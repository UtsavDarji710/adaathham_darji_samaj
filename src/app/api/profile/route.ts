import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  getMemberByIdOrSession,
  ensureSessionUser,
  canUserEditTarget,
  updateMemberRecord,
} from "@/lib/memberStore";
import { getSupabaseMember, updateSupabaseMember } from "@/lib/supabaseMembers";
import { Member } from "@/types";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionVal = cookieStore.get("ad8_session")?.value;

    if (!sessionVal || sessionVal === "guest") {
      return NextResponse.json(
        {
          success: false,
          message: "અનધિકૃત પ્રવેશ. કૃપા કરીને પ્રથમ લૉગિન કરો (Unauthorized. Please log in).",
        },
        { status: 401 }
      );
    }

    const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();

    // 1. Resolve Current User
    let currentUser = await getSupabaseMember(cleanSession);
    if (!currentUser) {
      currentUser = getMemberByIdOrSession(cleanSession) || ensureSessionUser(cleanSession);
    }

    const body = await request.json();
    const { memberId, updates } = body as {
      memberId?: string;
      updates?: Partial<Member>;
    };

    if (!updates) {
      return NextResponse.json(
        { success: false, message: "સુધારવા માટે કોઈ વિગતો મળી નથી." },
        { status: 400 }
      );
    }

    const targetId = memberId || currentUser.id;

    // Authorization check: User can edit their own profile, Admins can edit ANY member
    const isAuthorized = canUserEditTarget(currentUser, targetId);
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: "આ સભ્યની પ્રોફાઇલ સુધારવા માટે એડમિન પરવાનગી જરૂરી છે (Forbidden).",
        },
        { status: 403 }
      );
    }

    // 2. Update permanently in Supabase
    let supaUpdated: Member | null = null;
    if (isSupabaseConfigured()) {
      supaUpdated = await updateSupabaseMember(targetId, updates);
    }

    // 3. Update server cache
    const updated = updateMemberRecord(targetId, updates);

    return NextResponse.json({
      success: true,
      message: "વિગતો સફળતાપૂર્વક સાચવાઈ ગઈ છે.",
      member: supaUpdated || updated,
    });
  } catch (error: any) {
    console.error("[Profile Update API Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: "પ્રોફાઇલ સાચવતી વખતે સર્વર ક્ષતિ આવી.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
