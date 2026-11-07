import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberByIdOrSession, ensureSessionUser } from "@/lib/memberStore";

export async function GET() {
  const cookieStore = cookies();
  const sessionVal = cookieStore.get("ad8_session")?.value;

  if (!sessionVal || sessionVal === "guest") {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();

  // Find user by ID, email, or phone from the dynamic member registry
  let user = getMemberByIdOrSession(cleanSession);

  // If a valid session identifier exists (email or phone) but not yet in store, initialize session user
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
