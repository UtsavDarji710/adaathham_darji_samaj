"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  Member,
  FamilyRelationship,
  BusinessItem,
  BusinessAdvertisement,
  JobPosting,
  CommunityEvent,
  Donation,
  SamitiBankDetails,
  Announcement,
  Circular,
  CommitteeMember,
  ActivityLog,
} from "@/types";
import {
  INITIAL_RELATIONSHIPS,
  INITIAL_BUSINESSES,
  INITIAL_ADVERTISEMENTS,
  INITIAL_JOB_POSTINGS,
  INITIAL_EVENTS,
  INITIAL_DONATIONS,
  INITIAL_BANK_DETAILS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CIRCULARS,
  INITIAL_COMMITTEE,
  INITIAL_LOGS,
} from "@/lib/mockData";

interface DataContextType {
  members: Member[];
  relationships: FamilyRelationship[];
  businesses: BusinessItem[];
  advertisements: BusinessAdvertisement[];
  jobPostings: JobPosting[];
  events: CommunityEvent[];
  donations: Donation[];
  bankDetails: SamitiBankDetails;
  announcements: Announcement[];
  circulars: Circular[];
  committee: CommitteeMember[];
  logs: ActivityLog[];
  
  // Member actions
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  // Family relationships actions
  addRelationship: (rel: Omit<FamilyRelationship, "id" | "created_at">) => void;
  approveRelationship: (id: string, approvedBy: string) => void;
  rejectRelationship: (id: string) => void;
  deleteRelationship: (id: string) => void;

  // Business actions
  addBusiness: (biz: Omit<BusinessItem, "id" | "created_at">) => void;
  updateBusiness: (id: string, updates: Partial<BusinessItem>) => void;
  approveBusiness: (id: string) => void;
  deleteBusiness: (id: string) => void;

  // Business Advertisement actions (વ્યવસાય જાહેરાત અરજીઓ & મંજૂરી પ્રણાલી)
  addAdvertisement: (adv: Omit<BusinessAdvertisement, "id" | "created_at">) => void;
  approveAdvertisement: (id: string, approvedBy: string) => void;
  rejectAdvertisement: (id: string, remarks: string, rejectedBy: string) => void;
  deleteAdvertisement: (id: string) => void;

  // Job Postings actions (નોકરી & રોજગાર ડિરેક્ટરી)
  addJobPosting: (job: Omit<JobPosting, "id" | "created_at">) => void;
  deleteJobPosting: (id: string) => void;

  // Events actions
  addEvent: (event: Omit<CommunityEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<CommunityEvent>) => void;
  deleteEvent: (id: string) => void;

  // Donations actions (દાન સંચાલન & ખજાનચી હિસાબ)
  addDonation: (don: Partial<Donation> & { donor_name: string; mobile_number?: string; donation_purpose?: string; amount?: number }) => Donation;
  approveDonation: (id: string, approvedBy: string) => void;
  rejectDonation: (id: string, remarks: string, rejectedBy: string) => void;
  deleteDonation: (id: string) => void;
  verifyDonation: (id: string) => void;

  // Bank details & Payment QR Code configuration
  updateBankDetails: (details: Partial<SamitiBankDetails>) => void;

  // Announcements actions
  addAnnouncement: (ann: Omit<Announcement, "id">) => void;
  deleteAnnouncement: (id: string) => void;

  // Logs
  addLog: (action: string, target: string, details: string, adminName: string, adminRole: string) => void;

