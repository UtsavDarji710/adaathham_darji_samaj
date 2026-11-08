import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { dbRowToMember } from "@/lib/supabaseMembers";
import { getAllMembers } from "@/lib/memberStore";
import { Member } from "@/types";

export async function GET() {
  try {
    // 1. Supabase-First Live Query
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const dynamicMembers: Member[] = data.map(dbRowToMember);
        return NextResponse.json({
          success: true,
          members: dynamicMembers,
          source: "supabase",
        });
      }
    }

    // 2. Server Member Store Fallback (real verified active members only)
    const localMembers = getAllMembers().filter((m) => !/^mem-\d+$/.test(m.id));
    return NextResponse.json({
      success: true,
      members: localMembers,
      source: "local",
    });
  } catch (error: any) {
    console.error("[/api/members error]", error);
    return NextResponse.json(
      {
        success: false,
        members: getAllMembers().filter((m) => !/^mem-\d+$/.test(m.id)),
        message: "Failed to fetch live members, returned fallback store.",
      },
      { status: 500 }
    );
  }
}

