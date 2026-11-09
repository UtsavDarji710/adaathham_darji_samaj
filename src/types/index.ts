export type PrivacyVisibility = "public" | "members" | "family" | "private";

export interface PrivacySettings {
  phone: PrivacyVisibility;
  address: PrivacyVisibility;
  photo: PrivacyVisibility;
  family: PrivacyVisibility;
  business: PrivacyVisibility;
  employment: PrivacyVisibility;
  education: PrivacyVisibility;
}

export type AdminRole = "president" | "secretary" | "joint_secretary" | "treasurer" | "assistant_treasurer" | "admin" | "member";

export interface EmploymentDetail {
  company: string;
  job_title: string;
  industry?: string;
  city: string;
  experience_years?: string;
  full_name?: string;
  job_type?: string; // સરકારી / ખાનગી ક્ષેત્ર
  phone?: string;
  is_public?: boolean; // સાર્વજનિક નોકરી ડિરેક્ટરીમાં પ્રદર્શન નિયંત્રણ (Show publicly in Nokri tab)
}

export interface MemberBusinessDetail {
  owner_name?: string;
  business_name?: string;
  category?: string; // વ્યવસાયનો પ્રકાર
  role?: string; // હોદ્દો
  city?: string;
  phone?: string;
  address?: string; // પેઢીનું સરનામું
  banner_url?: string; // બિઝનેસનું બેનર / ફોટો
  description?: string;
  is_public?: boolean; // સાર્વજનિક બિઝનેસ ડિરેક્ટરી અને હોમપેજ પ્રદર્શન નિયંત્રણ (Show publicly in Business directory)
}

export interface ChildEducation {
  id: string;
  name: string;
  school_college: string;
  standard_course: string;
  education_level: string;
  is_public: boolean;
}

export interface MemberEducationRecord {
  id: string;
  member_id: string; // "self" or family member ID
  member_name: string;
  degree: string;
  field_of_study?: string;
  institution?: string;
  passing_year?: string;
}

export interface EducationDetail {
  highest_degree: string;
  institution: string;
  field_of_study: string;
  passing_year: string;
  education_category?: string; // શિક્ષણ વિભાગ: Graduate, Post Graduate, etc.
  education_details?: string; // શું અભ્યાસ કર્યો છે? દા.ત. B.Com, MBA
  children?: ChildEducation[];
  family_education?: MemberEducationRecord[];
}

export interface MatrimonyPrivacySettings {
  show_name: boolean; // નામ બતાવવું
  show_photo: boolean; // ફોટો બતાવવો
  show_age: boolean; // ઉંમર / જન્મતારીખ બતાવવી
  show_native_place: boolean; // મૂળ વતન બતાવવું
  show_education: boolean; // શિક્ષણ બતાવવું
  show_occupation: boolean; // વ્યવસાય બતાવવો
  show_contact: boolean; // સંપર્ક / માતા-પિતાની વિગત બતાવવી
}

export interface MatrimonyProfile {
  is_available: boolean; // મેટ્રિમોની માટે ઉપલબ્ધ? (Yes / No)
  is_public_listing?: boolean; // પબ્લિક લિસ્ટિંગમાં બતાવવું છે? (Yes / No)
  is_saved?: boolean; // માહિતી સાચવેલ છે? (Yes / No)
  height?: string; // ઊંચાઈ (દા.ત. 5' 8")
  weight?: string; // વજન
  complexion?: string; // વાન / રંગરૂપ
  subcaste_gotra?: string; // ગોત્ર / શાખ
  about_me?: string; // ઉમેદવાર વિશે ટૂંકી વિગત
  partner_expectations?: string; // અપેક્ષિત જીવનસાથી
  hobbies?: string; // શોખ
  privacy: MatrimonyPrivacySettings;
  updated_at?: string;
}

/**
 * Matrimony Public Listing Eligibility Condition:
 * 1. Marital status MUST be Unmarried (અપરણિત). Engaged (સગાઈ થયેલ) & Married (પરણિત) are STRICTLY excluded.
 * 2. Matrimony Checkbox must be Selected (is_available === true).
 * 3. Public Listing Consent must be Granted (is_public_listing === true).
 * 4. Matrimony Details must be Saved (is_saved === true).
 */
