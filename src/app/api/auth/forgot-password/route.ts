import { NextResponse } from "next/server";
import { getMemberByIdOrSession } from "@/lib/memberStore";
import { checkCooldown, generateNumericOtp, storeOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને માન્ય ઈમેઈલ સરનામું દાખલ કરો." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const member = getMemberByIdOrSession(normalizedEmail);

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          message: "આ ઈમેઈલ સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને સાચો ઈમેઈલ દાખલ કરો.",
        },
        { status: 404 }
      );
    }

    // Cooldown check (60s)
    const cooldown = checkCooldown(normalizedEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `કૃપા કરીને ફરીથી ઓટીપી મોકલવા માટે ${cooldown.remainingSeconds} સેકન્ડ રાહ જુઓ.`,
          cooldownSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate and store OTP for password reset
    const rawOtp = generateNumericOtp();
    const { expiresAt } = storeOtp(normalizedEmail, rawOtp, "reset_password");

    // Send email using Nodemailer
    const emailResult = await sendOtpEmail(
      normalizedEmail,
      rawOtp,
      member.name
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `પાસવર્ડ રીસેટ કરવા માટેનો ૬-આંકડાનો ઓટીપી આપના ઈમેઈલ (${normalizedEmail}) પર મોકલવામાં આવ્યો છે.`,
      username: member.username,
      expiresAt,
      cooldownSeconds: 60,
      previewOtp: emailResult.previewMode ? rawOtp : undefined,
    });
  } catch (error: any) {
    console.error("[Forgot password error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}

