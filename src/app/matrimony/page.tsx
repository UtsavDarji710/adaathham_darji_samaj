"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  HeartHandshake,
  Shield,
  Search,
  Filter,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  Phone,
  Lock,
  ArrowRight,
  X,
  Sparkles,
  UserCheck,
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import {
  Member,
  SAMITI_NATIVE_PLACES,
  SAMITI_EDUCATION_CATEGORIES,
  isMemberEligibleForPublicMatrimony,
} from "@/types";
import { UserAvatar } from "@/components/UserAvatar";

function calculateAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 && age < 120 ? age : null;
}

export default function PublicMatrimonyPage() {
  const { members } = useData();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
  const [selectedNativePlace, setSelectedNativePlace] = useState("all");
  const [selectedEducation, setSelectedEducation] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Member | null>(null);

  // Strictly filter members eligible for Public Matrimony Listing:
  // 1. Marital status === Unmarried (Engaged and Married are strictly excluded)
  // 2. Matrimony Enabled === true
  // 3. Public Listing Consent === true
  // 4. Details Saved === true
  const eligibleCandidates = members.filter((m) => isMemberEligibleForPublicMatrimony(m));

  // Count by side for quick filters
  const maleCount = eligibleCandidates.filter((c) => c.gender === "male").length;
  const femaleCount = eligibleCandidates.filter((c) => c.gender === "female").length;

  // Apply User UI Filters (Gender, Native Place, Education, Search)
  const filteredCandidates = eligibleCandidates.filter((cand) => {
    // Gender Filter
    if (selectedGender !== "all" && cand.gender !== selectedGender) {
      return false;
    }

    // Native Place Filter
    if (selectedNativePlace !== "all" && cand.native_place !== selectedNativePlace) {
      return false;
    }

    // Education Filter
    if (selectedEducation !== "all") {
      const eduCategory = cand.education?.education_category || "";
      const eduDetails = cand.education?.education_details || cand.education?.highest_degree || "";
      if (
        !eduCategory.toLowerCase().includes(selectedEducation.toLowerCase()) &&
        !eduDetails.toLowerCase().includes(selectedEducation.toLowerCase())
      ) {
        return false;
      }
    }

    // Search Query (Search Name only if name is public, native place, education, job)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const priv = cand.matrimony?.privacy;
      const nameMatch = priv?.show_name !== false && cand.name.toLowerCase().includes(q);
      const placeMatch = priv?.show_native_place !== false && cand.native_place.toLowerCase().includes(q);
      const cityMatch = cand.city.toLowerCase().includes(q);
      const eduMatch =
        priv?.show_education !== false &&
        ((cand.education?.highest_degree || "").toLowerCase().includes(q) ||
          (cand.education?.education_details || "").toLowerCase().includes(q));
      const jobMatch =
        priv?.show_occupation !== false &&
        ((cand.employment?.job_title || "").toLowerCase().includes(q) ||
          (cand.employment?.company || "").toLowerCase().includes(q) ||
          (cand.business?.business_name || "").toLowerCase().includes(q));

      if (!nameMatch && !placeMatch && !cityMatch && !eduMatch && !jobMatch) {
        return false;
      }
    }

    return true;
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setSelectedNativePlace("all");
    setSelectedEducation("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-ivory-50 to-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-900 via-rose-800 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-rose-700/40">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/20 via-pink-400/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/30 border border-rose-400/40 text-rose-200 text-xs font-bold">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>સત્તાવાર સામાજિક મેટ્રિમોની મંચ • અડાઆઠમ દરજી સમાજ</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                લગ્ન વિષયક ડિરેક્ટરી (Matrimony Directory)
              </h1>

              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed max-w-xl">
                સમાજના સુશિક્ષિત અને સંસ્કારી યુવક-યુવતીઓ માટે યોગ્ય જીવનસાથીની શોધ માટેનું પારદર્શક, સુરક્ષિત અને સંમતિ આધારિત પોર્ટલ.
              </p>

              {/* Trust & Policy Highlights */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-rose-100 text-[11px] font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>માત્ર અપરણિત (Unmarried) સભ્યો</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-rose-100 text-[11px] font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>૧૦૦% સંમતિ આપેલ &amp; ગોપનીયતા સુરક્ષિત</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-rose-100 text-[11px] font-semibold">
                  <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                  <span>કુલ ઉપલબ્ધ પાત્રો: {eligibleCandidates.length}</span>
                </span>
              </div>
            </div>

            {/* Right Action Button for Members */}
            <div className="flex flex-col gap-2.5 self-start md:self-auto flex-shrink-0">
              {currentUser ? (
                <Link
                  href="/profile"
                  className="px-5 py-3 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-600 group-hover:scale-110 transition-transform" />
                  <span>મારી મેટ્રિમોની પ્રોફાઇલ / સેટિંગ્સ</span>
                  <ArrowRight className="w-4 h-4 text-rose-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2.5 rounded-xl bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-rose-600" />
                    <span>લૉગિન કરો</span>
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs border border-rose-500 shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>પ્રોફાઇલ નોંધણી કરો</span>
                  </Link>
                </div>
              )}
              <span className="text-[10px] text-rose-200 text-center">
                સભ્ય ગમે ત્યારે પબ્લિક લિસ્ટિંગમાંથી નામ હટાવી શકે છે.
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS SECTION */}
        <div className="bg-white rounded-3xl border border-ivory-300 p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory-200">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-charcoal-900">
                ઉમેદવાર ફિલ્ટર્સ &amp; શોધ (Search &amp; Filters)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal-500">
                પરિણામો: <strong className="text-rose-700">{filteredCandidates.length}</strong> પાત્રો
              </span>
              {(searchTerm || selectedGender !== "all" || selectedNativePlace !== "all" || selectedEducation !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 underline ml-2 cursor-pointer"
                >
                  ફિલ્ટર્સ સાફ કરો (Reset)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                શોધો (નામ, મૂળ વતન, શિક્ષણ, વ્યવસાય)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="દા.ત. અડાઆઠમ, એન્જિનિયર, બી.ટેક., ડૉક્ટર..."
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Native Place Dropdown (36 Native Places) */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                મૂળ વતન (Native Place)
              </label>
              <select
                value={selectedNativePlace}
                onChange={(e) => setSelectedNativePlace(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-medium text-charcoal-800"
              >
                <option value="all">તમામ ૩૬ ગામો (All Native Places)</option>
                {SAMITI_NATIVE_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                શિક્ષણ (Education Category)
              </label>
              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-medium text-charcoal-800"
              >
                <option value="all">તમામ શિક્ષણ સ્તર (All Education)</option>
                {SAMITI_EDUCATION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Gender / Side Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-ivory-200 overflow-x-auto">
            <span className="text-[11px] font-bold text-charcoal-600 mr-1 flex-shrink-0">
              પક્ષ પસંદ કરો:
            </span>
            <button
              type="button"
              onClick={() => setSelectedGender("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedGender === "all"
                  ? "bg-charcoal-900 text-white shadow-xs"
                  : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200"
              }`}
            >
              <span>બધા ઉમેદવારો</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {eligibleCandidates.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender("male")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedGender === "male"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <span>વર પક્ષ (Groom)</span>
              <span className="text-[10px] bg-blue-200/50 px-1.5 py-0.2 rounded-full">
                {maleCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender("female")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                selectedGender === "female"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200"
              }`}
            >
              <span>કન્યા પક્ષ (Bride)</span>
              <span className="text-[10px] bg-pink-200/50 px-1.5 py-0.2 rounded-full">
                {femaleCount}
              </span>
            </button>
          </div>
        </div>

        {/* CANDIDATE CARDS GRID */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-rose-300 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-charcoal-900">
                {eligibleCandidates.length === 0
                  ? "હાલમાં કોઈ મેટ્રિમોની ઉમેદવાર નોંધાયેલ નથી"
                  : "કોઈ મેળ ખાતા ઉમેદવાર મળ્યા નથી"}
              </h3>
              <p className="text-xs text-charcoal-500 mt-1 max-w-md mx-auto leading-relaxed">
                {eligibleCandidates.length === 0
                  ? "મેટ્રિમોની મંચ માત્ર અપરણિત (Unmarried) સભ્યો માટે છે જેમણે સ્વેચ્છાએ પબ્લિક લિસ્ટિંગ માટે સંમતિ આપી હોય. જો આપ અપરણિત સભ્ય છો, તો આપની પ્રોફાઇલમાંથી મેટ્રિમોની વિગતો ભરીને લિસ્ટિંગ સક્રિય કરી શકો છો."
                  : "આપના ફિલ્ટર્સ મુજબ હાલમાં કોઈ પ્રોફાઇલ ઉપલબ્ધ નથી. કૃપા કરીને ફિલ્ટર્સ સાફ કરો અથવા અન્ય ગામ પસંદ કરો."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {eligibleCandidates.length === 0 ? (
                currentUser ? (
                  <Link
                    href="/profile"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>પ્રોફાઇલમાં મેટ્રિમોની વિગત ઉમેરો</span>
                  </Link>
                ) : (
                  <Link
                    href="/login?redirect=/matrimony"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>લૉગિન કરીને ઉમેદવારી નોંધાવો</span>
                  </Link>
                )
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  તમામ ઉમેદવારો દર્શાવો
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCandidates.map((candidate) => {
              const priv = candidate.matrimony?.privacy || {
                show_name: true,
                show_photo: true,
                show_age: true,
                show_native_place: true,
                show_education: true,
                show_occupation: true,
                show_contact: true,
              };

              const displayName = priv.show_name ? candidate.name : "ગોપનીય ઉમેદવાર (Confidential)";
              const displayPhoto = priv.show_photo ? candidate.photo_url : null;
              const displayPlace = priv.show_native_place ? candidate.native_place : "ગોપનીય";
              const displayEdu = priv.show_education
                ? candidate.education?.education_details ||
                  candidate.education?.highest_degree ||
                  "શિક્ષિત"
                : "ગોપનીય";
              const displayJob = priv.show_occupation
                ? candidate.employment?.job_title ||
                  candidate.business?.business_name ||
                  candidate.employment?.company ||
                  "સેવા / વ્યવસાય"
                : "ગોપનીય";
              const age = priv.show_age ? calculateAge(candidate.dob) : null;

              const isBride = candidate.gender === "female";

              return (
                <div
                  key={candidate.id}
                  className="bg-white rounded-3xl border border-ivory-300 hover:border-rose-400 hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Decorative Color Top Ribbon */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isBride
                        ? "bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600"
                        : "bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600"
                    }`}
                  />

                  <div>
                    {/* Header: Photo + Gender Badge + Name */}
                    <div className="flex items-start gap-3.5 mb-3.5 pt-1">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-ivory-200 bg-ivory-100 flex-shrink-0 shadow-xs">
                        {priv.show_photo === false ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 text-rose-700">
                            <Lock className="w-6 h-6 mb-1" />
                            <span className="text-[9px] font-bold">ફોટો ગોપનીય</span>
                          </div>
                        ) : (
                          <UserAvatar
                            src={candidate.photo_url}
                            alt={displayName}
                            className="w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              isBride
                                ? "bg-pink-100 text-pink-800 border border-pink-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {isBride ? "કન્યા પક્ષ (Bride)" : "વર પક્ષ (Groom)"}
                          </span>
                          {age && (
                            <span className="text-[10px] font-bold bg-ivory-100 text-charcoal-700 px-2 py-0.5 rounded-full border border-ivory-200">
                              {age} વર્ષ
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900 mt-1 truncate">
                          {displayName}
                        </h3>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-500">
                          <span className="flex items-center gap-1 font-semibold text-charcoal-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            <span>{displayPlace}</span>
                          </span>
                          {candidate.matrimony?.height && (
                            <>
                              <span>•</span>
                              <span>{candidate.matrimony.height}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="space-y-2 py-3 border-t border-b border-ivory-200 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] text-charcoal-500 flex items-center gap-1 flex-shrink-0">
                          <GraduationCap className="w-3.5 h-3.5 text-forest-700" />
                          <span>શિક્ષણ:</span>
                        </span>
                        <span className="font-bold text-charcoal-900 text-right truncate">
                          {displayEdu}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] text-charcoal-500 flex items-center gap-1 flex-shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                          <span>વ્યવસાય/નોકરી:</span>
                        </span>
                        <span className="font-bold text-charcoal-900 text-right truncate">
                          {displayJob}
                        </span>
                      </div>

                      {candidate.father_name && priv.show_contact && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] text-charcoal-500 flex items-center gap-1 flex-shrink-0">
                            <Users className="w-3.5 h-3.5 text-charcoal-600" />
                            <span>વાલી / પિતા:</span>
                          </span>
                          <span className="font-semibold text-charcoal-800 text-right truncate text-[11px]">
                            {candidate.father_name}
                          </span>
                        </div>
                      )}

                      {candidate.matrimony?.partner_expectations && (
                        <div className="pt-1.5 text-[11px] text-charcoal-600 italic line-clamp-2 bg-ivory-50/70 p-2 rounded-xl">
                          &ldquo;{candidate.matrimony.partner_expectations}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-2 flex items-center justify-between gap-2">
                    {priv.show_contact && candidate.phone ? (
                      <a
                        href={`tel:${candidate.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold text-xs border border-forest-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="સંપર્ક કરો"
                      >
                        <Phone className="w-3.5 h-3.5 text-forest-700" />
                        <span>{candidate.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-charcoal-400 italic flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>સંપર્ક ગોપનીય</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer ml-auto group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
                    >
                      <span>વિગતો જુઓ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* POLICY & SECURITY INFORMATION BOX */}
        <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
            <Shield className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-charcoal-900">
              મેટ્રિમોની પાત્રતા નિયમો &amp; ગોપનીયતા માર્ગદર્શિકા (Guidelines)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-charcoal-700">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="font-bold text-rose-950 block text-xs">
                ૧. માત્ર અપરણિત (Unmarried) સભ્યો
              </span>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                મેટ્રિમોની લિસ્ટિંગમાં માત્ર અપરણિત સભ્યો જ આવી શકે છે. સગાઈ થયેલ (Engaged) કે પરણિત (Married) સભ્યોની લિસ્ટિંગ સંપૂર્ણપણે પ્રતિબંધિત છે.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
              <span className="font-bold text-amber-950 block text-xs">
                ૨. સભ્યની સ્વેચ્છા &amp; સંમતિ
              </span>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                જ્યારે સભ્ય પોતાના પ્રોફાઇલમાં &apos;મેટ્રિમોની&apos; અને &apos;Public Listing&apos; બંને માટે હા પસંદ કરે અને સાચવે ત્યારે જ પ્રોફાઇલ જાહેર લિસ્ટિંગમાં આવે છે.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <span className="font-bold text-emerald-950 block text-xs">
                ૩. ગમે ત્યારે પ્રોફાઇલ હટાવવાની છૂટ
              </span>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                સભ્ય પોતાની પ્રોફાઇલમાંથી કોઈપણ સમયે Public Listing ઓપ્શન બંધ કરીને લિસ્ટિંગમાંથી તરત જ પોતાનું નામ દૂર કરી શકે છે.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CANDIDATE DETAILS MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-ivory-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-base">
                  મેટ્રિમોની ઉમેદવાર સંપૂર્ણ વિગત
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-ivory-200">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-rose-200 bg-rose-50 flex-shrink-0 shadow-sm">
                  {selectedCandidate.matrimony?.privacy?.show_photo === false ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-rose-700">
                      <Lock className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold">ફોટો ગોપનીય</span>
                    </div>
                  ) : (
                    <UserAvatar
                      src={selectedCandidate.photo_url}
                      alt={selectedCandidate.name}
                      className="w-full h-full rounded-2xl"
                    />
                  )}
                </div>

                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                      selectedCandidate.gender === "female"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedCandidate.gender === "female" ? "કન્યા પક્ષ (Bride)" : "વર પક્ષ (Groom)"}
                  </span>
                  <h4 className="font-extrabold text-base text-charcoal-900">
                    {selectedCandidate.matrimony?.privacy?.show_name !== false
                      ? selectedCandidate.name
                      : "ગોપનીય ઉમેદવાર (Confidential Candidate)"}
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    મૂળ વતન:{" "}
                    <strong>
                      {selectedCandidate.matrimony?.privacy?.show_native_place !== false
                        ? selectedCandidate.native_place
                        : "ગોપનીય"}
                    </strong>{" "}
                    • હાલ: {selectedCandidate.city}
                  </p>
                </div>
              </div>

              {/* Bio Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">ઉંમર (Age)</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidate.matrimony?.privacy?.show_age !== false
                      ? calculateAge(selectedCandidate.dob)
                        ? `${calculateAge(selectedCandidate.dob)} વર્ષ`
                        : "માહિતી નથી"
                      : "ગોપનીય"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">ઊંચાઈ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidate.matrimony?.height || "માહિતી નથી"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">વાન / રંગરૂપ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidate.matrimony?.complexion || "માહિતી નથી"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl">
                  <span className="text-[11px] text-charcoal-500 block">શિક્ષણ</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidate.matrimony?.privacy?.show_education !== false
                      ? selectedCandidate.education?.education_details ||
                        selectedCandidate.education?.highest_degree ||
                        "શિક્ષિત"
                      : "ગોપનીય"}
                  </span>
                </div>
                <div className="p-3 bg-ivory-50 rounded-xl col-span-2">
                  <span className="text-[11px] text-charcoal-500 block">નોકરી / વ્યવસાય</span>
                  <span className="font-bold text-charcoal-900">
                    {selectedCandidate.matrimony?.privacy?.show_occupation !== false
                      ? selectedCandidate.employment?.job_title ||
                        selectedCandidate.business?.business_name ||
                        "સેવા / વ્યવસાય"
                      : "ગોપનીય"}
                  </span>
                </div>
              </div>

              {/* About candidate */}
              {selectedCandidate.matrimony?.about_me && (
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200">
                  <span className="font-bold text-xs text-rose-950 block mb-1">
                    ઉમેદવાર વિશે (About Me):
                  </span>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    {selectedCandidate.matrimony.about_me}
                  </p>
                </div>
              )}

              {/* Partner expectations */}
              {selectedCandidate.matrimony?.partner_expectations && (
                <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <span className="font-bold text-xs text-amber-950 block mb-1">
                    અપેક્ષિત જીવનસાથી (Partner Expectations):
                  </span>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    {selectedCandidate.matrimony.partner_expectations}
                  </p>
                </div>
              )}

              {/* Contact information */}
              <div className="pt-2">
                {selectedCandidate.matrimony?.privacy?.show_contact !== false ? (
                  <div className="p-4 bg-forest-50/90 rounded-2xl border border-forest-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-forest-800 font-semibold block">
                        સંપર્ક નંબર
                      </span>
                      <span className="font-extrabold text-base text-forest-950">
                        {selectedCandidate.phone}
                      </span>
                      {selectedCandidate.father_name && (
                        <span className="text-[11px] text-charcoal-600 block mt-0.5">
                          વાલી / પિતા: {selectedCandidate.father_name}
                        </span>
                      )}
                    </div>
                    <a
                      href={`tel:${selectedCandidate.phone}`}
                      className="px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>કૉલ કરો</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-ivory-100 rounded-2xl border border-ivory-300 text-center text-xs text-charcoal-600 space-y-1">
                    <Lock className="w-5 h-5 text-charcoal-400 mx-auto" />
                    <p className="font-bold text-charcoal-800">
                      આ ઉમેદવારની સંપર્ક વિગતો ગોપનીય રાખેલ છે.
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      વધુ માહિતી કે સંબંધ માટે અડાઆઠમ દરજી સેવા સમિતિના કન્વીનર અથવા એડમિનનો સંપર્ક કરો.
                    </p>
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