export function isMemberEligibleForPublicMatrimony(member: {
  marital_status?: string;
  is_available_for_matrimony?: boolean;
  matrimony?: MatrimonyProfile;
}): boolean {
  if (!member) return false;

  // Condition 1: Strictly Unmarried only (Engaged & Married rejected)
  const status = (member.marital_status || "").trim();
  const isUnmarried =
    status === "અપરણિત (Unmarried)" ||
    status === "અપરણિત" ||
    status.toLowerCase().includes("unmarried");
  if (!isUnmarried) return false;

  // Condition 2: Matrimony Enabled
  const isMatrimonyEnabled =
    member.is_available_for_matrimony === true && member.matrimony?.is_available === true;
  if (!isMatrimonyEnabled) return false;

  // Condition 3: Public Listing Consent
  const isPublicListing = member.matrimony?.is_public_listing === true;
  if (!isPublicListing) return false;

  // Condition 4: Details Saved
  const isDetailsSaved = member.matrimony?.is_saved === true;
  if (!isDetailsSaved) return false;

  return true;
}

export const SAMITI_NATIVE_PLACES = [
  "અડપોદરા",
  "બાકરોલ (મહાદેવગ્રામ)",
  "બામણવાડ",
  "ભેટાલી",
  "બોલુન્દ્રા",
  "દધાલિયા",
  "દહેગામડા",
  "દાવલી",
  "ગઢડા",
  "ઈસરી",
  "ઈટાડી",
  "ખંભીસર",
  "ખોડંબા",
  "કોકાપુર",
  "કુડોલ",
  "કુણોલ",
  "કુશ્કી",
  "લિંભોઈ",
  "મેઢાસણ",
  "મોડાસા",
  "નાંદીસણ",
  "નવાગામ",
  "પાલ્લા",
  "પટેલ છાપરા",
  "પુજાપુર",
  "રાયગઢ",
  "રાજેન્દ્રનગર",
  "રખિયાલ",
  "રમોસ",
  "રેલ્લાવાડા",
  "સરડોઈ",
  "શામપુર",
  "શણગાલ",
  "શીવનગર",
  "તરકવાડા",
  "ટીંટોઈ",
  "અન્ય (Other)",
] as const;

export const SAMITI_EDUCATION_CATEGORIES = [
  "સ્નાતક (Graduate)",
  "અનુસ્નાતક (Post Graduate)",
  "ઉચ્ચતર માધ્યમિક (Higher Secondary / 12th)",
  "માધ્યમિક / હાઈસ્કૂલ (Secondary / 10th)",
  "ડિપ્લોમા (Diploma)",
  "ડોક્ટરેટ / Ph.D.",
  "વ્યવસાયિક / સીએ / ટેકનિકલ કોર્સ (Professional)",
  "અશિક્ષિત / પ્રાથમિક (Primary)",
  "અન્ય (Other)",
] as const;

export interface FamilyRelationDetail {
  id: string;
  relation: string; // e.g. "પિતા (Father)", "માતા (Mother)", etc.
  name: string;
  phone?: string;
  city?: string;
  native_place?: string;
  sasri_name?: string; // સાસરીનું નામ
  piyar_name?: string; // પિયરનું નામ
  is_public?: boolean; // જાહેર પ્રદર્શન સંમતિ (Show publicly? default: false)
  gender?: "male" | "female" | "other";
  marital_status?: string;
  is_registered?: boolean;
  member_id?: string;
  photo_url?: string | null;
}

export interface Member {
  id: string;
  auth_user_id?: string; // Supabase auth.users UUID reference
  username?: string; // યુઝરનેમ (Unique Alphanumeric Login Identifier)
  name: string;
  photo_url?: string | null;
  phone: string;
  email?: string;
  is_email_verified?: boolean;
  email_verified_at?: string;
  address: string;
  city: string;
  district?: string;
  native_place: string; // વતન
  pincode?: string;
  father_name?: string; // પિતાનું પૂરું નામ
  grandfather_name?: string; // દાદાનું પૂરું નામ
  maternal_uncle_name?: string; // મામાનું પૂરું નામ
  maternal_grandfather_name?: string; // નાનાનું પૂરું નામ
  sasri_name?: string; // સાસરીનું નામ (Sasri Name)
  piyar_name?: string; // પિયરનું નામ (Piyar Name)
  is_public_in_family?: boolean; // સભ્ય માહિતી જાહેર કરવી? (Show publicly? default: false)
  family_relations?: FamilyRelationDetail[]; // પારિવારિક સંબંધો (બહુવિધ સંબંધો, નામ અને મોબાઇલ)
  marital_status?: string; // લગ્ન સ્થિતિ (Married Status)
  gender: "male" | "female" | "other";
  dob?: string;
  blood_group?: string;
  role: AdminRole;
  is_lifetime_member: boolean;
  committee_role?: string;
  committee_order?: number;
  privacy: PrivacySettings;
  business?: MemberBusinessDetail;
  employment?: EmploymentDetail;
  education?: EducationDetail;
  business_id?: string;
  is_available_for_matrimony?: boolean; // મેટ્રિમોની માટે ઉપલબ્ધ?
  matrimony?: MatrimonyProfile; // મેટ્રિમોની પ્રોફાઇલ & સેટિંગ્સ
  password_hash?: string;
  salt?: string;
  created_at: string;
  completeness: number; // 0 - 100%
}

