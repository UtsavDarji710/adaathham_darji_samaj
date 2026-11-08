import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function matrimonyDbRowToProfile(matRow) {
  const matPriv = matRow?.privacy_settings || {};
  return {
    is_available: !!matRow?.is_available,
    is_public_listing: matPriv.is_public_listing !== false,
    is_saved: matPriv.is_saved !== false,
    height: matRow?.height || "",
    weight: matRow?.weight || "",
    complexion: matRow?.complexion || "",
    subcaste_gotra: matRow?.subcaste_gotra || "",
    about_me: matRow?.about_me || "",
    partner_expectations: matRow?.partner_expectations || "",
    hobbies: matRow?.hobbies || "",
    privacy: {
      show_name: matPriv.show_name !== false,
      show_photo: matPriv.show_photo !== false,
      show_age: matPriv.show_age !== false,
      show_native_place: matPriv.show_native_place !== false,
      show_education: matPriv.show_education !== false,
      show_occupation: matPriv.show_occupation !== false,
      show_contact: !!matPriv.show_contact,
    },
    updated_at: matRow?.updated_at || new Date().toISOString(),
  };
}

function isMemberEligibleForPublicMatrimony(member) {
  if (!member) return false;
  const status = (member.marital_status || "").trim();
  const isUnmarried =
    status === "અપરણિત (Unmarried)" ||
    status === "અપરણિત" ||
    status.toLowerCase().includes("unmarried");
  if (!isUnmarried) return false;
  const isMatrimonyEnabled =
    member.is_available_for_matrimony === true && member.matrimony?.is_available === true;
  if (!isMatrimonyEnabled) return false;
  const isPublicListing = member.matrimony?.is_public_listing === true;
  if (!isPublicListing) return false;
  const isDetailsSaved = member.matrimony?.is_saved === true;
  if (!isDetailsSaved) return false;
  return true;
}

async function main() {
  const [membersRes, matRes] = await Promise.all([
    supabase.from('members').select('*'),
    supabase.from('member_matrimony').select('*'),
  ]);

  const matMap = new Map();
  matRes.data.forEach((m) => matMap.set(m.member_id, m));

  const members = membersRes.data.map((row) => {
    const matRow = matMap.get(row.id);
    const statusClean = String(row.marital_status || "").trim();
    const isUnmarried =
      statusClean === "અપરણિત (Unmarried)" ||
      statusClean === "અપરણિત" ||
      statusClean.toLowerCase().includes("unmarried");

    let matrimony;
    let is_available_for_matrimony = false;
    if (matRow) {
      const prof = matrimonyDbRowToProfile(matRow);
      matrimony = {
        ...prof,
        is_available: isUnmarried ? prof.is_available : false,
      };
      is_available_for_matrimony = isUnmarried && prof.is_available;
    }

    return {
      id: row.id,
      name: row.name,
      marital_status: row.marital_status,
      is_available_for_matrimony,
      matrimony,
    };
  });

  console.log('Processed members:', JSON.stringify(members, null, 2));

  const eligible = members.filter(isMemberEligibleForPublicMatrimony);
  console.log('Eligible Matrimony Candidates count:', eligible.length);
  console.log('Eligible Candidates:', JSON.stringify(eligible, null, 2));
}

main();

