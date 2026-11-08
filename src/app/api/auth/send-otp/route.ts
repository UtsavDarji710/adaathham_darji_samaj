import { NextResponse } from "next/server";
import { checkCooldown, generateNumericOtp, storeOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/email";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { getMemberByIdOrSession } from "@/lib/memberStore";

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

    // 1. Check conflict for signup against live Supabase database
    if (purpose === "signup") {
      if (isSupabaseConfigured() && supabaseAdmin) {
        // Check if email already registered in Supabase members table
        const { data: memberRow, error: memberErr } = await supabaseAdmin
          .from("members")
          .select("id, email, phone")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (!memberErr && memberRow) {
          return NextResponse.json(
            {
              success: false,
              message: "આ ઈમેઈલ સરનામું પહેલેથી જ નોંધાયેલું છે. કૃપા કરીને લૉગિન કરો.",
            },
            { status: 409 }
          );
        }

        // Check if phone already registered in Supabase members table
        if (phone) {
          const digits = phone.replace(/\D/g, "");
          const clean10 = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
          if (clean10.length === 10) {
            const { data: phoneRow, error: phoneErr } = await supabaseAdmin
              .from("members")
              .select("id, phone")
              .or(`phone.eq.${clean10},phone.eq.+91${clean10}`)
              .maybeSingle();

            if (!phoneErr && phoneRow) {
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

        // Also check Supabase Auth users
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
          if (usersData?.users?.some((u) => u.email?.toLowerCase() === normalizedEmail)) {
            return NextResponse.json(
              {
                success: false,
                message: "આ ઈમેઈલ સરનામું પહેલેથી જ નોંધાયેલું છે. કૃપા કરીને લૉગિન કરો.",
              },
              { status: 409 }
            );
          }
        } catch (err: any) {
          console.warn("[send-otp listUsers check warning]", err.message);
        }
      }
    }

    // 2. Check account exists for login / forgot password
    if (purpose === "login" || purpose === "forgot-password") {
      let userFound = false;

      if (isSupabaseConfigured() && supabaseAdmin) {
        const { data: memberRow } = await supabaseAdmin
          .from("members")
          .select("id, email")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (memberRow) {
          userFound = true;
        } else {
          try {
            const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
            if (usersData?.users?.some((u) => u.email?.toLowerCase() === normalizedEmail)) {
              userFound = true;
            }
          } catch {}
        }
      } else {
        const found = getMemberByIdOrSession(normalizedEmail);
        if (found) userFound = true;
      }

      if (!userFound) {
        return NextResponse.json(
          {
            success: false,
            message: "આ ઈમેઈલ સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને પ્રથમ નોંધણી (Signup) કરો.",
          },
          { status: 404 }
        );
      }
    }

    // 3. Check 60s cooldown
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

    // 4. Generate 6-digit OTP
    const rawOtp = generateNumericOtp();

    // 5. Store hashed OTP with 5-min TTL
    const { expiresAt } = storeOtp(normalizedEmail, rawOtp, purpose);

    // 6. Send email using Nodemailer
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
