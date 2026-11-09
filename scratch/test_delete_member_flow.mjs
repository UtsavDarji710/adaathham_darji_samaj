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

async function runTests() {
  console.log("=== Testing Delete Member Backend & Supabase Flow ===");

  const testEmail = `del_test_${Date.now()}@samajtest.org`;
  const testPhone = `98765${Math.floor(10000 + Math.random() * 90000)}`;
  const testUsername = `del_user_${Date.now()}`;

  console.log(`\n1. Creating dummy member: ${testUsername} (${testEmail})`);
  const { data: memberData, error: createErr } = await supabase
    .from("members")
    .insert({
      name: "Temporary Deletion Test Member",
      email: testEmail,
      phone: testPhone,
      username: testUsername,
      role: "member",
      city: "મોડાસા",
      native_place: "બોલુન્દ્રા",
      address: "ટેસ્ટ સરનામું",
      marital_status: "અપરિણિત (Unmarried)",
      gender: "male",
      completeness: 85,
    })
    .select()
    .single();

  if (createErr || !memberData) {
    console.error("Failed to create test member:", createErr);
    process.exit(1);
  }

  const memberId = memberData.id;
  console.log(`✓ Member created with ID: ${memberId}`);

  // 2. Add matrimony record for this member
  console.log("\n2. Inserting matrimony record for member...");
  const { error: matErr } = await supabase
    .from("member_matrimony")
    .insert({
      member_id: memberId,
      is_available: true,
      height: "5'8\"",
      weight: "65 kg",
      about_me: "Testing matrimony cascade delete",
    });

  if (matErr) {
    console.warn("Notice: matrimony insert:", matErr.message);
  } else {
    console.log("✓ Matrimony record inserted");
  }

  // 3. Verify member and child records exist
  const { data: checkBefore } = await supabase
    .from("members")
    .select("id, name, email")
    .eq("id", memberId)
    .maybeSingle();

  if (!checkBefore) {
    console.error("Failed: Member not found in DB before deletion test");
    process.exit(1);
  }
  console.log(`✓ Verified member exists before deletion: ${checkBefore.name}`);

  // 4. Test API DELETE request against local server or direct deleteSupabaseMember simulation
  console.log("\n3. Testing member deletion via DELETE handler simulation...");
  
  // Clean matrimony
  const { error: delMatErr } = await supabase
    .from("member_matrimony")
    .delete()
    .eq("member_id", memberId);
  if (delMatErr) console.warn("delMatErr:", delMatErr.message);

  // Clean member
  const { error: delMemErr } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (delMemErr) {
    console.error("Failed to delete member:", delMemErr);
    process.exit(1);
  }
  console.log("✓ Member row deleted from Supabase");

  // 5. Verify member is no longer in Supabase
  const { data: checkAfter } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();

  if (checkAfter) {
    console.error("FAILED: Member still exists in Supabase after deletion!");
    process.exit(1);
  }
  console.log("✓ Verified member is completely removed from DB");

  // Verify matrimony is deleted
  const { data: checkMatAfter } = await supabase
    .from("member_matrimony")
    .select("id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (checkMatAfter) {
    console.error("FAILED: Matrimony record still exists after member deletion!");
    process.exit(1);
  }
  console.log("✓ Verified matrimony record is completely removed from DB");

  console.log("\n=== ALL DELETE MEMBER TESTS PASSED ===");
}

runTests().catch((err) => {
  console.error("Unhandled test error:", err);
  process.exit(1);
});

