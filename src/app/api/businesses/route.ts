import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { BusinessItem } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          businesses: data as BusinessItem[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      businesses: [],
    });
  } catch (error: any) {
    console.error("[/api/businesses GET error]", error);
    return NextResponse.json({ success: false, businesses: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const row = {
        name: body.name,
        category: body.category || "વ્યવસાય",
        description: body.description || "",
        owner_name: body.owner_name || "",
        owner_id: body.owner_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.owner_id) ? body.owner_id : null,
        city: body.city || "મોડાસા",
        address: body.address || "",
        phone: body.phone || "",
        email: body.email || null,
        website: body.website || null,
        logo_url: body.logo_url || null,
        cover_url: body.cover_url || null,
        is_featured: !!body.is_featured,
        is_paid: !!body.is_paid,
        status: body.status || "active",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("businesses").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, business: data });
      }
    }
    return NextResponse.json({ success: true, business: body });
  } catch (error: any) {
    console.error("[/api/businesses POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

