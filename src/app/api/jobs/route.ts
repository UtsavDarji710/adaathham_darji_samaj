import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { JobPosting } from "@/types";

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("job_postings")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({
          success: true,
          jobs: data as JobPosting[],
        });
      }
    }
    return NextResponse.json({
      success: true,
      jobs: [],
    });
  } catch (error: any) {
    console.error("[/api/jobs GET error]", error);
    return NextResponse.json({ success: false, jobs: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured() && supabaseAdmin) {
      const row = {
        title: body.title,
        company_name: body.company_name,
        category: body.category || "સામાન્ય",
        job_type: body.job_type || "પૂર્ણ સમય (Full-time)",
        city: body.city || "મોડાસા",
        salary_range: body.salary_range || "",
        experience: body.experience || "",
        description: body.description || "",
        contact_person: body.contact_person || "",
        contact_phone: body.contact_phone || "",
        contact_email: body.contact_email || null,
        posted_by: body.posted_by && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.posted_by) ? body.posted_by : null,
        status: body.status || "active",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin.from("job_postings").insert(row).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, job: data });
      }
    }
    return NextResponse.json({ success: true, job: body });
  } catch (error: any) {
    console.error("[/api/jobs POST error]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

