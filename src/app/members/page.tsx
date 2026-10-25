"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Shield,
  Eye,
  Lock,
  Filter,
  UserPlus,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Member } from "@/types";

export default function MembersDirectoryPage() {
  const { members } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedNative, setSelectedNative] = useState("all");
  const [activeModalMember, setActiveModalMember] = useState<Member | null>(null);

  // Extract unique cities & native places for filtering
  const cities = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.city))).filter(Boolean);
  }, [members]);

  const nativePlaces = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.native_place))).filter(Boolean);
  }, [members]);

  // Filter members based on query and dropdowns
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.native_place.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.employment?.company && m.employment.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCity = selectedCity === "all" || m.city === selectedCity;
      const matchNative = selectedNative === "all" || m.native_place === selectedNative;

      return matchSearch && matchCity && matchNative;
    });
  }, [members, searchQuery, selectedCity, selectedNative]);

  // Helper to determine phone visibility
  const canViewPhone = (member: Member) => {
    if (isAdmin || currentUser?.id === member.id) return true;
    if (member.privacy.phone === "public") return true;
    if (member.privacy.phone === "members" && currentUser) return true;
    return false;
  };

  // Helper to determine address visibility
  const canViewAddress = (member: Member) => {
    if (isAdmin || currentUser?.id === member.id) return true;
    if (member.privacy.address === "public") return true;
    if (member.privacy.address === "members" && currentUser) return true;
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સભ્યોની ડિરેક્ટરી (Members Directory)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            અડાઆઠમ દરજી સમાજના નોંધાયેલા પરિવારોના સભ્યોની યાદી અને સંપર્ક માહિતી.
          </p>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <UserPlus className="w-4 h-4" />
          <span>નવા સભ્ય ઉમેરો</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-sm mb-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="નામ, શહેર, વતન અથવા વ્યવસાય શોધો..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-500 font-semibold whitespace-nowrap">હાલનું શહેર:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="py-2 px-3 border border-ivory-300 rounded-xl text-xs font-medium bg-white focus:border-saffron-500 focus:outline-none"
          >
            <option value="all">બધા શહેરો</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Native Place Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-500 font-semibold whitespace-nowrap">મૂળ વતન:</span>
          <select
            value={selectedNative}
            onChange={(e) => setSelectedNative(e.target.value)}
            className="py-2 px-3 border border-ivory-300 rounded-xl text-xs font-medium bg-white focus:border-saffron-500 focus:outline-none"
          >
            <option value="all">બધા વતન</option>
            {nativePlaces.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Role & Privacy Notice Banner */}
      <div className={`mb-6 p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        !currentUser
          ? "bg-amber-50/80 border-amber-200 text-amber-900"
          : isAdmin
          ? "bg-purple-50/80 border-purple-200 text-purple-900"
          : "bg-forest-50/80 border-forest-200 text-forest-900"
      }`}>
        <div className="flex items-start sm:items-center gap-2.5">
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0 text-saffron-700" />
          <div>
            <span>
              <strong>ગોપનીયતા રક્ષણ: </strong>
              {!currentUser ? (
                <span>
                  તમે <strong>અતિથિ (Guest)</strong> તરીકે જોઈ રહ્યા છો — માત્ર જાહેર સભ્યોના ફોન નંબર દેખાશે. સભ્યોના સંપર્કો જોવા માટે લૉગિન કરો.
                </span>
              ) : isAdmin ? (
                <span>
                  તમે <strong>{currentUser.committee_role || "એડમિન હોદ્દેદાર"}</strong> તરીકે જોઈ રહ્યા છો — વહીવટી અધિકાર હેઠળ તમામ સંપર્કો માન્ય છે.
                </span>
              ) : (
                <span>
                  તમે <strong>નોંધાયેલ સભ્ય ({currentUser.name.split(" ")[0]})</strong> તરીકે લૉગિન છો — સભ્યો માટે મંજૂર સંપર્ક વિગતો ખુલ્લી છે.
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          {!currentUser ? (
            <Link
              href="/login"
              className="px-3 py-1 rounded-lg bg-saffron-600 text-white font-bold text-[11px] hover:bg-saffron-700 transition-colors shadow-2xs"
            >
              સભ્ય લૉગિન કરો →
            </Link>
          ) : (
            <span className="text-[11px] font-bold bg-white px-2.5 py-1 rounded-lg border border-ivory-300">
              {isAdmin ? "🛡️ એડમિન ઍક્સેસ" : "👤 સભ્ય મોડ"}
            </span>
          )}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map((member) => {
          const hasPhoneAccess = canViewPhone(member);
          const hasAddressAccess = canViewAddress(member);

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-ivory-300 p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-ivory-300 group-hover:border-saffron-400 transition-colors"
                    />
                    {member.is_lifetime_member && (
                      <span
                        className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs"
                        title="આજીવન સભ્ય"
                      >
                        ★
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full inline-block mb-1">
                      {member.committee_role || "સભ્ય"}
                    </span>
                    <h3 className="font-bold text-sm text-charcoal-900 group-hover:text-saffron-700 transition-colors truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-saffron-600 flex-shrink-0" />
                      <span className="truncate">{member.city} ({member.native_place})</span>
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 pt-2 border-t border-ivory-200 text-xs text-charcoal-600">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-500 text-[11px]">સંપર્ક:</span>
                    {hasPhoneAccess ? (
                      <a href={`tel:${member.phone}`} className="font-bold text-forest-800 hover:underline">
                        {member.phone}
                      </a>
                    ) : (
                      <span className="text-charcoal-400 italic text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3" /> ખાનગી
                      </span>
                    )}
                  </div>

                  {member.employment && (
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-500 text-[11px]">વ્યવસાય:</span>
                      <span className="font-medium text-charcoal-800 truncate max-w-[150px]">
                        {member.employment.job_title}
                      </span>
                    </div>
                  )}

                  {member.education && (
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-500 text-[11px]">શિક્ષણ:</span>
                      <span className="font-medium text-charcoal-800 truncate max-w-[150px]">
                        {member.education.highest_degree}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs">
                {currentUser ? (
                  <Link
                    href={`/family-tree`}
                    className="text-forest-700 font-bold hover:underline"
                  >
                    પરિવાર વૃક્ષ →
                  </Link>
                ) : (
                  <span className="text-[11px] text-charcoal-400 font-medium">
                    અડાઆઠમ દરજી સમાજ
                  </span>
                )}
                <button
                  onClick={() => setActiveModalMember(member)}
                  className="px-3 py-1 bg-ivory-100 hover:bg-saffron-50 text-saffron-800 font-bold rounded-lg border border-ivory-300 hover:border-saffron-300 transition-colors"
                >
                  વિગતો
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-ivory-300">
          <p className="text-sm font-bold text-charcoal-700">કોઈ સભ્ય મળ્યો નથી.</p>
          <p className="text-xs text-charcoal-500 mt-1">કૃપા કરીને અન્ય નામ અથવા ફિલ્ટર પસંદ કરો.</p>
        </div>
      )}

      {/* Member Details Modal */}
      {activeModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
              <span className="text-xs font-bold text-saffron-700 uppercase tracking-wider">
                સભ્ય પરિચય
              </span>
              <button
                onClick={() => setActiveModalMember(null)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            </div>

            <div className="py-4 text-center">
              <img
                src={activeModalMember.photo_url}
                alt={activeModalMember.name}
                className="w-24 h-24 rounded-2xl object-cover mx-auto border-3 border-saffron-500 shadow-md mb-2"
              />
              <h3 className="font-bold text-lg text-charcoal-900">{activeModalMember.name}</h3>
              <p className="text-xs font-semibold text-saffron-800">
                {activeModalMember.committee_role || "સમાજ સભ્ય"}
              </p>
            </div>

            <div className="space-y-3 text-xs border-t border-ivory-200 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-[11px] text-charcoal-500 block">મૂળ વતન:</span>
                  <span className="font-bold text-charcoal-900">{activeModalMember.native_place}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-[11px] text-charcoal-500 block">હાલનું શહેર:</span>
                  <span className="font-bold text-charcoal-900">{activeModalMember.city} ({activeModalMember.district})</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] text-charcoal-500 block">સરનામું:</span>
                {canViewAddress(activeModalMember) ? (
                  <span className="font-medium text-charcoal-900">
                    {activeModalMember.address}, {activeModalMember.city} - {activeModalMember.pincode}
                  </span>
                ) : (
                  <span className="text-charcoal-400 italic">ગોપનીય (માત્ર મંજૂર પરિવાર માટે)</span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                <span className="text-[11px] text-charcoal-500 block">સંપર્ક નંબર:</span>
                {canViewPhone(activeModalMember) ? (
                  <span className="font-bold text-forest-800">{activeModalMember.phone}</span>
                ) : (
                  <span className="text-charcoal-400 italic">ગોપનીય (ખાનગી રાખેલ છે)</span>
                )}
              </div>

              {activeModalMember.employment && (
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-[11px] text-charcoal-500 block">વ્યવસાય / કંપની:</span>
                  <span className="font-bold text-charcoal-900 block">
                    {activeModalMember.employment.company} — {activeModalMember.employment.job_title}
                  </span>
                  <span className="text-charcoal-600 block mt-0.5">
                    ક્ષેત્ર: {activeModalMember.employment.industry} (અનુભવ: {activeModalMember.employment.experience_years})
                  </span>
                </div>
              )}

              {activeModalMember.education && (
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-[11px] text-charcoal-500 block">શૈક્ષણિક વિગતો:</span>
                  <span className="font-bold text-charcoal-900 block">
                    {activeModalMember.education.highest_degree} ({activeModalMember.education.field_of_study})
                  </span>
                  <span className="text-charcoal-600 block mt-0.5">
                    સંસ્થા: {activeModalMember.education.institution} (ઉત્તીર્ણ વર્ષ: {activeModalMember.education.passing_year})
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setActiveModalMember(null)}
                className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl text-xs font-semibold hover:bg-ivory-100"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
