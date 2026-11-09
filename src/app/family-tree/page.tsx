"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  Shield,
  ShieldCheck,
  Lock,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Heart,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building,
  Home,
  CheckCircle,
  LogIn,
  Eye,
  EyeOff,
  Filter,
  GitFork,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Member, RelationshipType } from "@/types";

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: "પિતા (Father)",
  mother: "માતા (Mother)",
  husband: "પતિ (Husband)",
  wife: "પત્ની (Wife)",
  son: "પુત્ર (Son)",
  daughter: "પુત્રી (Daughter)",
  brother: "ભાઈ (Brother)",
  sister: "બહેન (Sister)",
  father_in_law: "સસરા (Father-in-law)",
  mother_in_law: "સાસુ (Mother-in-law)",
  sister_in_law_nanand: "નણંદ (Husband's Sister)",
  sister_in_law_bhabhi: "ભાભી (Brother's Wife)",
  brother_in_law_banevi: "બનેવી (Sister's Husband)",
  uncle_paternal: "કાકા (Paternal Uncle)",
  aunt_paternal: "કાકી (Paternal Aunt)",
  uncle_maternal: "મામા (Maternal Uncle)",
  aunt_maternal: "મામી (Maternal Aunt)",
  nephew: "ભત્રીજો (Nephew)",
  niece: "ભત્રીજી (Niece)",
  other: "સંબંધી (Relative)",
};

interface DisplayFamilyRelation {
  id: string;
  name: string;
  relationLabel: string;
  phone?: string;
  photo_url?: string | null;
  isRegisteredMember: boolean;
  member?: Member;
  native_place?: string;
  city?: string;
}

export default function FamilyTreePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-charcoal-500 text-sm">
          પરિવાર વૃક્ષ લોડ થઈ રહ્યું છે...
        </div>
      }
    >
      <FamilyTreeContent />
    </Suspense>
  );
}

