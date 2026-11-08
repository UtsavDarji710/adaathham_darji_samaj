"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

  // Reset to initial demo data
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
  committee: "ad8_data_committee",
  logs: "ad8_data_logs",
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>(INITIAL_RELATIONSHIPS);
  const [businesses, setBusinesses] = useState<BusinessItem[]>(INITIAL_BUSINESSES);
  const [advertisements, setAdvertisements] = useState<BusinessAdvertisement[]>(INITIAL_ADVERTISEMENTS);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(INITIAL_JOB_POSTINGS);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [bankDetails, setBankDetails] = useState<SamitiBankDetails>(INITIAL_BANK_DETAILS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [circulars, setCirculars] = useState<Circular[]>(INITIAL_CIRCULARS);
  const [committee, setCommittee] = useState<CommitteeMember[]>(INITIAL_COMMITTEE);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Load dynamic data on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // 1. Fetch live dynamic members from API / Supabase
      fetch("/api/members")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.members) && data.members.length > 0) {
            setMembers(data.members);
            sync(STORAGE_KEYS.members, data.members);
          }
        })
        .catch((err) => {
          console.warn("[DataContext] Live members fetch warning:", err);
        });

      // 2. Load stored dynamic data or fallback to initial lists
      const storedMembers = localStorage.getItem(STORAGE_KEYS.members);
      if (storedMembers) {
        try {
          const parsed = JSON.parse(storedMembers);
          if (Array.isArray(parsed) && parsed.length > 0) setMembers(parsed);
        } catch {}
      }

      const storedRels = localStorage.getItem(STORAGE_KEYS.relationships);
      if (storedRels) {
        try {
          const parsed = JSON.parse(storedRels);
          if (Array.isArray(parsed) && parsed.length > 0) setRelationships(parsed);
        } catch {}
      }

      const storedBiz = localStorage.getItem(STORAGE_KEYS.businesses);
      if (storedBiz) {
        try {
          const parsed = JSON.parse(storedBiz);
          if (Array.isArray(parsed) && parsed.length > 0) setBusinesses(parsed);
          else if (INITIAL_BUSINESSES.length > 0) setBusinesses(INITIAL_BUSINESSES);
        } catch {}
      } else if (INITIAL_BUSINESSES.length > 0) {
        setBusinesses(INITIAL_BUSINESSES);
      }

      const storedAds = localStorage.getItem(STORAGE_KEYS.advertisements);
      if (storedAds) {
        try {
          const parsed = JSON.parse(storedAds);
          if (Array.isArray(parsed) && parsed.length > 0) setAdvertisements(parsed);
          else if (INITIAL_ADVERTISEMENTS.length > 0) setAdvertisements(INITIAL_ADVERTISEMENTS);
        } catch {}
      } else if (INITIAL_ADVERTISEMENTS.length > 0) {
        setAdvertisements(INITIAL_ADVERTISEMENTS);
      }

      const storedJobs = localStorage.getItem(STORAGE_KEYS.jobs);
      if (storedJobs) {
        try {
          const parsed = JSON.parse(storedJobs);
          if (Array.isArray(parsed) && parsed.length > 0) setJobPostings(parsed);
          else if (INITIAL_JOB_POSTINGS.length > 0) setJobPostings(INITIAL_JOB_POSTINGS);
        } catch {}
      } else if (INITIAL_JOB_POSTINGS.length > 0) {
        setJobPostings(INITIAL_JOB_POSTINGS);
      }

      const storedEvents = localStorage.getItem(STORAGE_KEYS.events);
      if (storedEvents) {
        try {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed) && parsed.length > 0) setEvents(parsed);
          else if (INITIAL_EVENTS.length > 0) setEvents(INITIAL_EVENTS);
        } catch {}
      } else if (INITIAL_EVENTS.length > 0) {
        setEvents(INITIAL_EVENTS);
      }

      const storedDonations = localStorage.getItem(STORAGE_KEYS.donations);
      if (storedDonations) {
        try {
          const parsed = JSON.parse(storedDonations);
          if (Array.isArray(parsed) && parsed.length > 0) setDonations(parsed);
          else if (INITIAL_DONATIONS.length > 0) setDonations(INITIAL_DONATIONS);
        } catch {}
      } else if (INITIAL_DONATIONS.length > 0) {
        setDonations(INITIAL_DONATIONS);
      }

      const storedBank = localStorage.getItem(STORAGE_KEYS.bank_details);
      if (storedBank) {
        try {
          setBankDetails(JSON.parse(storedBank));
        } catch {}
      }

      const storedAnnouncements = localStorage.getItem(STORAGE_KEYS.announcements);
      if (storedAnnouncements) {
        try {
          const parsed = JSON.parse(storedAnnouncements);
          if (Array.isArray(parsed) && parsed.length > 0) setAnnouncements(parsed);
          else if (INITIAL_ANNOUNCEMENTS.length > 0) setAnnouncements(INITIAL_ANNOUNCEMENTS);
        } catch {}
      } else if (INITIAL_ANNOUNCEMENTS.length > 0) {
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
      }

      const storedCommittee = localStorage.getItem(STORAGE_KEYS.committee);
      if (storedCommittee) {
        try {
          const parsed = JSON.parse(storedCommittee);
          if (Array.isArray(parsed) && parsed.length > 0) setCommittee(parsed);
          else if (INITIAL_COMMITTEE.length > 0) setCommittee(INITIAL_COMMITTEE);
        } catch {}
      } else if (INITIAL_COMMITTEE.length > 0) {
        setCommittee(INITIAL_COMMITTEE);
      }

      const storedLogs = localStorage.getItem(STORAGE_KEYS.logs);
      if (storedLogs) {
        try {
          const parsed = JSON.parse(storedLogs);
          if (Array.isArray(parsed) && parsed.length > 0) setLogs(parsed);
        } catch {}
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
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

    // Sync ad8_current_user in localStorage if updating the current user
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
      id: `rel-${Date.now()}`,
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
      id: `biz-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newBiz, ...businesses];
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);
  };

  const updateBusiness = (id: string, updates: Partial<BusinessItem>) => {
    const updated = businesses.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);
  };

  const approveBusiness = (id: string) => {
    updateBusiness(id, { status: "active" });
  };

  const deleteBusiness = (id: string) => {
    const updated = businesses.filter((b) => b.id !== id);
    setBusinesses(updated);
    sync(STORAGE_KEYS.businesses, updated);
  };

  // Business Advertisements methods
  const addAdvertisement = (adv: Omit<BusinessAdvertisement, "id" | "created_at">) => {
    const newAdv: BusinessAdvertisement = {
      ...adv,
      id: `adv-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "pending",
    };
    const updated = [newAdv, ...advertisements];
    setAdvertisements(updated);
    sync(STORAGE_KEYS.advertisements, updated);
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
  };

  // Job Postings methods
  const addJobPosting = (job: Omit<JobPosting, "id" | "created_at">) => {
    const newJob: JobPosting = {
      ...job,
      id: `job-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "active",
    };
    const updated = [newJob, ...jobPostings];
    setJobPostings(updated);
    sync(STORAGE_KEYS.jobs, updated);
  };

  const deleteJobPosting = (id: string) => {
    const updated = jobPostings.filter((j) => j.id !== id);
    setJobPostings(updated);
    sync(STORAGE_KEYS.jobs, updated);
  };

  const addEvent = (event: Omit<CommunityEvent, "id">) => {
    const newEvent: CommunityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    sync(STORAGE_KEYS.events, updated);
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

  const addDonation = (don: Partial<Donation> & { donor_name: string; mobile_number?: string; donation_purpose?: string; amount?: number }) => {
    const year = don.donation_year || String(new Date().getFullYear());
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const donationId = don.donation_id || `DON-${year}-${randomSuffix}`;
    const receiptNumber = don.receipt_number || `ADS-${year}-${String(donations.length + 1).padStart(3, "0")}`;

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donation_id: donationId,
      user_id: don.user_id,
      donor_id: don.donor_id,
      donor_name: don.donor_name,
      mobile_number: don.mobile_number || "",
      donor_photo: don.donor_photo,
      hasthe_names: don.hasthe_names || [],
      donation_purpose: don.donation_purpose || don.purpose || "સમાજના વિકાસ માટે",
      specific_purpose: don.specific_purpose,
      donation_year: year,
      amount: Number(don.amount) || 0,
      date: don.date || new Date().toISOString().split("T")[0],
      purpose: don.purpose || don.donation_purpose || "સમાજના વિકાસ માટે",
      campaign: don.campaign || "સમાજ વિકાસ ભંડોળ",
      payment_proof: don.payment_proof,
      status: don.status || "pending",
      payment_status: don.payment_status || "pending",
      is_anonymous: don.is_anonymous || false,
      public_consent: don.public_consent !== false,
      receipt_number: receiptNumber,
      payment_method: don.payment_method || "UPI / ઓનલાઇન",
      created_at: new Date().toISOString(),
    };

    const updated = [newDonation, ...donations];
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
    return newDonation;
  };

  const approveDonation = (id: string, approvedBy: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = donations.map((d) =>
      d.id === id
        ? {
            ...d,
            status: "approved" as const,
            payment_status: "verified" as const,
            approved_by: approvedBy,
            approved_at: today,
            updated_at: new Date().toISOString(),
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
            updated_at: new Date().toISOString(),
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
    approveDonation(id, "ખજાનચી શ્રી");
  };

  const updateBankDetails = (details: Partial<SamitiBankDetails>) => {
    const updated: SamitiBankDetails = {
      ...bankDetails,
      ...details,
      updated_at: new Date().toISOString().split("T")[0],
    };
    setBankDetails(updated);
    sync(STORAGE_KEYS.bank_details, updated);
  };

  const addAnnouncement = (ann: Omit<Announcement, "id">) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    sync(STORAGE_KEYS.announcements, updated);
  };

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    sync(STORAGE_KEYS.announcements, updated);
  };

  const addLog = (
    action: string,
    target: string,
    details: string,
    adminName: string,
    adminRole: string
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      target,
      details,
      admin_name: adminName,
      admin_role: adminRole,
      timestamp: new Date().toLocaleString("gu-IN"),
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    sync(STORAGE_KEYS.logs, updated);
  };

  const resetDemoData = () => {
    setMembers([]);
    setRelationships(INITIAL_RELATIONSHIPS);
    setBusinesses(INITIAL_BUSINESSES);
    setAdvertisements(INITIAL_ADVERTISEMENTS);
    setJobPostings(INITIAL_JOB_POSTINGS);
    setEvents(INITIAL_EVENTS);
    setDonations(INITIAL_DONATIONS);
    setBankDetails(INITIAL_BANK_DETAILS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setCommittee(INITIAL_COMMITTEE);
    setLogs(INITIAL_LOGS);

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
