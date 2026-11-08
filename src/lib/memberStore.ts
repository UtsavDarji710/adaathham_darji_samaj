import fs from "fs";
import path from "path";
import { Member, AdminRole } from "@/types";
import { INITIAL_MEMBERS } from "@/lib/mockData";
import { hashPassword, verifyPassword } from "@/lib/passwordUtils";

export const ADMIN_ROLES: AdminRole[] = [
  "president",
  "secretary",
  "joint_secretary",
  "treasurer",
  "assistant_treasurer",
  "admin",
];

// Server-side persistent file storage path (.data/members.json)
const PERSISTENT_DIR = path.join(process.cwd(), ".data");
const PERSISTENT_FILE = path.join(PERSISTENT_DIR, "members.json");

function savePersistentStore(map: Map<string, Member>) {
  try {
    if (!fs.existsSync(PERSISTENT_DIR)) {
      fs.mkdirSync(PERSISTENT_DIR, { recursive: true });
    }
    const uniqueMap = new Map<string, Member>();
    map.forEach((member, key) => {
      if (
        !key.startsWith("email:") &&
        !key.startsWith("phone:") &&
        !key.startsWith("username:")
      ) {
        uniqueMap.set(member.id, member);
      }
    });
    const arr: Member[] = [];
    uniqueMap.forEach((m) => arr.push(m));
    fs.writeFileSync(PERSISTENT_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (err) {
    // Fail gracefully in read-only environments
  }
}

function loadPersistentStore(): Member[] | null {
  try {
    if (fs.existsSync(PERSISTENT_FILE)) {
      const content = fs.readFileSync(PERSISTENT_FILE, "utf-8");
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Member[];
        }
      }
    }
  } catch (err) {
    // Fail gracefully
  }
  return null;
}

// Server-side global member registry (survives requests in runtime memory)
declare global {
  // eslint-disable-next-line no-var
  var __SERVER_MEMBERS_MAP__: Map<string, Member> | undefined;
}

function getStore(): Map<string, Member> {
  if (!globalThis.__SERVER_MEMBERS_MAP__) {
    const map = new Map<string, Member>();
    const rawSaved = loadPersistentStore();
    // Exclude legacy dummy mock member IDs (mem-1 to mem-99)
    const saved = rawSaved ? rawSaved.filter((m) => !/^mem-\d+$/.test(m.id)) : null;

    // Merge saved members with INITIAL_MEMBERS to ensure newly defined seed fields (e.g. username) are always retained
    let sourceMembers: Member[];
    if (saved && saved.length > 0) {
      sourceMembers = saved.map((s) => {
        const init = INITIAL_MEMBERS.find((m) => m.id === s.id);
        return {
          ...(init || {}),
          ...s,
          username: s.username || init?.username,
        };
      });
      for (const init of INITIAL_MEMBERS) {
        if (!sourceMembers.some((s) => s.id === init.id)) {
          sourceMembers.push(init);
        }
      }
    } else {
      sourceMembers = INITIAL_MEMBERS;
    }

    // Seed with members
    for (const member of sourceMembers) {
      map.set(member.id, { ...member });
      if (member.username) {
        map.set(`username:${member.username.toLowerCase().trim()}`, { ...member });
      }
      if (member.email) {
        map.set(`email:${member.email.toLowerCase().trim()}`, { ...member });
      }
      if (member.phone) {
        map.set(`phone:${member.phone.replace(/\D/g, "")}`, { ...member });
      }
    }
    savePersistentStore(map);
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
    if (
      !key.startsWith("email:") &&
      !key.startsWith("phone:") &&
      !key.startsWith("username:")
    ) {
      uniqueMap.set(member.id, member);
    }
  });
  const result: Member[] = [];
  uniqueMap.forEach((m) => result.push(m));
  return result;
}

/**
 * Find member by session cookie, username, email, phone, or id
 */
