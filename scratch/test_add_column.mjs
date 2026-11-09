import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envFile = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  // Check if we can add columns via rpc or sql
  // In Supabase, if there's no custom exec_sql rpc, we can store jati and dod safely in JSON, or test:
  const testId = "86b7b1da-e0ba-476d-a87e-7b8fb20405bd";
  const { data, error } = await supabase.from("members").update({ jati: "અડાઆઠમ દરજી" }).eq("id", testId).select();
  console.log("Update with jati result:", { data, error });
}

main().catch(console.error);

