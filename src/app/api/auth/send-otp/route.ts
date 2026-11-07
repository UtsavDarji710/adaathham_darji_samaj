import { NextResponse } from "next/server";
import { checkCooldown, generateNumericOtp, storeOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/email";
import { INITIAL_MEMBERS } from "@/lib/mockData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, purpose = "signup", name, phone } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને માન્ય ઈમેઈલ એડ્રેસ દાખલ કરો." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check conflict for signup
    if (purpose === "signup") {
      const existingEmail = INITIAL_MEMBERS.some(
        (m) => m.email && m.email.toLowerCase() === normalizedEmail
      );
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "આ ઈમેઈલ સરનામું પહેલેથી જ નોંધાયેલું છે. કૃપા કરીને લૉગિન કરો.",
          },
          { status: 409 }
        );
      }

      if (phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        const existingPhone = INITIAL_MEMBERS.some(
          (m) => m.phone.replace(/\D/g, "") === cleanPhone
        );
        if (existingPhone) {
          return NextResponse.json(
            {
              success: false,
              message: "આ મોબાઇલ નંબર પહેલેથી જ નોંધાયેલો છે. કૃપા કરીને લૉગિન કરો.",
            },
            { status: 409 }
          );
        }
      }
    }

    // Check account exists for login
    if (purpose === "login") {
      const found = INITIAL_MEMBERS.find(
        (m) => m.email && m.email.toLowerCase() === normalizedEmail
      );
      // Also allow test admin emails or registered members
      const validEmails = [
        "president@adaadhamsamaj.org",
        "secretary@adaadhamsamaj.org",
        "joint_secretary@adaadhamsamaj.org",
        "treasurer@adaadhamsamaj.org",
        "assistant_treasurer@adaadhamsamaj.org",
        "member@adaadhamsamaj.org",
      ];
      if (!found && !validEmails.includes(normalizedEmail)) {
        return NextResponse.json(
          {
            success: false,
            message: "આ ઈમેઈલ સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને પ્રથમ નોંધણી (Signup) કરો.",
          },
          { status: 404 }
        );
      }
    }

    // Check 60s cooldown
    const cooldown = checkCooldown(normalizedEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `કૃપા કરીને ફરીથી ઓટીપી વિનંતી કરવા માટે ${cooldown.remainingSeconds} સેકન્ડ રાહ જુઓ.`,
          cooldownSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const rawOtp = generateNumericOtp();

    // Store hashed OTP with 5-min TTL
    const { expiresAt } = storeOtp(normalizedEmail, rawOtp, purpose);

    // Send email using Nodemailer
    const emailResult = await sendOtpEmail(normalizedEmail, rawOtp, name);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "૬-આંકડાનો સુરક્ષિત વેરિફિકેશન ઓટીપી આપના ઈમેઈલ પર મોકલવામાં આવ્યો છે.",
      expiresAt,
      cooldownSeconds: 60,
      previewOtp: emailResult.previewMode ? rawOtp : undefined,
    });
  } catch (error: any) {
    console.error("[send-otp error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}

