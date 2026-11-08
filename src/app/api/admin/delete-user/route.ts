import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberByIdOrSession, isAdminRole } from "@/lib/memberStore";
import { getSupabaseMember, deleteSupabaseMember, clearSupabaseStorageBuckets } from "@/lib/supabaseMembers";

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request - Only Admin can delete users
    const cookieStore = cookies();
    const sessionVal = cookieStore.get("ad8_session")?.value;
    let isAdmin = false;

    if (sessionVal && sessionVal !== "guest") {
      const cleanSession = decodeURIComponent(sessionVal).trim().toLowerCase();
      let user = await getSupabaseMember(cleanSession);
      if (!user) {
        user = getMemberByIdOrSession(cleanSession);
      }
      if (user && isAdminRole(user.role)) {
        isAdmin = true;
      }
    }

    // Also support internal API secret if called via server-side script
    const authHeader = request.headers.get("x-admin-secret");
    if (authHeader && authHeader === process.env.SUPABASE_SERVICE_ROLE_KEY) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "અનધિકૃત પ્રવેશ. આ ક્રિયા માટે એડમિન પરવાનગી જરૂરી છે (Admin access required).",
        },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body = await request.json();
    const { identifier, clearAllImages, buckets } = body;

    const results: {
      userDeleted?: any;
      storageCleaned?: any;
    } = {};

    // 3. Clear all uploaded images if requested
    if (clearAllImages) {
      const storageResult = await clearSupabaseStorageBuckets(buckets);
      results.storageCleaned = storageResult;
    }

    // 4. Delete specific user if identifier provided
    if (identifier) {
      const userResult = await deleteSupabaseMember(identifier, {
        deleteStoragePhoto: true,
      });
      results.userDeleted = userResult;
    }

    return NextResponse.json({
      success: true,
      message: "પ્રક્રિયા સફળતાપૂર્વક પૂર્ણ થઈ.",
      ...results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: `ક્ષતિ આવી: ${err.message}`,
      },
      { status: 500 }
    );
  }
}