function FamilyTreeContent() {
  const { members, relationships, businesses } = useData();
  const { currentUser, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const urlMemberId = searchParams.get("memberId") || searchParams.get("id");

  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Sync with URL query parameter
  useEffect(() => {
    if (urlMemberId) {
      setActiveMemberId(urlMemberId);
      setExpandedMemberId(urlMemberId);
    }
  }, [urlMemberId]);

  // Determine active member:
  // Priority: activeMemberId state -> urlMemberId -> currentUser
  const activeMember = useMemo(() => {
    const targetId = activeMemberId || urlMemberId;
    if (targetId) {
      const found = members.find((m) => m.id === targetId);
      if (found) return found;
    }
    return currentUser || null;
  }, [activeMemberId, urlMemberId, members, currentUser]);

  const isViewingSelf = Boolean(currentUser && activeMember && currentUser.id === activeMember.id);

  // Unique native places for quick filter
  const nativePlaces = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.native_place) set.add(m.native_place);
    });
    return Array.from(set);
  }, [members]);

  // Search logic: Requirement 5: "Do not display the complete family database publicly by default. Visitors should first search for a family/member."
  const isSearchActive = searchQuery.trim().length > 0 || selectedVillage !== "all";

  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];

    const q = searchQuery.toLowerCase().trim();

    return members.filter((m) => {
      // Village filter
      if (selectedVillage !== "all" && m.native_place !== selectedVillage) {
        return false;
      }

      if (!q) return true;

      const nameMatch = m.name?.toLowerCase().includes(q);
      const villageMatch = m.native_place?.toLowerCase().includes(q);
      const cityMatch = m.city?.toLowerCase().includes(q);
      const sasriMatch = m.sasri_name?.toLowerCase().includes(q);
      const piyarMatch = m.piyar_name?.toLowerCase().includes(q);
      const phoneMatch = (isAdmin || currentUser) && m.phone?.includes(q);

      return nameMatch || villageMatch || cityMatch || sasriMatch || piyarMatch || phoneMatch;
    });
  }, [members, searchQuery, selectedVillage, isSearchActive, isAdmin, currentUser]);

  // Helper to get connected family members for a member (from profile relations & approved links)
  const getFamilyMembers = (memberId: string): DisplayFamilyRelation[] => {
    const targetMember =
      members.find((m) => m.id === memberId) ||
      (currentUser?.id === memberId ? currentUser : null);

    const result: DisplayFamilyRelation[] = [];
    const seenNames = new Set<string>();

    // 1. Direct family relations saved in member profile (family_relations JSONB array)
    if (targetMember && Array.isArray(targetMember.family_relations)) {
      targetMember.family_relations.forEach((rel, idx) => {
        if (rel && rel.name && rel.name.trim()) {
          const cleanName = rel.name.trim();
          seenNames.add(cleanName.toLowerCase());

          const matchedMember = members.find(
            (m) =>
              m.id !== memberId &&
              (m.name.toLowerCase() === cleanName.toLowerCase() ||
                (rel.phone && m.phone && m.phone.replace(/\D/g, "") === rel.phone.replace(/\D/g, "")))
          );

          result.push({
            id: rel.id || `profile-rel-${idx}`,
            name: cleanName,
            relationLabel: rel.relation || "સંબંધી (Relative)",
            phone: rel.phone || (matchedMember ? matchedMember.phone : undefined),
            photo_url: matchedMember?.photo_url || null,
            isRegisteredMember: !!matchedMember,
            member: matchedMember,
            native_place: rel.native_place || matchedMember?.native_place,
            city: rel.city || matchedMember?.city,
          });
        }
      });
    }

    // 2. Direct father_name / grandfather_name from registration/profile
    if (targetMember?.father_name && targetMember.father_name.trim()) {
      const fName = targetMember.father_name.trim();
      if (!seenNames.has(fName.toLowerCase())) {
        seenNames.add(fName.toLowerCase());
        const matched = members.find((m) => m.name.toLowerCase() === fName.toLowerCase());
        result.push({
          id: `father-${targetMember.id}`,
          name: fName,
          relationLabel: "પિતા (Father)",
          phone: matched?.phone,
          photo_url: matched?.photo_url || null,
          isRegisteredMember: !!matched,
          member: matched,
          native_place: matched?.native_place || targetMember.native_place,
          city: matched?.city || targetMember.city,
        });
      }
    }

    // 3. Approved peer-to-peer relationships (family_relationships)
    const relatedLinks = relationships.filter(
      (r) => (r.from_member_id === memberId || r.to_member_id === memberId) && r.status === "approved"
    );

    relatedLinks.forEach((rel) => {
      const isFrom = rel.from_member_id === memberId;
      const otherId = isFrom ? rel.to_member_id : rel.from_member_id;
      const otherMember = members.find((m) => m.id === otherId);

      if (otherMember && otherMember.name && !seenNames.has(otherMember.name.trim().toLowerCase())) {
        seenNames.add(otherMember.name.trim().toLowerCase());

        let relationLabel = rel.relationship_label || RELATIONSHIP_LABELS[rel.relationship] || rel.relationship;
        if (!isFrom) {
          if (rel.relationship === "father") relationLabel = "સંતાન (Child)";
          else if (rel.relationship === "son") relationLabel = "પિતા/માતા (Parent)";
          else if (rel.relationship === "husband") relationLabel = "પત્ની (Wife)";
          else if (rel.relationship === "wife") relationLabel = "પતિ (Husband)";
        }

        result.push({
          id: rel.id,
          name: otherMember.name.trim(),
          relationLabel,
          phone: otherMember.phone,
          photo_url: otherMember.photo_url || null,
          isRegisteredMember: true,
          member: otherMember,
          native_place: otherMember.native_place,
          city: otherMember.city,
        });
      }
    });

    return result;
  };

  // Helper to determine if a member's contact/address is visible
  const canViewPersonalDetails = (member: Member) => {
    if (isAdmin) return true;
    if (currentUser?.id === member.id) return true;
    if (member.is_public_in_family === false && !currentUser) return false;
    if (member.privacy?.phone === "private" && currentUser?.id !== member.id) return false;
    if (member.privacy?.phone === "members" && !currentUser) return false;
    return true;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-saffron-50 via-ivory-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-saffron-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-saffron-600 text-white shadow-xs">
                <Users className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                પરિવાર શોધ & ડિરેક્ટરી (Family Search)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-2xl leading-relaxed">
              અડાઆઠમ દરજી સેવા સમિતિના પરિવારોની વિગતો જોવા માટે નીચે આપેલા સર્ચ બોક્સમાં નામ, ગામ, સાસરી કે પિયરનું નામ શોધો.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-charcoal-600 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-ivory-300 w-max">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>ગોપનીયતા સુરક્ષિત પ્લેટફોર્મ</span>
          </div>
        </div>
      </div>

      {/* SEARCH BOX & VILLAGE FILTER CONTROLS */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-saffron-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="પરિવાર અથવા સભ્યનું નામ, પિતાનું નામ, ગામ, સાસરી કે પિયરનું નામ દાખલ કરો..."
              className="w-full pl-11 pr-4 py-3 border border-ivory-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-saffron-500 font-medium bg-ivory-50/50 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-xs text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            )}
          </div>

          {/* Village Filter Dropdown */}
          <div className="md:w-64">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-4 py-3 border border-ivory-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-saffron-500 bg-white text-charcoal-800"
            >
              <option value="all">બધા ગામ (All Villages)</option>
              {nativePlaces.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-charcoal-500 font-medium">ઝડપી શોધ:</span>
          {["અડાઆઠમ", "મોડાસા", "અમદાવાદ", "હિંમતનગર", "ભાવિન દરજી"].map((term) => (
            <button
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-2.5 py-1 rounded-lg bg-ivory-100 hover:bg-saffron-50 hover:text-saffron-800 text-charcoal-700 text-[11px] font-semibold border border-ivory-200 transition-colors"
            >
              {term}
            </button>
          ))}
          {isSearchActive && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedVillage("all");
              }}
              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[11px] font-bold hover:bg-red-100 transition-colors ml-auto"
            >
              ફિલ્ટર સાફ કરો
            </button>
          )}
        </div>
      </div>

      {/* REQUIREMENT 5: INITIAL STATE */}
      {!isSearchActive && (
        <div className="space-y-6">
          {/* If an active member is selected (either from URL or state) AND it's NOT self:
              Show the selected member's family card prominently at the TOP! */}
          {activeMember && !isViewingSelf && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-charcoal-900 flex items-center gap-2">
                    <GitFork className="w-5 h-5 text-saffron-600" />
                    <span>{activeMember.name} નો પરિવાર (Family Profile)</span>
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    સભ્ય ડિરેક્ટરીમાંથી પસંદ કરેલ સભ્યની પારિવારિક વિગતો
                  </p>
                </div>

                {currentUser && (
                  <button
                    onClick={() => {
                      setActiveMemberId(currentUser.id);
                      setExpandedMemberId(currentUser.id);
                    }}
                    className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                  >
                    <Heart className="w-3.5 h-3.5 text-saffron-600 fill-saffron-600" />
                    <span>મારો પરિવાર જુઓ</span>
                  </button>
                )}
              </div>

              {/* Selected Member Card */}
              <div className="bg-white rounded-3xl border-2 border-saffron-400 p-6 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      src={activeMember.photo_url}
                      alt={activeMember.name}
                      className="w-16 h-16 rounded-2xl border-2 border-saffron-400 shadow-sm flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-base sm:text-lg text-charcoal-900">
                          {activeMember.name}
                        </h4>
                        {activeMember.role !== "member" && (
                          <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full">
                            {activeMember.committee_role || activeMember.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-600 flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-forest-700" />
                        <span>મૂળ વતન: <strong>{activeMember.native_place}</strong> | હાલ: {activeMember.city}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px]">
                        {activeMember.sasri_name && (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            સાસરી: {activeMember.sasri_name}
                          </span>
                        )}
                        {activeMember.piyar_name && (
                          <span className="text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            પિયર: {activeMember.piyar_name}
                          </span>
                        )}
                        {activeMember.phone && (
                          <a
                            href={`tel:${activeMember.phone}`}
                            className="font-mono text-forest-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-forest-600" />
                            <span>{activeMember.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setExpandedMemberId(
                        expandedMemberId === activeMember.id ? null : activeMember.id
                      )
                    }
                    className="px-4 py-2 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 font-bold text-xs rounded-xl border border-saffron-200 transition-colors w-max"
                  >
                    {expandedMemberId === activeMember.id ? "વિગતો સંકેલો" : "પરિવાર વિગત જુઓ"}
                  </button>
                </div>

                {/* Relatives of Selected Member */}
                {expandedMemberId === activeMember.id && (
                  <div className="pt-4 border-t border-ivory-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-charcoal-800">
                        {activeMember.name} ના પરિવારના સંબંધીઓ (Family Relations):
                      </h5>
                      <span className="text-[11px] text-charcoal-500 font-medium">
                        કુલ: {getFamilyMembers(activeMember.id).length} સભ્યો
                      </span>
                    </div>

                    {getFamilyMembers(activeMember.id).length === 0 ? (
                      <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 text-center text-xs text-charcoal-600">
                        આ સભ્ય માટે હજુ સુધી કોઈ પારિવારિક સંબંધીઓ નોંધાયેલ નથી.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {getFamilyMembers(activeMember.id).map((rel) => (
                          <div
                            key={rel.id}
                            className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3 text-xs shadow-2xs hover:border-saffron-300 transition-colors"
                          >
                            <UserAvatar
                              src={rel.photo_url}
                              alt={rel.name}
                              className="w-11 h-11 rounded-xl border border-ivory-300 flex-shrink-0"
                            />
                            <div className="overflow-hidden min-w-0 flex-1">
                              <span className="font-extrabold text-charcoal-900 block truncate">
                                {rel.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] font-bold text-saffron-800 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">
                                  {rel.relationLabel}
                                </span>
                                {rel.phone && (
                                  <a
                                    href={`tel:${rel.phone}`}
                                    className="text-[11px] font-mono text-charcoal-600 hover:text-forest-700 flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-forest-600" />
                                    <span>{rel.phone}</span>
                                  </a>
                                )}
                              </div>
                              {rel.isRegisteredMember && rel.member && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMemberId(rel.member!.id);
                                    setExpandedMemberId(rel.member!.id);
                                  }}
                                  className="text-[10px] text-forest-700 font-bold hover:underline block mt-1"
                                >
                                  આ સભ્યનો પરિવાર જુઓ →
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If viewing own profile OR no selected member */}
          {(!activeMember || isViewingSelf) && (
            <>
              {/* Search prompt card */}
              <div className="bg-white rounded-3xl border border-ivory-300 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-card">
                <div className="w-14 h-14 rounded-3xl bg-saffron-100 text-saffron-800 flex items-center justify-center mx-auto shadow-xs">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-charcoal-900">
                    પરિવાર વિગતો શોધવા માટે નામ દાખલ કરો
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                    સમાજના સભ્યોની અંગત સુરક્ષા અને ગોપનીયતા જાળવવા માટે સંપૂર્ણ ડેટાબેઝ જાહેરમાં પ્રદર્શિત થતો નથી. કૃપા કરીને ઉપરના સર્ચ બોક્સમાં સભ્યનું નામ અથવા ગામ શોધો.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setSearchQuery("અડાઆઠમ")}
                    className="px-5 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>અડાઆઠમના પરિવારો શોધો</span>
                  </button>

                  {!currentUser && (
                    <Link
                      href="/login"
                      className="px-5 py-2.5 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>સભ્ય લૉગિન કરો</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Logged in User's Own Family Profile */}
              {currentUser && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-charcoal-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-saffron-600 fill-saffron-600" />
                      <span>તમારો પરિવાર (Your Family Profile)</span>
                    </h3>
                    <Link
                      href="/profile"
                      className="text-xs font-bold text-saffron-700 hover:underline"
                    >
                      પ્રોફાઇલ / પરિવાર સંપાદિત કરો →
                    </Link>
                  </div>

                  <div className="bg-white rounded-3xl border border-saffron-200 p-6 shadow-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          src={currentUser.photo_url}
                          alt={currentUser.name}
                          className="w-16 h-16 rounded-2xl border-2 border-saffron-400 shadow-sm flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-extrabold text-base text-charcoal-900">
                            {currentUser.name}
                          </h4>
                          <p className="text-xs text-charcoal-600 flex items-center gap-2 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-forest-700" />
                            <span>મૂળ વતન: <strong>{currentUser.native_place}</strong> | હાલ: {currentUser.city}</span>
                          </p>
                          {currentUser.sasri_name && (
                            <p className="text-[11px] text-saffron-800 font-semibold mt-0.5">
                              સાસરીનું નામ: {currentUser.sasri_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedMemberId(
                            expandedMemberId === currentUser.id ? null : currentUser.id
                          )
                        }
                        className="px-4 py-2 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 font-bold text-xs rounded-xl border border-saffron-200 transition-colors w-max"
                      >
                        {expandedMemberId === currentUser.id ? "વિગતો સંકેલો" : "પરિવાર વિગત જુઓ"}
                      </button>
                    </div>

                    {/* Relatives for currentUser */}
                    {expandedMemberId === currentUser.id && (
                      <div className="pt-4 border-t border-ivory-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-charcoal-800">
                            પરિવારના સંબંધીઓની યાદી (Family Relations):
                          </h5>
                          <span className="text-[11px] text-charcoal-500 font-medium">
                            કુલ: {getFamilyMembers(currentUser.id).length} સભ્યો
                          </span>
                        </div>

                        {getFamilyMembers(currentUser.id).length === 0 ? (
                          <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 text-center text-xs text-charcoal-600">
                            <p>હજુ સુધી કોઈ પારિવારિક સંબંધીઓ ઉમેરેલ નથી.</p>
                            <Link
                              href="/profile"
                              className="inline-flex items-center gap-1 mt-2 text-saffron-700 font-bold hover:underline"
                            >
                              <span>પ્રોફાઇલમાં પરિવારના સભ્યો ઉમેરો →</span>
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {getFamilyMembers(currentUser.id).map((rel) => (
                              <div
                                key={rel.id}
                                className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-center gap-3 text-xs shadow-2xs hover:border-saffron-300 transition-colors"
                              >
                                <UserAvatar
                                  src={rel.photo_url}
                                  alt={rel.name}
                                  className="w-11 h-11 rounded-xl border border-ivory-300 flex-shrink-0"
                                />
                                <div className="overflow-hidden min-w-0 flex-1">
                                  <span className="font-extrabold text-charcoal-900 block truncate">
                                    {rel.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="text-[10px] font-bold text-saffron-800 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">
                                      {rel.relationLabel}
                                    </span>
                                    {rel.phone && (
                                      <a
                                        href={`tel:${rel.phone}`}
                                        className="text-[11px] font-mono text-charcoal-600 hover:text-forest-700 flex items-center gap-1"
                                      >
                                        <Phone className="w-3 h-3 text-forest-600" />
                                        <span>{rel.phone}</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SEARCH RESULTS: REQUIREMENT 5 (STRUCTURED CLEAN LIST VIEW ONLY) */}
      {isSearchActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-saffron-600" />
              <span>શોધ પરિણામો ({searchResults.length} પરિવારો મળ્યા)</span>
            </h2>
            <span className="text-xs text-charcoal-500 font-medium">
              સંરચિત યાદી દર્શન (Structured List View)
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-charcoal-300 mx-auto" />
              <h3 className="font-bold text-charcoal-800 text-sm">
                કોઈ મેળ ખાતી પરિવાર વિગત મળી નથી.
              </h3>
              <p className="text-xs text-charcoal-500">
                કૃપા કરીને અન્ય નામ, ગામ અથવા સાસરીનું નામ લખીને ફરી પ્રયત્ન કરો.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((member) => {
                const familyList = getFamilyMembers(member.id);
                const isExpanded = expandedMemberId === member.id;
                const canSeeContact = canViewPersonalDetails(member);

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-3xl border border-ivory-300 shadow-card hover:shadow-hover transition-all overflow-hidden"
                  >
                    {/* Top Row in List View */}
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Member Info */}
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="relative">
                          <UserAvatar
                            src={member.photo_url}
                            alt={member.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-ivory-300 shadow-2xs flex-shrink-0"
                          />
                          {member.is_lifetime_member && (
                            <span
                              className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs"
                              title="આજીવન સભ્ય"
                            >
                              ★
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base sm:text-lg text-charcoal-900">
                              {member.name}
                            </h3>
                            {member.role !== "member" && (
                              <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full">
                                {member.committee_role || member.role}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-600">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-forest-700" />
                              <span>મૂળ વતન: <strong>{member.native_place}</strong></span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-charcoal-400" />
                              <span>શહેર: {member.city}</span>
                            </span>
                          </div>

                          {/* Sasri & Piyar Names (Requirement 1) */}
                          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs">
                            {member.sasri_name && (
                              <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                                <span>સાસરી: {member.sasri_name}</span>
                              </span>
                            )}
                            {member.piyar_name && (
                              <span className="inline-flex items-center gap-1 text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
                                <span>પિયર: {member.piyar_name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact & Expand CTAs */}
                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-ivory-200">
                        {/* Privacy Aware Contact Display */}
                        {canSeeContact ? (
                          <a
                            href={`tel:${member.phone}`}
                            className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{member.phone}</span>
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-charcoal-400 bg-ivory-100 px-3 py-1.5 rounded-xl border border-ivory-200">
                            <Lock className="w-3.5 h-3.5 text-charcoal-500" />
                            <span>સંપર્ક સુરક્ષિત (લૉગિન જરૂરી)</span>
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
                          className="px-4 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span>{isExpanded ? "સંકેલો" : "પરિવાર જુઓ"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED STRUCTURED FAMILY LIST VIEW */}
                    {isExpanded && (
                      <div className="bg-ivory-50/70 p-5 sm:p-6 border-t border-ivory-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs sm:text-sm text-charcoal-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-saffron-700" />
                            <span>
                              {member.name} ના પરિવારના સભ્યોની યાદી ({familyList.length} સભ્યો):
                            </span>
                          </h4>
                          <span className="text-[11px] text-charcoal-500 font-medium">
                            સંબંધો & પારિવારિક વિગતો
                          </span>
                        </div>

                        {familyList.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-white border border-ivory-300 text-center text-xs text-charcoal-500">
                            પરિવારના અન્ય સભ્યો હજુ નોંધાયેલ નથી.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {familyList.map((rel) => {
                              const canSeeRelPhone =
                                isAdmin ||
                                currentUser !== null ||
                                (rel.member ? canViewPersonalDetails(rel.member) : false);

                              return (
                                <div
                                  key={rel.id}
                                  className="bg-white p-3.5 rounded-2xl border border-ivory-200 shadow-2xs flex items-center gap-3 text-xs"
                                >
                                  <UserAvatar
                                    src={rel.photo_url}
                                    alt={rel.name}
                                    className="w-12 h-12 rounded-xl border border-ivory-300 flex-shrink-0"
                                  />
                                  <div className="overflow-hidden space-y-0.5 min-w-0 flex-1">
                                    <span className="font-extrabold text-charcoal-900 block truncate">
                                      {rel.name}
                                    </span>
                                    <span className="inline-block text-[10px] font-bold text-saffron-800 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">
                                      {rel.relationLabel}
                                    </span>
                                    {rel.phone && canSeeRelPhone ? (
                                      <span className="block text-[11px] text-charcoal-500 font-mono">
                                        {rel.phone}
                                      </span>
                                    ) : rel.phone ? (
                                      <span className="block text-[10px] text-charcoal-400 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>અંગત સુરક્ષા</span>
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
