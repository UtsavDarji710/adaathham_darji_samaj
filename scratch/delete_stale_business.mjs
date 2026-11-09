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
  console.log("Deleting Dhaval marketing business from Supabase...");
  const { data, error } = await supabase
    .from("businesses")
    .delete()
    .eq("id", "223f98b0-75f7-47bb-9ab2-9eb536634d0a")
    .select();

  console.log("Delete result:", { data, error });

  const { data: remaining } = await supabase.from("businesses").select("id, name, owner_name");
  console.log("Remaining businesses in Supabase:", remaining);
}

main().catch(console.error);

