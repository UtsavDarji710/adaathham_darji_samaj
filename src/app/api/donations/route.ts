import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { Donation } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          donations: data as Donation[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      donations: [],
    });
  } catch (error: any) {
    console.error("[/api/donations GET error]", error);
    return NextResponse.json({ success: false, donations: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const isApproved = body.status === "approved";
      const row: Record<string, any> = {
        donation_id: body.donation_id || `DON-${Date.now()}`,
        donor_name: body.donor_name,
        mobile_number: body.mobile_number || "",
        donor_photo: body.donor_photo || null,
        hasthe_names: Array.isArray(body.hasthe_names) ? body.hasthe_names : [],
        donation_purpose: body.donation_purpose || "સમાજ કલ્યાણ ફંડ",
        specific_purpose: body.specific_purpose || null,
        donation_year: body.donation_year || String(new Date().getFullYear()),
        amount: Number(body.amount) || 0,
        date: body.date || new Date().toISOString().split("T")[0],
        payment_proof: body.payment_proof || null,
        status: body.status || "pending",
        payment_status: isApproved ? "verified" : (body.payment_status || "pending"),
        is_anonymous: !!body.is_anonymous,
        public_consent: body.public_consent !== false,
        created_at: new Date().toISOString(),
      };

      if (body.receipt_number) row.receipt_number = body.receipt_number;
      if (body.payment_method) row.payment_method = body.payment_method;
      if (body.approved_by) row.approved_by = body.approved_by;
      if (body.approved_at) row.approved_at = body.approved_at;
      if (body.admin_remarks) row.admin_remarks = body.admin_remarks;

      const { data, error } = await supabaseAdmin.from("donations").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, donation: data });
      }
      if (error) {
        console.warn("[/api/donations POST supabase warning]", error.message);
      }
    }
    return NextResponse.json({ success: true, donation: body });
  } catch (error: any) {
    console.error("[/api/donations POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.donation_id;
    if (!id) {
      return NextResponse.json({ success: false, message: "Donation ID is required" }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (body.donor_name !== undefined) updates.donor_name = body.donor_name;
      if (body.mobile_number !== undefined) updates.mobile_number = body.mobile_number;
      if (body.donor_photo !== undefined) updates.donor_photo = body.donor_photo;
      if (body.hasthe_names !== undefined) updates.hasthe_names = Array.isArray(body.hasthe_names) ? body.hasthe_names : [];
      if (body.donation_purpose !== undefined) updates.donation_purpose = body.donation_purpose;
      if (body.specific_purpose !== undefined) updates.specific_purpose = body.specific_purpose;
      if (body.donation_year !== undefined) updates.donation_year = body.donation_year;
      if (body.amount !== undefined) updates.amount = Number(body.amount);
      if (body.date !== undefined) updates.date = body.date;
      if (body.payment_proof !== undefined) updates.payment_proof = body.payment_proof;
      if (body.status !== undefined) {
        updates.status = body.status;
        if (body.status === "approved") {
          updates.payment_status = "verified";
        } else if (body.status === "pending") {
          updates.payment_status = "pending";
        }
      }
      if (body.payment_status !== undefined) updates.payment_status = body.payment_status;
      if (body.is_anonymous !== undefined) updates.is_anonymous = !!body.is_anonymous;
      if (body.public_consent !== undefined) updates.public_consent = !!body.public_consent;
      if (body.receipt_number !== undefined) updates.receipt_number = body.receipt_number;
      if (body.payment_method !== undefined) updates.payment_method = body.payment_method;
      if (body.admin_remarks !== undefined) updates.admin_remarks = body.admin_remarks;
      if (body.approved_by !== undefined) updates.approved_by = body.approved_by;
      if (body.approved_at !== undefined) updates.approved_at = body.approved_at;

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabaseAdmin.from("donations").update(updates);
      if (isUUID) {
        query = query.or(`id.eq.${id},donation_id.eq.${id}`);
      } else {
        query = query.eq("donation_id", id);
      }

      const { data, error } = await query.select().maybeSingle();
      if (!error && data) {
        return NextResponse.json({ success: true, donation: data });
      }
      if (error) {
        console.warn("[/api/donations PUT supabase warning]", error.message);
      }
    }

    return NextResponse.json({ success: true, donation: body });
  } catch (error: any) {
    console.error("[/api/donations PUT error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await request.json();
        id = body.id || body.donation_id;
      } catch {
        // no json body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "Donation ID is required" }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabaseAdmin) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabaseAdmin.from("donations").delete();
      if (isUUID) {
        query = query.or(`id.eq.${id},donation_id.eq.${id}`);
      } else {
        query = query.eq("donation_id", id);
      }
      const { error } = await query;
      if (error) {
        console.warn("[/api/donations DELETE supabase warning]", error.message);
      }
    }

    return NextResponse.json({ success: true, message: "Donation deleted successfully" });
  } catch (error: any) {
    console.error("[/api/donations DELETE error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