export type RelationshipType =
  | "husband" // પતિ
  | "wife" // પત્ની
  | "father" // પિતા
  | "mother" // માતા
  | "son" // પુત્ર
  | "daughter" // પુત્રી
  | "brother" // ભાઈ
  | "sister" // બહેન
  | "father_in_law" // સસરા
  | "mother_in_law" // સાસુ
  | "sister_in_law_nanand" // નણંદ
  | "sister_in_law_bhabhi" // ભાભી
  | "brother_in_law_banevi" // બનેવી
  | "uncle_paternal" // કાકા
  | "aunt_paternal" // કાકી
  | "uncle_maternal" // મામા
  | "aunt_maternal" // મામી
  | "nephew" // ભત્રીજો
  | "niece" // ભત્રીજી
  | "other"; // અન્ય માન્ય પારિવારિક સંબંધો

export interface FamilyRelationship {
  id: string;
  from_member_id: string;
  from_member_name: string;
  to_member_id: string;
  to_member_name: string;
  relationship: RelationshipType;
  relationship_label: string; // Gujarati label
  status: "pending" | "approved" | "rejected";
  created_at: string;
  requested_by?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface BusinessItem {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  category: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email?: string;
  is_email_verified?: boolean;
  email_verified_at?: string;
  website?: string;
  logo_url?: string;
  cover_url?: string;
  is_featured: boolean;
  is_paid: boolean;
  paid_amount?: number;
  valid_until?: string;
  status: "active" | "pending" | "rejected" | "expired" | "hidden";
  is_public?: boolean;
  created_at: string;
}

export interface BusinessAdvertisement {
  id: string;
  business_name: string;
  category: string;
  description: string;
  owner_name: string;
  contact_number: string;
  address: string;
  image_url: string; // Business Image / Advertisement Banner
  website_link?: string;
  status: "pending" | "approved" | "rejected";
  rejection_remarks?: string;
  submitted_by?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company_name: string;
  category: string;
  job_type: "પૂર્ણ સમય (Full-time)" | "અંશકાલીન (Part-time)" | "રિમોટ (Remote)" | "ઇન્ટર્નશિપ (Internship)";
  city: string;
  salary_range?: string;
  experience?: string;
  description: string;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  posted_by?: string;
  created_at: string;
  status: "active" | "closed";
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  cover_image: string;
  gallery: string[];
  video_url?: string;
  status: "upcoming" | "past" | "archived";
  year: number;
  organizer: string;
}

export interface Donation {
  id: string;
  donation_id: string; // e.g. DON-2026-001
  user_id?: string; // registered user ID
  donor_id?: string;
  donor_name: string;
  mobile_number: string;
  donor_photo?: string; // Donor photo uploaded
  hasthe_names: string[]; // Multiple હસ્તે names
  donation_purpose: string; // e.g. "સમાજના વિકાસ માટે", "શિક્ષણ સહાય", "આરોગ્ય સહાય", "સામાજિક કાર્યક્રમ", "અન્ય"
  specific_purpose?: string; // custom purpose description
  donation_year: string; // e.g. "2026"
  amount: number;
  date: string;
  purpose?: string; // backward compatibility
  campaign?: string; // backward compatibility
  payment_proof?: string; // Payment proof screenshot (Admin only, never public)
  status: "pending" | "approved" | "rejected";
  payment_status?: "verified" | "pending"; // backward compatibility
  is_anonymous?: boolean;
  public_consent?: boolean;
  receipt_number?: string;
  payment_method?: string;
  admin_remarks?: string;
  approved_by?: string;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SamitiBankDetails {
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  upi_id?: string;
  qr_code_url: string;
  updated_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  category: "સામાન્ય" | "અગત્યનું" | "શોક સંદેશ" | "આનંદના સમાચાર" | "સમિતિ નિર્ણય";
  image_url?: string;
  author: string;
  is_urgent?: boolean;
}

export interface Circular {
  id: string;
  circular_no: string; // e.g. "પરિપત્ર ક્રમાંક: ADS/૨૦૨૬/૦૧"
  title: string;
  subject: string;
  body: string;
  date: string;
  department: string;
  signatory: string;
  is_important?: boolean;
}

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string; // પ્રમુખ, મંત્રી, સહમંત્રી, ખજાનચી, ટ્રસ્ટી, કારોબારી સભ્ય
  photo_url?: string | null;
  phone: string;
  city: string;
  term: string;
  order: number;
  is_lifetime_member: boolean;
  role_key: AdminRole;
}

export interface ActivityLog {
  id: string;
  admin_name: string;
  admin_role: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
