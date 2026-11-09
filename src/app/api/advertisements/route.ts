import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { BusinessAdvertisement } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("business_advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          advertisements: data as BusinessAdvertisement[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      advertisements: [],
    });
  } catch (error: any) {
    console.error("[/api/advertisements GET error]", error);
    return NextResponse.json({ success: false, advertisements: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const row = {
        business_name: body.business_name,
        category: body.category || "વ્યવસાય જાહેરાત",
        description: body.description || "",
        owner_name: body.owner_name || "",
        contact_number: body.contact_number || "",
        address: body.address || "",
        image_url: body.image_url || "",
        website_link: body.website_link || null,
        status: body.status || "pending",
        rejection_remarks: body.rejection_remarks || null,
        submitted_by:
          body.submitted_by &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.submitted_by)
            ? body.submitted_by
            : null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from("business_advertisements")
        .insert(row)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, advertisement: data });
      }
    }
    return NextResponse.json({ success: true, advertisement: body });
  } catch (error: any) {
    console.error("[/api/advertisements POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id && isSupabaseConfigured() && supabaseAdmin) {
      await supabaseAdmin.from("business_advertisements").delete().eq("id", id);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[/api/advertisements DELETE error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

