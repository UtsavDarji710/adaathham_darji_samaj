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
      const row = {
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
        payment_status: body.payment_status || "pending",
        is_anonymous: !!body.is_anonymous,
        public_consent: body.public_consent !== false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("donations").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, donation: data });
      }
    }
    return NextResponse.json({ success: true, donation: body });
  } catch (error: any) {
    console.error("[/api/donations POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

