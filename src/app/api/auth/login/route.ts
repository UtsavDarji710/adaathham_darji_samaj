import { NextResponse } from "next/server";
import { verifyMemberPassword, registerMember } from "@/lib/memberStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { authenticateSupabase } from "@/lib/supabaseMembers";

/**
 * Login Handler: Strict Username + Password Authentication
 * Single unified login flow using Username & Password.
 * Supabase-first authentication with secure local fallback.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const cleanUsername = typeof username === "string" ? username.trim() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!cleanUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "કૃપા કરીને આપનું યુઝરનેમ (Username) દાખલ કરો.",
        },
        { status: 400 }
      );
    }

    if (!cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "કૃપા કરીને આપનો પાસવર્ડ (Password) દાખલ કરો.",
        },
        { status: 400 }
      );
    }

    // 1. Supabase-First Authentication
    if (isSupabaseConfigured()) {
      const supaAuth = await authenticateSupabase(cleanUsername, cleanPassword);

      if (supaAuth.success && supaAuth.member) {
        const member = supaAuth.member;
        const sessionVal = member.username || member.email || member.id;

        // Cache in memory for fast local queries
        registerMember(member);

        const response = NextResponse.json({
          success: true,
          message: `સ્વાગત છે, ${member.name}!`,
          user: member,
        });

        // Set secure session cookie (7 days)
        response.cookies.set("ad8_session", sessionVal.toLowerCase().trim(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }
    }

    // 2. Fallback to server memberStore
    const verification = verifyMemberPassword(cleanUsername, cleanPassword);

    if (!verification.success || !verification.member) {
      return NextResponse.json(
        {
          success: false,
          message:
            verification.message ||
            "અમાન્ય યુઝરનેમ અથવા પાસવર્ડ. કૃપા કરીને ફરી ચકાસો અથવા પાસવર્ડ રીસેટ કરો.",
        },
        { status: 401 }
      );
    }

    const member = verification.member;
    const sessionVal = member.username || member.email || member.id;

    const response = NextResponse.json({
      success: true,
      message: `સ્વાગત છે, ${member.name}!`,
      user: member,
    });

    // Set secure session cookie (7 days)
    response.cookies.set("ad8_session", sessionVal.toLowerCase().trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Login error]", error);
    return NextResponse.json(
      { success: false, message: "સર્વર ભૂલ. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો." },
      { status: 500 }
    );
  }
}
