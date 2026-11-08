import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { Announcement } from "@/types";

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          announcements: data as Announcement[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      announcements: [],
    });
  } catch (error: any) {
    console.error("[/api/announcements GET error]", error);
    return NextResponse.json({ success: false, announcements: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const row = {
        title: body.title,
        body: body.body || "",
        date: body.date || new Date().toISOString().split("T")[0],
        category: body.category || "સામાન્ય",
        image_url: body.image_url || null,
        author: body.author || "મંત્રી શ્રી",
        is_urgent: !!body.is_urgent,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("announcements").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, announcement: data });
      }
    }
    return NextResponse.json({ success: true, announcement: body });
  } catch (error: any) {
    console.error("[/api/announcements POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

