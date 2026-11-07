"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Member, AdminRole, PrivacySettings } from "@/types";
import { INITIAL_MEMBERS } from "@/lib/mockData";

interface AuthContextType {
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
  loginAs: (role: AdminRole | "member" | "guest", memberId?: string) => void;
  loginWithPhone: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>;
  sendEmailOtp: (
    email: string,
    purpose: "signup" | "login",
    extra?: { name?: string; phone?: string }
  ) => Promise<{ success: boolean; message: string; cooldownSeconds?: number; previewOtp?: string }>;
  verifyEmailOtp: (
    email: string,
    otp: string,
    purpose?: "signup" | "login"
  ) => Promise<{ success: boolean; message: string; user?: Member | null }>;
  loginWithEmailOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; message: string; user?: Member | null }>;
  registerMember: (data: Partial<Member>) => Promise<{ success: boolean; member?: Member; message: string }>;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<Member>) => void;
  updatePrivacySettings: (privacy: Partial<PrivacySettings>) => void;
  isAdmin: boolean;
  canManageMembers: boolean;
  canManageFinances: boolean;
  canManageFamilies: boolean;
  canManageEvents: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "ad8_auth_user_id";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<Member | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            let effectiveUser = data.user;
            if (typeof window !== "undefined") {
              const localMembers = localStorage.getItem("ad8_members_data");
              if (localMembers) {
                try {
                  const parsed = JSON.parse(localMembers);
                  const found = parsed.find(
                    (m: any) =>
                      m.id === data.user.id ||
                      (m.email && m.email.toLowerCase() === data.user.email?.toLowerCase()) ||
                      (m.phone && m.phone.replace(/\D/g, "") === data.user.phone?.replace(/\D/g, ""))
                  );
                  if (found) {
                    effectiveUser = { ...data.user, ...found };
                  }
                } catch (e) {}
              }
              localStorage.setItem(AUTH_STORAGE_KEY, effectiveUser.id);
            }
            setCurrentUserState(effectiveUser);
            return;
          }
        }
      } catch (e) {
        // Network/offline fallback to localStorage
      }

      const savedUserId = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
      if (savedUserId && savedUserId !== "guest") {
        if (typeof window !== "undefined") {
          const localMembers = localStorage.getItem("ad8_members_data");
          if (localMembers) {
            try {
              const parsed = JSON.parse(localMembers);
              const found = parsed.find((m: any) => m.id === savedUserId);
              if (found) {
                setCurrentUser(found);
                return;
              }
            } catch (e) {}
          }
        }
        const found = INITIAL_MEMBERS.find((m) => m.id === savedUserId);
        if (found) {
          setCurrentUser(found);
          return;
        }
      }

      // Default is null (Unauthenticated)
      setCurrentUserState(null);
    };

    initSession();
  }, []);

  const setCurrentUser = (user: Member | null) => {
    setCurrentUserState(user);
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, user.id);
        const sessionVal = user.email || user.phone || user.id;
        document.cookie = `ad8_session=${encodeURIComponent(sessionVal)}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        document.cookie = "ad8_session=; path=/; max-age=0; SameSite=Lax";
      }
    }
  };

  const loginAs = (role: AdminRole | "member" | "guest", memberId?: string) => {
    if (role === "guest") {
      logout();
      return;
    }
    if (memberId) {
      const target = INITIAL_MEMBERS.find((m) => m.id === memberId);
      if (target) {
        setCurrentUser(target);
        return;
      }
    }
    const matching = INITIAL_MEMBERS.find((m) => m.role === role);
    if (matching) {
      setCurrentUser(matching);
    } else {
      setCurrentUser(INITIAL_MEMBERS[0]);
    }
  };

  const loginWithPhone = async (phone: string, _pin: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    // Quick direct mapping for test credentials
    const testRolePhoneMap: Record<string, string> = {
      "9825000001": "mem-1", // પ્રમુખ
      "9825012345": "mem-1",
      "9825000002": "mem-4", // મંત્રી
      "9825445678": "mem-4",
      "9825000003": "mem-5", // સહમંત્રી
      "9825256789": "mem-5",
      "9825000004": "mem-6", // ખજાનચી
      "9825867890": "mem-6",
      "9825000007": "comm-assistant-treasurer", // સહ ખજાનચી
      "9825000005": "mem-3", // સામાન્ય સભ્ય
      "9898034567": "mem-3",
    };

    const targetId = testRolePhoneMap[cleanPhone];
    if (targetId) {
      const found = INITIAL_MEMBERS.find((m) => m.id === targetId);
      if (found) {
        setCurrentUser(found);
        return { success: true, message: `સ્વાગત છે, ${found.name} (${found.committee_role || "સભ્ય"})!` };
      }
    }

    const found = INITIAL_MEMBERS.find((m) => m.phone.replace(/\D/g, "") === cleanPhone);
    if (found) {
      setCurrentUser(found);
      return { success: true, message: `સ્વાગત છે, ${found.name}!` };
    }
    return {
      success: false,
      message: "આ મોબાઇલ નંબર સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને સાચો મોબાઇલ નંબર દાખલ કરો અથવા નવું રજીસ્ટ્રેશન કરો.",
    };
  };

  // Requirement 14.1 & 14.2: Send OTP via Backend API with Nodemailer
  const sendEmailOtp = async (
    email: string,
    purpose: "signup" | "login",
    extra?: { name?: string; phone?: string }
  ) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose, name: extra?.name, phone: extra?.phone }),
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        cooldownSeconds: data.cooldownSeconds,
        previewOtp: data.previewOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        message: "ઓટીપી મોકલવામાં સર્વર સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
      };
    }
  };

  // Requirement 14.2: Verify OTP via Backend API
  const verifyEmailOtp = async (
    email: string,
    otp: string,
    purpose?: "signup" | "login"
  ) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        user: data.user || null,
      };
    } catch (err: any) {
      return {
        success: false,
        message: "ઓટીપી ચકાસણીમાં ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
      };
    }
  };

  // Requirement 14.3: Complete Login with Email OTP
  const loginWithEmailOtp = async (email: string, otp: string) => {
    const result = await verifyEmailOtp(email, otp, "login");
    if (result.success && result.user) {
      setCurrentUser(result.user);
      return {
        success: true,
        message: `સ્વાગત છે, ${result.user.name}!`,
        user: result.user,
      };
    }
    return {
      success: false,
      message: result.message || "લૉગિન નિષ્ફળ ગયું.",
    };
  };

  const registerMember = async (data: Partial<Member>) => {
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: data.name || "નવા સભ્ય",
      photo_url:
        data.photo_url ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
      phone: data.phone || "",
      email: data.email || "",
      is_email_verified: true,
      email_verified_at: new Date().toISOString(),
      address: data.address || "",
      city: data.city || "મોડાસા",
      district: data.district || "અરવલ્લી",
      native_place: data.native_place || "અડાઆઠમ",
      pincode: data.pincode || "383315",
      father_name: data.father_name || "",
      grandfather_name: data.grandfather_name || "",
      maternal_uncle_name: data.maternal_uncle_name || "",
      maternal_grandfather_name: data.maternal_grandfather_name || "",
      marital_status: data.marital_status || "પરણિત (Married)",
      gender: data.gender || "male",
      dob: data.dob,
      blood_group: data.blood_group,
      role: "member",
      is_lifetime_member: false,
      completeness: 75,
      created_at: new Date().toISOString(),
      privacy: {
        phone: "members",
        address: "members",
        photo: "public",
        family: "members",
        business: "public",
        employment: "members",
        education: "members",
      },
      ...data,
    };
    INITIAL_MEMBERS.push(newMember);
    setCurrentUser(newMember);
    return { success: true, member: newMember, message: "સભ્ય નોંધણી સફળતાપૂર્વક થઈ ગઈ છે!" };
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    }
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = "ad8_session=; path=/; max-age=0; SameSite=Lax";
      window.location.href = "/login";
    }
  };

  const updateCurrentUserProfile = (data: Partial<Member>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);

    if (typeof window !== "undefined") {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: currentUser.id, updates: data }),
      }).catch((err) => {
        console.warn("[AuthContext] Profile sync error:", err);
      });
    }
  };

  const updatePrivacySettings = (privacy: Partial<PrivacySettings>) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      privacy: { ...currentUser.privacy, ...privacy },
    };
    setCurrentUser(updated);
  };

  const role = currentUser?.role;
  const isCommitteeAdmin = ["president", "secretary", "joint_secretary", "treasurer", "assistant_treasurer", "admin"].includes(role || "");
  const isAdmin = isCommitteeAdmin;
  const canManageMembers = isCommitteeAdmin;
  const canManageFamilies = isCommitteeAdmin;
  const canManageFinances = isCommitteeAdmin;
  const canManageEvents = isCommitteeAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
        loginWithPhone,
        sendEmailOtp,
        verifyEmailOtp,
        loginWithEmailOtp,
        registerMember,
        logout,
        updateCurrentUserProfile,
        updatePrivacySettings,
        isAdmin,
        canManageMembers,
        canManageFinances,
        canManageFamilies,
        canManageEvents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
