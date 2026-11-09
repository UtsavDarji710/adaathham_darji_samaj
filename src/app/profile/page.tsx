"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Briefcase,
  GraduationCap,
  Lock,
  Save,
  CheckCircle,
  Camera,
  GitFork,
  Heart,
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Clock,
  XCircle,
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
  Building,
  Phone,
  Users,
  X,
  MapPin,
  UserCheck,
  Copy,
  Megaphone,
  Search,
  Filter,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Mail,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  PrivacyVisibility,
  ChildEducation,
  MemberEducationRecord,
  FamilyRelationDetail,
  Member,
  SAMITI_NATIVE_PLACES,
  SAMITI_EDUCATION_CATEGORIES,
  MatrimonyProfile,
  MatrimonyPrivacySettings,
  BusinessAdvertisement,
  isMemberEligibleForPublicMatrimony,
} from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { UserAvatar } from "@/components/UserAvatar";

const RELATION_OPTIONS = [
  "પિતા (Father)",
  "માતા (Mother)",
  "દાદા (Grandfather)",
  "દાદી (Grandmother)",
  "નાના (Maternal Grandfather)",
  "નાની (Maternal Grandmother)",
  "મામા (Maternal Uncle)",
  "મામી (Maternal Aunt)",
  "કાકા (Paternal Uncle)",
  "કાકી (Paternal Aunt)",
  "ભાઈ (Brother)",
  "બહેન (Sister)",
  "પત્ની (Wife)",
  "પતિ (Husband)",
  "પુત્ર (Son)",
  "પુત્રી (Daughter)",
  "સસરા (Father-in-law)",
  "સાસુ (Mother-in-law)",
  "જમાઈ (Son-in-law)",
  "પુત્રવધૂ (Daughter-in-law)",
  "ફોઈ (Paternal Aunt)",
  "ફુવા (Paternal Uncle-in-law)",
  "માસી (Maternal Aunt)",
  "માસા (Maternal Uncle-in-law)",
  "અન્ય સંબંધ (Other)",
];

function getInitialFamilyRelations(user: any): FamilyRelationDetail[] {
  if (!user || !Array.isArray(user.family_relations)) return [];
  // User adds relations themselves; do not add default or auto-synthesized relations
  return user.family_relations.filter(
    (r: FamilyRelationDetail) =>
      r &&
      !r.id?.startsWith("init-") &&
      !r.id?.startsWith("rel-d") &&
      !r.id?.startsWith("rel-b") &&
      Boolean(r.name && r.name.trim() !== "દરજી" && r.name.trim() !== "")
  );
}

