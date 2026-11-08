import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
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
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("=== 1. Update existing utsavdarji and darmik username columns in Supabase ===");
  const { error: upErr1 } = await supabaseAdmin
    .from("members")
    .update({ username: "utsavdarji" })
    .eq("email", "utsavdarji102001@gmail.com");
  console.log("Updated utsavdarji username:", upErr1 || "SUCCESS");

  const { error: upErr2 } = await supabaseAdmin
    .from("members")
    .update({ username: "darmik" })
    .eq("email", "darmikdarji@gmail.com");
  console.log("Updated darmik username:", upErr2 || "SUCCESS");

  console.log("\n=== 2. Check / Create Dharmik Parmar (dharmikparmar31@gmail.com) ===");
  const email = "dharmikparmar31@gmail.com";
  const username = "dharmikparmar";
  const defaultPassword = "Samaj@123";

  // Check if auth user exists
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
  let dharmikAuth = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!dharmikAuth) {
    console.log("Creating Dharmik Parmar in Supabase Auth...");
    const { data: newAuth, error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        username: username,
        name: "ધાર્મિક પરમાર",
        phone: "98250 12345",
        role: "member",
        email_verified: true,
      },
    });

    if (createAuthErr) {
      console.error("Failed to create Dharmik in Supabase Auth:", createAuthErr);
      return;
    }
    dharmikAuth = newAuth.user;
    console.log("Dharmik Auth created with ID:", dharmikAuth.id);
  } else {
    console.log("Dharmik Auth already exists with ID:", dharmikAuth.id);
    // Update password to ensure it is Samaj@123
    await supabaseAdmin.auth.admin.updateUserById(dharmikAuth.id, {
      password: defaultPassword,
      user_metadata: {
        ...dharmikAuth.user_metadata,
        username: username,
        name: "ધાર્મિક પરમાર",
      },
    });
    console.log("Dharmik Auth metadata and password refreshed.");
  }

  // Check if Dharmik exists in public.members
  const { data: existingMember } = await supabaseAdmin
    .from("members")
    .select("*")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();

  const dharmikMemberData = {
    id: dharmikAuth.id,
    auth_user_id: dharmikAuth.id,
    username: username,
    name: "ધાર્મિક પરમાર",
    email: email,
    phone: "98250 12345",
    is_email_verified: true,
    email_verified_at: new Date().toISOString(),
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    address: "મોડાસા",
    city: "મોડાસા",
    district: "અરવલ્લી",
    native_place: "અડાઆઠમ",
    pincode: "383315",
    marital_status: "અપરિણિત (Single)",
    gender: "male",
    role: "member",
    is_lifetime_member: false,
    completeness: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!existingMember) {
    console.log("Inserting Dharmik Parmar into public.members...");
    const { error: insertErr } = await supabaseAdmin.from("members").insert(dharmikMemberData);
    if (insertErr) {
      console.error("Error inserting member:", insertErr);
    } else {
      console.log("Successfully inserted Dharmik into public.members!");
    }
  } else {
    console.log("Updating existing Dharmik member record in public.members...");
    const { error: updateErr } = await supabaseAdmin
      .from("members")
      .update(dharmikMemberData)
      .eq("email", email);
    if (updateErr) {
      console.error("Error updating member:", updateErr);
    } else {
      console.log("Successfully updated Dharmik in public.members!");
    }
  }

  console.log("\n=== 3. Testing Sign-In via Supabase Auth with Password ===");
  const { data: signInData, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
    email: email,
    password: defaultPassword,
  });

  if (signInErr) {
    console.error("Sign in failed:", signInErr);
  } else {
    console.log("Sign-in SUCCESSFUL! Access token received for Dharmik:", signInData.user.id);
  }

  console.log("\n=== 4. Verifying All Users in public.members ===");
  const { data: allMembers } = await supabaseAdmin.from("members").select("id, username, email, name, phone, role");
  console.table(allMembers);
}

main().catch(console.error);

