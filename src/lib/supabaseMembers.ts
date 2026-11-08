import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { Member, PrivacySettings } from "@/types";
import { hashPassword, verifyPassword } from "@/lib/passwordUtils";

const DEFAULT_PRIVACY: PrivacySettings = {
  phone: "members",
  address: "members",
  photo: "public",
  family: "members",
  business: "public",
  employment: "members",
  education: "members",
};

/**
 * Convert a Supabase `members` table row to application `Member` type
 */
export function dbRowToMember(row: any): Member {
  return {
    id: row.id || row.local_member_id || "",
    auth_user_id: row.auth_user_id || undefined,
    username: row.username ? String(row.username).toLowerCase().trim() : undefined,
    name: row.name || "",
    phone: row.phone || "",
    email: row.email ? String(row.email).toLowerCase().trim() : undefined,
    is_email_verified: !!row.is_email_verified,
    email_verified_at: row.email_verified_at || undefined,
    photo_url:
      row.photo_url ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    address: row.address || "",
    city: row.city || "મોડાસા",
    district: row.district || "અરવલ્લી",
    native_place: row.native_place || "અડાઆઠમ",
    pincode: row.pincode || "383315",
    father_name: row.father_name || "",
    grandfather_name: row.grandfather_name || "",
    maternal_uncle_name: row.maternal_uncle_name || "",
    maternal_grandfather_name: row.maternal_grandfather_name || "",
    sasri_name: row.sasri_name || "",
    piyar_name: row.piyar_name || "",
    is_public_in_family: !!row.is_public_in_family,
    marital_status: row.marital_status || "પરણિત (Married)",
    gender: row.gender || "male",
    dob: row.dob || undefined,
    blood_group: row.blood_group || undefined,
    role: row.role || "member",
    is_lifetime_member: !!row.is_lifetime_member,
    committee_role: row.committee_role || undefined,
    committee_order: row.committee_order ?? 99,
    completeness: row.completeness ?? 75,
    created_at: row.created_at || new Date().toISOString(),
    privacy: {
      phone: row.privacy_phone || DEFAULT_PRIVACY.phone,
      address: row.privacy_address || DEFAULT_PRIVACY.address,
      photo: row.privacy_photo || DEFAULT_PRIVACY.photo,
      family: row.privacy_family || DEFAULT_PRIVACY.family,
      business: row.privacy_business || DEFAULT_PRIVACY.business,
      employment: row.privacy_employment || DEFAULT_PRIVACY.employment,
      education: row.privacy_education || DEFAULT_PRIVACY.education,
    },
    family_relations: Array.isArray(row.family_relations) ? row.family_relations : [],
    employment: row.employment && typeof row.employment === "object" ? row.employment : undefined,
    education: row.education && typeof row.education === "object" ? row.education : undefined,
    password_hash: row.password_hash || undefined,
    salt: row.salt || undefined,
  };
}

/**
 * Map application `Member` properties to Supabase `members` table columns
 */
export function memberToDbRow(m: Partial<Member>): Record<string, any> {
  const row: Record<string, any> = {};

  // Only assign valid UUID or let DB generate
  if (m.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m.id)) {
    row.id = m.id;
  }
  if (m.auth_user_id) row.auth_user_id = m.auth_user_id;
  if (m.username !== undefined) row.username = m.username ? m.username.toLowerCase().trim() : null;
  if (m.name !== undefined) row.name = m.name;
  if (m.phone !== undefined) row.phone = m.phone;
  if (m.email !== undefined) row.email = m.email ? m.email.toLowerCase().trim() : null;
  if (m.password_hash !== undefined) row.password_hash = m.password_hash;
  if (m.salt !== undefined) row.salt = m.salt;
  if (m.is_email_verified !== undefined) row.is_email_verified = m.is_email_verified;
  if (m.email_verified_at !== undefined) row.email_verified_at = m.email_verified_at;
  if (m.photo_url !== undefined) row.photo_url = m.photo_url;
  if (m.address !== undefined) row.address = m.address;
  if (m.city !== undefined) row.city = m.city;
  if (m.district !== undefined) row.district = m.district;
  if (m.native_place !== undefined) row.native_place = m.native_place;
  if (m.pincode !== undefined) row.pincode = m.pincode;
  if (m.father_name !== undefined) row.father_name = m.father_name;
  if (m.grandfather_name !== undefined) row.grandfather_name = m.grandfather_name;
  if (m.maternal_uncle_name !== undefined) row.maternal_uncle_name = m.maternal_uncle_name;
  if (m.maternal_grandfather_name !== undefined)
    row.maternal_grandfather_name = m.maternal_grandfather_name;
  if (m.sasri_name !== undefined) row.sasri_name = m.sasri_name;
  if (m.piyar_name !== undefined) row.piyar_name = m.piyar_name;
  if (m.is_public_in_family !== undefined) row.is_public_in_family = m.is_public_in_family;
  if (m.marital_status !== undefined) row.marital_status = m.marital_status;
  if (m.gender !== undefined) row.gender = m.gender;
  if (m.dob !== undefined) row.dob = m.dob;
  if (m.blood_group !== undefined) row.blood_group = m.blood_group;
  if (m.role !== undefined) row.role = m.role;
  if (m.is_lifetime_member !== undefined) row.is_lifetime_member = m.is_lifetime_member;
  if (m.committee_role !== undefined) row.committee_role = m.committee_role;
  if (m.committee_order !== undefined) row.committee_order = m.committee_order;
  if (m.completeness !== undefined) row.completeness = m.completeness;
  if (m.family_relations !== undefined) row.family_relations = m.family_relations;
  if (m.employment !== undefined) row.employment = m.employment;
  if (m.education !== undefined) row.education = m.education;

  if (m.privacy) {
    if (m.privacy.phone) row.privacy_phone = m.privacy.phone;
    if (m.privacy.address) row.privacy_address = m.privacy.address;
    if (m.privacy.photo) row.privacy_photo = m.privacy.photo;
    if (m.privacy.family) row.privacy_family = m.privacy.family;
    if (m.privacy.business) row.privacy_business = m.privacy.business;
    if (m.privacy.employment) row.privacy_employment = m.privacy.employment;
    if (m.privacy.education) row.privacy_education = m.privacy.education;
  }

  row.updated_at = new Date().toISOString();
  return row;
}