export function getMemberByIdOrSession(sessionVal: string): Member | null {
  if (!sessionVal || sessionVal === "guest") return null;

  const clean = decodeURIComponent(sessionVal).trim().toLowerCase();
  const store = getStore();

  // 1. Direct ID match
  if (store.has(clean)) {
    return store.get(clean) || null;
  }

  // 2. Direct Username lookup
  if (store.has(`username:${clean}`)) {
    return store.get(`username:${clean}`) || null;
  }

  // 3. Email lookup
  if (clean.includes("@")) {
    const byEmail = store.get(`email:${clean}`);
    if (byEmail) return byEmail;
  }

  // 4. Clean phone lookup
  const cleanPhone = clean.replace(/\D/g, "");
  if (cleanPhone.length >= 10) {
    const byPhone = store.get(`phone:${cleanPhone}`);
    if (byPhone) return byPhone;
  }

  // 5. Fallback search through INITIAL_MEMBERS
  const inInitial = INITIAL_MEMBERS.find((m) => {
    if (m.id && m.id.toLowerCase() === clean) return true;
    if (m.username && m.username.toLowerCase() === clean) return true;
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
 * Check if a username is already taken by another member
 */
export function isUsernameTaken(username: string, excludeMemberId?: string): boolean {
  if (!username) return false;
  const clean = username.toLowerCase().trim();
  const store = getStore();
  const existing = store.get(`username:${clean}`);
  if (existing && (!excludeMemberId || existing.id !== excludeMemberId)) {
    return true;
  }
  const inInitial = INITIAL_MEMBERS.find(
    (m) => m.username?.toLowerCase().trim() === clean && (!excludeMemberId || m.id !== excludeMemberId)
  );
  return !!inInitial;
}

/**
 * Find a member strictly by username
 */
export function getMemberByUsername(username: string): Member | null {
  if (!username) return null;
  const clean = username.toLowerCase().trim();
  const store = getStore();
  if (store.has(`username:${clean}`)) {
    return store.get(`username:${clean}`) || null;
  }
  return INITIAL_MEMBERS.find((m) => m.username?.toLowerCase().trim() === clean) || null;
}

/**
 * Register or update member in the server store
 */
export function registerMember(member: Member): Member {
  const store = getStore();
  store.set(member.id, member);
  if (member.username) {
    store.set(`username:${member.username.toLowerCase().trim()}`, member);
  }
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

  // Persist to disk so server recompilations/reboots preserve all details & photos
  savePersistentStore(store);

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

/**
 * Verify member password strictly by username (or member ID for session validation)
 */
export function verifyMemberPassword(
  identifierOrUsername: string,
  plainPassword: string
): { success: boolean; member?: Member; message: string } {
  const clean = (identifierOrUsername || "").trim().toLowerCase();
  if (!clean) {
    return {
      success: false,
      message: "કૃપા કરીને યુઝરનેમ (Username) દાખલ કરો.",
    };
  }

  const store = getStore();

  // 1. Strict username lookup
  let member = store.get(`username:${clean}`) || null;
  if (!member) {
    member = INITIAL_MEMBERS.find((m) => m.username?.toLowerCase().trim() === clean) || null;
  }

  // 2. Fallback check by direct ID
  if (!member && store.has(clean)) {
    member = store.get(clean) || null;
  }

  if (!member) {
    return {
      success: false,
      message: "આ યુઝરનેમ (Username) સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને સાચું યુઝરનેમ દાખલ કરો અથવા નવી નોંધણી કરો.",
    };
  }

  const isValid = verifyPassword(plainPassword, member.password_hash, member.salt);
  if (!isValid) {
    return {
      success: false,
      message: "અમાન્ય પાસવર્ડ. કૃપા કરીને સાચો પાસવર્ડ દાખલ કરો અથવા પાસવર્ડ રીસેટ કરો.",
    };
  }

  return {
    success: true,
    member,
    message: `સ્વાગત છે, ${member.name}!`,
  };
}

/**
 * Reset member password by email
 */
export function resetMemberPassword(
  email: string,
  newPassword: string
): { success: boolean; message: string; member?: Member } {
  const member = getMemberByIdOrSession(email);
  if (!member) {
    return {
      success: false,
      message: "આ ઈમેઈલ સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી.",
    };
  }

  const { hash, salt } = hashPassword(newPassword);
  const updated = updateMemberRecord(member.id, {
    password_hash: hash,
    salt,
  });

  return {
    success: true,
    message: "આપનો પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે. હવે નવા પાસવર્ડ અને યુઝરનેમ વડે લૉગિન કરો.",
    member: updated || undefined,
  };
}

/**
 * Delete a member record from in-memory map and persistent storage (.data/members.json)
 */
export function deleteMemberRecord(identifier: string): boolean {
  const member = getMemberByIdOrSession(identifier);
  if (!member) return false;

  const store = getStore();
  store.delete(member.id);
  if (member.auth_user_id) {
    store.delete(member.auth_user_id);
  }
  if (member.username) {
    store.delete(`username:${member.username.toLowerCase().trim()}`);
  }
  if (member.email) {
    store.delete(`email:${member.email.toLowerCase().trim()}`);
  }
  if (member.phone) {
    store.delete(`phone:${member.phone.replace(/\D/g, "")}`);
  }

  savePersistentStore(store);
  return true;
}


