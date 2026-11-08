import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
let envConfig = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        envConfig[key] = val;
      }
    }
  });
}

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function checkAllData() {
  console.log("=== CHECKING SUPABASE TABLES ===");
  
  // 1. Auth Users
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
  console.log(`Supabase Auth Users count: ${usersData?.users?.length || 0}`);
  usersData?.users?.forEach((u) => {
    console.log(` - Auth: ${u.email} | id: ${u.id} | meta:`, u.user_metadata);
  });

  // 2. Members table
  const { data: members, error: mErr } = await supabaseAdmin.from("members").select("id, name, username, email, phone, role");
  console.log(`Supabase members count: ${members?.length || 0}`);
  members?.forEach((m) => {
    console.log(` - Member: [${m.username}] ${m.name} (${m.email}, phone: ${m.phone}, role: ${m.role})`);
  });

  // 3. Businesses table
  const { data: biz } = await supabaseAdmin.from("businesses").select("id, name, category");
  console.log(`Supabase businesses count: ${biz?.length || 0}`);

  // 4. Job Postings table
  const { data: jobs } = await supabaseAdmin.from("job_postings").select("id, title");
  console.log(`Supabase jobs count: ${jobs?.length || 0}`);

  // 5. Events table
  const { data: events } = await supabaseAdmin.from("events").select("id, title");
  console.log(`Supabase events count: ${events?.length || 0}`);

  // 6. Donations table
  const { data: don } = await supabaseAdmin.from("donations").select("id, donor_name, amount");
  console.log(`Supabase donations count: ${don?.length || 0}`);

  // 7. Advertisements table
  const { data: ads } = await supabaseAdmin.from("business_advertisements").select("id, business_name");
  console.log(`Supabase ads count: ${ads?.length || 0}`);
}

checkAllData().catch(console.error);