/**
 * Fetch a member by username, email, ID, or auth_user_id directly from Supabase
 */
export async function getSupabaseMember(identifier: string): Promise<Member | null> {
  if (!isSupabaseConfigured() || !identifier || identifier === "guest") {
    return null;
  }

  const clean = decodeURIComponent(identifier).trim().toLowerCase();

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

    let query = supabaseAdmin.from("members").select("*");

    if (isUUID) {
      query = query.or(`id.eq.${clean},auth_user_id.eq.${clean}`);
    } else if (clean.includes("@")) {
      query = query.ilike("email", clean);
    } else {
      query = query.or(`username.ilike.${clean},phone.eq.${clean}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.warn("[getSupabaseMember error]", error.message);
      return null;
    }

    if (data) {
      return dbRowToMember(data);
    }

    // Secondary check: look up in auth.users by email or user_metadata.username
    const { data: usersData, error: authListErr } = await supabaseAdmin.auth.admin.listUsers();
    if (!authListErr && usersData?.users) {
      const match = usersData.users.find(
        (u) =>
          u.email?.toLowerCase() === clean ||
          u.user_metadata?.username?.toLowerCase() === clean ||
          u.id === clean
      );

      if (match) {
        // Query members by matched auth user id or email
        const { data: memberByAuth } = await supabaseAdmin
          .from("members")
          .select("*")
          .or(`auth_user_id.eq.${match.id},email.ilike.${match.email}`)
          .maybeSingle();

        if (memberByAuth) {
          return dbRowToMember(memberByAuth);
        }
      }
    }

    return null;
  } catch (err: any) {
    console.warn("[getSupabaseMember exception]", err.message);
    return null;
  }
}

/**
 * Check if a username is already taken in Supabase
 */
export async function isSupabaseUsernameTaken(
  username: string,
  excludeEmail?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !username) return false;

  const clean = username.trim().toLowerCase();

  try {
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("id, username, email")
      .ilike("username", clean)
      .maybeSingle();

    if (!error && data) {
      if (excludeEmail && data.email?.toLowerCase() === excludeEmail.toLowerCase()) {
        return false;
      }
      return true;
    }

    // Also check auth.users metadata
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    if (usersData?.users) {
      const exists = usersData.users.some(
        (u) =>
          u.user_metadata?.username?.toLowerCase() === clean &&
          (!excludeEmail || u.email?.toLowerCase() !== excludeEmail.toLowerCase())
      );
      if (exists) return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Authenticate user with Username + Password using Supabase
 */
export async function authenticateSupabase(
  usernameOrIdentifier: string,
  plainPassword: string
): Promise<{ success: boolean; member?: Member; message?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase ડેટાબેઝ રૂપરેખાંકિત નથી.",
    };
  }

  const clean = usernameOrIdentifier.trim().toLowerCase();

  try {
    // 1. Locate member in public.members by username or email
    let memberRow: any = null;
    let targetEmail = "";

    const { data: dbData, error: dbErr } = await supabaseAdmin
      .from("members")
      .select("*")
      .or(`username.ilike.${clean},email.ilike.${clean}`)
      .maybeSingle();

    if (!dbErr && dbData) {
      memberRow = dbData;
      targetEmail = dbData.email;
    }

    // 2. If not found in members table, check auth.users
    if (!targetEmail) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const found = usersData.users.find(
          (u) =>
            u.email?.toLowerCase() === clean ||
            u.user_metadata?.username?.toLowerCase() === clean
        );
        if (found && found.email) {
          targetEmail = found.email;
        }
      }
    }

    if (!targetEmail) {
      return {
        success: false,
        message: "આ યુઝરનેમ ધરાવતું ખાતું મળ્યું નથી. કૃપા કરીને પ્રથમ નોંધણી (Register) કરો.",
      };
    }

    // 3. Authenticate with Supabase Auth using targetEmail + plainPassword
    const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: plainPassword,
    });

    if (authError || !authResult.user) {
      // Check stored password hash in members table for compatibility
      if (memberRow?.password_hash && memberRow?.salt) {
        const isValid = verifyPassword(plainPassword, memberRow.password_hash, memberRow.salt);
        if (isValid) {
          return {
            success: true,
            member: dbRowToMember(memberRow),
          };
        }
      }

      return {
        success: false,
        message: "અમાન્ય યુઝરનેમ અથવા પાસવર્ડ. કૃપા કરીને ફરી ચકાસો અથવા પાસવર્ડ રીસેટ કરો.",
      };
    }

    // 4. Auth succeeded! If members row not yet present, insert or load it
    if (!memberRow) {
      const { data: reloaded } = await supabaseAdmin
        .from("members")
        .select("*")
        .eq("auth_user_id", authResult.user.id)
        .maybeSingle();
      memberRow = reloaded;
    }

    if (memberRow) {
      return {
        success: true,
        member: dbRowToMember(memberRow),
      };
    }

    // Construct member from auth metadata if table row is empty
    const meta = authResult.user.user_metadata || {};
    const fallbackMember: Member = {
      id: authResult.user.id,
      auth_user_id: authResult.user.id,
      username: meta.username || clean,
      name: meta.name || "સભ્યશ્રી",
      email: targetEmail,
      phone: meta.phone || "98250 12345",
      role: meta.role || "member",
      is_lifetime_member: false,
      photo_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
      address: "મોડાસા",
      city: "મોડાસા",
      district: "અરવલ્લી",
      native_place: "અડાઆઠમ",
      marital_status: "પરણિત (Married)",
      gender: "male",
      completeness: 80,
      created_at: new Date().toISOString(),
      privacy: DEFAULT_PRIVACY,
    };

    // Auto-create in members table
    try {
      await supabaseAdmin.from("members").insert(memberToDbRow(fallbackMember));
    } catch (e) {
      // Ignore conflict
    }

    return {
      success: true,
      member: fallbackMember,
    };
  } catch (err: any) {
    console.error("[authenticateSupabase error]", err);
    return {
      success: false,
      message: "પ્રમાણીકરણ દરમિયાન સર્વર ક્ષતિ આવી.",
    };
  }
}

/**
 * Register a new member in Supabase Auth and Supabase `members` table
 */
export async function registerSupabaseMember(
  memberData: Member,
  plainPassword: string
): Promise<{ success: boolean; member?: Member; message?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase રૂપરેખાંકિત નથી." };
  }

  const cleanUsername = memberData.username?.toLowerCase().trim() || "";
  const normalizedEmail = memberData.email?.toLowerCase().trim() || "";

  try {
    // 1. Create User in Supabase Authentication
    let authUserId: string | null = null;

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: plainPassword,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        name: memberData.name,
        phone: memberData.phone,
        role: memberData.role || "member",
        email_verified: true,
      },
    });

    if (authErr) {
      if (authErr.message.toLowerCase().includes("already registered")) {
        // User auth exists; retrieve id
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const found = usersData?.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
        authUserId = found?.id || null;
      } else {
        console.error("[registerSupabaseMember authErr]", authErr);
        return {
          success: false,
          message: `ઓથેન્ટિકેશન એકાઉન્ટ બનાવવામાં ભૂલ: ${authErr.message}`,
        };
      }
    } else {
      authUserId = authData.user.id;
    }

    const { hash: passwordHash, salt: passwordSalt } = hashPassword(plainPassword);

    // 2. Prepare database row
    const dbPayload = memberToDbRow({
      ...memberData,
      id: authUserId || undefined,
      auth_user_id: authUserId || undefined,
      username: cleanUsername,
      email: normalizedEmail,
      password_hash: passwordHash,
      salt: passwordSalt,
      is_email_verified: true,
      email_verified_at: new Date().toISOString(),
    });

    // Check if row already exists in members table
    const { data: existingRow } = await supabaseAdmin
      .from("members")
      .select("id")
      .or(`email.eq.${normalizedEmail},username.eq.${cleanUsername}`)
      .maybeSingle();

    let savedMemberRow: any = null;

    if (existingRow) {
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("members")
        .update(dbPayload)
        .eq("id", existingRow.id)
        .select()
        .single();

      if (updateErr) {
        console.error("[registerSupabaseMember updateErr]", updateErr);
      } else {
        savedMemberRow = updated;
      }
    } else {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("members")
        .insert(dbPayload)
        .select()
        .single();

      if (insertErr) {
        console.error("[registerSupabaseMember insertErr]", insertErr);
        // If unique phone constraint was violated, try upserting by phone
        if (insertErr.code === "23505") {
          const { data: upserted } = await supabaseAdmin
            .from("members")
            .update(dbPayload)
            .eq("phone", memberData.phone)
            .select()
            .single();
          savedMemberRow = upserted;
        }
      } else {
        savedMemberRow = inserted;
      }
    }

    const resultMember = savedMemberRow ? dbRowToMember(savedMemberRow) : memberData;
    return {
      success: true,
      member: resultMember,
    };
  } catch (err: any) {
    console.error("[registerSupabaseMember exception]", err);
    return {
      success: false,
      message: err.message || "નોંધણી પ્રક્રિયામાં ભૂલ આવી.",
    };
  }
}

/**
 * Update member profile in Supabase
 */
export async function updateSupabaseMember(
  idOrSession: string,
  updates: Partial<Member>
): Promise<Member | null> {
  if (!isSupabaseConfigured() || !idOrSession) return null;

  const clean = decodeURIComponent(idOrSession).trim().toLowerCase();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  const dbUpdates = memberToDbRow(updates);

  try {
    let query = supabaseAdmin.from("members").update(dbUpdates);

    if (isUUID) {
      query = query.or(`id.eq.${clean},auth_user_id.eq.${clean}`);
    } else if (clean.includes("@")) {
      query = query.ilike("email", clean);
    } else {
      query = query.or(`username.ilike.${clean},phone.eq.${clean}`);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      console.warn("[updateSupabaseMember error]", error.message);
      return null;
    }

    return data ? dbRowToMember(data) : null;
  } catch (err: any) {
    console.warn("[updateSupabaseMember exception]", err.message);
    return null;
  }
}

/**
 * Update user avatar photo in Supabase permanently
 */
export async function updateSupabaseMemberPhoto(
  idOrSession: string,
  photoUrl: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !idOrSession || !photoUrl) return false;

  const clean = decodeURIComponent(idOrSession).trim().toLowerCase();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  try {
    let query = supabaseAdmin
      .from("members")
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() });

    if (isUUID) {
      query = query.or(`id.eq.${clean},auth_user_id.eq.${clean}`);
    } else if (clean.includes("@")) {
      query = query.ilike("email", clean);
    } else {
      query = query.or(`username.ilike.${clean},phone.eq.${clean}`);
    }

    const { error } = await query;
    if (error) {
      console.warn("[updateSupabaseMemberPhoto error]", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("[updateSupabaseMemberPhoto exception]", err.message);
    return false;
  }
}

/**
 * Reset user password in Supabase Auth and members table
 */
export async function resetSupabasePassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; username?: string; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: "Supabase રૂપરેખાંકિત નથી." };
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Find user in auth.users
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      return { success: false, message: listErr.message };
    }

    const authUser = usersData.users.find((u) => u.email?.toLowerCase() === cleanEmail);
    if (!authUser) {
      return {
        success: false,
        message: "આ ઈમેઈલ ધરાવતું કોઈ ખાતું મળ્યું નથી.",
      };
    }

    // 2. Update Supabase Auth password
    const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      password: newPassword,
    });

    if (updateAuthErr) {
      return {
        success: false,
        message: `પાસવર્ડ બદલવામાં ક્ષતિ: ${updateAuthErr.message}`,
      };
    }

    // 3. Update password_hash in members table
    const { hash: passwordHash, salt: passwordSalt } = hashPassword(newPassword);
    await supabaseAdmin
      .from("members")
      .update({
        password_hash: passwordHash,
        salt: passwordSalt,
        updated_at: new Date().toISOString(),
      })
      .ilike("email", cleanEmail);

    const username = authUser.user_metadata?.username;
    return {
      success: true,
      username,
      message:
        "આપનો પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે આપ આપના યુઝરનેમ અને નવા પાસવર્ડ વડે લૉગિન કરી શકો છો.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "સર્વર ક્ષતિ આવી.",
    };
  }
}

