"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Member, AdminRole, PrivacySettings } from "@/types";

interface AuthContextType {
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
  loginAs: (role: AdminRole | "member" | "guest", memberId?: string) => void;
  loginWithPhone: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>;
  loginWithPassword: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; user?: Member | null; message: string }>;
  loginWithUsername: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; user?: Member | null; message: string }>;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string; username?: string; cooldownSeconds?: number; previewOtp?: string }>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string; username?: string }>;
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
              // 1. Check if user profile has locally updated fields (such as updated photo_url)
              const savedUserStr = localStorage.getItem("ad8_current_user");
              if (savedUserStr) {
                try {
                  const savedUser = JSON.parse(savedUserStr);
                  if (savedUser?.id && String(savedUser.id).startsWith("mem-")) {
                    localStorage.removeItem("ad8_current_user");
                  } else if (
                    savedUser &&
                    (savedUser.id === data.user.id ||
                      savedUser.email?.toLowerCase() === data.user.email?.toLowerCase())
                  ) {
                    effectiveUser = { ...data.user, ...savedUser };
                  }
                } catch (e) {}
              }

              // 2. Check ad8_data_members storage key (synced by DataContext)
              const localMembers =
                localStorage.getItem("ad8_data_members") ||
                localStorage.getItem("ad8_members_data");
              if (localMembers) {
                try {
                  const parsed = JSON.parse(localMembers);
                  const found = parsed.find(
                    (m: any) =>
                      m &&
                      !String(m.id || "").startsWith("mem-") &&
                      (m.id === data.user.id ||
                        (m.email && m.email.toLowerCase() === data.user.email?.toLowerCase()) ||
                        (m.phone && m.phone.replace(/\D/g, "") === data.user.phone?.replace(/\D/g, "")))
                  );
                  if (found) {
                    effectiveUser = { ...effectiveUser, ...found };
                  }
                } catch (e) {}
              }
              localStorage.setItem(AUTH_STORAGE_KEY, effectiveUser.id);
              localStorage.setItem("ad8_current_user", JSON.stringify(effectiveUser));
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
          if (savedUserId.startsWith("mem-")) {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem("ad8_current_user");
          } else {
            const localMembers = localStorage.getItem("ad8_members_data");
            if (localMembers) {
              try {
                const parsed = JSON.parse(localMembers);
                const found = parsed.find((m: any) => m.id === savedUserId && !String(m.id || "").startsWith("mem-"));
                if (found) {
                  setCurrentUser(found);
                  return;
                }
              } catch (e) {}
            }
          }
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
        const sessionVal = user.username || user.email || user.phone || user.id;
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
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ad8_data_members");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const match = memberId
              ? list.find((m: any) => m.id === memberId)
              : list.find((m: any) => m.role === role);
            if (match) {
              setCurrentUser(match);
              return;
            }
          }
        } catch {}
      }
    }
  };

  const loginWithPassword = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        let effectiveUser = data.user;
        if (typeof window !== "undefined") {
          const localMembers = localStorage.getItem("ad8_data_members");
          if (localMembers) {
            try {
              const parsed = JSON.parse(localMembers);
              const found = parsed.find(
                (m: any) =>
                  m.id === data.user.id ||
                  (m.username && m.username.toLowerCase() === data.user.username?.toLowerCase()) ||
                  (m.email && m.email.toLowerCase() === data.user.email?.toLowerCase())
              );
              if (found) {
                // If local member store has an updated photo_url, preserve it
                if (found.photo_url && found.photo_url !== data.user.photo_url) {
                  effectiveUser = { ...data.user, ...found, photo_url: found.photo_url };
                  // Background sync to server store
                  fetch("/api/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ memberId: effectiveUser.id, updates: { photo_url: found.photo_url } }),
                  }).catch(() => {});
                } else {
                  effectiveUser = { ...data.user, ...found };
                }
              }
            } catch (e) {}
          }
          localStorage.setItem(AUTH_STORAGE_KEY, effectiveUser.id);
          localStorage.setItem("ad8_current_user", JSON.stringify(effectiveUser));
        }
        setCurrentUser(effectiveUser);
        return { success: true, user: effectiveUser, message: data.message };
      }
      return { success: false, message: data.message || "લૉગિન નિષ્ફળ ગયું." };
    } catch {
      return { success: false, message: "સર્વર સમસ્યા આવી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો." };
    }
  };

  const loginWithUsername = async (username: string, password: string) => {
    return loginWithPassword(username, password);
  };

  const loginWithPhone = async (phone: string, pin: string) => {
    return loginWithPassword(phone, pin);
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        username: data.username,
        cooldownSeconds: data.cooldownSeconds,
        previewOtp: data.previewOtp,
      };
    } catch {
      return { success: false, message: "ઓટીપી મોકલવામાં સર્વર ક્ષતિ આવી." };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();
      return {
        success: data.success,
        message: data.message,
        username: data.username,
      };
    } catch {
      return { success: false, message: "પાસવર્ડ રીસેટ કરવામાં સર્વર ક્ષતિ આવી." };
    }
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
      let effectiveUser = result.user;
      if (typeof window !== "undefined") {
        const localMembers = localStorage.getItem("ad8_data_members");
        if (localMembers) {
          try {
            const parsed = JSON.parse(localMembers);
            const found = parsed.find(
              (m: any) =>
                m.id === result.user.id ||
                (m.email && m.email.toLowerCase() === result.user.email?.toLowerCase())
            );
            if (found) {
              if (found.photo_url && found.photo_url !== result.user.photo_url) {
                effectiveUser = { ...result.user, ...found, photo_url: found.photo_url };
                fetch("/api/profile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ memberId: effectiveUser.id, updates: { photo_url: found.photo_url } }),
                }).catch(() => {});
              } else {
                effectiveUser = { ...result.user, ...found };
              }
            }
          } catch (e) {}
        }
        localStorage.setItem(AUTH_STORAGE_KEY, effectiveUser.id);
        localStorage.setItem("ad8_current_user", JSON.stringify(effectiveUser));
      }
      setCurrentUser(effectiveUser);
      return {
        success: true,
        message: `સ્વાગત છે, ${effectiveUser.name}!`,
        user: effectiveUser,
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
      photo_url: data.photo_url || "/default-avatar.svg",
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
      localStorage.setItem("ad8_current_user", JSON.stringify(updated));

      // Also persist to members lists in localStorage
      ["ad8_data_members", "ad8_members_data"].forEach((storageKey) => {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const list = JSON.parse(raw);
            const nextList = list.map((m: any) =>
              m.id === currentUser.id ||
              (m.email && m.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
              (m.phone && m.phone.replace(/\D/g, "") === currentUser.phone?.replace(/\D/g, ""))
                ? { ...m, ...data }
                : m
            );
            localStorage.setItem(storageKey, JSON.stringify(nextList));
          }
        } catch (e) {}
      });

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
        loginWithPassword,
        loginWithUsername,
        forgotPassword,
        resetPassword,
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
