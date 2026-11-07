import { NextResponse } from "next/server";
import { checkCooldown, generateNumericOtp, storeOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/email";
import { INITIAL_MEMBERS } from "@/lib/mockData";
import { getMemberByIdOrSession } from "@/lib/memberStore";

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

    // Check if account exists
    const member = getMemberByIdOrSession(normalizedEmail);

    const testAdminEmails = [
      "president@adaadhamsamaj.org",
      "secretary@adaadhamsamaj.org",
      "joint_secretary@adaadhamsamaj.org",
      "treasurer@adaadhamsamaj.org",
      "assistant_treasurer@adaadhamsamaj.org",
      "member@adaadhamsamaj.org",
    ];

    if (!member && !testAdminEmails.includes(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "આ ઈમેઈલ સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને પ્રથમ સભ્ય નોંધણી (Signup) કરો.",
        },
        { status: 404 }
      );
    }

    // Cooldown check (Requirement 14.2)
    const cooldown = checkCooldown(normalizedEmail);
    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `કૃપા કરીને ફરીથી ઓટીપી માટે ${cooldown.remainingSeconds} સેકન્ડ રાહ જુઓ.`,
          cooldownSeconds: cooldown.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const rawOtp = generateNumericOtp();

    // Store hashed OTP (5 minutes expiry)
    const { expiresAt } = storeOtp(normalizedEmail, rawOtp, "login");

    // Send email using Nodemailer
    const emailResult = await sendOtpEmail(
      normalizedEmail,
      rawOtp,
      member ? member.name : undefined
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "લૉગિન ઓટીપી આપના નોંધાયેલા ઈમેઈલ પર મોકલવામાં આવ્યો છે.",
      expiresAt,
      cooldownSeconds: 60,
      previewOtp: emailResult.previewMode ? rawOtp : undefined,
    });
  } catch (error: any) {
    console.error("[login error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}

