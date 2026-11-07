"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HeartHandshake,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  User,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Lock,
  Globe,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import {
  Member,
  MatrimonyProfile,
  SAMITI_NATIVE_PLACES,
  isMemberEligibleForPublicMatrimony,
} from "@/types";

export default function AdminMatrimonyPage() {
  const { members, updateMember, addLog } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");
  const [filterNativePlace, setFilterNativePlace] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "public" | "private" | "ineligible">("all");

  const [selectedCandidate, setSelectedCandidate] = useState<Member | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper check if member is unmarried
  const isMemberUnmarried = (m: Member) => {
    const s = m.marital_status || "";
    return (
      s === "અપરણિત (Unmarried)" ||
      s === "અપરણિત" ||
      s.toLowerCase().includes("unmarried")
    );
  };

  // Helper to get education string
  const getMemberEducation = (m: Member): string => {
    if (!m.education) return "—";
    return (
      m.education.education_details ||
      m.education.education_category ||
      m.education.highest_degree ||
      "—"
    );
  };

  // Helper to get occupation string
  const getMemberOccupation = (m: Member): string => {
    if (m.business?.business_name) return m.business.business_name;
    if (m.employment?.job_title) return m.employment.job_title;
    if (m.employment?.company) return m.employment.company;
    return "—";
  };

  // All candidates with matrimony registered or enabled
  const matrimonyCandidates = members.filter(
    (m) => m.matrimony?.is_available || m.is_available_for_matrimony
  );

  // Statistics
  const totalRegistered = matrimonyCandidates.length;
  const publicActiveCount = matrimonyCandidates.filter((m) =>
    isMemberEligibleForPublicMatrimony(m)
  ).length;
  const privateCount = matrimonyCandidates.filter(
    (m) =>
      isMemberUnmarried(m) &&
      (m.matrimony?.is_public_listing === false || !m.matrimony?.is_saved)
  ).length;
  const ineligibleCount = matrimonyCandidates.filter(
    (m) => !isMemberUnmarried(m)
  ).length;

  // Filtered List
  const filteredList = matrimonyCandidates.filter((m) => {
    const isUnmarried = isMemberUnmarried(m);
    const isPublic = isMemberEligibleForPublicMatrimony(m);

    // Status filter
    if (filterStatus === "public" && !isPublic) return false;
    if (filterStatus === "private" && (isPublic || !isUnmarried)) return false;
    if (filterStatus === "ineligible" && isUnmarried) return false;

    // Gender filter
    if (filterGender !== "all" && m.gender !== filterGender) return false;

    // Native place filter
    if (filterNativePlace !== "all" && m.native_place !== filterNativePlace) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.name.toLowerCase().includes(q);
      const matchPlace = (m.native_place || "").toLowerCase().includes(q);
      const matchCity = (m.city || "").toLowerCase().includes(q);
      const matchPhone = (m.phone || "").includes(q);
      const eduStr = getMemberEducation(m).toLowerCase();
      const occStr = getMemberOccupation(m).toLowerCase();
      if (!matchName && !matchPlace && !matchCity && !matchPhone && !eduStr.includes(q) && !occStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // Toggle Public Listing
  const handleTogglePublicListing = (candidate: Member) => {
    if (!isMemberUnmarried(candidate)) {
      showToast("નિયમ મુજબ માત્ર અપરણિત સભ્યો જ પબ્લિક લિસ્ટિંગમાં મૂકી શકાય.");
      return;
    }

    const currentPublic = candidate.matrimony?.is_public_listing ?? false;
    const newPublic = !currentPublic;

    const defaultPrivacy = {
      show_photo: true,
      show_name: true,
      show_age: true,
      show_native_place: true,
      show_education: true,
      show_occupation: true,
      show_contact: true,
    };

    const updatedMatrimony: MatrimonyProfile = {
      ...(candidate.matrimony || {
        is_available: true,
        privacy: defaultPrivacy,
      }),
      is_available: true,
      is_public_listing: newPublic,
      is_saved: true,
      privacy: candidate.matrimony?.privacy || defaultPrivacy,
    };

    updateMember(candidate.id, {
      is_available_for_matrimony: true,
      matrimony: updatedMatrimony,
    });

    addLog(
      "મેટ્રિમોની પબ્લિક સ્થિતિ બદલી",
      candidate.name,
      `પબ્લિક લિસ્ટિંગ સ્થિતિ: ${newPublic ? "સક્રિય (Active)" : "નિષ્ક્રિય (Private)"}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "admin"
    );

    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate({
        ...candidate,
        is_available_for_matrimony: true,
        matrimony: updatedMatrimony,
      });
    }

    showToast(
      `${candidate.name} ની પબ્લિક લિસ્ટિંગ સ્થિતિ: ${
        newPublic ? "જાહેર (Public)" : "ખાનગી (Private)"
      } કરવામાં આવી.`
    );
  };

  // Opt-out / Deactivate from Matrimony
  const handleDeactivateMatrimony = (candidate: Member) => {
    if (
      !confirm(
        `શું તમે ખરેખર ${candidate.name} નું પ્રોફાઇલ મેટ્રિમોનીમાંથી હટાવવા માંગો છો?`
      )
    ) {
      return;
    }

    const updatedMatrimony = candidate.matrimony
      ? {
          ...candidate.matrimony,
          is_available: false,
          is_public_listing: false,
        }
      : undefined;

    updateMember(candidate.id, {
      is_available_for_matrimony: false,
      matrimony: updatedMatrimony,
    });

    addLog(
      "મેટ્રિમોની પ્રોફાઇલ હટાવી",
      candidate.name,
      "મેટ્રિમોની ઉપલબ્ધતા બંધ કરવામાં આવી.",
      currentUser?.name || "એડમિન",
      currentUser?.role || "admin"
    );

    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate(null);
    }

    showToast(`${candidate.name} નું નામ મેટ્રિમોનીમાંથી હટાવી દેવામાં આવ્યું.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-ivory-600/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-500 hover:text-saffron-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>મુખ્ય એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 text-white shadow-md">
              <HeartHandshake className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
                મેટ્રિમોની સંચાલન (Matrimony Management)
              </h1>
              <p className="text-xs text-charcoal-500 mt-0.5">
                સમાજના મેટ્રિમોની ઉમેદવારોની ચકાસણી, પબ્લિક લિસ્ટિંગ મંજૂરી અને ગોપનીયતા નિયંત્રણ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/matrimony"
            target="_blank"
            className="px-4 py-2 bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>લાઇવ પબ્લિક પેજ જુઓ</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Samaj Bylaw Policy Alert */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs text-charcoal-700 space-y-1">
          <h4 className="font-bold text-amber-950 text-sm">
            સમાજના બંધારણીય નિયમો અને પાત્રતા (Eligibility Rule):
          </h4>
          <p className="leading-relaxed">
            • માત્ર <strong>અપરણિત (Unmarried)</strong> સભ્યો જ વેબસાઇટના પબ્લિક મેટ્રિમોની પોર્ટલ પર દેખાઈ શકે છે.
            <br />
            • જે સભ્ય <strong>સગાઈ થયેલ (Engaged)</strong> અથવા <strong>પરણિત (Married)</strong> હોય તે આપોઆપ લિસ્ટિંગમાંથી બાકાત થાય છે.
            <br />
            • પબ્લિક લિસ્ટિંગ માટે સભ્યની સંમતિ (Public Listing: Yes) અને માહિતી સેવ થયેલ હોવી ફરજિયાત છે.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500">કુલ નોંધણીઓ</span>
            <span className="p-2 rounded-xl bg-charcoal-100 text-charcoal-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 mt-2">
            {totalRegistered}
          </div>
          <span className="text-[11px] text-charcoal-500 font-medium block mt-1">
            મેટ્રિમોની માટે પસંદ કરેલ સભ્યો
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700">પબ્લિક લિસ્ટિંગ સક્રિય</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-2">
            {publicActiveCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            વેબસાઇટ પર મુલાકાતીઓને દૃશ્યમાન
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">ખાનગી / પ્રાઇવેટ પ્રોફાઇલ</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 mt-2">
            {privateCount}
          </div>
          <span className="text-[11px] text-amber-700 font-medium block mt-1">
            પબ્લિક લિસ્ટિંગ અનચેક કરેલ છે
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">અયોગ્ય / બાકાત</span>
            <span className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-rose-800 mt-2">
            {ineligibleCount}
          </div>
          <span className="text-[11px] text-rose-700 font-medium block mt-1">
            પરણિત અથવા સગાઈ થયેલ સભ્યો
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="નામ, ગામ, વ્યવસાય, શિક્ષણ શોધો..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-semibold text-charcoal-800"
            >
              <option value="all">બધી સ્થિતિ (All Statuses)</option>
              <option value="public">પબ્લિક લિસ્ટિંગ સક્રિય (Public Active)</option>
              <option value="private">ખાનગી / આંતરિક (Private / Internal)</option>
              <option value="ineligible">અયોગ્ય (Married / Engaged)</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-semibold text-charcoal-800"
            >
              <option value="all">બંને પક્ષ (All Genders)</option>
              <option value="male">વર પક્ષ (Groom / Male)</option>
              <option value="female">કન્યા પક્ષ (Bride / Female)</option>
            </select>
          </div>

          {/* Native Place Filter */}
          <div>
            <select
              value={filterNativePlace}
              onChange={(e) => setFilterNativePlace(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-ivory-300 rounded-xl bg-white focus:border-rose-500 focus:outline-none font-semibold text-charcoal-800"
            >
              <option value="all">બધા ૩૬ ગામો (All Native Places)</option>
              {SAMITI_NATIVE_PLACES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick status bar */}
        <div className="flex items-center justify-between text-xs text-charcoal-500 pt-2 border-t border-ivory-200">
          <span>
            દર્શાવેલ ઉમેદવારો: <strong>{filteredList.length}</strong> (કુલ {totalRegistered} માંથી)
          </span>
          {(searchQuery || filterGender !== "all" || filterNativePlace !== "all" || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterGender("all");
                setFilterNativePlace("all");
                setFilterStatus("all");
              }}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 transition-colors"
            >
              ફિલ્ટર સાફ કરો (Reset)
            </button>
          )}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 space-y-2">
            <HeartHandshake className="w-10 h-10 mx-auto text-charcoal-300" />
            <h4 className="font-bold text-sm text-charcoal-700">કોઈ ઉમેદવાર મળ્યા નથી</h4>
            <p className="text-xs">તમારા ફિલ્ટર અથવા શોધ શબ્દ બદલીને ફરી પ્રયાસ કરો.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 border-b border-ivory-200 text-charcoal-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ઉમેદવાર</th>
                  <th className="py-3.5 px-4">જાતિ & ઉંમર</th>
                  <th className="py-3.5 px-4">મૂળ વતન</th>
                  <th className="py-3.5 px-4">શિક્ષણ & વ્યવસાય</th>
                  <th className="py-3.5 px-4">વૈવાહિક સ્થિતિ</th>
                  <th className="py-3.5 px-4">મેટ્રિમોની સ્ટેટસ</th>
                  <th className="py-3.5 px-4 text-right">વહીવટી ક્રિયાઓ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200 font-medium text-charcoal-800">
                {filteredList.map((cand) => {
                  const isUnmarried = isMemberUnmarried(cand);
                  const isPublic = isMemberEligibleForPublicMatrimony(cand);

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-ivory-50/70 transition-colors"
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-ivory-200 border border-ivory-300 flex-shrink-0">
                            {cand.photo_url ? (
                              <Image
                                src={cand.photo_url}
                                alt={cand.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-charcoal-900 flex items-center gap-1.5">
                              <span>{cand.name}</span>
                              {cand.gender === "female" ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-pink-50 text-pink-700 border border-pink-200">
                                  કન્યા
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  વર
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-charcoal-500 font-mono">
                              {cand.phone || "નંબર ઉપલબ્ધ નથી"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Gender & Age */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal-800">
                          {cand.gender === "female" ? "સ્ત્રી" : "પુરુષ"}
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          {cand.dob ? `જન્મ: ${cand.dob}` : "જન્મ તારીખ નથી"}
                        </div>
                      </td>

                      {/* Native Place */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-charcoal-900">
                          {cand.native_place || "—"}
                        </span>
                        {cand.city && (
                          <span className="block text-[11px] text-charcoal-500">
                            હાલ: {cand.city}
                          </span>
                        )}
                      </td>

                      {/* Education & Occupation */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal-900 truncate max-w-[160px]">
                          {getMemberEducation(cand)}
                        </div>
                        <div className="text-[11px] text-charcoal-500 truncate max-w-[160px]">
                          {getMemberOccupation(cand)}
                        </div>
                      </td>

                      {/* Marital Status */}
                      <td className="py-3.5 px-4">
                        {isUnmarried ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            અપરણિત (Eligible)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            {cand.marital_status || "પરણિત / સગાઈ"} (Ineligible)
                          </span>
                        )}
                      </td>

                      {/* Matrimony Status */}
                      <td className="py-3.5 px-4">
                        {isPublic ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>પબ્લિક લિસ્ટિંગ સક્રિય</span>
                          </div>
                        ) : isUnmarried ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>ખાનગી / સેવ પેન્ડિંગ</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-charcoal-400 font-semibold text-xs">
                            <span className="w-2 h-2 rounded-full bg-charcoal-300" />
                            <span>લિસ્ટિંગમાંથી બાકાત</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Modal */}
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1.5 text-charcoal-500 hover:text-charcoal-900 hover:bg-ivory-100 rounded-lg transition-colors"
                            title="સંપૂર્ણ વિગતો જુઓ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Public Visibility (If unmarried) */}
                          {isUnmarried && (
                            <button
                              onClick={() => handleTogglePublicListing(cand)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                cand.matrimony?.is_public_listing
                                  ? "text-emerald-700 hover:bg-emerald-50"
                                  : "text-amber-700 hover:bg-amber-50"
                              }`}
                              title={
                                cand.matrimony?.is_public_listing
                                  ? "પબ્લિક લિસ્ટિંગ બંધ કરી ખાનગી બનાવો"
                                  : "પબ્લિક લિસ્ટિંગમાં સક્રિય કરો"
                              }
                            >
                              {cand.matrimony?.is_public_listing ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* Deactivate / Remove */}
                          <button
                            onClick={() => handleDeactivateMatrimony(cand)}
                            className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="મેટ્રિમોનીમાંથી હટાવો"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Dossier Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-ivory-300 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-2xl bg-rose-100 text-rose-800">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-charcoal-900">
                    {selectedCandidate.name}
                  </h3>
                  <span className="text-xs text-charcoal-500">
                    મેટ્રિમોની ઉમેદવાર ચકાસણી પત્રક
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Summary Box */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-ivory-200 border-2 border-white shadow-md flex-shrink-0">
                {selectedCandidate.photo_url ? (
                  <Image
                    src={selectedCandidate.photo_url}
                    alt={selectedCandidate.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-charcoal-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-extrabold text-lg text-charcoal-900">
                    {selectedCandidate.name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCandidate.gender === "female"
                        ? "bg-pink-100 text-pink-800 border border-pink-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {selectedCandidate.gender === "female" ? "કન્યા પક્ષ (Bride)" : "વર પક્ષ (Groom)"}
                  </span>
                </div>

                <div className="text-xs text-charcoal-600 space-y-0.5">
                  <p>
                    <strong>વૈવાહિક સ્થિતિ:</strong> {selectedCandidate.marital_status || "અપરણિત"}
                  </p>
                  <p>
                    <strong>મૂળ વતન:</strong> {selectedCandidate.native_place || "—"} | <strong>હાલ વસવાટ:</strong> {selectedCandidate.city || "—"}
                  </p>
                  <p>
                    <strong>મોબાઇલ:</strong> {selectedCandidate.phone || "નોંધાયેલ નથી"}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal-500 block text-[10px] uppercase">
                  શિક્ષણ & ડિગ્રી
                </span>
                <span className="font-extrabold text-charcoal-900 text-sm">
                  {getMemberEducation(selectedCandidate)}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal-500 block text-[10px] uppercase">
                  વ્યવસાય / નોકરી
                </span>
                <span className="font-extrabold text-charcoal-900 text-sm">
                  {getMemberOccupation(selectedCandidate)}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal-500 block text-[10px] uppercase">
                  પિયરનું નામ (Piyar Name)
                </span>
                <span className="font-semibold text-charcoal-900">
                  {selectedCandidate.piyar_name || "—"}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-200 space-y-1">
                <span className="font-bold text-charcoal-500 block text-[10px] uppercase">
                  સાસરીનું નામ (Sasri Name)
                </span>
                <span className="font-semibold text-charcoal-900">
                  {selectedCandidate.sasri_name || "—"}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-ivory-200 space-y-1 sm:col-span-2">
                <span className="font-bold text-charcoal-500 block text-[10px] uppercase">
                  જીવનસાથીની અપેક્ષા (Partner Expectations)
                </span>
                <p className="text-charcoal-800 leading-relaxed italic">
                  {selectedCandidate.matrimony?.partner_expectations || "કોઈ ખાસ અપેક્ષા નોંધેલ નથી."}
                </p>
              </div>
            </div>

            {/* Candidate Privacy Settings */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-2">
              <h4 className="font-bold text-xs text-charcoal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>સભ્યની પસંદગીય ગોપનીયતા (Privacy Settings):</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-charcoal-700">
                  {selectedCandidate.matrimony?.privacy?.show_photo !== false ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span>ફોટો દર્શાવો</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-700">
                  {selectedCandidate.matrimony?.privacy?.show_contact !== false ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span>મોબાઇલ નંબર</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-700">
                  {selectedCandidate.matrimony?.privacy?.show_native_place !== false ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span>મૂળ વતન</span>
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-700">
                  {selectedCandidate.matrimony?.privacy?.show_education !== false ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span>શિક્ષણ</span>
                </div>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => handleDeactivateMatrimony(selectedCandidate)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                મેટ્રિમોનીમાંથી હટાવો
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isMemberUnmarried(selectedCandidate) && (
                  <button
                    type="button"
                    onClick={() => handleTogglePublicListing(selectedCandidate)}
                    className={`w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                      selectedCandidate.matrimony?.is_public_listing
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white"
                    }`}
                  >
                    {selectedCandidate.matrimony?.is_public_listing ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>ખાનગી કરો (Make Private)</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>પબ્લિક લિસ્ટિંગ સક્રિય કરો</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-charcoal-700 bg-ivory-100 hover:bg-ivory-200 rounded-xl transition-colors"
                >
                  બંધ કરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
