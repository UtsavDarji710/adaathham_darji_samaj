// Standalone cleanup script for Supabase
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local manually
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

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function deleteAllUsers() {
  console.log("\n==============================================");
  console.log("DELETING ALL USERS FROM SUPABASE & LOCAL STORE");
  console.log("==============================================");

  // 1. Delete all users from Supabase Auth
  try {
    const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers();
    if (uErr) {
      console.error("Error listing Supabase Auth users:", uErr.message);
    } else if (usersData?.users && usersData.users.length > 0) {
      console.log(`Found ${usersData.users.length} user(s) in Supabase Auth.`);
      for (const user of usersData.users) {
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (delErr) {
          console.error(`  ✕ Error deleting auth user ${user.id} (${user.email}):`, delErr.message);
        } else {
          console.log(`  ✓ Deleted auth user: ${user.id} (${user.email || user.user_metadata?.username || "no email"})`);
        }
      }
    } else {
      console.log("Supabase Auth has 0 users.");
    }
  } catch (err) {
    console.error("Exception deleting Supabase Auth users:", err.message);
  }

  // 2. Delete all records from public.members table
  try {
    const { data: members, error: mErr } = await supabaseAdmin
      .from("members")
      .select("id, username, email");

    if (mErr) {
      console.error("Error querying public.members:", mErr.message);
    } else if (members && members.length > 0) {
      console.log(`Found ${members.length} row(s) in public.members.`);
      for (const m of members) {
        const { error: delRowErr } = await supabaseAdmin.from("members").delete().eq("id", m.id);
        if (delRowErr) {
          console.error(`  ✕ Error deleting member row ${m.id}:`, delRowErr.message);
        } else {
          console.log(`  ✓ Deleted member table row: ${m.id} (${m.username || m.email || "unknown"})`);
        }
      }
    } else {
      console.log("public.members table is empty (0 rows).");
    }
  } catch (err) {
    console.error("Exception deleting public.members rows:", err.message);
  }

  // 3. Clear local store (.data/members.json)
  try {
    const dataDir = path.resolve(process.cwd(), ".data");
    const membersJson = path.join(dataDir, "members.json");
    if (fs.existsSync(membersJson)) {
      fs.writeFileSync(membersJson, JSON.stringify([], null, 2), "utf-8");
      console.log("✓ Cleared local .data/members.json file (0 members).");
    }
  } catch (err) {
    console.error("Exception clearing local members.json:", err.message);
  }

  console.log("=== FINISHED DELETING ALL USERS ===\n");
}

export async function clearAllImages(buckets = [
  "member-photos",
  "business-photos",
  "advertisement-banners",
  "donor-photos",
  "payment-proofs",
  "samiti-assets",
]) {
  console.log("\n==============================================");
  console.log("CLEARING ALL UPLOADED IMAGES FROM STORAGE");
  console.log("==============================================");

  let totalFilesDeleted = 0;

  for (const bucket of buckets) {
    try {
      const { data: files, error: listErr } = await supabaseAdmin.storage.from(bucket).list("", { limit: 1000 });
      if (listErr) {
        console.log(`Bucket '${bucket}': ${listErr.message}`);
        continue;
      }

      if (files && files.length > 0) {
        const names = files.map((f) => f.name).filter(Boolean);
        console.log(`Found ${names.length} file(s) in bucket '${bucket}':`, names);
        const { error: delErr } = await supabaseAdmin.storage.from(bucket).remove(names);
        if (delErr) {
          console.error(`  ✕ Error deleting files from '${bucket}':`, delErr.message);
        } else {
          console.log(`  ✓ Successfully removed ${names.length} file(s) from bucket '${bucket}'`);
          totalFilesDeleted += names.length;
        }
      } else {
        console.log(`Bucket '${bucket}' is already empty.`);
      }
    } catch (err) {
      console.error(`Exception clearing bucket '${bucket}':`, err.message);
    }
  }

  console.log(`=== FINISHED CLEARING STORAGE (${totalFilesDeleted} total files deleted) ===\n`);
}

// Check CLI arguments
const args = process.argv.slice(2);
const allUsers = args.includes("--all-users");
const shouldClearImages = args.includes("--clear-images");
const targetUser = args.find((a) => a.startsWith("--user="))?.split("=")[1];

async function main() {
  if (allUsers) {
    await deleteAllUsers();
  } else if (targetUser) {
    console.log(`Deleting single user ${targetUser}...`);
    await supabaseAdmin.from("members").delete().or(`username.ilike.${targetUser},email.ilike.${targetUser}`);
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const found = usersData?.users?.find(u => u.email?.toLowerCase() === targetUser.toLowerCase() || u.user_metadata?.username?.toLowerCase() === targetUser.toLowerCase());
    if (found) {
      await supabaseAdmin.auth.admin.deleteUser(found.id);
      console.log(`Deleted auth user ${found.id}`);
    }
  }

  if (shouldClearImages) {
    await clearAllImages();
  }

  if (!allUsers && !targetUser && !shouldClearImages) {
    console.log("Usage: node scratch/cleanup_supabase.mjs [--all-users] [--clear-images] [--user=<identifier>]");
  }
}

main().catch(console.error);
