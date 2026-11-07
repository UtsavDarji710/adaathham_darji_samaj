import { Member, AdminRole } from "@/types";
import { INITIAL_MEMBERS } from "@/lib/mockData";

export const ADMIN_ROLES: AdminRole[] = [
  "president",
  "secretary",
  "joint_secretary",
  "treasurer",
  "assistant_treasurer",
  "admin",
];

// Server-side global member registry (survives requests in runtime memory)
// In serverless/Vercel or production with database, can also sync to Supabase/Postgres
declare global {
  // eslint-disable-next-line no-var
  var __SERVER_MEMBERS_MAP__: Map<string, Member> | undefined;
}

function getStore(): Map<string, Member> {
  if (!globalThis.__SERVER_MEMBERS_MAP__) {
    const map = new Map<string, Member>();
    // Seed with initial members
    for (const member of INITIAL_MEMBERS) {
      map.set(member.id, { ...member });
      if (member.email) {
        map.set(`email:${member.email.toLowerCase().trim()}`, { ...member });
      }
      if (member.phone) {
        map.set(`phone:${member.phone.replace(/\D/g, "")}`, { ...member });
      }
    }
    globalThis.__SERVER_MEMBERS_MAP__ = map;
  }
  return globalThis.__SERVER_MEMBERS_MAP__;
}

/**
 * Check if a role is an administrative role
 */
export function isAdminRole(role?: string): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as AdminRole);
}

/**
 * Get all members
 */
export function getAllMembers(): Member[] {
  const store = getStore();
  const uniqueMap = new Map<string, Member>();
  store.forEach((member, key) => {
    if (!key.startsWith("email:") && !key.startsWith("phone:")) {
      uniqueMap.set(member.id, member);
    }
  });
  const result: Member[] = [];
  uniqueMap.forEach((m) => result.push(m));
  return result;
}

/**
 * Find member by session cookie, email, phone, or id
 */
export function getMemberByIdOrSession(sessionVal: string): Member | null {
  if (!sessionVal || sessionVal === "guest") return null;

  const clean = decodeURIComponent(sessionVal).trim().toLowerCase();
  const store = getStore();

  // 1. Direct ID match
  if (store.has(clean)) {
    return store.get(clean) || null;
  }

  // 2. Email lookup
  if (clean.includes("@")) {
    const byEmail = store.get(`email:${clean}`);
    if (byEmail) return byEmail;
  }

  // 3. Clean phone lookup
  const cleanPhone = clean.replace(/\D/g, "");
  if (cleanPhone.length >= 10) {
    const byPhone = store.get(`phone:${cleanPhone}`);
    if (byPhone) return byPhone;
  }

  // 4. Fallback search through INITIAL_MEMBERS
  const inInitial = INITIAL_MEMBERS.find((m) => {
    if (m.id && m.id.toLowerCase() === clean) return true;
    if (m.email && m.email.toLowerCase() === clean) return true;
    if (m.phone && m.phone.replace(/\D/g, "") === cleanPhone) return true;
    return false;
  });

  if (inInitial) {
    // Cache in store for subsequent lookups
    registerMember(inInitial);
    return inInitial;
  }

  return null;
}

/**
 * Register or update member in the server store
 */
export function registerMember(member: Member): Member {
  const store = getStore();
  store.set(member.id, member);
  if (member.email) {
    store.set(`email:${member.email.toLowerCase().trim()}`, member);
  }
  if (member.phone) {
    store.set(`phone:${member.phone.replace(/\D/g, "")}`, member);
  }

  // Also update INITIAL_MEMBERS in-place if exists or add
  const idx = INITIAL_MEMBERS.findIndex((m) => m.id === member.id);
  if (idx >= 0) {
    INITIAL_MEMBERS[idx] = member;
  } else {
    INITIAL_MEMBERS.push(member);
  }

  return member;
}

/**
 * Update member details in the server store
 */
export function updateMemberRecord(
  idOrSession: string,
  updates: Partial<Member>
): Member | null {
  const existing = getMemberByIdOrSession(idOrSession);
  if (!existing) return null;

  const merged: Member = {
    ...existing,
    ...updates,
    privacy: {
      ...existing.privacy,
      ...(updates.privacy || {}),
    },
    employment: updates.employment !== undefined ? updates.employment : existing.employment,
    education: updates.education !== undefined ? updates.education : existing.education,
    matrimony: updates.matrimony !== undefined ? updates.matrimony : existing.matrimony,
  };

  registerMember(merged);
  return merged;
}

/**
 * Ensure any valid session (email or phone) gets a valid Member object
 */
export function ensureSessionUser(sessionVal: string): Member {
  const clean = decodeURIComponent(sessionVal).trim().toLowerCase();
  const existing = getMemberByIdOrSession(clean);
  if (existing) return existing;

  const isEmail = clean.includes("@");
  const cleanDigits = clean.replace(/\D/g, "");
  const isPhone = cleanDigits.length >= 10;

  // Derive initial display name from email or phone
  let displayName = "સભ્યશ્રી";
  if (isEmail) {
    const username = clean.split("@")[0].replace(/[._-]/g, " ");
    displayName = username.charAt(0).toUpperCase() + username.slice(1);
  }

  const newMember: Member = {
    id: `mem-${clean.replace(/[^a-zA-Z0-9]/g, "") || Date.now()}`,
    name: displayName,
    email: isEmail ? clean : "member@adaadhamsamaj.org",
    phone: isPhone ? clean : "98250 00000",
    photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    role: "member",
    is_lifetime_member: false,
    address: "મોડાસા",
    city: "મોડાસા",
    district: "અરવલ્લી",
    native_place: "અડાઆઠમ",
    pincode: "383315",
    marital_status: "પરણિત (Married)",
    gender: "male",
    completeness: 80,
    created_at: new Date().toISOString(),
    privacy: {
      phone: "members",
      address: "members",
      photo: "public",
      family: "members",
      business: "public",
      employment: "public",
      education: "members",
    },
  };

  registerMember(newMember);
  return newMember;
}

/**
 * Check if a user has permission to update target member
 */
export function canUserEditTarget(user: Member, targetMemberId: string): boolean {
  if (isAdminRole(user.role)) return true;
  if (user.id === targetMemberId) return true;

  const target = getMemberByIdOrSession(targetMemberId);
  if (!target) return false;

  if (user.email && target.email && user.email.toLowerCase() === target.email.toLowerCase()) {
    return true;
  }
  if (
    user.phone &&
    target.phone &&
    user.phone.replace(/\D/g, "") === target.phone.replace(/\D/g, "")
  ) {
    return true;
  }

  return false;
}
