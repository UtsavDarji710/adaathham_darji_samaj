import { NextResponse } from "next/server";
import { Member } from "@/types";
import { INITIAL_MEMBERS } from "@/lib/mockData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
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

    // Construct new verified Member
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: internationalPhone,
      is_email_verified: true,
      email_verified_at: new Date().toISOString(),
      photo_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
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
      privacy: {
        phone: "members",
        address: "members",
        photo: "public",
        family: "members",
        business: "public",
        employment: "members",
        education: "members",
      },
    };

    // Store in mock/memory list for immediate runtime access
    INITIAL_MEMBERS.push(newMember);

    const response = NextResponse.json({
      success: true,
      message: "અડાઆઠમ દરજી સેવા સમિતિમાં આપનું સ્વાગત છે! આપનું ખાતું સફળતાપૂર્વક ચકાસાયું અને સક્રિય થયું છે.",
      member: newMember,
    });

    response.cookies.set("ad8_session", normalizedEmail, {
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