  // Reset to clean dynamic data
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  members: "ad8_data_members",
  relationships: "ad8_data_relationships",
  businesses: "ad8_data_businesses",
  advertisements: "ad8_data_advertisements",
  jobs: "ad8_data_jobs",
  events: "ad8_data_events",
  donations: "ad8_data_donations",
  bank_details: "ad8_data_bank_details",
  announcements: "ad8_data_announcements",
  circulars: "ad8_data_circulars",
  committee: "ad8_data_committee",
  logs: "ad8_data_logs",
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [advertisements, setAdvertisements] = useState<BusinessAdvertisement[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [bankDetails, setBankDetails] = useState<SamitiBankDetails>(INITIAL_BANK_DETAILS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [customCommittee, setCustomCommittee] = useState<CommitteeMember[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Dynamically derive Committee list from live registered members with committee_role or admin role
  const committee = useMemo(() => {
    const list: CommitteeMember[] = [];
    members.forEach((m) => {
      if (m.committee_role || (m.role && m.role !== "member")) {
        list.push({
          id: m.id,
          name: m.name,
          designation: m.committee_role || (m.role === "admin" ? "સિસ્ટમ એડમિનિસ્ટ્રેટર" : String(m.role)),
          photo_url: m.photo_url || null,
          phone: m.phone,
          city: m.city || "મોડાસા",
          term: "૨૦૨૩ - ૨૦૨૬",
          order: m.committee_order ?? 99,
          is_lifetime_member: !!m.is_lifetime_member,
          role_key: (m.role as any) || "admin",
        });
      }
    });

    // Merge with any custom registered committee members
    customCommittee.forEach((c) => {
      if (!list.some((existing) => existing.id === c.id || existing.name === c.name)) {
        list.push(c);
      }
    });

    return list.sort((a, b) => a.order - b.order);
  }, [members, customCommittee]);

  // Load live dynamic data from Supabase APIs & purge stale legacy mock data
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to purge legacy mock items (mem-1, biz-1, etc.) from browser localStorage
    const purgeLegacyMockData = () => {
      const legacyPrefixes = ["mem-", "biz-", "evt-", "don-", "adv-", "job-", "ann-", "circ-", "comm-", "log-"];
      const isLegacy = (item: any) =>
        item && typeof item.id === "string" && legacyPrefixes.some((p) => item.id.startsWith(p));

      Object.values(STORAGE_KEYS).forEach((key) => {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.some(isLegacy)) {
              localStorage.removeItem(key);
            }
          }
        } catch {}
      });

      try {
        const val = localStorage.getItem("ad8_members_data");
        if (val) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed) && parsed.some(isLegacy)) {
            localStorage.removeItem("ad8_members_data");
          }
        }
      } catch {}

      try {
        const val = localStorage.getItem(STORAGE_KEYS.bank_details);
        if (val) {
          const parsed = JSON.parse(val);
          if (
            parsed &&
            (parsed.qr_code_url?.includes("qrserver.com") ||
              parsed.qr_code_url?.includes("sbi") ||
              parsed.bank_name?.includes("SBI") ||
              !parsed.qr_code_url?.includes("supabase"))
          ) {
            localStorage.removeItem(STORAGE_KEYS.bank_details);
          }
        }
      } catch {}
    };

    purgeLegacyMockData();

    // 1. Fetch live dynamic members from API / Supabase
    fetch("/api/members", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.members)) {
          setMembers(data.members);
          sync(STORAGE_KEYS.members, data.members);
        }
      })
      .catch((err) => {
        console.warn("[DataContext] Live members fetch warning:", err);
      });

    // 2. Fetch live businesses from Supabase API
    fetch("/api/businesses", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.businesses)) {
          setBusinesses(data.businesses);
          sync(STORAGE_KEYS.businesses, data.businesses);
        }
      })
      .catch((err) => console.warn("[DataContext] Live businesses fetch warning:", err));

    // 3. Fetch live jobs from Supabase API
    fetch("/api/jobs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.jobs)) {
          setJobPostings(data.jobs);
          sync(STORAGE_KEYS.jobs, data.jobs);
        }
      })
      .catch((err) => console.warn("[DataContext] Live jobs fetch warning:", err));

    // 4. Fetch live advertisements from Supabase API
    fetch("/api/advertisements", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.advertisements)) {
          setAdvertisements(data.advertisements);
          sync(STORAGE_KEYS.advertisements, data.advertisements);
        }
      })
      .catch((err) => console.warn("[DataContext] Live advertisements fetch warning:", err));

    // 5. Fetch live events from Supabase API
    fetch("/api/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
          sync(STORAGE_KEYS.events, data.events);
        }
      })
      .catch((err) => console.warn("[DataContext] Live events fetch warning:", err));

    // 6. Fetch live donations from Supabase API
    fetch("/api/donations", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.donations)) {
          setDonations(data.donations);
          sync(STORAGE_KEYS.donations, data.donations);
        }
      })
      .catch((err) => console.warn("[DataContext] Live donations fetch warning:", err));

    // 7. Fetch live announcements from Supabase API
    fetch("/api/announcements", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
          sync(STORAGE_KEYS.announcements, data.announcements);
        }
      })
      .catch((err) => console.warn("[DataContext] Live announcements fetch warning:", err));
  }, []);

  const sync = <T,>(key: string, data: T) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error("Storage error", err);
      }
    }
  };

  const addMember = (member: Member) => {
    const updated = [member, ...members];
    setMembers(updated);
    sync(STORAGE_KEYS.members, updated);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    const updated = members.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMembers(updated);
    sync(STORAGE_KEYS.members, updated);

    // Sync ad8_current_user in localStorage if updating current user
    if (typeof window !== "undefined") {
      try {
        const rawUser = localStorage.getItem("ad8_current_user");
        if (rawUser) {
          const user = JSON.parse(rawUser);
          if (
            user &&
            (user.id === id ||
              (user.email && user.email.toLowerCase() === id.toLowerCase()) ||
              (user.phone && user.phone.replace(/\D/g, "") === id.replace(/\D/g, "")))
          ) {
            localStorage.setItem("ad8_current_user", JSON.stringify({ ...user, ...updates }));
          }
        }
      } catch (e) {}

      // Asynchronously sync with the backend /api/profile endpoint
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: id, updates }),
      }).catch((err) => {
        console.warn("[DataContext] Server profile sync error:", err);
      });
    }
  };

  const deleteMember = (id: string) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    sync(STORAGE_KEYS.members, updated);
  };

  const addRelationship = (rel: Omit<FamilyRelationship, "id" | "created_at">) => {
    const newRel: FamilyRelationship = {
      ...rel,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rel-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newRel, ...relationships];
    setRelationships(updated);
    sync(STORAGE_KEYS.relationships, updated);
  };

  const approveRelationship = (id: string, approvedBy: string) => {
    const updated = relationships.map((r) =>
      r.id === id
        ? {
            ...r,
            status: "approved" as const,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
          }
        : r
    );
    setRelationships(updated);
    sync(STORAGE_KEYS.relationships, updated);
  };

  const rejectRelationship = (id: string) => {
    const updated = relationships.map((r) =>
      r.id === id ? { ...r, status: "rejected" as const } : r
    );
    setRelationships(updated);
    sync(STORAGE_KEYS.relationships, updated);
  };

  const deleteRelationship = (id: string) => {
    const updated = relationships.filter((r) => r.id !== id);
    setRelationships(updated);
    sync(STORAGE_KEYS.relationships, updated);
  };

  const addBusiness = (biz: Omit<BusinessItem, "id" | "created_at">) => {
    const newBiz: BusinessItem = {
      ...biz,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `biz-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newBiz, ...businesses];
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);

    // Save to Supabase API
    fetch("/api/businesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBiz),
    }).catch((err) => console.warn("[addBusiness error]", err));
  };

  const updateBusiness = (id: string, updates: Partial<BusinessItem>) => {
    const updated = businesses.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);

    // Sync updates to Supabase backend API
    fetch("/api/businesses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    }).catch((err) => console.warn("[updateBusiness error]", err));
  };

  const approveBusiness = (id: string) => {
    updateBusiness(id, { status: "active" });
  };

  const deleteBusiness = (id: string) => {
    const updated = businesses.filter((b) => b.id !== id);
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);

    // Sync deletion to Supabase backend API
    fetch(`/api/businesses?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("[deleteBusiness error]", err));
  };

  // Business Advertisements methods
  const addAdvertisement = (adv: Omit<BusinessAdvertisement, "id" | "created_at">) => {
    const newAdv: BusinessAdvertisement = {
      ...adv,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `adv-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newAdv, ...advertisements];
    setAdvertisements(updated);
    sync(STORAGE_KEYS.advertisements, updated);

    // Save to Supabase API
    fetch("/api/advertisements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdv),
    }).catch((err) => console.warn("[addAdvertisement error]", err));
  };

  const approveAdvertisement = (id: string, approvedBy: string) => {
    const updated = advertisements.map((a) =>
      a.id === id
        ? {
            ...a,
            status: "approved" as const,
            approved_by: approvedBy,
            approved_at: new Date().toISOString(),
            rejection_remarks: undefined,
          }
        : a
    );
    setAdvertisements(updated);
    sync(STORAGE_KEYS.advertisements, updated);
  };

  const rejectAdvertisement = (id: string, remarks: string, rejectedBy: string) => {
    const updated = advertisements.map((a) =>
      a.id === id
        ? {
            ...a,
            status: "rejected" as const,
            rejection_remarks: remarks,
            approved_by: rejectedBy,
            approved_at: new Date().toISOString(),
          }
        : a
    );
    setAdvertisements(updated);
    sync(STORAGE_KEYS.advertisements, updated);
  };

  const deleteAdvertisement = (id: string) => {
    const updated = advertisements.filter((a) => a.id !== id);
    setAdvertisements(updated);
    sync(STORAGE_KEYS.advertisements, updated);
    fetch(`/api/advertisements?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
  };

  // Job Postings methods
  const addJobPosting = (job: Omit<JobPosting, "id" | "created_at">) => {
    const newJob: JobPosting = {
      ...job,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "active",
    };
    const updated = [newJob, ...jobPostings];
    setJobPostings(updated);
    sync(STORAGE_KEYS.jobs, updated);

    // Save to Supabase API
    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newJob),
    }).catch((err) => console.warn("[addJobPosting error]", err));
  };

  const deleteJobPosting = (id: string) => {
    const updated = jobPostings.filter((j) => j.id !== id);
    setJobPostings(updated);
    sync(STORAGE_KEYS.jobs, updated);
  };

  // Events methods
  const addEvent = (event: Omit<CommunityEvent, "id">) => {
    const newEvent: CommunityEvent = {
      ...event,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    sync(STORAGE_KEYS.events, updated);

    // Save to Supabase API
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    }).catch((err) => console.warn("[addEvent error]", err));
  };

  const updateEvent = (id: string, updates: Partial<CommunityEvent>) => {
    const updated = events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEvents(updated);
    sync(STORAGE_KEYS.events, updated);
  };

  const deleteEvent = (id: string) => {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    sync(STORAGE_KEYS.events, updated);
  };

  // Donations methods
  const addDonation = (
    don: Partial<Donation> & {
      donor_name: string;
      mobile_number?: string;
      donation_purpose?: string;
      amount?: number;
    }
  ): Donation => {
    const newDonation: Donation = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `don-${Date.now()}`,
      donation_id: don.donation_id || `DON-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      donor_name: don.donor_name,
      mobile_number: don.mobile_number || "",
      donor_photo: don.donor_photo,
      hasthe_names: don.hasthe_names || [],
      donation_purpose: don.donation_purpose || "સમાજના વિકાસ માટે",
      specific_purpose: don.specific_purpose || don.purpose,
      donation_year: don.donation_year || String(new Date().getFullYear()),
      amount: don.amount || 0,
      date: don.date || new Date().toISOString().split("T")[0],
      purpose: don.purpose || don.donation_purpose || "",
      campaign: don.campaign,
      payment_proof: don.payment_proof,
      status: "pending",
      payment_status: "pending",
      is_anonymous: !!don.is_anonymous,
      public_consent: don.public_consent !== false,
      receipt_number: `ADS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      payment_method: don.payment_method || "UPI",
    };

    const updated = [newDonation, ...donations];
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);

    // Save to Supabase API
    fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDonation),
    }).catch((err) => console.warn("[addDonation error]", err));

    return newDonation;
  };

  const approveDonation = (id: string, approvedBy: string) => {
    const updated = donations.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "approved" as const,
            payment_status: "verified" as const,
            approved_by: approvedBy,
            approved_at: new Date().toISOString().split("T")[0],
          }
        : d
    );
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
  };

  const rejectDonation = (id: string, remarks: string, rejectedBy: string) => {
    const updated = donations.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "rejected" as const,
            payment_status: "pending" as const,
            admin_remarks: remarks,
            approved_by: rejectedBy,
            approved_at: new Date().toISOString().split("T")[0],
          }
        : d
    );
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
  };

  const deleteDonation = (id: string) => {
    const updated = donations.filter((d) => d.id !== id);
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
  };

  const verifyDonation = (id: string) => {
    const updated = donations.map((d) =>
      d.id === id ? { ...d, payment_status: "verified" as const } : d
    );
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
  };

  const updateBankDetails = (details: Partial<SamitiBankDetails>) => {
    const updated = { ...bankDetails, ...details, updated_at: new Date().toISOString().split("T")[0] };
    setBankDetails(updated);
    sync(STORAGE_KEYS.bank_details, updated);
  };

  // Announcements methods
  const addAnnouncement = (ann: Omit<Announcement, "id">) => {
    const newAnn: Announcement = {
      ...ann,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`,
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    sync(STORAGE_KEYS.announcements, updated);

    // Save to Supabase API
    fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAnn),
    }).catch((err) => console.warn("[addAnnouncement error]", err));
  };

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    sync(STORAGE_KEYS.announcements, updated);
  };

  // Activity Logs
  const addLog = (action: string, target: string, details: string, adminName: string, adminRole: string) => {
    const newLog: ActivityLog = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      action,
      target,
      details,
      admin_name: adminName,
      admin_role: adminRole,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    sync(STORAGE_KEYS.logs, updated);
  };

  const resetDemoData = () => {
    setMembers([]);
    setRelationships([]);
    setBusinesses([]);
    setAdvertisements([]);
    setJobPostings([]);
    setEvents([]);
    setDonations([]);
    setBankDetails(INITIAL_BANK_DETAILS);
    setAnnouncements([]);
    setCirculars([]);
    setCustomCommittee([]);
    setLogs([]);

    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  return (
    <DataContext.Provider
      value={{
        members,
        relationships,
        businesses,
        advertisements,
        jobPostings,
        events,
        donations,
        bankDetails,
        announcements,
        circulars,
        committee,
        logs,
        addMember,
        updateMember,
        deleteMember,
        addRelationship,
        approveRelationship,
        rejectRelationship,
        deleteRelationship,
        addBusiness,
        updateBusiness,
        approveBusiness,
        deleteBusiness,
        addAdvertisement,
        approveAdvertisement,
        rejectAdvertisement,
        deleteAdvertisement,
        addJobPosting,
        deleteJobPosting,
        addEvent,
        updateEvent,
        deleteEvent,
        addDonation,
        approveDonation,
        rejectDonation,
        deleteDonation,
        verifyDonation,
        updateBankDetails,
        addAnnouncement,
        deleteAnnouncement,
        addLog,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
