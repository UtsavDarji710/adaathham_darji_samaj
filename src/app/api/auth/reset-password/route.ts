import { NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/otpStore";
import { resetMemberPassword } from "@/lib/memberStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { resetSupabasePassword } from "@/lib/supabaseMembers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "ઈમેઈલ, ઓટીપી અને નવો પાસવર્ડ ત્રણેય ફરજિયાત છે." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને ૬-આંકડાનો માન્ય ઓટીપી દાખલ કરો." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "નવો પાસવર્ડ લઘુત્તમ ૬ અક્ષરનો હોવો આવશ્યક છે." },
        { status: 400 }
      );
    }

    // Verify OTP for password reset
    const verification = verifyOtpCode(normalizedEmail, cleanOtp, "reset_password");
    if (!verification.success) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // 1. Reset password in Supabase if configured
    let resolvedUsername: string | undefined = undefined;
    if (isSupabaseConfigured()) {
      const supaReset = await resetSupabasePassword(normalizedEmail, newPassword.trim());
      if (supaReset.username) {
        resolvedUsername = supaReset.username;
      }
    }

    // 2. Apply new password to server member store
    const result = resetMemberPassword(normalizedEmail, newPassword.trim());
    if (!result.success && !resolvedUsername) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const finalUsername = resolvedUsername || result.member?.username;

    return NextResponse.json({
      success: true,
      username: finalUsername,
      message: "આપનો પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે આપ આપના યુઝરનેમ અને નવા પાસવર્ડ વડે લૉગિન કરી શકો છો.",
    });
  } catch (error: any) {
    console.error("[Reset password error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}

