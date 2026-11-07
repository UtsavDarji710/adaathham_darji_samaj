import { NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/otpStore";
import { INITIAL_MEMBERS } from "@/lib/mockData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, purpose } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "ઈમેઈલ અને ઓટીપી બંને ફરજિયાત છે." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને ૬-આંકડાનો માન્ય અંકિત ઓટીપી દાખલ કરો." },
        { status: 400 }
      );
    }

    // Verify code securely
    const verification = verifyOtpCode(normalizedEmail, cleanOtp, purpose);

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message: verification.message,
          code: verification.code,
        },
        { status: 400 }
      );
    }

    // OTP is valid!
    // If login, find user
    let user = INITIAL_MEMBERS.find(
      (m) => m.email && m.email.toLowerCase() === normalizedEmail
    );

    // If test admin email used
    if (!user && normalizedEmail.endsWith("@adaadhamsamaj.org")) {
      const prefix = normalizedEmail.split("@")[0];
      user = INITIAL_MEMBERS.find((m) => m.role === prefix) || INITIAL_MEMBERS[0];
    }

    const response = NextResponse.json({
      success: true,
      message: "ઓટીપી ચકાસણી સફળ રહી!",
      email: normalizedEmail,
      isVerified: true,
      user: user || null,
    });

    // Set secure cookie for session
    response.cookies.set("ad8_session", normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[verify-otp error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}

