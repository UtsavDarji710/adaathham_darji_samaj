import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read and parse .env.local
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key Available:", !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError);
    return;
  }
  console.log("Available Buckets:", buckets.map(b => ({ name: b.name, public: b.public })));

  const srcPath = "C:/Users/utsav/.gemini/antigravity/brain/73796dd7-3d7c-4601-b694-3be2d2b0dc76/.user_uploaded/media_1794225571546_49688315.jpg";
  const imageBuffer = fs.readFileSync(srcPath);

  // Preferred bucket
  let targetBucket = buckets.find(b => b.name === "samiti-assets" || b.name === "member-photos" || b.public);
  if (!targetBucket && buckets.length > 0) {
    targetBucket = buckets[0];
  }

  let bucketName = targetBucket ? targetBucket.name : "samiti-assets";
  console.log("Using bucket:", bucketName);

  // Ensure bucket exists or create it
  if (!targetBucket) {
    const { data: createData, error: createError } = await supabase.storage.createBucket("samiti-assets", {
      public: true
    });
    console.log("Bucket creation result:", createData, createError);
    bucketName = "samiti-assets";
  }

  const fileName = `bank-qr-code.jpg`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
  } else {
    console.log("Upload successful:", uploadData);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log("PUBLIC_URL_RESULT=" + publicUrlData.publicUrl);
}

main().catch(console.error);
