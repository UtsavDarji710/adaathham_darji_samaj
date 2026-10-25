"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Member,
  FamilyRelationship,
  BusinessItem,
  CommunityEvent,
  Donation,
  Announcement,
  CommitteeMember,
  ActivityLog,
} from "@/types";
import {
  INITIAL_MEMBERS,
  INITIAL_RELATIONSHIPS,
  INITIAL_BUSINESSES,
  INITIAL_EVENTS,
  INITIAL_DONATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_COMMITTEE,
  INITIAL_LOGS,
} from "@/lib/mockData";

interface DataContextType {
  members: Member[];
  relationships: FamilyRelationship[];
  businesses: BusinessItem[];
  events: CommunityEvent[];
  donations: Donation[];
  announcements: Announcement[];
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

  // Events actions
  addEvent: (event: Omit<CommunityEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<CommunityEvent>) => void;
  deleteEvent: (id: string) => void;

  // Donations actions
  addDonation: (don: Omit<Donation, "id" | "receipt_number">) => Donation;
  verifyDonation: (id: string) => void;

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
  events: "ad8_data_events",
  donations: "ad8_data_donations",
  announcements: "ad8_data_announcements",
  committee: "ad8_data_committee",
  logs: "ad8_data_logs",
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>(INITIAL_RELATIONSHIPS);
  const [businesses, setBusinesses] = useState<BusinessItem[]>(INITIAL_BUSINESSES);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_EVENTS);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [committee, setCommittee] = useState<CommitteeMember[]>(INITIAL_COMMITTEE);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_LOGS);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedMembers = localStorage.getItem(STORAGE_KEYS.members);
      if (storedMembers) setMembers(JSON.parse(storedMembers));

      const storedRels = localStorage.getItem(STORAGE_KEYS.relationships);
      if (storedRels) setRelationships(JSON.parse(storedRels));

      const storedBiz = localStorage.getItem(STORAGE_KEYS.businesses);
      if (storedBiz) setBusinesses(JSON.parse(storedBiz));

      const storedEvents = localStorage.getItem(STORAGE_KEYS.events);
      if (storedEvents) setEvents(JSON.parse(storedEvents));

      const storedDonations = localStorage.getItem(STORAGE_KEYS.donations);
      if (storedDonations) setDonations(JSON.parse(storedDonations));

      const storedAnnouncements = localStorage.getItem(STORAGE_KEYS.announcements);
      if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));

      const storedCommittee = localStorage.getItem(STORAGE_KEYS.committee);
      if (storedCommittee) setCommittee(JSON.parse(storedCommittee));

      const storedLogs = localStorage.getItem(STORAGE_KEYS.logs);
      if (storedLogs) setLogs(JSON.parse(storedLogs));
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

  const addDonation = (don: Omit<Donation, "id" | "receipt_number">) => {
    const receiptNumber = `ADS-${new Date().getFullYear()}-${String(donations.length + 1).padStart(3, "0")}`;
    const newDonation: Donation = {
      ...don,
      id: `don-${Date.now()}`,
      receipt_number: receiptNumber,
    };
    const updated = [newDonation, ...donations];
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
    return newDonation;
  };

  const verifyDonation = (id: string) => {
    const updated = donations.map((d) =>
      d.id === id ? { ...d, payment_status: "verified" as const } : d
    );
    setDonations(updated);
    sync(STORAGE_KEYS.donations, updated);
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
    setMembers(INITIAL_MEMBERS);
    setRelationships(INITIAL_RELATIONSHIPS);
    setBusinesses(INITIAL_BUSINESSES);
    setEvents(INITIAL_EVENTS);
    setDonations(INITIAL_DONATIONS);
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
        events,
        donations,
        announcements,
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
        addEvent,
        updateEvent,
        deleteEvent,
        addDonation,
        verifyDonation,
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
