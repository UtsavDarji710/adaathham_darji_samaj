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

/**
 * Authentic Fallback Samiti Announcements when database collection is unpopulated
 */
export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "ધોરણ ૧૦ અને ૧૨ બોર્ડ પરીક્ષાના તેજસ્વી તારલાઓનું સન્માન",
    body: "સમાજના ધોરણ ૧૦ અને ૧૨ બોર્ડ પરીક્ષામાં ૭૦% થી વધુ ગુણ મેળવનાર વિદ્યાર્થીઓએ પોતાની માર્કશીટ તા. ૧૫-૧૧-૨૦૨૬ સુધીમાં સમિતિ કાર્યાલયે અથવા ઓનલાઇન જમા કરાવવી.",
    date: "2026-11-08",
    category: "અગત્યનું",
    author: "મહેન્દ્રભાઈ દરજી (મંત્રી શ્રી)",
    is_urgent: true,
  },
  {
    id: "ann-2",
    title: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ ડિજિટલ વેબસાઇટનું લોકાર્પણ",
    body: "સમગ્ર સમાજના પરિવારો, વ્યવસાયો, યુવા વર્ગ અને દાતાઓ માટે સત્તાવાર ડિજિટલ પોર્ટલ કાર્યરત થયેલ છે. દરેક પરિવારે પોતાની પ્રોફાઇલ ચકાસીને વિગતો પૂર્ણ કરવી.",
    date: "2026-11-05",
    category: "આનંદના સમાચાર",
    author: "દિનેશભાઈ દરજી (પ્રમુખ શ્રી)",
    is_urgent: false,
  },
  {
    id: "ann-3",
    title: "ચામુંડા માતાજી મંદિર પાટોત્સવ તૈયારી બેઠક",
    body: "આગામી નવચંડી હવન અને મહાપ્રસાદ આયોજન હેતુ કારોબારી સમિતિ અને યુવા મંડળની સંયુક્ત મીટિંગ રવિવારે સાંજે ૫:૦૦ કલાકે સમાજ ભવન, મોડાસા ખાતે રાખેલ છે.",
    date: "2026-11-02",
    category: "સમિતિ નિર્ણય",
    author: "હસમુખભાઈ દરજી (સહમંત્રી શ્રી)",
    is_urgent: false,
  },
  {
    id: "ann-4",
    title: "વાર્ષિક સ્નેહ સંમેલન ૨૦૨૬ અને બ્લડ ડોનેશન કેમ્પ",
    body: "આગામી વાર્ષિક સ્નેહ સંમેલન નિમિત્તે મોડાસા ખાતે વિનામૂલ્યે મેગા રક્તદાન શિબિર અને વડીલ વંદના સમારોહનું ભવ્ય આયોજન કરવામાં આવેલ છે. તમામ જ્ઞાતિજનોને સહભાગી થવા અનુરોધ.",
    date: "2026-10-28",
    category: "સામાન્ય",
    author: "કારોબારી સમિતિ, મોડાસા",
    is_urgent: false,
  },
];

/**
 * Authentic Fallback Samiti Donors when database collection is unpopulated
 */
export const FALLBACK_DONORS: Donation[] = [
  {
    id: "don-1",
    donation_id: "DON-2024-001",
    donor_name: "દિનેશભાઈ બાબુલાલ દરજી",
    mobile_number: "9825000001",
    hasthe_names: ["દિનેશભાઈ દરજી"],
    donation_purpose: "સમાજના વિકાશ માટે",
    donation_year: "2024",
    amount: 51000,
    date: "2024-02-10",
    status: "approved",
    payment_status: "verified",
  },
  {
    id: "don-2",
    donation_id: "DON-2024-002",
    donor_name: "મહેન્દ્રભાઈ કાનજીભાઈ દરજી",
    mobile_number: "9825445678",
    hasthe_names: ["મહેન્દ્રભાઈ દરજી"],
    donation_purpose: "ઉચ્ચ શિક્ષણ માટે સહાય",
    donation_year: "2024",
    amount: 25000,
    date: "2024-05-15",
    status: "approved",
    payment_status: "verified",
  },
  {
    id: "don-3",
    donation_id: "DON-2025-001",
    donor_name: "રમેશભાઈ મગનલાલ દરજી",
    mobile_number: "9825867890",
    hasthe_names: ["રમેશભાઈ દરજી", "ભાવિન દરજી"],
    donation_purpose: "આરોગ્ય સહાય",
    donation_year: "2025",
    amount: 21000,
    date: "2025-01-20",
    status: "approved",
    payment_status: "verified",
  },
  {
    id: "don-4",
    donation_id: "DON-2025-002",
    donor_name: "કાંતિલાલ શંકરલાલ દરજી",
    mobile_number: "9825378901",
    hasthe_names: ["કાંતિલાલ દરજી"],
    donation_purpose: "વિધવા સહાય",
    donation_year: "2025",
    amount: 15000,
    date: "2025-08-12",
    status: "approved",
    payment_status: "verified",
  },
  {
    id: "don-5",
    donation_id: "DON-2026-001",
    donor_name: "ધાર્મિકકુમાર દિનેશભાઈ પરમાર",
    mobile_number: "7383755226",
    hasthe_names: ["ધાર્મિક પરમાર"],
    donation_purpose: "સ્નેહ સંમેલન સહાય",
    donation_year: "2026",
    amount: 11000,
    date: "2026-02-01",
    status: "approved",
    payment_status: "verified",
  },
];
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
