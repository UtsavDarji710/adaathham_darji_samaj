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

export type AdminRole = "president" | "secretary" | "joint_secretary" | "treasurer" | "admin" | "member";

export interface EmploymentDetail {
  company: string;
  job_title: string;
  industry?: string;
  city: string;
  experience_years?: string;
  full_name?: string;
  job_type?: string; // સરકારી / ખાનગી ક્ષેત્ર
  phone?: string;
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
}

export interface ChildEducation {
  id: string;
  name: string;
  school_college: string;
  standard_course: string;
  education_level: string;
  is_public: boolean;
}

export interface EducationDetail {
  highest_degree: string;
  institution: string;
  field_of_study: string;
  passing_year: string;
  children: ChildEducation[];
}

export interface Member {
  id: string;
  name: string;
  photo_url: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district?: string;
  native_place: string; // વતન
  pincode?: string;
  father_name?: string; // પિતાનું પૂરું નામ
  grandfather_name?: string; // દાદાનું પૂરું નામ
  maternal_uncle_name?: string; // મામાનું પૂરું નામ
  maternal_grandfather_name?: string; // નાનાનું પૂરું નામ
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
  website?: string;
  logo_url?: string;
  cover_url?: string;
  is_featured: boolean;
  is_paid: boolean;
  paid_amount?: number;
  valid_until?: string;
  status: "active" | "pending" | "rejected" | "expired";
  created_at: string;
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
  donor_id?: string;
  donor_name: string;
  amount: number;
  date: string;
  purpose: string; // જેમ કે ભવન નિર્માણ, વિદ્યાર્થી સહાય, ઉત્સવ
  campaign: string;
  payment_status: "verified" | "pending";
  is_anonymous: boolean;
  public_consent: boolean;
  receipt_number: string;
  payment_method?: string;
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

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string; // પ્રમુખ, મંત્રી, સહમંત્રી, ખજાનચી, ટ્રસ્ટી, કારોબારી સભ્ય
  photo_url: string;
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
