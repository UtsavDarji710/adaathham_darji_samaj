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
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PrivacyVisibility, ChildEducation } from "@/types";

export default function ProfilePage() {
  const { currentUser, updateCurrentUserProfile, updatePrivacySettings, loginAs } = useAuth();
  const { relationships } = useData();

  const [activeTab, setActiveTab] = useState<"general" | "privacy" | "employment" | "education">("general");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form states initialized with currentUser data
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [city, setCity] = useState(currentUser?.city || "મોડાસા");
  const [district, setDistrict] = useState(currentUser?.district || "અરવલ્લી");
  const [nativePlace, setNativePlace] = useState(currentUser?.native_place || "અડાઆઠમ");
  const [pincode, setPincode] = useState(currentUser?.pincode || "383315");
  const [bloodGroup, setBloodGroup] = useState(currentUser?.blood_group || "B+");
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo_url || "");

  // Employment
  const [company, setCompany] = useState(currentUser?.employment?.company || "");
  const [jobTitle, setJobTitle] = useState(currentUser?.employment?.job_title || "");
  const [industry, setIndustry] = useState(currentUser?.employment?.industry || "");
  const [workCity, setWorkCity] = useState(currentUser?.employment?.city || "");
  const [experience, setExperience] = useState(currentUser?.employment?.experience_years || "");

  // Education
  const [degree, setDegree] = useState(currentUser?.education?.highest_degree || "");
  const [institution, setInstitution] = useState(currentUser?.education?.institution || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(currentUser?.education?.field_of_study || "");
  const [passingYear, setPassingYear] = useState(currentUser?.education?.passing_year || "");
  const [childrenList, setChildrenList] = useState<ChildEducation[]>(currentUser?.education?.children || []);

  // Child modal / new child fields
  const [newChildName, setNewChildName] = useState("");
  const [newChildSchool, setNewChildSchool] = useState("");
  const [newChildStandard, setNewChildStandard] = useState("");

  // Privacy Settings state
  const [privacyPhone, setPrivacyPhone] = useState<PrivacyVisibility>(currentUser?.privacy.phone || "members");
  const [privacyAddress, setPrivacyAddress] = useState<PrivacyVisibility>(currentUser?.privacy.address || "members");
  const [privacyPhoto, setPrivacyPhoto] = useState<PrivacyVisibility>(currentUser?.privacy.photo || "public");
  const [privacyFamily, setPrivacyFamily] = useState<PrivacyVisibility>(currentUser?.privacy.family || "members");
  const [privacyBusiness, setPrivacyBusiness] = useState<PrivacyVisibility>(currentUser?.privacy.business || "public");
  const [privacyEmployment, setPrivacyEmployment] = useState<PrivacyVisibility>(currentUser?.privacy.employment || "members");
  const [privacyEducation, setPrivacyEducation] = useState<PrivacyVisibility>(currentUser?.privacy.education || "members");

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal-900">કૃપા કરીને પ્રથમ લોગિન કરો.</h2>
        <p className="text-xs text-charcoal-500 mt-2">આ પેજ જોવા માટે સભ્ય તરીકે લોગિન હોવું જરૂરી છે.</p>
        <Link
          href="/login"
          className="mt-4 inline-block px-6 py-2.5 bg-saffron-600 text-white rounded-xl text-xs font-bold"
        >
          લોગિન પેજ પર જાઓ
        </Link>
      </div>
    );
  }

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name,
      phone,
      address,
      city,
      district,
      native_place: nativePlace,
      pincode,
      blood_group: bloodGroup,
      photo_url: photoUrl,
      completeness: 95,
    });
    showToast("સામાન્ય માહિતી સફળતાપૂર્વક સાચવાઈ!");
  };

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrivacySettings({
      phone: privacyPhone,
      address: privacyAddress,
      photo: privacyPhoto,
      family: privacyFamily,
      business: privacyBusiness,
      employment: privacyEmployment,
      education: privacyEducation,
    });
    showToast("ગોપનીયતા સેટિંગ્સ સફળતાપૂર્વક અપડેટ થયા!");
  };

  const handleSaveEmployment = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      employment: {
        company,
        job_title: jobTitle,
        industry,
        city: workCity,
        experience_years: experience,
      },
    });
    showToast("વ્યવસાય અને નોકરીની વિગતો સાચવાઈ!");
  };

  const handleAddChild = () => {
    if (!newChildName.trim()) return;
    const newChild: ChildEducation = {
      id: `c-${Date.now()}`,
      name: newChildName,
      school_college: newChildSchool,
      standard_course: newChildStandard,
      education_level: "શાળા/કોલેજ",
      is_public: false, // Default private for child protection
    };
    const updated = [...childrenList, newChild];
    setChildrenList(updated);
    setNewChildName("");
    setNewChildSchool("");
    setNewChildStandard("");
    updateCurrentUserProfile({
      education: {
        highest_degree: degree,
        institution,
        field_of_study: fieldOfStudy,
        passing_year: passingYear,
        children: updated,
      },
    });
    showToast("બાળકની શૈક્ષણિક વિગત ઉમેરાઈ!");
  };

  const handleRemoveChild = (id: string) => {
    const updated = childrenList.filter((c) => c.id !== id);
    setChildrenList(updated);
    updateCurrentUserProfile({
      education: {
        highest_degree: degree,
        institution,
        field_of_study: fieldOfStudy,
        passing_year: passingYear,
        children: updated,
      },
    });
    showToast("નોંધ દૂર કરવામાં આવી.");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Automatically update form fields when user logs in or switches role
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
      setCity(currentUser.city || "મોડાસા");
      setDistrict(currentUser.district || "અરવલ્લી");
      setNativePlace(currentUser.native_place || "અડાઆઠમ");
      setPincode(currentUser.pincode || "383315");
      setBloodGroup(currentUser.blood_group || "B+");
      setPhotoUrl(currentUser.photo_url || "");
      setCompany(currentUser.employment?.company || "");
      setJobTitle(currentUser.employment?.job_title || "");
      setIndustry(currentUser.employment?.industry || "");
      setWorkCity(currentUser.employment?.city || "");
      setExperience(currentUser.employment?.experience_years || "");
      setDegree(currentUser.education?.highest_degree || "");
      setInstitution(currentUser.education?.institution || "");
      setFieldOfStudy(currentUser.education?.field_of_study || "");
      setPassingYear(currentUser.education?.passing_year || "");
      setChildrenList(currentUser.education?.children || []);
    }
  }, [currentUser]);

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
              <h4 className="font-bold text-xs text-charcoal-900 mb-1">શિક્ષણ & સંતાનો</h4>
              <p className="text-[11px] text-charcoal-600 leading-normal">
                ઉચ્ચ અભ્યાસ અને સંતાનોના ધોરણની નોંધણી કરો.
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

          {/* Quick 1-Click Role Testing Hub */}
          <div className="mt-8 pt-6 border-t border-ivory-200 relative z-10">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-charcoal-600 inline-flex items-center gap-1.5 bg-ivory-100 px-3 py-1 rounded-full border border-ivory-300">
                <Sparkles className="w-3 h-3 text-saffron-600" />
                ટેસ્ટિંગ માટે ઝડપી ૧-ક્લિક લૉગિન (Quick Unlock)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => loginAs("president")}
                className="p-2.5 rounded-xl border border-saffron-200 hover:border-saffron-400 bg-saffron-50/70 hover:bg-saffron-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-xs text-saffron-950 group-hover:text-saffron-800">
                      પ્રમુખ શ્રી
                    </div>
                    <div className="text-[10px] text-saffron-700">દિનેશભાઈ દરજી</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => loginAs("secretary")}
                className="p-2.5 rounded-xl border border-purple-200 hover:border-purple-400 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <div>
                    <div className="font-bold text-xs text-purple-950 group-hover:text-purple-800">
                      મંત્રી શ્રી
                    </div>
                    <div className="text-[10px] text-purple-700">મહેન્દ્રભાઈ દરજી</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => loginAs("member")}
                className="p-2.5 rounded-xl border border-forest-200 hover:border-forest-400 bg-forest-50/70 hover:bg-forest-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <div>
                    <div className="font-bold text-xs text-forest-950 group-hover:text-forest-800">
                      સામાન્ય સભ્ય
                    </div>
                    <div className="text-[10px] text-forest-700">ભાવિનકુમાર દરજી</div>
                  </div>
                </div>
              </button>
            </div>
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

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={currentUser.photo_url}
              alt={currentUser.name}
              className="w-28 h-28 rounded-3xl object-cover border-4 border-saffron-500 shadow-md"
            />
            <button
              onClick={() => {
                const url = prompt("નવા પ્રોફાઇલ ફોટોની ઇમેજ URL દાખલ કરો:", currentUser.photo_url);
                if (url) {
                  setPhotoUrl(url);
                  updateCurrentUserProfile({ photo_url: url });
                  showToast("પ્રોફાઇલ ફોટો બદલાયો!");
                }
              }}
              className="absolute -bottom-2 -right-2 p-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl shadow-md transition-colors"
              title="ફોટો બદલો"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-charcoal-900">{currentUser.name}</h1>
              <span className="text-xs bg-saffron-100 text-saffron-800 font-bold px-2.5 py-0.5 rounded-full border border-saffron-200">
                {currentUser.committee_role || "સમાજ સભ્ય"}
              </span>
              {currentUser.is_lifetime_member && (
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  ★ આજીવન સભ્ય
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal-500">
              મૂળ વતન: <strong>{currentUser.native_place}</strong> • હાલ: <strong>{currentUser.city}</strong> • મોબાઈલ: <strong>{currentUser.phone}</strong>
            </p>

            {/* Profile Completeness Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-charcoal-600">પ્રોફાઇલ પૂર્ણતા:</span>
                <span className="text-saffron-700 font-bold">{currentUser.completeness || 85}%</span>
              </div>
              <div className="w-full h-2.5 bg-ivory-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-saffron-600 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${currentUser.completeness || 85}%` }}
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
          શિક્ષણ & બાળકો
        </button>
      </div>

      {/* TAB 1: GENERAL INFO FORM */}
      {activeTab === "general" && (
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
              <label className="block text-xs font-bold text-charcoal-700 mb-1">મોબાઈલ નંબર *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">મૂળ વતન (ગામ) *</label>
              <input
                type="text"
                value={nativePlace}
                onChange={(e) => setNativePlace(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
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
              <label className="block text-xs font-bold text-charcoal-700 mb-1">જિલ્લો *</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">પિનકોડ</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
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
          </div>

          <div className="flex justify-end pt-4 border-t border-ivory-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>વિગતો સાચવો</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PRIVACY PERMISSIONS MATRIX */}
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

      {/* TAB 3: EMPLOYMENT FORM */}
      {activeTab === "employment" && (
        <form onSubmit={handleSaveEmployment} className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">કંપની / પેઢીનું નામ</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="જેમ કે ટાટા કન્સલ્ટન્સી સર્વિસીસ"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">હોદ્દો / ડેઝિગ્નેશન</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="જેમ કે સીનિયર સોફ્ટવેર એન્જિનિયર"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">ઉદ્યોગ / ક્ષેત્ર (Industry)</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="જેમ કે આઈટી, બેંકિંગ, ટેક્સટાઇલ"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">કામનું સ્થળ (શહેર)</label>
              <input
                type="text"
                value={workCity}
                onChange={(e) => setWorkCity(e.target.value)}
                placeholder="અમદાવાદ, ગાંધીનગર, વડોદરા વગેરે"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">અનુભવ (વર્ષમાં)</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="જેમ કે ૫ વર્ષ"
                className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-ivory-200">
            <button
              type="submit"
              className="px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>વિગતો સાચવો</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: EDUCATION & CHILDREN FORM */}
      {activeTab === "education" && (
        <div className="space-y-8">
          {/* Own Education */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-saffron-600" />
              <span>પોતાની શૈક્ષણિક લાયકાત</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">ઉચ્ચતમ ડિગ્રી</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="જેમ કે બી.કોમ., બી.ટેક., એમ.એસસી."
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">અભ્યાસનું ક્ષેત્ર</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="કમ્પ્યુટર, વાણિજ્ય, વિજ્ઞાન વગેરે"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">શાળા / કોલેજ / યુનિવર્સિટી</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="સંસ્થાનું નામ"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 mb-1">ઉત્તીર્ણ વર્ષ</label>
                <input
                  type="text"
                  value={passingYear}
                  onChange={(e) => setPassingYear(e.target.value)}
                  placeholder="જેમ કે 2018"
                  className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  updateCurrentUserProfile({
                    education: {
                      highest_degree: degree,
                      institution,
                      field_of_study: fieldOfStudy,
                      passing_year: passingYear,
                      children: childrenList,
                    },
                  });
                  showToast("શૈક્ષણિક વિગતો સાચવાઈ!");
                }}
                className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                સાચવો
              </button>
            </div>
          </div>

          {/* Children's Education Management */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-forest-700" />
                <span>બાળકોની શૈક્ષણિક વિગતો (વાલી સંચાલન)</span>
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                બાળકોની વિગતો ડિફોલ્ટ રૂપે ખાનગી રહે છે જેથી બાળ સુરક્ષા જળવાય.
              </p>
            </div>

            {/* List of children */}
            <div className="space-y-3">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-charcoal-900">{child.name}</h4>
                    <p className="text-[11px] text-charcoal-600 mt-0.5">
                      {child.standard_course} • {child.school_college}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveChild(child.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="કાઢી નાખો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {childrenList.length === 0 && (
                <div className="text-center py-6 text-xs text-charcoal-400 border border-dashed border-ivory-300 rounded-2xl">
                  હજુ સુધી કોઈ બાળકની શૈક્ષણિક વિગત ઉમેરેલ નથી.
                </div>
              )}
            </div>

            {/* Add new child form */}
            <div className="p-4 rounded-2xl bg-ivory-100/70 border border-ivory-200 space-y-3">
              <span className="font-bold text-xs text-charcoal-800 block">નવા બાળકની વિગત ઉમેરો:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="બાળકનું પૂરું નામ *"
                  className="px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:outline-none"
                />
                <input
                  type="text"
                  value={newChildStandard}
                  onChange={(e) => setNewChildStandard(e.target.value)}
                  placeholder="ધોરણ / કોર્સ (દા.ત. ધો. ૧૦)"
                  className="px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:outline-none"
                />
                <input
                  type="text"
                  value={newChildSchool}
                  onChange={(e) => setNewChildSchool(e.target.value)}
                  placeholder="શાળા અથવા કોલેજ"
                  className="px-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddChild}
                className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>બાળક ઉમેરો</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
