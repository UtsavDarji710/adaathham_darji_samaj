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
        const enriched = data.map((b) => ({
          ...b,
          is_public: b.is_public !== undefined ? b.is_public : b.status === "active",
        }));
        return NextResponse.json({
          success: true,
          businesses: enriched as BusinessItem[],
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
        status: body.is_public === false ? "hidden" : (body.status || "active"),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("businesses").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({
          success: true,
          business: { ...data, is_public: data.status === "active" },
        });
      }
    }
    return NextResponse.json({ success: true, business: body });
  } catch (error: any) {
    console.error("[/api/businesses POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_public, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: "Business ID is required" }, { status: 400 });
    }
    if (isSupabaseConfigured() && supabaseAdmin) {
      const dbUpdates: Record<string, any> = { ...updates };
      if (is_public !== undefined) {
        dbUpdates.status = is_public ? "active" : "hidden";
      }

      const { data, error } = await supabaseAdmin
        .from("businesses")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return NextResponse.json({
          success: true,
          business: { ...data, is_public: data.status === "active" },
        });
      }
    }
    return NextResponse.json({ success: true, business: body });
  } catch (error: any) {
    console.error("[/api/businesses PATCH error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    let owner_id = searchParams.get("owner_id");

    if (!id && !owner_id) {
      try {
        const body = await request.json();
        id = body.id || null;
        owner_id = body.owner_id || null;
      } catch {}
    }

    if (!id && !owner_id) {
      return NextResponse.json({ success: false, message: "ID or owner_id is required" }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      let query = supabaseAdmin.from("businesses").delete();
      if (id) {
        query = query.eq("id", id);
      } else if (owner_id) {
        query = query.eq("owner_id", owner_id);
      }
      const { data, error } = await query.select();
      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: data });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[/api/businesses DELETE error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

