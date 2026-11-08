import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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
const anonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

async function testFullLoginFlow() {
  const identifier = "dharmik31";
  const password = "Jaygurudeo@9#";

  console.log(`Testing Login for Username: "${identifier}"...`);

  // Step 1: Look up member by username
  const { data: memberRow, error: memberErr } = await supabaseAdmin
    .from("members")
    .select("*")
    .ilike("username", identifier)
    .single();

  if (memberErr || !memberRow) {
    throw new Error(`Member lookup failed: ${memberErr?.message}`);
  }
  console.log("✓ Found public.members record:", memberRow.username, `(Role: ${memberRow.role})`);

  // Step 2: Sign in with Supabase Auth using email + password
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: memberRow.email,
    password,
  });

  if (authErr || !authData.user) {
    throw new Error(`Auth sign in failed: ${authErr?.message}`);
  }

  console.log("✓ Supabase Auth signed in successfully:", authData.user.email);
  console.log("✓ User ID matches:", authData.user.id === memberRow.id);
  console.log("✓ Admin role verified:", memberRow.role === "admin");
}

testFullLoginFlow().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

