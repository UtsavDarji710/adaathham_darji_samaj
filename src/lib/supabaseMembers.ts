import { supabase, supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { Member, PrivacySettings, MatrimonyProfile, MatrimonyPrivacySettings, DEFAULT_MEMBER_PRIVACY } from "@/types";
import { hashPassword, verifyPassword } from "@/lib/passwordUtils";
import { deleteMemberRecord, getMemberByIdOrSession } from "@/lib/memberStore";

const DEFAULT_PRIVACY: PrivacySettings = DEFAULT_MEMBER_PRIVACY;

/**
 * Convert a Supabase `member_matrimony` row to application `MatrimonyProfile`
 */
export function matrimonyDbRowToProfile(matRow: any): MatrimonyProfile {
  const matPriv =
    matRow && matRow.privacy_settings && typeof matRow.privacy_settings === "object"
      ? matRow.privacy_settings
      : {};

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

/**
 * Convert a Supabase `members` table row to application `Member` type
 */
export function dbRowToMember(row: any, matRow?: any): Member {
  const marital = row.marital_status || "પરણિત (Married)";
  const statusClean = String(marital).trim();
  const isUnmarried =
    statusClean === "અપરણિત (Unmarried)" ||
    statusClean === "અપરણિત" ||
    statusClean.toLowerCase().includes("unmarried");

  let matrimony: MatrimonyProfile | undefined = undefined;
  let isAvailableForMatrimony = false;

  if (matRow) {
    const prof = matrimonyDbRowToProfile(matRow);
    matrimony = {
      ...prof,
      is_available: isUnmarried ? prof.is_available : false,
    };
    isAvailableForMatrimony = isUnmarried && prof.is_available;
  } else if (row.matrimony) {
    matrimony = {
      ...row.matrimony,
      is_available: isUnmarried ? !!row.matrimony.is_available : false,
    };
    isAvailableForMatrimony =
      isUnmarried && (row.is_available_for_matrimony ?? row.matrimony?.is_available ?? false);
  }

  return {
    id: row.id || row.local_member_id || "",
    auth_user_id: row.auth_user_id || undefined,
    username: row.username ? String(row.username).toLowerCase().trim() : undefined,
    name: row.name || "",
    phone: row.phone || "",
    email: row.email ? String(row.email).toLowerCase().trim() : undefined,
    is_email_verified: !!row.is_email_verified,
    email_verified_at: row.email_verified_at || undefined,
    photo_url: row.photo_url || null,
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
    marital_status: marital,
    is_available_for_matrimony: isAvailableForMatrimony,
    matrimony: matrimony,
    gender: row.gender || "male",
    dob: row.dob || undefined,
    blood_group: row.blood_group || undefined,
    jati: row.jati || (row.education && row.education.jati) || undefined,
    caste: row.caste || row.jati || (row.education && row.education.jati) || undefined,
    dod: row.dod || (row.education && row.education.dod) || undefined,
    is_deceased: !!row.is_deceased || !!row.dod || !!(row.education && row.education.dod),
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
      dob: row.privacy_dob || DEFAULT_PRIVACY.dob || "public",
    },
    family_relations: Array.isArray(row.family_relations) ? row.family_relations : [],
    business:
      row.business && typeof row.business === "object" && row.business.business_name
        ? row.business
        : row.employment && row.employment.business_detail && row.employment.business_detail.business_name
        ? row.employment.business_detail
        : undefined,
    employment:
      row.employment &&
      typeof row.employment === "object" &&
      Boolean(
        (row.employment.job_title && String(row.employment.job_title).trim()) ||
        (row.employment.company && String(row.employment.company).trim())
      )
        ? row.employment
        : undefined,
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
  if (m.photo_url !== undefined) row.photo_url = m.photo_url || null;
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
  if (m.employment !== undefined || m.business !== undefined) {
    row.employment = {
      ...(m.employment || {}),
      ...(m.business !== undefined ? { business_detail: m.business } : {}),
    };
  }
  if (m.education !== undefined || m.jati !== undefined || m.dod !== undefined) {
    row.education = {
      ...(m.education || {}),
      ...(m.jati !== undefined ? { jati: m.jati } : {}),
      ...(m.dod !== undefined ? { dod: m.dod } : {}),
    };
  }

  if (m.privacy) {
    if (m.privacy.phone) row.privacy_phone = m.privacy.phone;
    if (m.privacy.address) row.privacy_address = m.privacy.address;
    if (m.privacy.photo) row.privacy_photo = m.privacy.photo;
    if (m.privacy.family) row.privacy_family = m.privacy.family;
    if (m.privacy.business) row.privacy_business = m.privacy.business;
    if (m.privacy.employment) row.privacy_employment = m.privacy.employment;
    if (m.privacy.education) row.privacy_education = m.privacy.education;
    if (m.privacy.dob) row.privacy_dob = m.privacy.dob;
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
      const { data: matData } = await supabaseAdmin
        .from("member_matrimony")
        .select("*")
        .eq("member_id", data.id)
        .maybeSingle();
      return dbRowToMember(data, matData);
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
          const { data: matData } = await supabaseAdmin
            .from("member_matrimony")
            .select("*")
            .eq("member_id", memberByAuth.id)
            .maybeSingle();
          return dbRowToMember(memberByAuth, matData);
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
      const { data: matData } = await supabaseAdmin
        .from("member_matrimony")
        .select("*")
        .eq("member_id", memberRow.id)
        .maybeSingle();

      return {
        success: true,
        member: dbRowToMember(memberRow, matData),
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
      photo_url: meta.photo_url || null,
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

    let { data, error } = await query.select().maybeSingle();

    if (error && error.message && error.message.includes("privacy_dob")) {
      delete dbUpdates.privacy_dob;
      let retryQuery = supabaseAdmin.from("members").update(dbUpdates);
      if (isUUID) {
        retryQuery = retryQuery.or(`id.eq.${clean},auth_user_id.eq.${clean}`);
      } else if (clean.includes("@")) {
        retryQuery = retryQuery.ilike("email", clean);
      } else {
        retryQuery = retryQuery.or(`username.ilike.${clean},phone.eq.${clean}`);
      }
      const retryRes = await retryQuery.select().maybeSingle();
      data = retryRes.data;
      error = retryRes.error;
    }

    if (error) {
      console.warn("[updateSupabaseMember error]", error.message);
      return null;
    }

    if (!data) return null;

    // Handle member_matrimony table updates
    const targetMemberId = data.id;
    if (updates.matrimony || updates.is_available_for_matrimony !== undefined) {
      const mat: Partial<MatrimonyProfile> = updates.matrimony || {};
      const status = (updates.marital_status || data.marital_status || "").trim();
      const isUnmarried =
        status === "અપરણિત (Unmarried)" ||
        status === "અપરણિત" ||
        status.toLowerCase().includes("unmarried");

      const isAvail = isUnmarried && (updates.is_available_for_matrimony ?? mat.is_available ?? false);

      const matPrivacy = mat.privacy || {
        show_name: true,
        show_photo: true,
        show_age: true,
        show_native_place: true,
        show_education: true,
        show_occupation: true,
        show_contact: false,
      };

      await supabaseAdmin.from("member_matrimony").upsert(
        {
          member_id: targetMemberId,
          is_available: isAvail,
          height: mat.height || null,
          weight: mat.weight || null,
          complexion: mat.complexion || null,
          subcaste_gotra: mat.subcaste_gotra || null,
          about_me: mat.about_me || null,
          partner_expectations: mat.partner_expectations || null,
          hobbies: mat.hobbies || null,
          privacy_settings: {
            ...matPrivacy,
            is_public_listing: mat.is_public_listing !== false,
            is_saved: mat.is_saved !== false,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "member_id" }
      );
    } else if (updates.marital_status) {
      // If marital status changed to married, automatically disable matrimony
      const status = updates.marital_status.trim();
      const isUnmarried =
        status === "અપરણિત (Unmarried)" ||
        status === "અપરણિત" ||
        status.toLowerCase().includes("unmarried");

      if (!isUnmarried) {
        await supabaseAdmin
          .from("member_matrimony")
          .update({ is_available: false, updated_at: new Date().toISOString() })
          .eq("member_id", targetMemberId);
      }
    }

    // Fetch fresh matrimony row
    const { data: matData } = await supabaseAdmin
      .from("member_matrimony")
      .select("*")
      .eq("member_id", targetMemberId)
      .maybeSingle();

    return dbRowToMember(data, matData);
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

/**
 * Remove a member from Supabase (auth.users and public.members table)
 * and delete their profile photo from Supabase Storage if present.
 */
export async function deleteSupabaseMember(
  identifier: string,
  options?: { deleteStoragePhoto?: boolean }
): Promise<{
  success: boolean;
  message: string;
  deletedAuthUserId?: string;
  deletedMemberId?: string;
  deletedStorageFiles?: string[];
}> {
  if (!isSupabaseConfigured()) {
    const localDeleted = deleteMemberRecord(identifier);
    return {
      success: localDeleted,
      message: localDeleted
        ? "સ્થાનિક સ્ટોરમાંથી સભ્ય સફળતાપૂર્વક દૂર કરવામાં આવ્યા."
        : "સભ્ય મળ્યા નથી.",
    };
  }

  const clean = identifier.trim().toLowerCase();
  const deletedFiles: string[] = [];
  let authUserId: string | null = null;
  let memberId: string | null = null;
  let memberEmail: string | null = null;
  let photoUrl: string | null = null;

  try {
    // 1. Find the member row in public.members
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
    let query = supabaseAdmin.from("members").select("id, auth_user_id, email, username, photo_url");

    if (isUUID) {
      query = query.or(`id.eq.${clean},auth_user_id.eq.${clean}`);
    } else if (clean.includes("@")) {
      query = query.ilike("email", clean);
    } else {
      query = query.or(`username.ilike.${clean},phone.eq.${clean}`);
    }

    const { data: memberRows, error: findErr } = await query;
    if (!findErr && memberRows && memberRows.length > 0) {
      const row = memberRows[0];
      memberId = row.id;
      authUserId = row.auth_user_id || (isUUID ? clean : null);
      memberEmail = row.email;
      photoUrl = row.photo_url;
    }

    // 1.1 Also check local memberStore if not yet resolved in Supabase
    if (!memberId) {
      const localMem = getMemberByIdOrSession(clean);
      if (localMem) {
        if (!memberEmail && localMem.email) memberEmail = localMem.email;
        if (!authUserId && localMem.auth_user_id) authUserId = localMem.auth_user_id;
        if (localMem.email) {
          const { data: byEmail } = await supabaseAdmin
            .from("members")
            .select("id, auth_user_id, email, username, photo_url")
            .ilike("email", localMem.email)
            .maybeSingle();
          if (byEmail) {
            memberId = byEmail.id;
            if (!authUserId) authUserId = byEmail.auth_user_id;
            if (!photoUrl) photoUrl = byEmail.photo_url;
          }
        }
      }
    }

    // 2. Also check auth.users if authUserId is not yet found
    if (!authUserId) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const found = usersData.users.find(
          (u) =>
            u.id === clean ||
            u.email?.toLowerCase() === clean ||
            u.user_metadata?.username?.toLowerCase() === clean
        );
        if (found) {
          authUserId = found.id;
          if (!memberEmail) memberEmail = found.email || null;
        }
      }
    }

    // 3. Delete user's profile photo from Supabase Storage if requested or present
    if (options?.deleteStoragePhoto !== false && photoUrl && photoUrl.includes("/storage/v1/object/public/")) {
      try {
        const parts = photoUrl.split("/storage/v1/object/public/")[1];
        if (parts) {
          const slashIdx = parts.indexOf("/");
          if (slashIdx !== -1) {
            const bucket = parts.substring(0, slashIdx);
            const path = parts.substring(slashIdx + 1);
            const { error: removeErr } = await supabaseAdmin.storage.from(bucket).remove([path]);
            if (!removeErr) {
              deletedFiles.push(`${bucket}/${path}`);
            }
          }
        }
      } catch (err: any) {
        console.warn("[deleteSupabaseMember storage warning]", err.message);
      }
    }

    // 4. Delete related child records first to satisfy foreign keys
    if (memberId) {
      try {
        await supabaseAdmin.from("member_matrimony").delete().eq("member_id", memberId);
      } catch (err: any) {
        console.warn("[deleteSupabaseMember matrimony delete warning]", err.message);
      }
      try {
        await supabaseAdmin.from("family_relationships").delete().or(`from_member_id.eq.${memberId},to_member_id.eq.${memberId}`);
      } catch (err: any) {
        console.warn("[deleteSupabaseMember family_relationships delete warning]", err.message);
      }
    }

    // 4.1 Delete row from public.members table
    if (memberId || authUserId || clean.includes("@")) {
      let deleteQuery = supabaseAdmin.from("members").delete();
      if (memberId) {
        deleteQuery = deleteQuery.eq("id", memberId);
      } else if (authUserId) {
        deleteQuery = deleteQuery.or(`auth_user_id.eq.${authUserId},id.eq.${authUserId}`);
      } else {
        deleteQuery = deleteQuery.ilike("email", clean);
      }
      const { error: deleteRowErr } = await deleteQuery;
      if (deleteRowErr) {
        console.warn("[deleteSupabaseMember deleteRowErr]", deleteRowErr.message);
      }
    }

    // 5. Delete user from auth.users (Supabase Auth)
    if (authUserId) {
      const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
      if (deleteAuthErr) {
        console.warn("[deleteSupabaseMember deleteAuthErr]", deleteAuthErr.message);
      }
    }

    // 6. Delete from local memberStore across all alias keys
    deleteMemberRecord(identifier);
    if (clean) deleteMemberRecord(clean);
    if (memberEmail) deleteMemberRecord(memberEmail);
    if (authUserId) deleteMemberRecord(authUserId);
    if (memberId) deleteMemberRecord(memberId);

    return {
      success: true,
      message: `સભ્ય (${identifier}) અને સંબંધિત વિગતો Supabase માંથી સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા.`,
      deletedAuthUserId: authUserId || undefined,
      deletedMemberId: memberId || undefined,
      deletedStorageFiles: deletedFiles.length > 0 ? deletedFiles : undefined,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `સભ્ય દૂર કરવામાં ક્ષતિ: ${err.message}`,
    };
  }
}

/**
 * Remove all uploaded images from Supabase Storage buckets.
 * Defaults to all image buckets: member-photos, business-photos, advertisement-banners, donor-photos, payment-proofs
 */
export async function clearSupabaseStorageBuckets(
  bucketNames: string[] = [
    "member-photos",
    "business-photos",
    "advertisement-banners",
    "donor-photos",
    "payment-proofs",
  ]
): Promise<{
  success: boolean;
  totalDeleted: number;
  details: Record<string, string[]>;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      totalDeleted: 0,
      details: {},
      message: "Supabase રૂપરેખાંકિત નથી.",
    };
  }

  let totalDeleted = 0;
  const details: Record<string, string[]> = {};

  for (const bucket of bucketNames) {
    try {
      const { data: fileList, error: listErr } = await supabaseAdmin.storage.from(bucket).list("", {
        limit: 1000,
      });

      if (!listErr && fileList && fileList.length > 0) {
        const paths = fileList.map((f) => f.name).filter(Boolean);
        if (paths.length > 0) {
          const { error: delErr } = await supabaseAdmin.storage.from(bucket).remove(paths);
          if (!delErr) {
            details[bucket] = paths;
            totalDeleted += paths.length;
          } else {
            console.warn(`[clearSupabaseStorageBuckets] Error clearing bucket ${bucket}:`, delErr.message);
          }
        }
      }
    } catch (err: any) {
      console.warn(`[clearSupabaseStorageBuckets exception for ${bucket}]`, err.message);
    }
  }

  return {
    success: true,
    totalDeleted,
    details,
    message: `${totalDeleted} તસવીરો Supabase સ્ટોરેજમાંથી સફળતાપૂર્વક દૂર કરવામાં આવી.`,
  };
}


