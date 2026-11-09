import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { dbRowToMember, memberToDbRow } from "@/lib/supabaseMembers";
import { getAllMembers, registerMember } from "@/lib/memberStore";
import { Member } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Supabase-First Live Query
    if (isSupabaseConfigured() && supabaseAdmin) {
      const [membersRes, matrimonyRes] = await Promise.all([
        supabaseAdmin.from("members").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("member_matrimony").select("*"),
      ]);

      if (!membersRes.error && Array.isArray(membersRes.data)) {
        const matMap = new Map<string, any>();
        if (!matrimonyRes.error && Array.isArray(matrimonyRes.data)) {
          matrimonyRes.data.forEach((m) => {
            if (m.member_id) matMap.set(m.member_id, m);
          });
        }

        const dynamicMembers: Member[] = membersRes.data.map((row) =>
          dbRowToMember(row, matMap.get(row.id))
        );

        return NextResponse.json(
          {
            success: true,
            members: dynamicMembers,
            source: "supabase",
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            },
          }
        );
      }
    }

    // 2. Server Member Store Fallback
    const localMembers = getAllMembers();
    return NextResponse.json(
      {
        success: true,
        members: localMembers,
        source: "local",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[/api/members error]", error);
    return NextResponse.json(
      {
        success: false,
        members: getAllMembers(),
        message: "Failed to fetch live members, returned fallback store.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const member = body as Member;
    if (!member || !member.name || !member.phone) {
      return NextResponse.json({ success: false, message: "Name and phone are required" }, { status: 400 });
    }

    // 1. Save to Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      const dbRow = memberToDbRow(member);
      const { data, error } = await supabaseAdmin.from("members").insert(dbRow).select().single();
      if (!error && data) {
        member.id = data.id;
      }
    }

    // 2. Register in server store
    registerMember(member);

    return NextResponse.json({
      success: true,
      message: "Member created successfully",
      member,
    });
  } catch (error: any) {
    console.error("[/api/members POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
