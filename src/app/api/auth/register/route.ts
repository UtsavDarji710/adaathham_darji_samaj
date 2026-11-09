import { NextResponse } from "next/server";
import { Member, DEFAULT_MEMBER_PRIVACY } from "@/types";
import { registerMember, isUsernameTaken } from "@/lib/memberStore";
import { hashPassword } from "@/lib/passwordUtils";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  registerSupabaseMember,
  isSupabaseUsernameTaken,
} from "@/lib/supabaseMembers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      name,
      email,
      phone,
      password,
      isEmailVerified,
      native_place = "અડાઆઠમ",
      city = "મોડાસા",
      father_name = "",
      grandfather_name = "",
      maternal_uncle_name = "",
      maternal_grandfather_name = "",
      marital_status = "પરણિત (Married)",
      gender = "male",
      address = "",
      profession = "",
    } = body;

    // 1. Username validation (Required, Unique, Alphanumeric + Underscore, 3-30 chars)
    const cleanUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!cleanUsername || cleanUsername.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "કૃપા કરીને લઘુત્તમ ૩ અક્ષરનું યુઝરનેમ (Username) દાખલ કરો.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "યુઝરનેમમાં માત્ર અંગ્રેજી અક્ષરો, અંકો અથવા અંડરસ્કોર (_) જ માન્ય છે (૩ થી ૩૦ અક્ષર).",
        },
        { status: 400 }
      );
    }

    // Check uniqueness locally and in Supabase
    if (isUsernameTaken(cleanUsername) || (await isSupabaseUsernameTaken(cleanUsername))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "આ યુઝરનેમ (Username) પહેલેથી જ નોંધાયેલું છે. કૃપા કરીને અન્ય યુઝરનેમ પસંદ કરો.",
        },
        { status: 400 }
      );
    }

    // Required field validation (Requirement 14.1)
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને પૂરું નામ દાખલ કરો." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "કૃપા કરીને માન્ય ઈમેઈલ સરનામું દાખલ કરો." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, message: "મોબાઇલ નંબર ફરજિયાત છે." },
        { status: 400 }
      );
    }

    // Mobile Number Management (Requirement 14.4)
    // Clean and validate Indian mobile number format (+91XXXXXXXXXX or 10 digits)
    const digitsOnly = phone.replace(/\D/g, "");
    let clean10 = digitsOnly;
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
      clean10 = digitsOnly.slice(2);
    }

    if (clean10.length !== 10 || !/^[6-9]\d{9}$/.test(clean10)) {
      return NextResponse.json(
        {
          success: false,
          message: "કૃપા કરીને માન્ય ૧૦-આંકડાનો ભારતીય મોબાઇલ નંબર દાખલ કરો (દા.ત. 98250 12345).",
        },
        { status: 400 }
      );
    }

    const internationalPhone = `+91${clean10}`;
    const normalizedEmail = email.toLowerCase().trim();

    // Verification check (Requirement 14.1: Do not allow users to access protected features until email has been verified)
    if (!isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "પ્રથમ આપના ઈમેઈલ પર મોકલેલો ૬-આંકડાનો ઓટીપી ચકાસો.",
        },
        { status: 403 }
      );
    }

    // Password validation (Requirement: Username & Password login)
    if (!password || typeof password !== "string" || password.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "પાસવર્ડ લઘુત્તમ ૬ અક્ષરનો હોવો આવશ્યક છે." },
        { status: 400 }
      );
    }

    const { hash: passwordHash, salt: passwordSalt } = hashPassword(password.trim());

    // Construct new verified Member
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      username: cleanUsername.toLowerCase(),
      name: name.trim(),
      email: normalizedEmail,
      phone: internationalPhone,
      password_hash: passwordHash,
      salt: passwordSalt,
      is_email_verified: true,
      email_verified_at: new Date().toISOString(),
      photo_url: body.photo_url || null,
      address: address.trim(),
      city: city.trim(),
      district: "અરવલ્લી",
      native_place: native_place.trim(),
      pincode: "383315",
      father_name: father_name.trim(),
      grandfather_name: grandfather_name.trim(),
      maternal_uncle_name: maternal_uncle_name.trim(),
      maternal_grandfather_name: maternal_grandfather_name.trim(),
      marital_status,
      gender,
      role: "member",
      is_lifetime_member: false,
      completeness: 75,
      created_at: new Date().toISOString(),
      employment: profession
        ? {
            company: profession,
            job_title: profession,
            city,
            experience_years: "૧ વર્ષ+",
          }
        : undefined,
      privacy: { ...DEFAULT_MEMBER_PRIVACY },
    };

    let finalMember = newMember;

    // 2. Persist permanently to Supabase Backend
    if (isSupabaseConfigured()) {
      const supaResult = await registerSupabaseMember(newMember, password.trim());
      if (!supaResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: supaResult.message || "Supabase ડેટાબેઝમાં નોંધણી નિષ્ફળ રહી.",
          },
          { status: 500 }
        );
      }
      if (supaResult.member) {
        finalMember = supaResult.member;
      }
    }

    // 3. Store in server cache for instant runtime access
    registerMember(finalMember);

    const response = NextResponse.json({
      success: true,
      message:
        "અડાઆઠમ દરજી સેવા સમિતિમાં આપનું સ્વાગત છે! આપનું ખાતું સફળતાપૂર્વક ચકાસાયું અને સક્રિય થયું છે.",
      member: finalMember,
    });

    response.cookies.set("ad8_session", finalMember.username || normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[register error]", error);
    return NextResponse.json(
      { success: false, message: "નોંધણી પ્રક્રિયામાં ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}
