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

/**
 * 100% Dynamic Shree Adaatham Darji Seva Samiti Data
 * All mock/dummy entries have been removed permanently.
 * All collections are now loaded live from Supabase PostgreSQL tables.
 */
export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_RELATIONSHIPS: FamilyRelationship[] = [];
export const INITIAL_BUSINESSES: BusinessItem[] = [];
export const INITIAL_ADVERTISEMENTS: BusinessAdvertisement[] = [];
export const INITIAL_JOB_POSTINGS: JobPosting[] = [];
export const INITIAL_EVENTS: CommunityEvent[] = [];
export const INITIAL_DONATIONS: Donation[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_CIRCULARS: Circular[] = [];
export const INITIAL_COMMITTEE: CommitteeMember[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];

/**
 * Official Samiti Bank Account Details & QR Configuration
 */
export const INITIAL_BANK_DETAILS: SamitiBankDetails = {
  account_holder: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા",
  bank_name: "Bank of Baroda (BOB)",
  account_number: "07210100050191",
  ifsc_code: "BARB0MODASA",
  branch_name: "મોડાસા મુખ્ય શાખા (Modasa Main Branch)",
  upi_id: "shri9825191@barodampay",
  qr_code_url: "https://opshugwobopselcmgsko.supabase.co/storage/v1/object/public/samiti-assets/bank-qr-code.jpg",
  updated_at: "2026-01-15",
};
