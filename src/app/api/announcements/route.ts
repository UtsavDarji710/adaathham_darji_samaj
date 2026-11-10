import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { Announcement } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing announcement id" }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      const rowUpdates: any = {};
      if (updates.title !== undefined) rowUpdates.title = updates.title;
      if (updates.body !== undefined) rowUpdates.body = updates.body;
      if (updates.date !== undefined) rowUpdates.date = updates.date;
      if (updates.category !== undefined) rowUpdates.category = updates.category;
      if (updates.image_url !== undefined) rowUpdates.image_url = updates.image_url;
      if (updates.author !== undefined) rowUpdates.author = updates.author;
      if (updates.is_urgent !== undefined) rowUpdates.is_urgent = !!updates.is_urgent;

      const { data, error } = await supabaseAdmin
        .from("announcements")
        .update(rowUpdates)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, announcement: data });
      }
    }

    return NextResponse.json({ success: true, announcement: body });
  } catch (error: any) {
    console.error("[/api/announcements PUT error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing announcement id" }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
      if (error) {
        console.warn("[/api/announcements DELETE error]", error);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("[/api/announcements DELETE error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

