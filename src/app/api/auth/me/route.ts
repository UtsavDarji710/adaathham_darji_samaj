import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { INITIAL_MEMBERS } from "@/lib/mockData";

export async function GET() {
  const cookieStore = cookies();
  const sessionVal = cookieStore.get("ad8_session")?.value;

  if (!sessionVal || sessionVal === "guest") {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();

  const user = INITIAL_MEMBERS.find((m) => {
    if (m.email && m.email.toLowerCase() === cleanSession) return true;
    if (m.phone && m.phone.replace(/\D/g, "") === cleanSession.replace(/\D/g, "")) return true;
    if (m.id && m.id.toLowerCase() === cleanSession) return true;
    return false;
  });

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
