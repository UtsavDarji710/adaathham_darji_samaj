import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberByIdOrSession, ensureSessionUser, registerMember } from "@/lib/memberStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSupabaseMember } from "@/lib/supabaseMembers";

export async function GET() {
  const cookieStore = cookies();
  const sessionVal = cookieStore.get("ad8_session")?.value;

  if (!sessionVal || sessionVal === "guest") {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();

  // 1. Supabase-First Session Lookup
  if (isSupabaseConfigured()) {
    try {
      const dbUser = await getSupabaseMember(cleanSession);
      if (dbUser) {
        // Keep in-memory cache warm
        registerMember(dbUser);
        return NextResponse.json({
          authenticated: true,
          user: dbUser,
        });
      }
    } catch (err) {
      console.warn("[/api/auth/me Supabase lookup]", err);
    }
  }

  // 2. Fallback to Server Member Store
  let user = getMemberByIdOrSession(cleanSession);

  // If a valid session identifier exists but not yet in store, initialize session user
  if (!user && (cleanSession.includes("@") || cleanSession.replace(/\D/g, "").length >= 10)) {
    user = ensureSessionUser(cleanSession);
  }

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
