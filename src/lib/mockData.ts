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
 * Real Active Members of Shree Adaatham Darji Seva Samiti
 * (100% dynamic from Supabase database; all mock data cleared)
 */
export const INITIAL_MEMBERS: Member[] = [];


/**
 * Dynamic Family Relationships
 * (Populated dynamically as members request and approve relationships)
 */
export const INITIAL_RELATIONSHIPS: FamilyRelationship[] = [];

/**
 * Dynamic Businesses Directory
 * (Populated dynamically as members register their businesses)
 */
export const INITIAL_BUSINESSES: BusinessItem[] = [];

/**
 * Dynamic Community Events
 * (Populated dynamically by Samiti Committee/Admin)
 */
export const INITIAL_EVENTS: CommunityEvent[] = [];

/**
 * Official Samiti Bank Details for verified donations & QR payments
 */
export const INITIAL_BANK_DETAILS: SamitiBankDetails = {
  account_holder: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા",
  bank_name: "બેંક ઓફ બરોડા (Bank of Baroda)",
  account_number: "02560100001234",
  ifsc_code: "BARB0MODASA",
  branch_name: "મોડાસા મુખ્ય શાખા (Modasa Main)",
  upi_id: "adaadhamsamaj@upi",
  qr_code_url:
    "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=adaadhamsamaj@upi&pn=Adaatham%20Darji%20Seva%20Samiti&mc=8651&mode=02&purpose=00",
  updated_at: new Date().toISOString(),
};

/**
 * Dynamic Donations
 * (Populated dynamically as donors contribute and receipts are verified)
 */
export const INITIAL_DONATIONS: Donation[] = [];

/**
 * Dynamic Announcements
 * (Published dynamically by the executive committee)
 */
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

/**
 * Dynamic Official Circulars
 * (Published dynamically by the committee)
 */
export const INITIAL_CIRCULARS: Circular[] = [];

/**
 * Samiti Committee Members (Live administrative leadership)
 */
export const INITIAL_COMMITTEE: CommitteeMember[] = [];


/**
 * Dynamic Activity Logs
 * (Generated dynamically as user & administrative actions occur)
 */
export const INITIAL_LOGS: ActivityLog[] = [];

/**
 * Dynamic Approved Business Advertisements
 * (Submitted dynamically by members and approved by committee)
 */
export const INITIAL_ADVERTISEMENTS: BusinessAdvertisement[] = [];

/**
 * Dynamic Job Postings
 * (Posted dynamically by community employers & recruiters)
 */
export const INITIAL_JOB_POSTINGS: JobPosting[] = [];
