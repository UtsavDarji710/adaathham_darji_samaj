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
  const srcPath = "C:/Users/utsav/.gemini/antigravity/brain/73796dd7-3d7c-4601-b694-3be2d2b0dc76/.user_uploaded/media_1794225571546_49688315.jpg";
  const imageBuffer = fs.readFileSync(srcPath);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("samiti-assets")
    .upload("bank-qr-code.jpg", imageBuffer, {
      contentType: "image/jpeg",
      upsert: true
    });

  if (uploadError) {
    console.error("Upload error to samiti-assets:", uploadError);
  } else {
    console.log("Upload successful to samiti-assets:", uploadData);
  }

  const { data: publicUrlData } = supabase.storage
    .from("samiti-assets")
    .getPublicUrl("bank-qr-code.jpg");

  console.log("SAMITI_ASSETS_PUBLIC_URL=" + publicUrlData.publicUrl);
}

main().catch(console.error);

