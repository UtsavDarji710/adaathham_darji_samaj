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

async function main() {
  const testMemberId = '86b7b1da-e0ba-476d-a87e-7b8fb20405bd'; // Utsav Darji
  
  // Test upsert
  const { data: upsertData, error: upsertErr } = await supabase
    .from('member_matrimony')
    .upsert({
      member_id: testMemberId,
      is_available: true,
      height: "5' 8\"",
      complexion: "ઘઉંવર્ણ (Wheatish)",
      about_me: "સોફ્ટવેર એન્જિનિયર, મોડાસા",
      partner_expectations: "સંસ્કારી અને સુશિક્ષિત જીવનસાથી",
      privacy_settings: {
        show_name: true,
        show_photo: true,
        show_age: true,
        show_native_place: true,
        show_education: true,
        show_occupation: true,
        show_contact: true,
        is_public_listing: true,
        is_saved: true
      }
    }, { onConflict: 'member_id' })
    .select();

  console.log('Upsert result:', { upsertData, upsertErr });

  // Test join or fetch
  const { data: allMat, error: allMatErr } = await supabase
    .from('member_matrimony')
    .select('*');
  console.log('All Matrimony count:', allMat?.length);
  console.log('First mat row:', allMat?.[0]);
}

main();