export default function ProfilePage() {
  const { currentUser, updateCurrentUserProfile, updatePrivacySettings, isAdmin } = useAuth();
  const {
    relationships,
    businesses,
    addBusiness,
    updateBusiness,
    addMember,
    updateMember,
    addRelationship,
    addLog,
    members,
    donations,
    addAdvertisement,
  } = useData();

  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mId = params.get("memberId");
      if (mId) {
        setSelectedMemberId(mId);
      }
    }
  }, []);

  const effectiveMember = React.useMemo(() => {
    if (isAdmin && selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || currentUser;
    }
    if (currentUser) {
      const fromStore = members.find(
        (m) =>
          m.id === currentUser.id ||
          (m.email && m.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
          (m.phone && m.phone.replace(/\D/g, "") === currentUser.phone?.replace(/\D/g, ""))
      );
      if (fromStore) {
        return { ...currentUser, ...fromStore };
      }
    }
    return currentUser;
  }, [isAdmin, selectedMemberId, members, currentUser]);

  const [activeTab, setActiveTab] = useState<
    "general" | "privacy" | "employment" | "education" | "donations" | "matrimony"
  >("general");

  // User's Submitted Donations (Requirement 13.6)
  const myDonations = currentUser
    ? donations.filter(
        (d) =>
          d.user_id === currentUser.id ||
          d.donor_id === currentUser.id ||
          (d.mobile_number && d.mobile_number === currentUser.phone) ||
          (d.donor_name && d.donor_name.toLowerCase() === currentUser.name.toLowerCase())
      )
    : [];
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states initialized with currentUser data
  const [username, setUsername] = useState(currentUser?.username || "");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [nativePlace, setNativePlace] = useState(currentUser?.native_place || "અડાઆઠમ");
  const [city, setCity] = useState(currentUser?.city || "મોડાસા");
  const [sasriName, setSasriName] = useState(currentUser?.sasri_name || "");
  const [piyarName, setPiyarName] = useState(currentUser?.piyar_name || "");
  const [maritalStatus, setMaritalStatus] = useState(currentUser?.marital_status || "પરણિત (Married)");
  const [bloodGroup, setBloodGroup] = useState(currentUser?.blood_group || "B+");
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo_url || "");
  const [showProfilePhotoCropModal, setShowProfilePhotoCropModal] = useState(false);

  // Matrimony states
  const [isAvailableForMatrimony, setIsAvailableForMatrimony] = useState(
    currentUser?.is_available_for_matrimony || currentUser?.matrimony?.is_available || false
  );
  const [isPublicListing, setIsPublicListing] = useState<boolean>(
    currentUser?.matrimony?.is_public_listing ?? true
  );
  const [matrimonyHeight, setMatrimonyHeight] = useState(currentUser?.matrimony?.height || "5' 8\"");
  const [matrimonyComplexion, setMatrimonyComplexion] = useState(currentUser?.matrimony?.complexion || "ઘઉંવર્ણ (Wheatish)");
  const [matrimonyAbout, setMatrimonyAbout] = useState(currentUser?.matrimony?.about_me || "");
  const [matrimonyExpectations, setMatrimonyExpectations] = useState(currentUser?.matrimony?.partner_expectations || "");
  const [matrimonyPrivacy, setMatrimonyPrivacy] = useState<MatrimonyPrivacySettings>(
    currentUser?.matrimony?.privacy || {
      show_name: true,
      show_photo: true,
      show_age: true,
      show_native_place: true,
      show_education: true,
      show_occupation: true,
      show_contact: true,
    }
  );

  // Eligibility: strictly Unmarried (અપરણિત). Married & Engaged are NOT eligible.
  const isUnmarried = Boolean(
    maritalStatus &&
      (maritalStatus.startsWith("અપરણિત") ||
        maritalStatus.toLowerCase().includes("unmarried") ||
        maritalStatus.toLowerCase().includes("single"))
  );

  // If user is married (પરણિત) and currently on matrimony tab, auto-switch to general
  React.useEffect(() => {
    if (!isUnmarried && activeTab === "matrimony") {
      setActiveTab("general");
    }
  }, [isUnmarried, activeTab]);

  // Matrimony Directory Filters & Modal
  const [matrimonyFilterGender, setMatrimonyFilterGender] = useState<"all" | "male" | "female">("all");
  const [matrimonyFilterNativePlace, setMatrimonyFilterNativePlace] = useState<string>("all");
  const [matrimonyFilterEducation, setMatrimonyFilterEducation] = useState<string>("all");
  const [matrimonyFilterSearch, setMatrimonyFilterSearch] = useState<string>("");
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<Member | null>(null);

  // Business Advertisement Modal States
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adBusinessName, setAdBusinessName] = useState("");
  const [adCategory, setAdCategory] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adOwnerName, setAdOwnerName] = useState("");
  const [adPhone, setAdPhone] = useState("");
  const [adAddress, setAdAddress] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adWebsite, setAdWebsite] = useState("");

  // Dynamic Family Relations state
  const [familyRelations, setFamilyRelations] = useState<FamilyRelationDetail[]>(() =>
    getInitialFamilyRelations(currentUser)
  );
  const [newRelationType, setNewRelationType] = useState("");
  const [newRelationName, setNewRelationName] = useState("");
  const [newRelationPhone, setNewRelationPhone] = useState("");

  // Add New Member Card State & Handlers
  const [showNewMemberCard, setShowNewMemberCard] = useState(false);
  const [newMemberRelation, setNewMemberRelation] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberNativePlace, setNewMemberNativePlace] = useState("");
  const [newMemberCity, setNewMemberCity] = useState("");
  const [newMemberSasriName, setNewMemberSasriName] = useState("");
  const [newMemberPiyarName, setNewMemberPiyarName] = useState("");
  const [newMemberIsPublic, setNewMemberIsPublic] = useState(false);
  const [newMemberMaritalStatus, setNewMemberMaritalStatus] = useState("પરણિત (Married)");
  const [newMemberBloodGroup, setNewMemberBloodGroup] = useState("B+");
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [newMemberGender, setNewMemberGender] = useState<"male" | "female" | "other">("male");

  // New member's own family relations state
  const [newMemberFamilyRelations, setNewMemberFamilyRelations] = useState<FamilyRelationDetail[]>([]);
  const [newMemberSubRelationType, setNewMemberSubRelationType] = useState("");
  const [newMemberSubRelationName, setNewMemberSubRelationName] = useState("");
  const [newMemberSubRelationPhone, setNewMemberSubRelationPhone] = useState("");

  const handleAddNewMemberRelation = () => {
    if (!newMemberSubRelationType) {
      alert("કૃપા કરીને સંબંધ પસંદ કરો.");
      return;
    }
    if (!newMemberSubRelationName.trim()) {
      alert("કૃપા કરીને સંબંધીનું પૂરું નામ દાખલ કરો.");
      return;
    }

    const newId = `rel-sub-${Date.now()}`;
    const newRel: FamilyRelationDetail = {
      id: newId,
      relation: newMemberSubRelationType,
      name: newMemberSubRelationName.trim(),
      phone: newMemberSubRelationPhone.trim() || undefined,
      is_registered: false,
    };

    setNewMemberFamilyRelations((prev) => [...prev, newRel]);
    setNewMemberSubRelationType("");
    setNewMemberSubRelationName("");
    setNewMemberSubRelationPhone("");
    showToast(`સંબંધ "${newRel.relation} - ${newRel.name}" ઉમેરાયો!`);
  };

  const handleRemoveNewMemberRelation = (id: string) => {
    setNewMemberFamilyRelations((prev) => prev.filter((r) => r.id !== id));
    showToast("સંબંધ યાદીમાંથી કાઢી નાખવામાં આવ્યો.");
  };

  const copyFromAbove = () => {
    setNewMemberNativePlace(nativePlace || currentUser?.native_place || "અડાઆઠમ");
    setNewMemberCity(city || currentUser?.city || "મોડાસા");
    setNewMemberAddress(address || currentUser?.address || "");
    setNewMemberSasriName(sasriName || currentUser?.sasri_name || "");
    setNewMemberPiyarName(piyarName || currentUser?.piyar_name || "");

    const copiedRelations: FamilyRelationDetail[] = [];
    if (currentUser) {
      copiedRelations.push({
        id: `rel-head-${Date.now()}`,
        relation: "મુખ્ય સભ્ય (Self/Head)",
        name: currentUser.name,
        phone: currentUser.phone,
        city: currentUser.city,
        native_place: currentUser.native_place,
        is_registered: true,
        member_id: currentUser.id,
      });
    }
    familyRelations.forEach((r) => {
      copiedRelations.push({
        ...r,
        id: `rel-copy-${r.id}-${Date.now()}`,
      });
    });
    setNewMemberFamilyRelations(copiedRelations);

    showToast("ઉપરના કાર્ડમાંથી વિગતો અને પારિવારિક સંબંધો કોપી થઈ ગયા!");
  };

  const handleOpenNewMemberCard = () => {
    setNewMemberRelation("");
    setNewMemberName("");
    setNewMemberPhone("");
    setNewMemberEmail("");
    setNewMemberNativePlace(nativePlace || currentUser?.native_place || "અડાઆઠમ");
    setNewMemberCity(city || currentUser?.city || "મોડાસા");
    setNewMemberSasriName(sasriName || currentUser?.sasri_name || "");
    setNewMemberPiyarName(piyarName || currentUser?.piyar_name || "");
    setNewMemberIsPublic(false);
    setNewMemberMaritalStatus("પરણિત (Married)");
    setNewMemberBloodGroup("B+");
    setNewMemberAddress(address || currentUser?.address || "");
    setNewMemberGender("male");

    const initialCopiedRelations: FamilyRelationDetail[] = [];
    if (currentUser) {
      initialCopiedRelations.push({
        id: `rel-head-${Date.now()}`,
        relation: "મુખ્ય સભ્ય (Self/Head)",
        name: currentUser.name,
        phone: currentUser.phone,
        city: currentUser.city,
        native_place: currentUser.native_place,
        is_registered: true,
        member_id: currentUser.id,
      });
    }
    familyRelations.forEach((r) => {
      initialCopiedRelations.push({
        ...r,
        id: `rel-copy-${r.id}-${Date.now()}`,
      });
    });
    setNewMemberFamilyRelations(initialCopiedRelations);

    setShowNewMemberCard(true);

    setTimeout(() => {
      document.getElementById("new-member-card")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAddNewMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberRelation) {
      alert("કૃપા કરીને સંબંધ પસંદ કરો.");
      return;
    }
    if (!newMemberName.trim()) {
      alert("કૃપા કરીને સભ્યનું પૂરું નામ દાખલ કરો.");
      return;
    }

    if (newMemberEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMemberEmail.trim())) {
        alert("કૃપા કરીને સાચું ઈમેલ સરનામું (Valid Email Address) દાખલ કરો.");
        return;
      }
    }

    const newId = `mem-${Date.now()}`;

    const createdMember: Member = {
      id: newId,
      name: newMemberName.trim(),
      photo_url: null,
      phone: newMemberPhone.trim() || "",
      email: newMemberEmail.trim() || undefined,
      address: newMemberAddress.trim() || currentUser?.address || "",
      city: newMemberCity.trim() || currentUser?.city || "મોડાસા",
      district: currentUser?.district || "અરવલ્લી",
      native_place: newMemberNativePlace.trim() || currentUser?.native_place || "અડાઆઠમ",
      sasri_name: newMemberSasriName.trim() || undefined,
      piyar_name: newMemberPiyarName.trim() || undefined,
      is_public_in_family: newMemberIsPublic,
      gender: newMemberGender,
      blood_group: newMemberBloodGroup || "B+",
      marital_status: newMemberMaritalStatus || "પરણિત (Married)",
      role: "member",
      is_lifetime_member: false,
      completeness: 85,
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
    };

    // 1. Add to DataContext
    addMember(createdMember);

    // 2. Add family relationship
    if (currentUser) {
      addRelationship({
        from_member_id: currentUser.id,
        from_member_name: currentUser.name,
        to_member_id: newId,
        to_member_name: createdMember.name,
        relationship: "other",
        relationship_label: newMemberRelation.split(" (")[0] || "સંબંધી",
        status: "approved",
        requested_by: currentUser.id,
        approved_by: currentUser.name,
      });

      if (addLog) {
        addLog(
          "પરિવારમાં નવા સભ્યની નોંધણી",
          `${createdMember.name} (${newMemberRelation})`,
          `નોંધણી કરનાર: ${currentUser.name}, ગામ: ${createdMember.native_place}`,
          currentUser.name,
          currentUser.role || "member"
        );
      }
    }

    // 3. Add to local familyRelations state
    const relationItem: FamilyRelationDetail = {
      id: newId,
      relation: newMemberRelation,
      name: createdMember.name,
      phone: createdMember.phone,
      city: createdMember.city,
      native_place: createdMember.native_place,
      sasri_name: createdMember.sasri_name,
      piyar_name: createdMember.piyar_name,
      is_public: newMemberIsPublic,
      gender: createdMember.gender,
      is_registered: true,
      member_id: newId,
    };

    setFamilyRelations((prev) => [...prev, relationItem]);
    setShowNewMemberCard(false);
    setNewMemberEmail("");
    showToast(`નવા સભ્ય "${createdMember.name}" સફળતાપૂર્વક ઉમેરાયા!`);
  };

  // ૧. બિઝનેસ / વ્યવસાય (ઉપર બિઝનેસ)
  const [businessOwnerName, setBusinessOwnerName] = useState(currentUser?.business?.owner_name || currentUser?.name || "");
  const [businessName, setBusinessName] = useState(currentUser?.business?.business_name || "");
  const [businessCategory, setBusinessCategory] = useState(currentUser?.business?.category || "");
  const [businessRole, setBusinessRole] = useState(currentUser?.business?.role || "Owner");
  const [businessCity, setBusinessCity] = useState(currentUser?.business?.city || currentUser?.city || "");
  const [businessPhone, setBusinessPhone] = useState(currentUser?.business?.phone || currentUser?.phone || "");
  const [businessAddress, setBusinessAddress] = useState(currentUser?.business?.address || "");
  const [businessBannerUrl, setBusinessBannerUrl] = useState(currentUser?.business?.banner_url || "");

  const handleBusinessPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("કૃપા કરીને 5MB કરતાં નાની ઈમેજ પસંદ કરો.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessBannerUrl(reader.result as string);
        showToast("વ્યવસાયની તસવીર અપલોડ થઈ ગઈ!");
      };
      reader.readAsDataURL(file);
    }
  };

  // ૨. નોકરી / રોજગાર (નીચે નોકરી)
  const [jobFullName, setJobFullName] = useState(currentUser?.employment?.full_name || currentUser?.name || "");
  const [jobSector, setJobSector] = useState(currentUser?.employment?.job_type || "ખાનગી ક્ષેત્ર (Private Sector)");
  const [jobCompany, setJobCompany] = useState(currentUser?.employment?.company || "");
  const [jobTitle, setJobTitle] = useState(currentUser?.employment?.job_title || "");
  const [jobCity, setJobCity] = useState(currentUser?.employment?.city || currentUser?.city || "");
  const [jobPhone, setJobPhone] = useState(currentUser?.employment?.phone || currentUser?.phone || "");
  const [jobIndustry, setJobIndustry] = useState(currentUser?.employment?.industry || "");
  const [jobExperience, setJobExperience] = useState(currentUser?.employment?.experience_years || "");

  // Education (Simplified to TWO fields: 1. શિક્ષણ વિભાગ (Category), 2. શું અભ્યાસ કર્યો છે? (Details))
  const [eduCategory, setEduCategory] = useState<string>(
    currentUser?.education?.education_category || SAMITI_EDUCATION_CATEGORIES[0]
  );
  const [eduDetails, setEduDetails] = useState<string>(
    currentUser?.education?.education_details || currentUser?.education?.highest_degree || ""
  );
  const [familyEducationList, setFamilyEducationList] = useState<MemberEducationRecord[]>(
    () => currentUser?.education?.family_education || []
  );
  const [selectedEduMemberId, setSelectedEduMemberId] = useState<string>("self");

  const handleSelectEduMember = (memberId: string) => {
    setSelectedEduMemberId(memberId);
    if (memberId === "self") {
      setEduCategory(currentUser?.education?.education_category || SAMITI_EDUCATION_CATEGORIES[0]);
      setEduDetails(currentUser?.education?.education_details || currentUser?.education?.highest_degree || "");
    } else {
      const existing = familyEducationList.find((e) => e.member_id === memberId);
      if (existing) {
        setEduCategory(existing.field_of_study || existing.institution || SAMITI_EDUCATION_CATEGORIES[0]);
        setEduDetails(existing.degree || "");
      } else {
        setEduCategory(SAMITI_EDUCATION_CATEGORIES[0]);
        setEduDetails("");
      }
    }
  };

  const handleSaveEducationRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDetails.trim()) {
      alert("કૃપા કરીને શું અભ્યાસ કર્યો છે તે દાખલ કરો (દા.ત. B.Com, MBA).");
      return;
    }

    if (selectedEduMemberId === "self") {
      const eduUpdate = {
        education: {
          highest_degree: eduDetails.trim(),
          education_category: eduCategory,
          education_details: eduDetails.trim(),
          institution: effectiveMember?.education?.institution || "",
          field_of_study: eduCategory,
          passing_year: effectiveMember?.education?.passing_year || "",
          family_education: familyEducationList,
        },
      };
      if (effectiveMember) {
        updateMember(effectiveMember.id, eduUpdate);
      }
      if (currentUser && effectiveMember?.id === currentUser.id) {
        updateCurrentUserProfile(eduUpdate);
      }
      showToast("શૈક્ષણિક વિગતો સાચવાઈ!");
    } else {
      const memberObj = familyRelations.find((r) => r.id === selectedEduMemberId);
      const memberName = memberObj ? `${memberObj.name} (${memberObj.relation})` : "પરિવાર સભ્ય";

      const updatedList = familyEducationList.filter((e) => e.member_id !== selectedEduMemberId);
      const newRecord: MemberEducationRecord = {
        id: `edu-${selectedEduMemberId}`,
        member_id: selectedEduMemberId,
        member_name: memberName,
        degree: eduDetails.trim(),
        institution: eduCategory,
        field_of_study: eduCategory,
        passing_year: "",
      };
      const finalEduList = [...updatedList, newRecord];
      setFamilyEducationList(finalEduList);

      const eduUpdate = {
        education: {
          highest_degree: effectiveMember?.education?.highest_degree || eduDetails.trim(),
          education_category: effectiveMember?.education?.education_category || eduCategory,
          education_details: effectiveMember?.education?.education_details || eduDetails.trim(),
          institution: effectiveMember?.education?.institution || "",
          field_of_study: effectiveMember?.education?.field_of_study || eduCategory,
          passing_year: effectiveMember?.education?.passing_year || "",
          family_education: finalEduList,
        },
      };
      if (effectiveMember) {
        updateMember(effectiveMember.id, eduUpdate);
      }
      if (currentUser && effectiveMember?.id === currentUser.id) {
        updateCurrentUserProfile(eduUpdate);
      }
      showToast(`${memberName} ની શૈક્ષણિક વિગતો સાચવાઈ!`);
    }
  };

  const handleRemoveEducationRecord = (id: string) => {
    const updated = familyEducationList.filter((e) => e.id !== id);
    setFamilyEducationList(updated);
    updateCurrentUserProfile({
      education: {
        highest_degree: currentUser?.education?.highest_degree || eduDetails,
        education_category: currentUser?.education?.education_category || eduCategory,
        education_details: currentUser?.education?.education_details || eduDetails,
        institution: currentUser?.education?.institution || "",
        field_of_study: currentUser?.education?.field_of_study || eduCategory,
        passing_year: currentUser?.education?.passing_year || "",
        family_education: updated,
      },
    });
    showToast("શૈક્ષણિક વિગત યાદીમાંથી દૂર કરવામાં આવી.");
  };

  // Privacy Settings state
  const [privacyPhone, setPrivacyPhone] = useState<PrivacyVisibility>(currentUser?.privacy.phone || "members");
  const [privacyAddress, setPrivacyAddress] = useState<PrivacyVisibility>(currentUser?.privacy.address || "members");
  const [privacyPhoto, setPrivacyPhoto] = useState<PrivacyVisibility>(currentUser?.privacy.photo || "public");
  const [privacyFamily, setPrivacyFamily] = useState<PrivacyVisibility>(currentUser?.privacy.family || "members");
  const [privacyBusiness, setPrivacyBusiness] = useState<PrivacyVisibility>(currentUser?.privacy.business || "public");
  const [privacyEmployment, setPrivacyEmployment] = useState<PrivacyVisibility>(currentUser?.privacy.employment || "members");
  const [privacyEducation, setPrivacyEducation] = useState<PrivacyVisibility>(currentUser?.privacy.education || "members");


  const handleAddRelation = () => {
    if (!newRelationType) {
      alert("કૃપા કરીને સંબંધ પસંદ કરો.");
      return;
    }
    if (!newRelationName.trim()) {
      alert("કૃપા કરીને સંબંધીનું પૂરું નામ દાખલ કરો.");
      return;
    }

    const newRel: FamilyRelationDetail = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      relation: newRelationType,
      name: newRelationName.trim(),
      phone: newRelationPhone.trim() || undefined,
    };

    setFamilyRelations((prev) => [...prev, newRel]);
    setNewRelationType("");
    setNewRelationName("");
    setNewRelationPhone("");
  };

  const handleRemoveRelation = (id: string) => {
    setFamilyRelations((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      setUsernameError("કૃપા કરીને લઘુત્તમ ૩ અક્ષરનું યુઝરનેમ (Username) દાખલ કરો.");
      showToast("કૃપા કરીને માન્ય યુઝરનેમ દાખલ કરો.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setUsernameError("યુઝરનેમમાં માત્ર અંગ્રેજી અક્ષરો, અંકો અથવા (_) જ માન્ય છે (૩ થી ૩૦ અક્ષર).");
      showToast("યુઝરનેમ ફોર્મેટ અમાન્ય છે.");
      return;
    }
    setUsernameError(null);

    const father = familyRelations.find((r) => r.relation.includes("પિતા"))?.name || "";
    const grandfather = familyRelations.find((r) => r.relation.includes("દાદા"))?.name || "";
    const maternalUncle = familyRelations.find((r) => r.relation.includes("મામા"))?.name || "";
    const maternalGrandfather = familyRelations.find((r) => r.relation.includes("નાના"))?.name || "";

    const updates: Partial<Member> = {
      username: cleanUsername,
      name,
      email: email.trim(),
      phone,
      address,
      city,
      native_place: nativePlace,
      sasri_name: sasriName,
      piyar_name: piyarName,
      father_name: father,
      grandfather_name: grandfather,
      maternal_uncle_name: maternalUncle,
      maternal_grandfather_name: maternalGrandfather,
      family_relations: familyRelations,
      marital_status: maritalStatus,
      blood_group: bloodGroup,
      photo_url: photoUrl,
      completeness: 95,
      is_available_for_matrimony: isUnmarried ? isAvailableForMatrimony : false,
      matrimony: {
        is_available: isUnmarried ? isAvailableForMatrimony : false,
        is_public_listing: isUnmarried && isAvailableForMatrimony ? isPublicListing : false,
        is_saved: true,
        height: matrimonyHeight,
        complexion: matrimonyComplexion,
        about_me: matrimonyAbout,
        partner_expectations: matrimonyExpectations,
        privacy: matrimonyPrivacy,
        updated_at: new Date().toISOString(),
      },
    };

    if (effectiveMember) {
      updateMember(effectiveMember.id, updates);
    }
    if (currentUser && effectiveMember?.id === currentUser.id) {
      updateCurrentUserProfile(updates);
    }

    if (addLog && currentUser) {
      addLog(
        "સભ્ય પ્રોફાઇલ સુધારી",
        effectiveMember?.name || name,
        effectiveMember?.id === currentUser.id ? "પોતાની પ્રોફાઇલ સાચવી" : `એડમિન દ્વારા સભ્યની વિગતો સુધારી (${currentUser.name})`,
        currentUser.name,
        currentUser.role || "admin"
      );
    }
    showToast(effectiveMember?.id === currentUser?.id ? "સામાન્ય માહિતી સફળતાપૂર્વક સાચવાઈ!" : `${effectiveMember?.name} ની માહિતી સફળતાપૂર્વક સાચવાઈ!`);
  };

  const handleSaveMatrimonyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveMember) return;

    const finalMatrimonyAvailable = isUnmarried ? isAvailableForMatrimony : false;
    const finalPublicListing = isUnmarried && isAvailableForMatrimony ? isPublicListing : false;

    const updates: Partial<Member> = {
      is_available_for_matrimony: finalMatrimonyAvailable,
      matrimony: {
        is_available: finalMatrimonyAvailable,
        is_public_listing: finalPublicListing,
        is_saved: true,
        height: matrimonyHeight,
        complexion: matrimonyComplexion,
        about_me: matrimonyAbout,
        partner_expectations: matrimonyExpectations,
        privacy: matrimonyPrivacy,
        updated_at: new Date().toISOString(),
      },
    };

    if (effectiveMember) {
      updateMember(effectiveMember.id, updates);
    }
    if (currentUser && effectiveMember?.id === currentUser.id) {
      updateCurrentUserProfile(updates);
    }

    if (addLog && currentUser) {
      addLog(
        "મેટ્રિમોની પ્રોફાઇલ અપડેટ",
        `${effectiveMember.name} — ${finalMatrimonyAvailable ? (finalPublicListing ? "પબ્લિક લિસ્ટિંગ સક્રિય" : "ખાનગી/આંતરિક સક્રિય") : "નિષ્ક્રિય"}`,
        `લગ્ન સ્થિતિ: ${maritalStatus}, ઊંચાઈ: ${matrimonyHeight}`,
        currentUser.name,
        currentUser.role || "member"
      );
    }

    if (finalMatrimonyAvailable && finalPublicListing) {
      showToast("મેટ્રિમોની પ્રોફાઇલ સાચવાઈ અને પબ્લિક લિસ્ટિંગમાં સક્રિય થઈ!");
    } else {
      showToast("મેટ્રિમોની પ્રોફાઇલ અને સેટિંગ્સ સફળતાપૂર્વક સાચવાઈ ગયા!");
    }
  };

  const handleSaveAdvertisement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adBusinessName.trim()) {
      alert("કૃપા કરીને બિઝનેસ / પેઢીનું નામ દાખલ કરો.");
      return;
    }
    if (!adPhone.trim()) {
      alert("કૃપા કરીને સંપર્ક નંબર દાખલ કરો.");
      return;
    }

    addAdvertisement({
      business_name: adBusinessName.trim(),
      category: adCategory.trim() || "સામાન્ય વેપાર",
      description: adDescription.trim() || `${adBusinessName} - વ્યવસાય જાહેરાત`,
      owner_name: adOwnerName.trim() || currentUser?.name || "ઓનર",
      contact_number: adPhone.trim() || currentUser?.phone || "",
      address: adAddress.trim() || currentUser?.address || "",
      image_url:
        adImageUrl.trim() ||
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
      website_link: adWebsite.trim() || undefined,
      status: "pending",
      submitted_by: currentUser?.id,
    });

    if (addLog && currentUser) {
      addLog(
        "વ્યવસાય જાહેરાત અરજી",
        `${adBusinessName} (${adCategory || "વેપાર"})`,
        `અરજદાર: ${currentUser.name}, સંપર્ક: ${adPhone}`,
        currentUser.name,
        currentUser.role || "member"
      );
    }

    showToast("આપની વ્યવસાય જાહેરાત મંજૂરી માટે સબમિટ થઈ ગઈ છે! એડમિન દ્વારા મંજૂર થયા પછી તે વેબસાઇટ પર પ્રદર્શિત થશે.");
    setIsAdModalOpen(false);
  };

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    const privacyUpdates = {
      phone: privacyPhone,
      address: privacyAddress,
      photo: privacyPhoto,
      family: privacyFamily,
      business: privacyBusiness,
      employment: privacyEmployment,
      education: privacyEducation,
    };
    if (effectiveMember) {
      updateMember(effectiveMember.id, {
        privacy: { ...(effectiveMember.privacy || {}), ...privacyUpdates },
      });
    }
    if (currentUser && effectiveMember?.id === currentUser.id) {
      updatePrivacySettings(privacyUpdates);
    }
    showToast("ગોપનીયતા સેટિંગ્સ સફળતાપૂર્વક અપડેટ થયા!");
  };

  const handleSaveEmployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveMember) return;

    // Save on member profile
    const empUpdates: Partial<Member> = {
      business: {
        owner_name: businessOwnerName,
        business_name: businessName,
        category: businessCategory,
        role: businessRole,
        city: businessCity,
        phone: businessPhone,
        address: businessAddress,
        banner_url: businessBannerUrl,
      },
      employment: {
        full_name: jobFullName,
        job_type: jobSector,
        company: jobCompany,
        job_title: jobTitle,
        city: jobCity,
        phone: jobPhone,
        industry: jobIndustry,
        experience_years: jobExperience,
      },
    };

    if (effectiveMember) {
      updateMember(effectiveMember.id, empUpdates);
    }
    if (currentUser && effectiveMember?.id === currentUser.id) {
      updateCurrentUserProfile(empUpdates);
    }

    // Auto-sync business with Community Business directory if business name provided
    const targetUser = effectiveMember || currentUser;
    if (businessName.trim() && targetUser) {
      const existing = businesses.find((b) => b.owner_id === targetUser.id);
      if (existing) {
        updateBusiness(existing.id, {
          name: businessName,
          category: businessCategory || "સામાન્ય વેપાર",
          city: businessCity || targetUser.city || "મોડાસા",
          address: businessAddress || targetUser.address || "",
          phone: businessPhone || targetUser.phone || "",
          cover_url: businessBannerUrl || existing.cover_url,
        });
      } else {
        addBusiness({
          owner_id: targetUser.id,
          owner_name: businessOwnerName || targetUser.name,
          name: businessName,
          category: businessCategory || "સામાન્ય વેપાર",
          description: `${businessRole ? businessRole + " તરીકે સંચાલિત." : ""} ${businessName}`,
          city: businessCity || targetUser.city || "મોડાસા",
          address: businessAddress || targetUser.address || "",
          phone: businessPhone || targetUser.phone || "",
          cover_url: businessBannerUrl || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800",
          is_featured: false,
          is_paid: false,
          status: "active",
        });
      }
    }

    showToast("બિઝનેસ અને નોકરીની વિગતો સફળતાપૂર્વક સાચવાઈ ગઈ!");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Automatically update form fields when user logs in, switches role, or admin selects another member
  React.useEffect(() => {
    if (effectiveMember) {
      setUsername(effectiveMember.username || "");
      setUsernameError(null);
      setName(effectiveMember.name || "");
      setEmail(effectiveMember.email || "");
      setPhone(effectiveMember.phone || "");
      setAddress(effectiveMember.address || "");
      setCity(effectiveMember.city || "મોડાસા");
      setNativePlace(effectiveMember.native_place || SAMITI_NATIVE_PLACES[0]);
      setSasriName(effectiveMember.sasri_name || "");
      setPiyarName(effectiveMember.piyar_name || "");
      setFamilyRelations(getInitialFamilyRelations(effectiveMember));
      setMaritalStatus(effectiveMember.marital_status || "પરણિત (Married)");
      setBloodGroup(effectiveMember.blood_group || "B+");
      setPhotoUrl(effectiveMember.photo_url || "");

      // Business fields (ઉપર બિઝનેસ)
      setBusinessOwnerName(effectiveMember.business?.owner_name || effectiveMember.name || "");
      setBusinessName(effectiveMember.business?.business_name || "");
      setBusinessCategory(effectiveMember.business?.category || "");
      setBusinessRole(effectiveMember.business?.role || "Owner");
      setBusinessCity(effectiveMember.business?.city || effectiveMember.city || "");
      setBusinessPhone(effectiveMember.business?.phone || effectiveMember.phone || "");
      setBusinessAddress(effectiveMember.business?.address || "");
      setBusinessBannerUrl(effectiveMember.business?.banner_url || "");

      // Job / Employment fields (નીચે નોકરી)
      setJobFullName(effectiveMember.employment?.full_name || effectiveMember.name || "");
      setJobSector(effectiveMember.employment?.job_type || "ખાનગી ક્ષેત્ર (Private Sector)");
      setJobCompany(effectiveMember.employment?.company || "");
      setJobTitle(effectiveMember.employment?.job_title || "");
      setJobCity(effectiveMember.employment?.city || effectiveMember.city || "");
      setJobPhone(effectiveMember.employment?.phone || effectiveMember.phone || "");
      setJobIndustry(effectiveMember.employment?.industry || "");
      setJobExperience(effectiveMember.employment?.experience_years || "");
      setEduCategory(effectiveMember.education?.education_category || SAMITI_EDUCATION_CATEGORIES[0]);
      setEduDetails(effectiveMember.education?.education_details || effectiveMember.education?.highest_degree || "");
      setFamilyEducationList(effectiveMember.education?.family_education || []);

      // Matrimony fields
      setIsAvailableForMatrimony(effectiveMember.is_available_for_matrimony || effectiveMember.matrimony?.is_available || false);
      setIsPublicListing(effectiveMember.matrimony?.is_public_listing ?? true);
      setMatrimonyHeight(effectiveMember.matrimony?.height || "5' 8\"");
      setMatrimonyComplexion(effectiveMember.matrimony?.complexion || "ઘઉંવર્ણ (Wheatish)");
      setMatrimonyAbout(effectiveMember.matrimony?.about_me || "");
      setMatrimonyExpectations(effectiveMember.matrimony?.partner_expectations || "");
      if (effectiveMember.matrimony?.privacy) {
        setMatrimonyPrivacy(effectiveMember.matrimony.privacy);
      }
    }
  }, [effectiveMember]);

  // User connected family count (safe against null currentUser)
  const userFamilyCount = currentUser
    ? relationships.filter(
        (r) => r.from_member_id === currentUser.id || r.to_member_id === currentUser.id
      ).length
    : 0;

  const visibilityOptions: { value: PrivacyVisibility; label: string }[] = [
    { value: "public", label: "જાહેર (કોઈપણ જોઈ શકે)" },
    { value: "members", label: "માત્ર લોગિન કરેલા સભ્યો" },
    { value: "family", label: "માત્ર મંજૂર પરિવારના સભ્યો" },
    { value: "private", label: "ખાનગી (માત્ર હું અને એડમિન)" },
  ];

  // Lock Guard: Only logged-in users can view and update profile
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-ivory-100 via-ivory-50 to-white">
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-ivory-300 shadow-xl overflow-hidden p-6 sm:p-10 relative">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-saffron-100/60 via-amber-50/40 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-forest-100/50 via-forest-50/20 to-transparent rounded-tr-full pointer-events-none" />

          {/* Header & Logo */}
          <div className="text-center relative z-10">
            <div className="relative inline-block mb-4">
              <img
                src="/logo.png"
                alt="અડાઆઠમ દરજી સેવા સમિતિ"
                width={80}
                height={80}
                style={{ width: "80px", height: "80px", minWidth: "80px" }}
                className="w-20 h-20 object-contain rounded-full shadow-md mx-auto border-2 border-saffron-300 bg-white p-1"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-500 to-amber-600 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span>સભ્ય સુરક્ષા ઝોન • લૉગિન આવશ્યક</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
              પ્રોફાઇલ જોવા અને અપડેટ કરવા માટે લૉગિન કરો
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-lg mx-auto leading-relaxed">
              અડાઆઠમ દરજી સમાજના સભ્ય તરીકે આપની અંગત વિગતો, સરનામું, વ્યવસાય, શિક્ષણ અને ગોપનીયતા સેટિંગ્સ અપડેટ કરવા માટે કૃપા કરીને તમારા ખાતામાં લૉગિન કરો.
            </p>
          </div>

          {/* 3 Value Highlight Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-7 relative z-10">
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <User className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">અંગત પ્રોફાઇલ</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                સરનામું, વતન, ફોટો અને સંપર્ક વિગતો મેનેજ કરો.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">ગોપનીયતા કંટ્રોલ</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                તમારો ફોન અને સરનામું કોણ જોઈ શકે તે નક્કી કરો.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">શિક્ષણની વિગતો</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                પોતાનો અને પરિવારના સભ્યોનો ઉચ્ચ અભ્યાસ ઉમેરો.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-4 h-4" />
              <span>સભ્ય લૉગિન કરો</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-ivory-100 text-charcoal-800 font-bold text-xs sm:text-sm border border-ivory-300 shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-forest-700" />
              <span>નવા સભ્યની નોંધણી</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast message */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Member Switcher Bar (Equal Rights to Access & Change Anything for Any Member) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-forest-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-charcoal-700 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-saffron-600 text-white shadow-sm flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-saffron-300">
                  વહીવટી સભ્ય પ્રોફાઇલ સંપાદન (Admin Full Edit Access)
                </span>
                <span className="text-[10px] bg-forest-800 text-emerald-300 px-2 py-0.5 rounded-full border border-forest-600 font-bold">
                  બધા અધિકાર સમાન (Equal Rights)
                </span>
              </div>
              <p className="text-xs text-charcoal-300 mt-0.5">
                {effectiveMember?.id === currentUser?.id ? (
                  <span>તમે હાલ <strong>તમારી પોતાની પ્રોફાઇલ</strong> સંપાદિત કરી રહ્યા છો. કોઈપણ સભ્યની વિગતો બદલવા માટે ડ્રોપડાઉનમાંથી પસંદ કરો.</span>
                ) : (
                  <span>તમે હાલ સભ્ય <strong className="text-white">{effectiveMember?.name}</strong> ({effectiveMember?.id}) ની વિગતો જોઈ અને સંપાદિત કરી રહ્યા છો.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-charcoal-800/90 px-3 py-1.5 rounded-xl border border-charcoal-700">
              <label className="text-[11px] text-charcoal-300 font-bold whitespace-nowrap">સભ્ય પસંદ કરો:</label>
              <select
                value={selectedMemberId || currentUser?.id || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMemberId(val);
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    if (val === currentUser?.id) {
                      url.searchParams.delete("memberId");
                    } else {
                      url.searchParams.set("memberId", val);
                    }
                    window.history.replaceState({}, "", url.toString());
                  }
                }}
                className="bg-charcoal-900 text-white text-xs px-2.5 py-1 rounded-lg border border-charcoal-600 font-bold focus:outline-none max-w-[200px] truncate"
              >
                <option value={currentUser?.id}>મારી પોતાની પ્રોફાઇલ ({currentUser?.name})</option>
                <optgroup label="સમાજના તમામ સભ્યો">
                  {members
                    .filter((m) => m.id !== currentUser?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.native_place} - {m.phone})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {effectiveMember?.id !== currentUser?.id && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMemberId(currentUser?.id || "");
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("memberId");
                    window.history.replaceState({}, "", url.toString());
                  }
                }}
                className="px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                મારી પ્રોફાઇલ પર પાછા જાઓ
              </button>
            )}
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <UserAvatar
              src={photoUrl || effectiveMember?.photo_url || currentUser.photo_url}
              alt={effectiveMember?.name || currentUser.name}
              className="w-28 h-28 rounded-3xl border-4 border-saffron-500 shadow-md"
            />
            <button
              type="button"
              onClick={() => setShowProfilePhotoCropModal(true)}
              className="absolute -bottom-2 -right-2 p-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl shadow-md transition-colors"
              title="પ્રોફાઇલ ફોટો બદલો અને ક્રોપ કરો"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Photo Crop Modal */}
          {showProfilePhotoCropModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl border border-ivory-300 p-6 max-w-lg w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
                  <h3 className="font-extrabold text-base text-charcoal-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-saffron-600" />
                    <span>પ્રોફાઇલ ફોટો અપલોડ &amp; ક્રોપ એડિટર</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowProfilePhotoCropModal(false)}
                    className="p-1 rounded-lg hover:bg-ivory-100 text-charcoal-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <ImageUploadWithCrop
                  currentImageUrl={photoUrl || effectiveMember?.photo_url || currentUser.photo_url || undefined}
                  onImageCropped={(url) => {
                    setPhotoUrl(url);
                    const targetId = effectiveMember?.id || currentUser?.id;
                    if (targetId) {
                      updateMember(targetId, { photo_url: url });
                    }
                    if (currentUser && (!effectiveMember || effectiveMember.id === currentUser.id)) {
                      updateCurrentUserProfile({ photo_url: url });
                    }
                    showToast("પ્રોફાઇલ ફોટો સફળતાપૂર્વક અપડેટ થયો!");
                    setShowProfilePhotoCropModal(false);
                  }}
                  aspectRatio={1}
                  aspectRatioLabel="૧:૧ (અવતાર ચોરસ)"
                  circleOverlay={true}
                  category="member-photos"
                  label="નવો પ્રોફાઇલ ફોટો પસંદ કરો"
                />
              </div>
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-charcoal-900">{effectiveMember?.name || currentUser.name}</h1>
              {(effectiveMember?.username || currentUser?.username) && (
                <span className="text-xs bg-ivory-200 text-charcoal-700 font-mono font-semibold px-2 py-0.5 rounded-full border border-ivory-300">
                  @{effectiveMember?.username || currentUser.username}
                </span>
              )}
              <span className="text-xs bg-saffron-100 text-saffron-800 font-bold px-2.5 py-0.5 rounded-full border border-saffron-200">
                {effectiveMember?.committee_role || currentUser.committee_role || "સમાજ સભ્ય"}
              </span>
              {(effectiveMember?.is_lifetime_member ?? currentUser.is_lifetime_member) && (
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  ★ આજીવન સભ્ય
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal-500">
              મૂળ વતન: <strong>{effectiveMember?.native_place || currentUser.native_place}</strong> • હાલ: <strong>{effectiveMember?.city || currentUser.city}</strong> • મોબાઈલ: <strong>{effectiveMember?.phone || currentUser.phone}</strong>
            </p>

            {/* Profile Completeness Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-charcoal-600">પ્રોફાઇલ પૂર્ણતા:</span>
                <span className="text-saffron-700 font-bold">{effectiveMember?.completeness || currentUser.completeness || 85}%</span>
              </div>
              <div className="w-full h-2.5 bg-ivory-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-saffron-600 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${effectiveMember?.completeness || currentUser.completeness || 85}%` }}
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
              <Link
                href="/family-tree"
                className="px-3.5 py-1.5 rounded-xl bg-ivory-100 hover:bg-saffron-50 border border-ivory-300 text-saffron-800 font-bold flex items-center gap-1.5 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>જોડાયેલા સંબંધો ({userFamilyCount})</span>
              </Link>
              <span className="text-charcoal-400">•</span>
              <span className="text-forest-800 font-semibold">
                ચકાસાયેલ ખાતું ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ivory-300 mb-8 space-x-1 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "general"
              ? "border-saffron-600 text-saffron-700"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <User className="w-4 h-4 inline-block mr-1.5" />
          સામાન્ય માહિતી
        </button>

        <button
          onClick={() => setActiveTab("employment")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "employment"
              ? "border-saffron-600 text-saffron-700"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Briefcase className="w-4 h-4 inline-block mr-1.5" />
          વ્યવસાય & નોકરી
        </button>

        <button
          onClick={() => setActiveTab("education")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "education"
              ? "border-saffron-600 text-saffron-700"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <GraduationCap className="w-4 h-4 inline-block mr-1.5" />
          શિક્ષણની વિગત (Education)
        </button>

        <button
          onClick={() => setActiveTab("donations")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "donations"
              ? "border-saffron-600 text-saffron-700"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>મારા દાન (My Donations)</span>
          {myDonations.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "donations"
                  ? "bg-saffron-100 text-saffron-800"
                  : "bg-ivory-200 text-charcoal-700"
              }`}
            >
              {myDonations.length}
            </span>
          )}
        </button>

        {/* Only show Matrimony Tab if user is Unmarried (અપરણિત). Completely removed for Married (પરણિત) members */}
        {isUnmarried && (
          <button
            onClick={() => setActiveTab("matrimony")}
            className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "matrimony"
                ? "border-rose-600 text-rose-700 bg-rose-50/50"
                : "border-transparent text-charcoal-600 hover:text-charcoal-900"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-100" />
            <span>લગ્ન વિષયક (Matrimony)</span>
            {isAvailableForMatrimony && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("privacy")}
          className={`py-3 px-4 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "privacy"
              ? "border-saffron-600 text-saffron-700"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Lock className="w-4 h-4 inline-block mr-1.5" />
          ગોપનીયતા સેટિંગ્સ (Privacy)
        </button>
      </div>

      {/* TAB 1: GENERAL INFO FORM */}
      {activeTab === "general" && (
        <div className="space-y-8">
          <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">પૂરું નામ *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-charcoal-700">
                  યુઝરનેમ (Username) *
                </label>
                <span className="text-[10px] text-saffron-700 font-semibold bg-saffron-50 px-2 py-0.5 rounded-full border border-saffron-200">
                  લૉગિન આઈડી (Login ID)
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 font-mono text-xs select-none">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                    setUsername(val);
                    if (usernameError) setUsernameError(null);
                  }}
                  placeholder="દા.ત. utsavdarji"
                  required
                  minLength={3}
                  maxLength={30}
                  className={`w-full pl-7 pr-3.5 py-2.5 text-xs border rounded-xl focus:outline-none font-mono font-medium ${
                    usernameError
                      ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                      : "border-ivory-300 focus:border-saffron-500"
                  }`}
                />
              </div>
              {usernameError ? (
                <p className="text-[10px] text-rose-600 mt-1 font-medium">{usernameError}</p>
              ) : (
                <p className="text-[10px] text-charcoal-400 mt-1">
                  અંગ્રેજી અક્ષરો, અંકો અથવા (_) • લૉગિન માટે આ યુઝરનેમ ઉપયોગી થશે
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">મોબાઈલ નંબર (Mobile Number) *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-charcoal-700">ઈમેઈલ સરનામું (Email Address)</label>
                {currentUser?.email && (
                  <span className="text-[10px] font-bold text-forest-700 bg-forest-50 px-2 py-0.2 rounded-full border border-forest-200">
                    ચકાસાયેલ ✓ (Verified)
                  </span>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="દા.ત. member@example.com"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">મૂળ વતન (ગામ) *</label>
              <select
                value={nativePlace}
                onChange={(e) => setNativePlace(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-900"
              >
                {SAMITI_NATIVE_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">હાલનું શહેર *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">સાસરીનું નામ (Sasri Name)</label>
              <input
                type="text"
                value={sasriName}
                onChange={(e) => setSasriName(e.target.value)}
                placeholder="દા.ત. અમદાવાદ, મોડાસા, હિંમતનગર"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">પિયરનું નામ (Piyar Name)</label>
              <input
                type="text"
                value={piyarName}
                onChange={(e) => setPiyarName(e.target.value)}
                placeholder="દા.ત. અડાઆઠમ, ધનસુરા"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">લગ્ન સ્થિતિ (Married Status) *</label>
              <select
                value={maritalStatus}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setMaritalStatus(newStatus);
                  if (!newStatus.startsWith("અપરણિત")) {
                    setIsAvailableForMatrimony(false);
                    setIsPublicListing(false);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-800"
              >
                <option value="પરણિત (Married)">પરણિત (Married)</option>
                <option value="અપરણિત (Unmarried)">અપરણિત (Unmarried)</option>
                <option value="સગાઈ થયેલ (Engaged)">સગાઈ થયેલ (Engaged)</option>
                <option value="અન્ય (Other)">અન્ય (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">બ્લડ ગ્રૂપ</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal-700 mb-1">રહેઠાણનું સરનામું</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            {/* મેટ્રિમોની ઓપ્ટ-ઇન કાર્ડ (Matrimony Opt-in & Public Listing Consent) - ONLY SHOWN IF UNMARRIED */}
            {isUnmarried && (
              <div className="sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-amber-50/50 border border-rose-200/80 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="matrimonyOptInGeneral"
                    checked={isAvailableForMatrimony}
                    onChange={(e) => setIsAvailableForMatrimony(e.target.checked)}
                    className="mt-1 w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="matrimonyOptInGeneral" className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-1.5 cursor-pointer">
                      <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                      <span>૧. મેટ્રિમોની માટે ઉપલબ્ધ (Available for Matrimony)</span>
                    </label>
                    <p className="text-[11px] text-charcoal-600 mt-0.5 leading-relaxed">
                      અપરણિત સભ્ય તરીકે યોગ્ય જીવનસાથીની શોધ માટે સમાજના મેટ્રિમોની વિભાગમાં જોડાઓ.
                    </p>
                  </div>
                </div>

                {isAvailableForMatrimony && (
                  <div className="mt-3 pt-3 border-t border-rose-200/60 space-y-3">
                    {/* Selection 2: Public Listing Consent */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-charcoal-900 block">
                          ૨. મારી પ્રોફાઇલ Public Listing માં બતાવવી છે?
                        </span>
                        <span className="text-[11px] text-charcoal-500 block">
                          Header માં રહેલા મેટ્રિમોની પબ્લિક પેજ પર સામાન્ય મુલાકાતીઓ (Visitors) માટે પ્રોફાઇલ દર્શાવવા સંમતિ આપો.
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 cursor-pointer">
                          <input
                            type="radio"
                            name="generalPublicListing"
                            checked={isPublicListing === true}
                            onChange={() => setIsPublicListing(true)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span>હા (Yes)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 cursor-pointer">
                          <input
                            type="radio"
                            name="generalPublicListing"
                            checked={isPublicListing === false}
                            onChange={() => setIsPublicListing(false)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span>ના (No)</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                          ઊંચાઈ (Height)
                        </label>
                        <input
                          type="text"
                          value={matrimonyHeight}
                          onChange={(e) => setMatrimonyHeight(e.target.value)}
                          placeholder="દા.ત. 5 ફૂટ 8 ઇંચ (172 cm)"
                          className="w-full px-3 py-2 text-xs border border-rose-200 bg-white rounded-xl focus:border-rose-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                          વાન / રંગરૂપ (Complexion)
                        </label>
                        <input
                          type="text"
                          value={matrimonyComplexion}
                          onChange={(e) => setMatrimonyComplexion(e.target.value)}
                          placeholder="દા.ત. ગોરો, ઘઉંવર્ણ"
                          className="w-full px-3 py-2 text-xs border border-rose-200 bg-white rounded-xl focus:border-rose-400 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                          અપેક્ષિત જીવનસાથી (Partner Expectations)
                        </label>
                        <input
                          type="text"
                          value={matrimonyExpectations}
                          onChange={(e) => setMatrimonyExpectations(e.target.value)}
                          placeholder="દા.ત. શિક્ષિત (ગ્રેજ્યુએટ/એન્જિનિયર/બેંકિંગ), સંસ્કારી પાત્ર"
                          className="w-full px-3 py-2 text-xs border border-rose-200 bg-white rounded-xl focus:border-rose-400 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center justify-between pt-1">
                        <span className="text-[11px] text-rose-800 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                          <span>વધુ ગોપનીયતા & બાયો સેટિંગ્સ &apos;લગ્ન વિષયક (Matrimony)&apos; ટેબમાં ઉપલબ્ધ છે.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("matrimony")}
                          className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
                        >
                          મેટ્રિમોની ટેબ ખોલો →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* પારિવારિક સંબંધો (Family Relations) - AT THE END */}
            <div className="sm:col-span-2 bg-gradient-to-b from-ivory-50/80 to-white rounded-2xl border border-ivory-300 p-4 sm:p-5 space-y-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
                    <Users className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-charcoal-900">
                      પારિવારિક સંબંધો (Family Relations)
                    </h3>
                    <p className="text-[11px] text-charcoal-500">
                      પરિવારના સભ્યો, સંબંધો અને મોબાઇલ નંબર ઉમેરો
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto text-[11px] font-bold text-saffron-800 bg-saffron-50 border border-saffron-200 px-3 py-1 rounded-full shadow-xs">
                  કુલ સંબંધો: {familyRelations.length}
                </span>
              </div>

              {/* List of Added Relations */}
              {familyRelations.length > 0 ? (
                <div className="space-y-2.5">
                  {familyRelations.map((rel, index) => (
                    <div
                      key={rel.id}
                      className="p-3.5 sm:px-4 sm:py-3 bg-white rounded-xl border border-ivory-300 shadow-xs hover:border-saffron-300 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-saffron-50 text-saffron-800 border border-saffron-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-saffron-50 text-saffron-800 border border-saffron-200 flex-shrink-0">
                              {rel.relation}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                              {rel.name}
                            </h4>
                            {rel.is_registered && (
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 flex-shrink-0">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                <span>સમાજ સભ્ય</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                            {rel.phone ? (
                              <span className="flex items-center gap-1.5 text-charcoal-700 font-semibold text-[11px] sm:text-xs">
                                <Phone className="w-3 h-3 text-forest-700 flex-shrink-0" />
                                <span>{rel.phone}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-charcoal-400 italic">
                                મોબાઇલ નંબર નોંધાયેલ નથી
                              </span>
                            )}

                            {(rel.city || rel.native_place) && (
                              <span className="flex items-center gap-1 text-[11px] text-charcoal-500">
                                <MapPin className="w-3 h-3 text-saffron-600 flex-shrink-0" />
                                <span>{[rel.city, rel.native_place].filter(Boolean).join(" • ")}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveRelation(rel.id)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="સંબંધ કાઢી નાખો"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-charcoal-400 border border-dashed border-ivory-300 rounded-xl bg-white">
                  હજુ સુધી કોઈ પારિવારિક સંબંધ ઉમેરેલ નથી. નીચેના ફોર્મમાંથી સંબંધ પસંદ કરી ઉમેરો.
                </div>
              )}

              {/* Add New Relation Sub-form */}
              <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-xs space-y-3">
                <span className="font-bold text-xs text-charcoal-800 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-saffron-600" />
                  <span>નવો પારિવારિક સંબંધ ઉમેરો:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      ૧. સંબંધ પસંદ કરો *
                    </label>
                    <select
                      value={newRelationType}
                      onChange={(e) => setNewRelationType(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none font-medium text-charcoal-800"
                    >
                      <option value="">-- સંબંધ પસંદ કરો --</option>
                      {RELATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      ૨. સંબંધીનું પૂરું નામ *
                    </label>
                    <input
                      type="text"
                      value={newRelationName}
                      onChange={(e) => setNewRelationName(e.target.value)}
                      placeholder="દા.ત. દિનેશભાઈ બાબુલાલ દરજી"
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                      ૩. મોબાઇલ નંબર
                    </label>
                    <input
                      type="tel"
                      value={newRelationPhone}
                      onChange={(e) => setNewRelationPhone(e.target.value)}
                      placeholder="દા.ત. 98250 12345"
                      className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddRelation}
                    className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>સંબંધ ઉમેરો (Add Relation)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ivory-200">
            <button
              type="button"
              onClick={handleOpenNewMemberCard}
              className="w-full sm:w-auto px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showNewMemberCard ? "નવો સભ્ય ઉમેરો કાર્ડ નીચે જુઓ ↓" : "+ નવો સભ્ય ઉમેરો (Add New Member)"}</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>વિગતો સાચવો</span>
            </button>
          </div>
        </form>

        {/* INLINE CARD TO ADD NEW MEMBER (COPIED DETAILS FROM ABOVE) */}
        {showNewMemberCard && (
          <form
            id="new-member-card"
            onSubmit={handleAddNewMemberSubmit}
            className="bg-white rounded-3xl border-2 border-forest-400 p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 text-white shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-charcoal-900">
                      નવા પરિવાર સભ્યની માહિતી (Add New Family Member)
                    </h3>
                    <span className="text-[10px] font-bold bg-forest-50 text-forest-800 px-2.5 py-0.5 rounded-full border border-forest-200">
                      નવું કાર્ડ
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    ઉપરના કાર્ડમાંથી મૂળ વતન, શહેર અને સરનામું આપોઆપ કોપી થયેલ છે.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={copyFromAbove}
                  className="px-3 py-1.5 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-xl transition-colors flex items-center gap-1.5"
                  title="ઉપરના કાર્ડમાંથી વતન, શહેર અને સરનામું ફરીથી કોપી કરો"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>ઉપરથી વિગત કોપી કરો</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewMemberCard(false)}
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors"
                  title="બંધ કરો"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Fields - Mirrors the upper general card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ૧. સંબંધ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧. પારિવારિક સંબંધ (Relation) *
                </label>
                <select
                  value={newMemberRelation}
                  onChange={(e) => {
                    const rel = e.target.value;
                    setNewMemberRelation(rel);
                    if (["પત્ની", "માતા", "પુત્રી", "બહેન", "દાદી", "કાકી", "મામી", "ફોઈ", "પૌત્રી", "ભાણી", "ભત્રીજી"].some((s) => rel.includes(s))) {
                      setNewMemberGender("female");
                    } else if (["પુત્ર", "પિતા", "ભાઈ", "દાદા", "કાકા", "મામા", "ફુવા", "પૌત્ર", "ભાણો", "ભત્રીજો", "પતિ"].some((s) => rel.includes(s))) {
                      setNewMemberGender("male");
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-semibold text-charcoal-800"
                >
                  <option value="">-- સંબંધ પસંદ કરો --</option>
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* ૨. જાતિ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૨. જાતિ (Gender) *
                </label>
                <div className="flex items-center gap-4 h-[38px]">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-800 cursor-pointer">
                    <input
                      type="radio"
                      name="newMemberGender"
                      value="male"
                      checked={newMemberGender === "male"}
                      onChange={() => setNewMemberGender("male")}
                      className="text-forest-700 focus:ring-forest-500"
                    />
                    <span>પુરુષ (Male)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-800 cursor-pointer">
                    <input
                      type="radio"
                      name="newMemberGender"
                      value="female"
                      checked={newMemberGender === "female"}
                      onChange={() => setNewMemberGender("female")}
                      className="text-forest-700 focus:ring-forest-500"
                    />
                    <span>સ્ત્રી (Female)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-800 cursor-pointer">
                    <input
                      type="radio"
                      name="newMemberGender"
                      value="other"
                      checked={newMemberGender === "other"}
                      onChange={() => setNewMemberGender("other")}
                      className="text-forest-700 focus:ring-forest-500"
                    />
                    <span>અન્ય (Other)</span>
                  </label>
                </div>
              </div>

              {/* ૩. પૂરું નામ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૩. પૂરું નામ *
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="દા.ત. મીનાબેન ભાવિનભાઈ દરજી"
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none font-semibold text-charcoal-900"
                />
              </div>

              {/* ૪. મોબાઇલ નંબર */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૪. મોબાઈલ નંબર
                </label>
                <input
                  type="tel"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  placeholder="દા.ત. 98250 99887"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              {/* ઈમેઈલ સરનામું */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ઈમેઈલ સરનામું (Email Address)
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="દા.ત. new.member@example.com"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              {/* ૫. મૂળ વતન (ગામ) */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1 flex items-center justify-between">
                  <span>૫. મૂળ વતન (ગામ) *</span>
                  <span className="text-[10px] text-forest-700 font-semibold bg-forest-50 px-1.5 py-0.5 rounded">યાદીમાંથી પસંદ કરો</span>
                </label>
                <select
                  value={newMemberNativePlace}
                  onChange={(e) => setNewMemberNativePlace(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-semibold text-charcoal-900"
                >
                  <option value="">-- મૂળ વતન પસંદ કરો --</option>
                  {SAMITI_NATIVE_PLACES.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>

              {/* ૬. હાલનું શહેર */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1 flex items-center justify-between">
                  <span>૬. હાલનું શહેર *</span>
                  <span className="text-[10px] text-forest-700 font-semibold bg-forest-50 px-1.5 py-0.5 rounded">ઉપરથી કોપી થયેલ</span>
                </label>
                <input
                  type="text"
                  value={newMemberCity}
                  onChange={(e) => setNewMemberCity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none bg-ivory-50/50"
                />
              </div>

              {/* ૭. સાસરીનું નામ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૭. સાસરીનું નામ (Sasri Name)
                </label>
                <input
                  type="text"
                  value={newMemberSasriName}
                  onChange={(e) => setNewMemberSasriName(e.target.value)}
                  placeholder="દા.ત. અમદાવાદ, મોડાસા, હિંમતનગર"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              {/* ૮. પિયરનું નામ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૮. પિયરનું નામ (Piyar Name)
                </label>
                <input
                  type="text"
                  value={newMemberPiyarName}
                  onChange={(e) => setNewMemberPiyarName(e.target.value)}
                  placeholder="દા.ત. અડાઆઠમ, ધનસુરા"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              {/* ૯. લગ્ન સ્થિતિ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૯. લગ્ન સ્થિતિ (Married Status) *
                </label>
                <select
                  value={newMemberMaritalStatus}
                  onChange={(e) => setNewMemberMaritalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-semibold text-charcoal-800"
                >
                  <option value="પરણિત (Married)">પરણિત (Married)</option>
                  <option value="અપરણિત (Unmarried)">અપરણિત (Unmarried)</option>
                  <option value="સગાઈ થયેલ (Engaged)">સગાઈ થયેલ (Engaged)</option>
                  <option value="અન્ય (Other)">અન્ય (Other)</option>
                </select>
              </div>

              {/* ૧૦. બ્લડ ગ્રૂપ */}
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧૦. બ્લડ ગ્રૂપ
                </label>
                <select
                  value={newMemberBloodGroup}
                  onChange={(e) => setNewMemberBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* ૧૧. પ્રાઇવસી સેટિંગ (Requirement 11) */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-forest-50/60 border border-forest-200">
                <label className="block text-xs font-bold text-charcoal-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-forest-700" />
                  <span>આ સભ્યની માહિતી જાહેર (Public) માં દર્શાવવી છે? (Show this member's information publicly?) *</span>
                </label>
                <p className="text-[11px] text-charcoal-500 mb-2.5">
                  ગોપનીયતા સુરક્ષા હેતુથી આ સભ્યની વિગતો જાહેર સર્ચમાં દર્શાવવી કે નહીં તે અહીં પસંદ કરો. (ડિફોલ્ટ: ના)
                </p>
                <div className="flex items-center gap-5">
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 cursor-pointer">
                    <input
                      type="radio"
                      name="newMemberPrivacy"
                      checked={newMemberIsPublic === false}
                      onChange={() => setNewMemberIsPublic(false)}
                      className="text-forest-700 focus:ring-forest-500"
                    />
                    <span>ના (No) — માત્ર પરિવાર/સભ્યો પૂરતી સુરક્ષિત (ભલામણ કરેલ)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-800 cursor-pointer">
                    <input
                      type="radio"
                      name="newMemberPrivacy"
                      checked={newMemberIsPublic === true}
                      onChange={() => setNewMemberIsPublic(true)}
                      className="text-forest-700 focus:ring-forest-500"
                    />
                    <span>હા (Yes) — જાહેર દર્શન માટે માન્ય</span>
                  </label>
                </div>
              </div>

              {/* ૯. રહેઠાણનું સરનામું */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 mb-1 flex items-center justify-between">
                  <span>૯. રહેઠાણનું સરનામું</span>
                  <span className="text-[10px] text-forest-700 font-semibold bg-forest-50 px-1.5 py-0.5 rounded">ઉપરથી કોપી થયેલ</span>
                </label>
                <textarea
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none bg-ivory-50/50"
                />
              </div>

              {/* પારિવારિક સંબંધો (Family Relations) - INSIDE NEW MEMBER CARD */}
              <div className="sm:col-span-2 bg-gradient-to-b from-forest-50/40 to-white rounded-2xl border border-forest-200 p-4 sm:p-5 space-y-4 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-charcoal-900">
                        પારિવારિક સંબંધો (Family Relations)
                      </h3>
                      <p className="text-[11px] text-charcoal-500">
                        પરિવારના સભ્યો, સંબંધો અને મોબાઇલ નંબર ઉમેરો
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto text-[11px] font-bold text-forest-800 bg-forest-50 border border-forest-200 px-3 py-1 rounded-full shadow-xs">
                    કુલ સંબંધો: {newMemberFamilyRelations.length}
                  </span>
                </div>

                {/* List of Added Relations */}
                {newMemberFamilyRelations.length > 0 ? (
                  <div className="space-y-2.5">
                    {newMemberFamilyRelations.map((rel, index) => (
                      <div
                        key={rel.id}
                        className="p-3.5 sm:px-4 sm:py-3 bg-white rounded-xl border border-ivory-300 shadow-xs hover:border-forest-300 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-forest-50 text-forest-800 border border-forest-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-forest-50 text-forest-800 border border-forest-200 flex-shrink-0">
                                {rel.relation}
                              </span>
                              <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                                {rel.name}
                              </h4>
                              {rel.is_registered && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 flex-shrink-0">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  <span>સમાજ સભ્ય</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                              {rel.phone ? (
                                <span className="flex items-center gap-1.5 text-charcoal-700 font-semibold text-[11px] sm:text-xs">
                                  <Phone className="w-3 h-3 text-forest-700 flex-shrink-0" />
                                  <span>{rel.phone}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-charcoal-400 italic">
                                  મોબાઇલ નંબર નોંધાયેલ નથી
                                </span>
                              )}

                              {(rel.city || rel.native_place) && (
                                <span className="flex items-center gap-1 text-[11px] text-charcoal-500">
                                  <MapPin className="w-3 h-3 text-forest-600 flex-shrink-0" />
                                  <span>{[rel.city, rel.native_place].filter(Boolean).join(" • ")}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveNewMemberRelation(rel.id)}
                            className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="સંબંધ કાઢી નાખો"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-charcoal-400 border border-dashed border-ivory-300 rounded-xl bg-white">
                    હજુ સુધી કોઈ પારિવારિક સંબંધ ઉમેરેલ નથી. નીચેના ફોર્મમાંથી સંબંધ પસંદ કરી ઉમેરો.
                  </div>
                )}

                {/* Add New Relation Sub-form */}
                <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-xs space-y-3">
                  <span className="font-bold text-xs text-charcoal-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-forest-700" />
                    <span>નવો પારિવારિક સંબંધ ઉમેરો:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                        ૧. સંબંધ પસંદ કરો *
                      </label>
                      <select
                        value={newMemberSubRelationType}
                        onChange={(e) => setNewMemberSubRelationType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-medium text-charcoal-800"
                      >
                        <option value="">-- સંબંધ પસંદ કરો --</option>
                        {RELATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                        ૨. સંબંધીનું પૂરું નામ *
                      </label>
                      <input
                        type="text"
                        value={newMemberSubRelationName}
                        onChange={(e) => setNewMemberSubRelationName(e.target.value)}
                        placeholder="દા.ત. દિનેશભાઈ બાબુલાલ દરજી"
                        className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                        ૩. મોબાઇલ નંબર
                      </label>
                      <input
                        type="tel"
                        value={newMemberSubRelationPhone}
                        onChange={(e) => setNewMemberSubRelationPhone(e.target.value)}
                        placeholder="દા.ત. 98250 12345"
                        className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddNewMemberRelation}
                      className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>સંબંધ ઉમેરો (Add Relation)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => setShowNewMemberCard(false)}
                className="w-full sm:w-auto px-5 py-2.5 border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-bold text-xs rounded-xl transition-colors"
              >
                રદ કરો (Cancel)
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ નવો સભ્ય સાચવો અને ઉમેરો (Save New Member)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    )}

      {/* TAB 2: BUSINESS & EMPLOYMENT (ઉપર બિઝનેસ, નીચે નોકરી) */}
      {activeTab === "employment" && (
        <form onSubmit={handleSaveEmployment} className="space-y-8">
          {/* ૧. ઉપલો વિભાગ: બિઝનેસ / પેઢીનું વિવરણ (Business Details) */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 text-white shadow-sm">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    ૧. બિઝનેસ / પેઢીની વિગતો (Business & Firm)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    આપનો સ્વતંત્ર વેપાર, દુકાન, ડિસ્ટ્રિબ્યુશન અથવા પેઢી હોય તો તેની વિગત અહીં ભરો.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setAdBusinessName(businessName || "");
                    setAdCategory(businessCategory || "");
                    setAdDescription("");
                    setAdOwnerName(businessOwnerName || currentUser?.name || "");
                    setAdPhone(businessPhone || currentUser?.phone || "");
                    setAdAddress(businessAddress || currentUser?.address || "");
                    setAdImageUrl(businessBannerUrl || "");
                    setAdWebsite("");
                    setIsAdModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>જાહેરાત માટે સંપર્ક કરો (Business Advertisement)</span>
                </button>
                <span className="text-[11px] font-bold bg-saffron-50 text-saffron-800 px-3 py-1 rounded-full border border-saffron-200">
                  ઉપર: બિઝનેસ (Top)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧. પૂરું નામ (માલિક / ઓનરનું નામ)
                </label>
                <input
                  type="text"
                  value={businessOwnerName}
                  onChange={(e) => setBusinessOwnerName(e.target.value)}
                  placeholder="દા.ત. Bharatbhai Dahyalal Darji (Bolundra)"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૨. બિઝનેસ / પેઢીનું નામ *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="દા.ત. Dhaval Marketing"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૩. વ્યવસાયનો પ્રકાર *
                </label>
                <input
                  type="text"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  placeholder="દા.ત. FMCG Distributor, ટેલરિંગ, જ્વેલર્સ, એન્જિનિયરિંગ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૪. હોદ્દો (Designation / Role) *
                </label>
                <input
                  type="text"
                  value={businessRole}
                  onChange={(e) => setBusinessRole(e.target.value)}
                  placeholder="દા.ત. Owner, Partner, ડિરેક્ટર, પ્રોપ્રાઇટર"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૫. શહેરનું નામ *
                </label>
                <input
                  type="text"
                  value={businessCity}
                  onChange={(e) => setBusinessCity(e.target.value)}
                  placeholder="દા.ત. Navi Mumbai, મોડાસા, અમદાવાદ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૬. મોબાઇલ નંબર *
                </label>
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="દા.ત. 9820941970 / 9322241970"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૭. પેઢીનું સરનામું (Pedhi nu Sarnamu) *
                </label>
                <textarea
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  rows={2}
                  placeholder="દુકાન/ઓફિસ નં, કોમ્પ્લેક્સ, રોડ અને વિસ્તારનું પૂરું સરનામું"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              {/* ૮. વ્યવસાય ફોટો / લોગો અપલોડ & ક્રોપ એડિટર (Requirement Task 1) */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-charcoal-700">
                  ૮. વ્યવસાય / પેઢીની તસવીર (Business Photo / Image) *
                </label>
                <div className="max-w-md">
                  <ImageUploadWithCrop
                    currentImageUrl={businessBannerUrl}
                    onImageCropped={(url) => {
                      setBusinessBannerUrl(url);
                      showToast("વ્યવસાયની તસવીર સફળતાપૂર્વક અપલોડ અને ક્રોપ થઈ ગઈ!");
                    }}
                    aspectRatio={16 / 9}
                    aspectRatioLabel="૧૬:૯ (વાઈડ બેનર)"
                    category="business-photos"
                    label="વ્યવસાયનો ફોટો અથવા લોગો અપલોડ & ક્રોપ કરો"
                    helperText="ડ્રેગ & ડ્રોપ કરો અથવા ડિવાઇસમાંથી પસંદ કરો • JPG, PNG, WebP (મહત્તમ 5MB)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ૨. નીચલો વિભાગ: નોકરી / રોજગારની વિગતો (Job & Employment Details) */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-forest-600 to-emerald-700 text-white shadow-sm">
                  <Building className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    ૨. નોકરી / રોજગારની વિગતો (Job & Service Details)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    જો આપ સરકારી, ગ્રાન્ટેડ કે ખાનગી ક્ષેત્રમાં નોકરી કરતા હોવ તો તેની માહિતી અહીં ભરો.
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-bold bg-forest-50 text-forest-800 px-3 py-1 rounded-full border border-forest-200">
                નીચે: નોકરી (Bottom)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧. પૂરું નામ (કર્મચારીનું નામ)
                </label>
                <input
                  type="text"
                  value={jobFullName}
                  onChange={(e) => setJobFullName(e.target.value)}
                  placeholder="દા.ત. Ashokbhai Lakhabhai Darji (Limbhoi)"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૨. નોકરી કરતા હોવ તો સરકારી / ખાનગી ક્ષેત્ર *
                </label>
                <select
                  value={jobSector}
                  onChange={(e) => setJobSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-semibold text-charcoal-800"
                >
                  <option value="સરકારી ક્ષેત્ર (Goverment)">સરકારી ક્ષેત્ર (Goverment)</option>
                  <option value="અર્ધ-સરકારી / ગ્રાન્ટેડ (Semi-Goverment)">અર્ધ-સરકારી / ગ્રાન્ટેડ (Semi-Goverment)</option>
                  <option value="ખાનગી ક્ષેત્ર (Private Sector)">ખાનગી ક્ષેત્ર (Private Sector)</option>
                  <option value="પ્રોફેશનલ / અન્ય (Other)">પ્રોફેશનલ / અન્ય (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૩. કંપની / સંસ્થા / વિભાગનું નામ *
                </label>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="દા.ત. Higher Secondary School, TCS, બેંક"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none font-semibold text-charcoal-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૪. હોદ્દો (Designation / Post) *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="દા.ત. Teacher, સોફ્ટવેર એન્જિનિયર, મેનેજર, ક્લાર્ક"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૫. શહેરનું નામ (કામનું સ્થળ) *
                </label>
                <input
                  type="text"
                  value={jobCity}
                  onChange={(e) => setJobCity(e.target.value)}
                  placeholder="દા.ત. Vadagam, ગાંધીનગર, અમદાવાદ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૬. મોબાઇલ નંબર
                </label>
                <input
                  type="tel"
                  value={jobPhone}
                  onChange={(e) => setJobPhone(e.target.value)}
                  placeholder="દા.ત. 9313194260"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૭. ઉદ્યોગ / ક્ષેત્ર (Industry)
                </label>
                <input
                  type="text"
                  value={jobIndustry}
                  onChange={(e) => setJobIndustry(e.target.value)}
                  placeholder="દા.ત. શિક્ષણ & વિદ્યા, આઈટી, બેંકિંગ, આરોગ્ય"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૮. અનુભવ (વર્ષમાં)
                </label>
                <input
                  type="text"
                  value={jobExperience}
                  onChange={(e) => setJobExperience(e.target.value)}
                  placeholder="દા.ત. ૧૫ વર્ષ, ૫ વર્ષ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-forest-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Unified Save Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-ivory-300 shadow-sm">
            <div className="text-xs text-charcoal-600">
              💡 બંને વિભાગોમાંથી આપને લાગુ પડતી એક અથવા બંને વિગતો ભરીને સાચવી શકો છો.
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>વિગતો સાચવો (Save Details)</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: EDUCATION FOR SELF & FAMILY MEMBERS (Requirement 6) */}
      {activeTab === "education" && (
        <div className="space-y-8">
          <form onSubmit={handleSaveEducationRecord} className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 text-white shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    શિક્ષણ & શૈક્ષણિક વિગતો (Education Details)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    પોતાની તથા સામાન્ય માહિતીમાં ઉમેરેલા પરિવારના સભ્યોની શૈક્ષણિક વિગતો ઉમેરો.
                  </p>
                </div>
              </div>
            </div>

            {/* Member Selection Dropdown */}
            <div className="p-4 rounded-2xl bg-saffron-50/70 border border-saffron-200 space-y-2">
              <label className="block text-xs font-bold text-saffron-950 flex items-center gap-1.5">
                <User className="w-4 h-4 text-saffron-700" />
                <span>સભ્ય પસંદ કરો (Select Family Member) *</span>
              </label>
              <select
                value={selectedEduMemberId}
                onChange={(e) => handleSelectEduMember(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-saffron-300 rounded-xl bg-white text-charcoal-900 focus:border-saffron-600 focus:outline-none shadow-2xs"
              >
                <option value="self">
                  👤 {currentUser?.name || name || "મુખ્ય સભ્ય"} (પોતે / Self)
                </option>
                {familyRelations.map((rel) => (
                  <option key={rel.id} value={rel.id}>
                    👥 {rel.name} — {rel.relation}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-saffron-800">
                💡 સામાન્ય માહિતી ટેબમાં ઉમેરેલા તમામ પરિવારજનો અહીં આપોઆપ ઉપલબ્ધ થાય છે.
              </p>
            </div>

            {/* Education Inputs - EXACTLY TWO FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧. શિક્ષણ વિભાગ (Education Category) *
                </label>
                <select
                  value={eduCategory}
                  onChange={(e) => setEduCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-900"
                >
                  {SAMITI_EDUCATION_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૨. શું અભ્યાસ કર્યો છે? (Education Details) *
                </label>
                <input
                  type="text"
                  value={eduDetails}
                  onChange={(e) => setEduDetails(e.target.value)}
                  placeholder="જેમ કે B.Com, MBA, B.Tech, M.A., ITI વગેરે"
                  required
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-ivory-200">
              <button
                type="submit"
                className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>શૈક્ષણિક વિગત સાચવો</span>
              </button>
            </div>
          </form>

          {/* Saved Family Education Summary List */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-forest-700" />
                <h3 className="font-bold text-sm text-charcoal-900">
                  નોંધાયેલ શૈક્ષણિક વિગતોની સૂચિ
                </h3>
              </div>
              <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                કુલ: {(eduDetails ? 1 : 0) + familyEducationList.length}
              </span>
            </div>

            <div className="space-y-3">
              {/* Self record */}
              {eduDetails && (
                <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-charcoal-900">{currentUser?.name || name}</h4>
                      <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.2 rounded-full border border-saffron-200">
                        પોતે (Self)
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-charcoal-900 text-xs">{eduDetails}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-saffron-50 text-saffron-800 border border-saffron-200">
                        {eduCategory}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectEduMember("self")}
                    className="text-xs font-bold text-saffron-700 hover:underline cursor-pointer"
                  >
                    સુધારો
                  </button>
                </div>
              )}

              {/* Family members records */}
              {familyEducationList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-charcoal-900">{rec.member_name}</h4>
                      <span className="text-[10px] font-bold bg-forest-100 text-forest-800 px-2 py-0.2 rounded-full border border-forest-200">
                        પરિવાર સભ્ય
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-charcoal-900 text-xs">{rec.degree}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-50 text-forest-800 border border-forest-200">
                        {rec.field_of_study || rec.institution || "શિક્ષણ"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectEduMember(rec.member_id)}
                      className="text-xs font-bold text-saffron-700 hover:underline cursor-pointer"
                    >
                      સુધારો
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducationRecord(rec.id)}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="દૂર કરો"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {!eduDetails && familyEducationList.length === 0 && (
                <div className="text-center py-6 text-xs text-charcoal-400 border border-dashed border-ivory-300 rounded-2xl">
                  હજુ સુધી કોઈ શૈક્ષણિક વિગત નોંધાયેલ નથી. ઉપરના ફોર્મમાંથી સભ્ય પસંદ કરી સાચવો.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MY DONATIONS (Requirement 13.6) */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-saffron-500 to-amber-600 text-white shadow-sm">
                  <Heart className="w-5 h-5 fill-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    મારા દ્વારા નોંધાયેલા દાન (My Donations)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    આપના એકાઉન્ટ દ્વારા સમાજને અર્પણ કરેલા તમામ દાન અને તેની મંજૂરી સ્થિતિ.
                  </p>
                </div>
              </div>

              <Link
                href="/donations"
                className="px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 w-max"
              >
                <Plus className="w-4 h-4" />
                <span>+ નવું દાન નોંધાવો</span>
              </Link>
            </div>

            {myDonations.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-10 h-10 text-charcoal-300 mx-auto" />
                <h4 className="font-bold text-sm text-charcoal-800">
                  આપે હજુ સુધી કોઈ દાન નોંધાવેલ નથી.
                </h4>
                <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                  સમાજ ભવન, શિક્ષણ સહાય કે ધાર્મિક મહોત્સવમાં સહયોગ આપવા માટે નીચે ક્લિક કરીને દાન નોંધણી કરી શકો છો.
                </p>
                <Link
                  href="/donations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron-600 text-white font-bold text-xs hover:bg-saffron-700 transition-colors shadow-2xs mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>દાન નોંધાવો</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myDonations.map((don) => {
                  const isApproved = don.status === "approved" || don.payment_status === "verified";
                  const isRejected = don.status === "rejected";
                  const isPending = !isApproved && !isRejected;

                  return (
                    <div
                      key={don.id}
                      className="bg-ivory-50/60 rounded-2xl border border-ivory-300 p-5 space-y-3 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Header: Donation ID & Status */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-ivory-200 text-xs">
                          <span className="font-mono font-bold text-charcoal-800 bg-white px-2 py-0.5 rounded border border-ivory-200">
                            {don.donation_id || don.receipt_number || "DON-RECORD"}
                          </span>

                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : isRejected
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {isApproved && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {isRejected && <XCircle className="w-3 h-3 text-red-600" />}
                            {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                            <span>
                              {isApproved
                                ? "મંજૂર / સ્વીકૃત (Approved)"
                                : isRejected
                                ? "અસ્વીકાર (Rejected)"
                                : "ચકાસણી પેન્ડિંગ (Awaiting Approval)"}
                            </span>
                          </span>
                        </div>

                        {/* Donor Name & Purpose */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-charcoal-900">
                              {don.donor_name}
                            </h4>
                            {don.amount > 0 && (
                              <span className="font-extrabold text-forest-800 text-sm">
                                ₹{don.amount.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-600 mt-1">
                            દાનનો હેતુ: <strong>{don.donation_purpose || don.purpose}</strong>
                          </p>
                          {don.specific_purpose && (
                            <p className="text-[11px] text-charcoal-500 italic mt-0.5">
                              &ldquo;{don.specific_purpose}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Multiple Hasthe names */}
                        {don.hasthe_names && don.hasthe_names.length > 0 && (
                          <div className="text-xs">
                            <span className="text-[10px] font-bold text-saffron-800 block mb-1">
                              હસ્તે:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {don.hasthe_names.map((hName, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-white text-charcoal-800 font-semibold px-2 py-0.5 rounded border border-ivory-200"
                                >
                                  {hName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata: Year & Submission Date */}
                        <div className="flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-ivory-200">
                          <span>વર્ષ: <strong>{don.donation_year || don.date.split("-")[0]}</strong></span>
                          <span>તારીખ: {don.date}</span>
                        </div>

                        {/* Status detail messages */}
                        {isPending && (
                          <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-1.5">
                            <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                            <span>આપનું દાન નોંધાઈ ગયું છે અને સમિતિ દ્વારા બેંક જમા ચકાસણી પ્રક્રિયામાં છે.</span>
                          </div>
                        )}

                        {isApproved && (
                          <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                            <span>
                              આપનું દાન સફળતાપૂર્વક ચકાસીને સ્વીકૃત કરવામાં આવ્યું છે. સમાજ આપનો આભાર માને છે.
                              {don.approved_by && ` (મંજૂર કરનાર: ${don.approved_by})`}
                            </span>
                          </div>
                        )}

                        {/* Rejection remarks display (Requirement 13.6) */}
                        {isRejected && (
                          <div className="p-2.5 rounded-xl bg-red-100/80 border border-red-200 text-xs text-red-900 flex items-start gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block">અસ્વીકાર કારણ / શેરો:</strong>
                              <span>{don.admin_remarks || "ચુકવણી મેળ ખાતી નથી."}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY PERMISSIONS MATRIX */}
      {activeTab === "privacy" && (
        <form onSubmit={handleSavePrivacy} className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
          <div className="p-4 rounded-2xl bg-saffron-50 border border-saffron-200 text-xs text-charcoal-700 flex items-start gap-3">
            <Shield className="w-5 h-5 text-saffron-700 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-saffron-900 mb-1">ગોપનીયતા નિયંત્રણ (Privacy Control)</h4>
              <p className="leading-relaxed">
                આપની અંગત વિગતો કોણ જોઈ શકે તે આપ સંપૂર્ણપણે નક્કી કરી શકો છો. જાહેર ડિરેક્ટરીમાં આપના પસંદ કરેલા નિયમો અનુસાર જ માહિતી પ્રદર્શિત થશે.
              </p>
            </div>
          </div>

          <div className="space-y-4 divide-y divide-ivory-200">
            {/* Phone Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">મોબાઇલ નંબર દર્શાવવો</span>
                <span className="text-[11px] text-charcoal-500">આપનો સંપર્ક નંબર ડિરેક્ટરીમાં કોણ જોઈ શકે</span>
              </div>
              <select
                value={privacyPhone}
                onChange={(e) => setPrivacyPhone(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Address Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">રહેઠાણનું સરનામું</span>
                <span className="text-[11px] text-charcoal-500">ઘરનું પૂરું સરનામું દર્શાવવાની પરવાનગી</span>
              </div>
              <select
                value={privacyAddress}
                onChange={(e) => setPrivacyAddress(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Photo Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">પ્રોફાઇલ ફોટોગ્રાફ</span>
                <span className="text-[11px] text-charcoal-500">ફોટો જાહેર કે માત્ર સભ્યો માટે ઉપલબ્ધ રાખવો</span>
              </div>
              <select
                value={privacyPhoto}
                onChange={(e) => setPrivacyPhoto(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Family Tree Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">પરિવાર વૃક્ષ અને સંબંધો</span>
                <span className="text-[11px] text-charcoal-500">વંશાવળીના પારિવારિક સંબંધોની દૃશ્યતા</span>
              </div>
              <select
                value={privacyFamily}
                onChange={(e) => setPrivacyFamily(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Employment Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">રોજગાર અને વ્યવસાય માહિતી</span>
                <span className="text-[11px] text-charcoal-500">કંપની અને નોકરીની વિગતો</span>
              </div>
              <select
                value={privacyEmployment}
                onChange={(e) => setPrivacyEmployment(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Education Privacy */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-charcoal-900 block">શૈક્ષણિક વિગતો</span>
                <span className="text-[11px] text-charcoal-500">ડિગ્રી અને અભ્યાસની માહિતી</span>
              </div>
              <select
                value={privacyEducation}
                onChange={(e) => setPrivacyEducation(e.target.value as PrivacyVisibility)}
                className="px-3 py-2 border border-ivory-300 rounded-xl text-xs bg-white font-medium focus:border-saffron-500 focus:outline-none"
              >
                {visibilityOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-ivory-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ગોપનીયતા સેટિંગ્સ સાચવો</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: MATRIMONY (લગ્ન વિષયક માહિતી & ડિરેક્ટરી) - ONLY ACCESSIBLE IF UNMARRIED */}
      {activeTab === "matrimony" && isUnmarried && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Card 1: User's Own Matrimony Profile & Privacy Settings */}
          <form
            onSubmit={handleSaveMatrimonyProfile}
            className="bg-white rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm">
                  <Heart className="w-5 h-5 fill-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    મારી મેટ્રિમોની પ્રોફાઇલ & સેટિંગ્સ (My Matrimony Profile)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    સમાજના યોગ્ય જીવનસાથી માટે પોતાની વિગતો અને વ્યક્તિગત ગોપનીયતા સેટિંગ્સ મેનેજ કરો.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isAvailableForMatrimony
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAvailableForMatrimony ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  <span>{isAvailableForMatrimony ? "મેટ્રિમોની સક્રિય (Active)" : "નિષ્ક્રિય (Inactive)"}</span>
                </span>
              </div>
            </div>

            {/* Eligibility & Opt-in Settings */}
            {!isUnmarried ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 mb-1">
                    મેટ્રિમોની પાત્રતા શરત (Eligibility Restriction)
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    સમાજના સત્તાવાર નિયમ મુજબ માત્ર <strong>અપરણિત (Unmarried)</strong> સભ્યો જ મેટ્રિમોની પોર્ટલ પર નોંધણી કરાવી શકે છે. સગાઈ થયેલ (Engaged) કે પરણિત (Married) સભ્યો મેટ્રિમોની લિસ્ટિંગમાં આવી શકતા નથી. આપની વર્તમાન લગ્ન સ્થિતિ <strong>{maritalStatus}</strong> હોવાથી મેટ્રિમોની પ્રોફાઇલ સક્રિય કરી શકાશે નહીં. જો આપની સ્થિતિ અપરણિત હોય તો સામાન્ય માહિતી ટેબમાં જઈ લગ્ન સ્થિતિ સુધારો.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 2-Tier Selection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selection 1: Matrimony Opt-In */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isAvailableForMatrimony
                        ? "bg-rose-50/70 border-rose-200 shadow-xs"
                        : "bg-ivory-50 border-ivory-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-bold text-xs sm:text-sm text-charcoal-900 block">
                          ૧. મેટ્રિમોની માં જોડાવું છે?
                        </span>
                        <p className="text-[11px] text-charcoal-600 leading-relaxed">
                          અપરણિત સભ્ય તરીકે યોગ્ય જીવનસાથીની શોધ માટે સમાજના મેટ્રિમોની વિભાગમાં જોડાવું.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isAvailableForMatrimony}
                          onChange={(e) => setIsAvailableForMatrimony(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Selection 2: Public Listing Consent */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isAvailableForMatrimony && isPublicListing
                        ? "bg-emerald-50/70 border-emerald-200 shadow-xs"
                        : "bg-ivory-50 border-ivory-200 opacity-90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-bold text-xs sm:text-sm text-charcoal-900 block">
                          ૨. મારી પ્રોફાઇલ Public Listing માં બતાવવી છે?
                        </span>
                        <p className="text-[11px] text-charcoal-600 leading-relaxed">
                          Header માં રહેલા &apos;મેટ્રિમોની&apos; પબ્લિક પેજ પર સામાન્ય મુલાકાતીઓ માટે પ્રોફાઇલ દર્શાવો.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          disabled={!isAvailableForMatrimony}
                          checked={isAvailableForMatrimony && isPublicListing}
                          onChange={(e) => setIsPublicListing(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Status Matrix Summary Banner */}
                <div className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-300 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-charcoal-700">વર્તમાન પબ્લિક લિસ્ટિંગ સ્થિતિ:</span>
                    {isAvailableForMatrimony && isPublicListing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Public Listing માં પ્રદર્શિત થશે (Show)</span>
                      </span>
                    ) : isAvailableForMatrimony && !isPublicListing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>પબ્લિક લિસ્ટિંગમાં છુપાયેલ છે (Hide - માત્ર આંતરિક)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>મેટ્રિમોની પોર્ટલમાંથી સંપૂર્ણ હટાવેલ (Hide)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Physical & Bio Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૧. ઊંચાઈ (Height)
                </label>
                <input
                  type="text"
                  value={matrimonyHeight}
                  onChange={(e) => setMatrimonyHeight(e.target.value)}
                  placeholder="દા.ત. 5 ફૂટ 8 ઇંચ (172 cm)"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૨. વાન / રંગરૂપ (Complexion)
                </label>
                <input
                  type="text"
                  value={matrimonyComplexion}
                  onChange={(e) => setMatrimonyComplexion(e.target.value)}
                  placeholder="દા.ત. ગોરો, ઘઉંવર્ણ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૩. ઉમેદવાર વિશે ટૂંકી વિગત (About Me / Bio)
                </label>
                <textarea
                  value={matrimonyAbout}
                  onChange={(e) => setMatrimonyAbout(e.target.value)}
                  rows={2}
                  placeholder="સ્વભાવ, શોખ, પારિવારિક પૃષ્ઠભૂમિ અને જીવનશૈલી વિશે ટૂંકમાં લખો"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal-700 mb-1">
                  ૪. અપેક્ષિત જીવનસાથી (Partner Expectations)
                </label>
                <textarea
                  value={matrimonyExpectations}
                  onChange={(e) => setMatrimonyExpectations(e.target.value)}
                  rows={2}
                  placeholder="શિક્ષણ, વ્યવસાય, સ્વભાવ અને જીવનસાથી પાસેથી અપેક્ષાઓ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Matrimony Specific Privacy Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-ivory-50/80 border border-ivory-300 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-ivory-200">
                <Shield className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-xs sm:text-sm text-charcoal-900">
                  મેટ્રિમોની ગોપનીયતા સેટિંગ્સ (Matrimony Privacy Settings)
                </h4>
              </div>
              <p className="text-[11px] text-charcoal-500">
                અન્ય સભ્યોને આપની પ્રોફાઇલ જોતી વખતે કઈ કઈ વિગતો દેખાવી જોઈએ તે નીચેથી પસંદ કરો:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Name */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_name ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">પૂરું નામ બતાવવું</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_name}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_name: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 2. Photo */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_photo ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">ફોટોગ્રાફ બતાવવો</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_photo}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_photo: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 3. Age / DOB */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_age ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">ઉંમર / જન્મતારીખ</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_age}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_age: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 4. Native Place */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_native_place ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">મૂળ વતન (ગામ)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_native_place}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_native_place: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 5. Education */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_education ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">શિક્ષણની વિગત</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_education}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_education: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 6. Occupation */}
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_occupation ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">વ્યવસાય / નોકરી</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_occupation}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_occupation: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>

                {/* 7. Contact & Parents */}
                <label className="sm:col-span-2 flex items-center justify-between p-2.5 bg-white rounded-xl border border-ivory-200 hover:border-rose-300 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    {matrimonyPrivacy.show_contact ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="font-semibold text-charcoal-800">
                      મોબાઇલ નંબર & વાલી / માતા-પિતાની વિગત
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={matrimonyPrivacy.show_contact}
                    onChange={(e) =>
                      setMatrimonyPrivacy((prev) => ({ ...prev, show_contact: e.target.checked }))
                    }
                    className="w-4 h-4 text-rose-600 rounded border-ivory-300 focus:ring-rose-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-ivory-200">
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>મેટ્રિમોની પ્રોફાઇલ સાચવો</span>
              </button>
            </div>
          </form>

          {/* Card 2: Community Matrimony Directory */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-sm">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    સમાજ મેટ્રિમોની ઉમેદવારો (Community Matrimony Directory)
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    અડાઆઠમ દરજી સમાજના જીવનસાથીની શોધમાં રહેલા વર અને કન્યા પક્ષની યાદી
                  </p>
                </div>
              </div>

              {/* Security & Consent Badge */}
              <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>માત્ર સંમતિ આપેલ સભ્યો (Opt-in Verified)</span>
              </div>
            </div>

            {/* Privacy & Consent Note */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs text-charcoal-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>સુરક્ષા અને સંમતિ ગેરંટી:</strong> અહીં ફક્ત એવા જ સભ્યો દર્શાવવામાં આવે છે જેમણે પોતાના પ્રોફાઇલમાં &apos;મેટ્રિમોની માટે ઉપલબ્ધ&apos; વિકલ્પ પસંદ કર્યો છે. જો કોઈ સભ્યએ પોતાનો ફોટો, નામ કે સંપર્ક છુપાવ્યો હોય તો તે તેમની વ્યક્તિગત પ્રાઇવસી સેટિંગ્સ મુજબ સુરક્ષિત રાખવામાં આવે છે.
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  શોધો (નામ / વતન / શિક્ષણ / વ્યવસાય)
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matrimonyFilterSearch}
                    onChange={(e) => setMatrimonyFilterSearch(e.target.value)}
                    placeholder="દા.ત. અડાઆઠમ, એન્જિનિયર, ડૉક્ટર..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Gender / Side Filter */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  પક્ષ (Side / Gender)
                </label>
                <select
                  value={matrimonyFilterGender}
                  onChange={(e) => setMatrimonyFilterGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-semibold text-charcoal-800"
                >
                  <option value="all">બધા (All Profiles)</option>
                  <option value="male">વર પક્ષ (Groom / Male)</option>
                  <option value="female">કન્યા પક્ષ (Bride / Female)</option>
                </select>
              </div>

              {/* Native Place Filter */}
              <div>
                <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                  મૂળ વતન (Native Place)
                </label>
                <select
                  value={matrimonyFilterNativePlace}
                  onChange={(e) => setMatrimonyFilterNativePlace(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-semibold text-charcoal-800"
                >
                  <option value="all">તમામ ૩૬ ગામો (All Native Places)</option>
                  {SAMITI_NATIVE_PLACES.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Listing Grid */}
            {(() => {
              const candidates = members.filter((m) => {
                // Must meet full eligibility: Unmarried only + Matrimony Enabled + Public Listing Enabled + Saved
                if (!isMemberEligibleForPublicMatrimony(m)) return false;

                if (matrimonyFilterGender !== "all" && m.gender !== matrimonyFilterGender) {
                  return false;
                }

                if (
                  matrimonyFilterNativePlace !== "all" &&
                  m.native_place !== matrimonyFilterNativePlace
                ) {
                  return false;
                }

                if (matrimonyFilterSearch.trim()) {
                  const q = matrimonyFilterSearch.toLowerCase();
                  const matchName =
                    m.matrimony?.privacy?.show_name !== false && m.name.toLowerCase().includes(q);
                  const matchPlace = m.native_place.toLowerCase().includes(q);
                  const matchEdu =
                    (m.education?.highest_degree || "").toLowerCase().includes(q) ||
                    (m.education?.education_details || "").toLowerCase().includes(q);
                  const matchJob =
                    (m.employment?.job_title || "").toLowerCase().includes(q) ||
                    (m.business?.business_name || "").toLowerCase().includes(q);
                  if (!matchName && !matchPlace && !matchEdu && !matchJob) return false;
                }
                return true;
              });

              if (candidates.length === 0) {
                return (
                  <div className="text-center py-12 px-4 border border-dashed border-rose-200 rounded-2xl bg-rose-50/20">
                    <Heart className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-charcoal-900 mb-1">
                      આ ફિલ્ટરમાં કોઈ ઉમેદવાર ઉપલબ્ધ નથી
                    </h4>
                    <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                      કૃપા કરીને અન્ય ગામ અથવા ફિલ્ટર પસંદ કરો. આપ પણ આપની પ્રોફાઇલ &apos;મેટ્રિમોની માટે ઉપલબ્ધ&apos; રાખી શકો છો.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((cand) => {
                    const priv = cand.matrimony?.privacy || {
                      show_name: true,
                      show_photo: true,
                      show_age: true,
                      show_native_place: true,
                      show_education: true,
                      show_occupation: true,
                      show_contact: true,
                    };

                    const displayName = priv.show_name ? cand.name : "ગોપનીય ઉમેદવાર (Confidential)";
                    const displayPhoto = priv.show_photo ? cand.photo_url : null;
                    const displayPlace = priv.show_native_place ? cand.native_place : "ગોપનીય";
                    const displayEdu = priv.show_education
                      ? cand.education?.education_details ||
                        cand.education?.highest_degree ||
                        "શિક્ષિત"
                      : "ગોપનીય";
                    const displayJob = priv.show_occupation
                      ? cand.employment?.job_title ||
                        cand.business?.business_name ||
                        cand.employment?.company ||
                        "સેવા / નોકરી"
                      : "ગોપનીય";

                    return (
                      <div
                        key={cand.id}
                        className="bg-white rounded-2xl border border-ivory-300 hover:border-rose-300 hover:shadow-md transition-all p-4 flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Top Gradient Stripe */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 ${
                            cand.gender === "female"
                              ? "bg-gradient-to-r from-pink-500 to-rose-500"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600"
                          }`}
                        />

                        <div>
                          {/* Candidate Header with Photo and Badges */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-ivory-200 bg-ivory-100 flex-shrink-0 shadow-2xs">
                              {displayPhoto ? (
                                <img
                                  src={displayPhoto}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 text-rose-700">
                                  <Lock className="w-5 h-5 mb-0.5" />
                                  <span className="text-[9px] font-bold">ગોપનીય</span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    cand.gender === "female"
                                      ? "bg-pink-100 text-pink-800 border border-pink-200"
                                      : "bg-blue-100 text-blue-800 border border-blue-200"
                                  }`}
                                >
                                  {cand.gender === "female" ? "કન્યા પક્ષ (Bride)" : "વર પક્ષ (Groom)"}
                                </span>
                                {cand.id === currentUser?.id && (
                                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200">
                                    આપની પ્રોફાઇલ
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-sm text-charcoal-900 mt-1 truncate">
                                {displayName}
                              </h4>

                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                                <span className="flex items-center gap-0.5 font-medium">
                                  <MapPin className="w-3 h-3 text-rose-600 flex-shrink-0" />
                                  <span>{displayPlace}</span>
                                </span>
                                {cand.matrimony?.height && (
                                  <>
                                    <span>•</span>
                                    <span>{cand.matrimony.height}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Details List */}
                          <div className="space-y-1.5 py-2.5 border-t border-b border-ivory-200 text-xs">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-forest-700" />
                                <span>શિક્ષણ:</span>
                              </span>
                              <span className="font-bold text-charcoal-900 text-right truncate">
                                {displayEdu}
                              </span>
                            </div>

                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-saffron-700" />
                                <span>વ્યવસાય:</span>
                              </span>
                              <span className="font-bold text-charcoal-900 text-right truncate">
                                {displayJob}
                              </span>
                            </div>

                            {cand.father_name && priv.show_contact && (
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-charcoal-600" />
                                  <span>વાલી / પિતા:</span>
                                </span>
                                <span className="font-semibold text-charcoal-800 text-right truncate text-[11px]">
                                  {cand.father_name}
                                </span>
                              </div>
                            )}

                            {cand.matrimony?.partner_expectations && (
                              <div className="pt-1 text-[11px] text-charcoal-600 italic line-clamp-2">
                                &ldquo;{cand.matrimony.partner_expectations}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                          {priv.show_contact && cand.phone ? (
                            <a
                              href={`tel:${cand.phone}`}
                              className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold text-xs border border-forest-200 flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-forest-700" />
                              <span>{cand.phone}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-charcoal-400 italic">
                              સંપર્ક વિગત ગોપનીય
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedCandidateModal(cand)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                          >
                            <span>વિગતો જુઓ</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 1: BUSINESS ADVERTISEMENT FORM MODAL */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-ivory-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-saffron-600 via-amber-600 to-saffron-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    વ્યવસાયની જાહેરાત સબમિટ કરો
                  </h3>
                  <p className="text-xs text-amber-100">
                    Business Advertisement Submission for Admin Approval
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdvertisement} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  આપના વ્યવસાયની જાહેરાત વેબસાઇટ પર દર્શાવવા માટે સબમિટ કરો. સમિતિના એડમિન દ્વારા મંજૂર થયા બાદ જાહેરાતો વિભાગમાં પ્રદર્શિત થશે.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    બિઝનેસ / પેઢીનું નામ *
                  </label>
                  <input
                    type="text"
                    value={adBusinessName}
                    onChange={(e) => setAdBusinessName(e.target.value)}
                    required
                    placeholder="દા.ત. શ્રી હરિ જ્વેલર્સ"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-semibold text-charcoal-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    વ્યવસાયનો પ્રકાર *
                  </label>
                  <input
                    type="text"
                    value={adCategory}
                    onChange={(e) => setAdCategory(e.target.value)}
                    required
                    placeholder="દા.ત. કાપડ વેપાર, જ્વેલરી, ટેલરિંગ, FMCG"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    માલિક / ઓનરનું નામ *
                  </label>
                  <input
                    type="text"
                    value={adOwnerName}
                    onChange={(e) => setAdOwnerName(e.target.value)}
                    required
                    placeholder="દા.ત. મહેન્દ્રભાઈ દરજી"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    સંપર્ક નંબર (Contact Phone) *
                  </label>
                  <input
                    type="tel"
                    value={adPhone}
                    onChange={(e) => setAdPhone(e.target.value)}
                    required
                    placeholder="દા.ત. 98250 12345"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    વ્યવસાયની વિગત / ઑફર્સ (Description) *
                  </label>
                  <textarea
                    value={adDescription}
                    onChange={(e) => setAdDescription(e.target.value)}
                    rows={2}
                    required
                    placeholder="ગ્રાહકો માટે આપની પ્રોડક્ટ્સ, સર્વિસ અને વિશિષ્ટ ઑફર્સ વિશે લખો"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    પેઢીનું સરનામું (Business Address) *
                  </label>
                  <textarea
                    value={adAddress}
                    onChange={(e) => setAdAddress(e.target.value)}
                    rows={2}
                    required
                    placeholder="દુકાન/ઓફિસ નં, કોમ્પ્લેક્સ, રોડ, શહેર"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    જાહેરાત બેનર / તસવીર (Advertisement Banner / Image) *
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={adImageUrl}
                    onImageCropped={(url) => setAdImageUrl(url)}
                    aspectRatio={16 / 9}
                    aspectRatioLabel="૧૬:૯ (વાઈડ બેનર)"
                    category="advertisement-banners"
                    label="જાહેરાતનું બેનર અપલોડ &amp; ક્રોપ કરો"
                    helperText="૧૬:૯ વાઈડ સાઈઝ • ડ્રેગ &amp; ડ્રોપ સપોર્ટ • JPG, PNG, WebP (મહત્તમ ૫ MB)"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    વેબસાઇટ અથવા સોશિયલ લિંક (Website / Link - વૈકલ્પિક)
                  </label>
                  <input
                    type="url"
                    value={adWebsite}
                    onChange={(e) => setAdWebsite(e.target.value)}
                    placeholder="https://mybusiness.com"
                    className="w-full px-3 py-2 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>જાહેરાત સબમિટ કરો (Submit for Approval)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANDIDATE DETAIL MODAL */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-ivory-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 fill-white" />
                <h3 className="font-extrabold text-base">
                  મેટ્રિમોની ઉમેદવાર સંપૂર્ણ વિગત
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidateModal(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-ivory-200">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-rose-200 bg-rose-50 flex-shrink-0 shadow-sm">
                  {selectedCandidateModal.matrimony?.privacy?.show_photo === false ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-700">
                      <Lock className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">ફોટો ગોપનીય</span>
                    </div>
                  ) : (
                    <UserAvatar
                      src={selectedCandidateModal.photo_url}
                      alt={selectedCandidateModal.name}
                      className="w-full h-full rounded-2xl"
                    />
                  )}
                </div>

                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                      selectedCandidateModal.gender === "female"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedCandidateModal.gender === "female" ? "કન્યા પક્ષ" : "વર પક્ષ"}
                  </span>
                  <h4 className="font-extrabold text-base text-charcoal-900">
                    {selectedCandidateModal.matrimony?.privacy?.show_name !== false
                      ? selectedCandidateModal.name
                      : "ગોપનીય ઉમેદવાર"}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    મૂળ વતન:{" "}
                    <strong>
                      {selectedCandidateModal.matrimony?.privacy?.show_native_place !== false
                        ? selectedCandidateModal.native_place
                        : "ગોપનીય"}
                    </strong>{" "}
                    • હાલ: {selectedCandidateModal.city}
                  </p>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">ઊંચાઈ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidateModal.matrimony?.height || "માહિતી નથી"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">વાન / રંગરૂપ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidateModal.matrimony?.complexion || "માહિતી નથી"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">શિક્ષણ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidateModal.matrimony?.privacy?.show_education !== false
                      ? selectedCandidateModal.education?.education_details ||
                        selectedCandidateModal.education?.highest_degree ||
                        "શિક્ષિત"
                      : "ગોપનીય"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">નોકરી / વ્યવસાય</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidateModal.matrimony?.privacy?.show_occupation !== false
                      ? selectedCandidateModal.employment?.job_title ||
                        selectedCandidateModal.business?.business_name ||
                        "સેવા / વ્યવસાય"
                      : "ગોપનીય"}
                  </span>
                </div>
              </div>

              {/* About Me */}
              {selectedCandidateModal.matrimony?.about_me && (
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200">
                  <span className="font-bold text-xs text-rose-950 block mb-1">ઉમેદવાર વિશે:</span>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    {selectedCandidateModal.matrimony.about_me}
                  </p>
                </div>
              )}

              {/* Expectations */}
              {selectedCandidateModal.matrimony?.partner_expectations && (
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <span className="font-bold text-xs text-amber-950 block mb-1">અપેક્ષિત જીવનસાથી:</span>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    {selectedCandidateModal.matrimony.partner_expectations}
                  </p>
                </div>
              )}

              {/* Contact / Parents info */}
              <div className="pt-2">
                {selectedCandidateModal.matrimony?.privacy?.show_contact !== false ? (
                  <div className="p-3.5 bg-forest-50/80 rounded-2xl border border-forest-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-forest-800 font-semibold block">સંપર્ક નંબર</span>
                      <span className="font-extrabold text-sm text-forest-950">
                        {selectedCandidateModal.phone}
                      </span>
                      {selectedCandidateModal.father_name && (
                        <span className="text-[11px] text-charcoal-600 block mt-0.5">
                          વાલી: {selectedCandidateModal.father_name}
                        </span>
                      )}
                    </div>
                    <a
                      href={`tel:${selectedCandidateModal.phone}`}
                      className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>કૉલ કરો</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 bg-ivory-100 rounded-2xl border border-ivory-300 text-center text-xs text-charcoal-600">
                    <Lock className="w-4 h-4 text-charcoal-400 mx-auto mb-1" />
                    <span>આ ઉમેદવારની સંપર્ક વિગતો ગોપનીય રાખવામાં આવેલ છે. સમિતિના એડમિન દ્વારા સંપર્ક કરો.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
