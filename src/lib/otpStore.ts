import crypto from "crypto";

interface OtpRecord {
  email: string;
  hashedCode: string;
  purpose: "signup" | "login" | "profile_update";
  expiresAt: number; // Unix epoch ms (5 minutes)
  lastRequestedAt: number; // For 60-second cooldown
  attempts: number; // Max 5 incorrect attempts
  isVerified: boolean;
}

// Global in-memory OTP registry for server runtime
// In multi-instance or serverless, can be backed by Redis or PostgreSQL `otp_codes` table
const globalOtpStore = new Map<string, OtpRecord>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

/**
 * Hash code using SHA-256 to ensure raw OTP is never stored in plaintext
 */
export function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Generate a cryptographically secure random 6-digit numeric OTP
 */
export function generateNumericOtp(): string {
  // Use crypto.randomInt for uniform distribution
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

/**
 * Check if an email is eligible to request an OTP (checks cooldown)
 */
export function checkCooldown(email: string): { allowed: boolean; remainingSeconds: number } {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = globalOtpStore.get(normalizedEmail);

  if (!existing) {
    return { allowed: true, remainingSeconds: 0 };
  }

  const elapsed = Date.now() - existing.lastRequestedAt;
  if (elapsed < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { allowed: false, remainingSeconds: remaining };
  }

  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Save new OTP in store with SHA-256 hash and 5-min expiry
 */
export function storeOtp(
  email: string,
  rawOtp: string,
  purpose: "signup" | "login" | "profile_update" = "signup"
): { expiresAt: number } {
  const normalizedEmail = email.toLowerCase().trim();
  const hashedCode = hashOtp(rawOtp);
  const now = Date.now();
  const expiresAt = now + OTP_TTL_MS;

  globalOtpStore.set(normalizedEmail, {
    email: normalizedEmail,
    hashedCode,
    purpose,
    expiresAt,
    lastRequestedAt: now,
    attempts: 0,
    isVerified: false,
  });

  return { expiresAt };
}

/**
 * Verify user submitted OTP against hash, expiration and attempt limits
 */
export function verifyOtpCode(
  email: string,
  userCode: string,
  expectedPurpose?: "signup" | "login" | "profile_update"
): {
  success: boolean;
  message: string;
  code?: "INVALID" | "EXPIRED" | "MAX_ATTEMPTS_EXCEEDED" | "ALREADY_VERIFIED" | "NOT_FOUND";
} {
  const normalizedEmail = email.toLowerCase().trim();
  const record = globalOtpStore.get(normalizedEmail);

  if (!record) {
    return {
      success: false,
      message: "ઓટીપી રેકોર્ડ મળ્યો નથી. કૃપા કરીને નવો ઓટીપી મેળવો.",
      code: "NOT_FOUND",
    };
  }

  if (record.isVerified) {
    return {
      success: false,
      message: "આ ઓટીપી પહેલેથી જ ચકાસાયેલો છે. કૃપા કરીને નવો ઓટીપી વિનંતી કરો.",
      code: "ALREADY_VERIFIED",
    };
  }

  if (Date.now() > record.expiresAt) {
    globalOtpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "આ ઓટીપીની માન્યતા (૫ મિનિટ) સમાપ્ત થઈ ગઈ છે. કૃપા કરીને ફરીથી ઓટીપી મોકલો.",
      code: "EXPIRED",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    globalOtpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "ઓટીપી દાખલ કરવાની મહત્તમ મર્યાદા (૫ વખત) સમાપ્ત થઈ ગઈ છે. કૃપા કરીને નવો ઓટીપી વિનંતી કરો.",
      code: "MAX_ATTEMPTS_EXCEEDED",
    };
  }

  if (expectedPurpose && record.purpose !== expectedPurpose) {
    return {
      success: false,
      message: "અમાન્ય ઓટીપી વિનંતી હેતુ.",
      code: "INVALID",
    };
  }

  // Increment attempt count
  record.attempts += 1;

  const userHashed = hashOtp(userCode);
  if (userHashed !== record.hashedCode) {
    const remainingAttempts = MAX_ATTEMPTS - record.attempts;
    return {
      success: false,
      message: `ખોટો ઓટીપી. કૃપા કરીને ફરી પ્રયાસ કરો. (બાકી પ્રયાસો: ${remainingAttempts})`,
      code: "INVALID",
    };
  }

  // Verification succeeded - mark as verified & invalidate immediately
  record.isVerified = true;
  globalOtpStore.delete(normalizedEmail); // Invalidate to prevent any reuse

  return {
    success: true,
    message: "ઓટીપી સફળતાપૂર્વક ચકાસાયો!",
  };
}

