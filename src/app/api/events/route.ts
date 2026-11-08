import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { CommunityEvent } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          events: data as CommunityEvent[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      events: [],
    });
  } catch (error: any) {
    console.error("[/api/events GET error]", error);
    return NextResponse.json({ success: false, events: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const row = {
        title: body.title,
        description: body.description || "",
        date: body.date,
        time: body.time || "",
        location: body.location || "મોડાસા",
        city: body.city || "મોડાસા",
        cover_image: body.cover_image || null,
        gallery: Array.isArray(body.gallery) ? body.gallery : [],
        video_url: body.video_url || null,
        status: body.status || "upcoming",
        year: body.year || new Date().getFullYear(),
        organizer: body.organizer || "શ્રી અડાઆઠમ દરજી સેવા સમિતિ",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("events").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, event: data });
      }
    }
    return NextResponse.json({ success: true, event: body });
  } catch (error: any) {
    console.error("[/api/events POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

