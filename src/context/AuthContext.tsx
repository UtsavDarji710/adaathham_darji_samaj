"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Member, AdminRole, PrivacySettings } from "@/types";
import { INITIAL_MEMBERS } from "@/lib/mockData";

interface AuthContextType {
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
  loginAs: (role: AdminRole | "member" | "guest", memberId?: string) => void;
  loginWithPhone: (phone: string, pin: string) => Promise<{ success: boolean; message: string }>;
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
    // Check saved session in localStorage
    const savedUserId = typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (savedUserId && savedUserId !== "guest") {
      const found = INITIAL_MEMBERS.find((m) => m.id === savedUserId);
      if (found) {
        setCurrentUserState(found);
        return;
      }
    }
    // Default is null (Public guest mode). Only logged-in members have active session
    setCurrentUserState(null);
  }, []);

  const setCurrentUser = (user: Member | null) => {
    setCurrentUserState(user);
    if (user && typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, "guest");
    }
  };

  const loginAs = (role: AdminRole | "member" | "guest", memberId?: string) => {
    if (role === "guest") {
      setCurrentUser(null);
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
      message: "આ મોબાઇલ નંબર સાથે કોઈ નોંધાયેલું ખાતું મળ્યું નથી. કૃપા કરીને ટેસ્ટ ઓળખપત્ર (દા.ત. 9825000001 / પિન 123456) નો ઉપયોગ કરો.",
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
      address: data.address || "",
      city: data.city || "મોડાસા",
      district: data.district || "અરવલ્લી",
      native_place: data.native_place || "અડાઆઠમ",
      pincode: data.pincode || "383315",
      gender: data.gender || "male",
      dob: data.dob,
      blood_group: data.blood_group,
      role: "member",
      is_lifetime_member: false,
      completeness: 65,
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

  const logout = () => {
    setCurrentUserState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const updateCurrentUserProfile = (data: Partial<Member>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
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
  const isAdmin = ["president", "secretary", "joint_secretary", "treasurer", "admin"].includes(role || "");
  const canManageMembers = ["president", "secretary", "joint_secretary", "admin"].includes(role || "");
  const canManageFamilies = ["president", "secretary", "joint_secretary", "admin"].includes(role || "");
  const canManageFinances = ["president", "treasurer", "admin"].includes(role || "");
  const canManageEvents = ["president", "secretary", "joint_secretary", "admin"].includes(role || "");

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
        loginWithPhone,
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
