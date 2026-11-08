import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Load .env.local
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

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const supabaseClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
});

function hashPassword(password, salt) {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 1000, 64, "sha512").toString("hex");
  return { hash, salt: generatedSalt };
}

async function createAdminUser() {
  const email = "dharmikparmar31@gmail.com".toLowerCase().trim();
  const username = "dharmik31".toLowerCase().trim();
  const password = "Jaygurudeo@9#";
  const name = "ધાર્મિક પરમાર";
  const phone = "98250 31031";
  const role = "admin";
  const committee_role = "સિસ્ટમ એડમિનિસ્ટ્રેટર";

  console.log(`Creating Admin User: ${username} (${email})...`);

  // 1. Check existing Auth users
  const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) {
    console.error("Error listing users:", listErr.message);
  } else if (usersData?.users) {
    for (const u of usersData.users) {
      if (u.email?.toLowerCase() === email || u.user_metadata?.username?.toLowerCase() === username) {
        console.log(`Found existing auth user ${u.id} (${u.email}), deleting...`);
        await supabaseAdmin.auth.admin.deleteUser(u.id);
      }
    }
  }

  // 2. Delete any existing rows in public.members with this email or username
  await supabaseAdmin.from("members").delete().or(`email.ilike.${email},username.ilike.${username}`);

  // 3. Create Supabase Auth User with confirmed email
  console.log("Creating new user in Supabase Auth...");
  const { data: authCreated, error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      name,
      phone,
      role,
    },
  });

  if (createAuthErr || !authCreated?.user) {
    throw new Error(`Failed to create Auth user: ${createAuthErr?.message}`);
  }

  const userId = authCreated.user.id;
  console.log(`Auth user created successfully! ID: ${userId}`);

  // 4. Hash password for public.members table
  const { hash, salt } = hashPassword(password);

  // 5. Insert row into public.members
  console.log("Inserting member record into public.members table...");
  const memberRecord = {
    id: userId,
    auth_user_id: userId,
    username,
    name,
    phone,
    email,
    password_hash: hash,
    salt,
    is_email_verified: true,
    email_verified_at: new Date().toISOString(),
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    address: "મોડાસા",
    city: "મોડાસા",
    district: "અરવલ્લી",
    native_place: "મોડાસા",
    pincode: "383315",
    marital_status: "પરણિત (Married)",
    gender: "male",
    role,
    is_lifetime_member: true,
    committee_role,
    committee_order: 1,
    completeness: 100,
    privacy_phone: "members",
    privacy_address: "members",
    privacy_photo: "public",
    privacy_family: "members",
    privacy_business: "public",
    privacy_employment: "members",
    privacy_education: "members",
    family_relations: [],
    employment: {
      occupation: "Business / IT Administration",
      employer: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ",
      work_address: "મોડાસા",
      experience_years: 5,
    },
    education: {
      degree: "Graduate / Professional",
      institute: "ગુજરાત યુનિવર્સિટી",
      field_of_study: "Management & Tech",
      passing_year: 2020,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertErr } = await supabaseAdmin.from("members").insert(memberRecord);
  if (insertErr) {
    throw new Error(`Failed to insert into public.members: ${insertErr.message}`);
  }
  console.log("public.members record inserted successfully!");

  // 6. Sync to local .data/members.json
  const dataDir = path.resolve(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const membersFile = path.join(dataDir, "members.json");
  let localMembers = [];
  if (fs.existsSync(membersFile)) {
    try {
      localMembers = JSON.parse(fs.readFileSync(membersFile, "utf-8"));
    } catch {}
  }
  // Remove any conflicting local member
  localMembers = localMembers.filter((m) => m.email?.toLowerCase() !== email && m.username?.toLowerCase() !== username);
  localMembers.push(memberRecord);
  fs.writeFileSync(membersFile, JSON.stringify(localMembers, null, 2), "utf-8");
  console.log("Local .data/members.json updated successfully!");

  // 7. Verify Auth with signInWithPassword
  console.log("\nVerifying direct sign in with Supabase Auth...");
  const { data: loginData, error: loginErr } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (loginErr || !loginData?.user) {
    throw new Error(`Verification login failed: ${loginErr?.message}`);
  }

  console.log("✓ Login successful via Supabase Auth!");
  console.log(`  User: ${loginData.user.email} (${loginData.user.id})`);
  console.log(`  Username metadata: ${loginData.user.user_metadata?.username}`);
  console.log(`  Role metadata: ${loginData.user.user_metadata?.role}`);

  console.log("\n==============================================");
  console.log("ADMIN USER CREATED AND VERIFIED SUCCESSFULLY!");
  console.log("==============================================");
  console.log(`Username: ${username}`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role:     ${role}`);
  console.log("==============================================\n");
}

createAdminUser().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});

