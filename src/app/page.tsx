"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  Heart,
  GitFork,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Megaphone,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  ExternalLink,
  Award,
  BadgeCheck,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { AutoScrollSlider } from "@/components/AutoScrollSlider";
import { Donation, Announcement, Circular, BusinessItem, CommunityEvent, CommitteeMember } from "@/types";

export default function HomePage() {
  const {
    members,
    relationships,
    businesses,
    events,
    announcements,
    circulars,
    committee,
    advertisements,
    donations,
  } = useData();
  const { currentUser } = useAuth();

  // Statistics calculated dynamically from live state
  const totalMembers = members.length;
  const totalFamilies = relationships.length > 0 
    ? new Set(relationships.map((r) => r.from_member_id)).size 
    : totalMembers;
  const totalBusinesses = businesses.filter((b) => b.status === "active").length;
  const totalEvents = events.length;

  const activeBusinesses = businesses.filter((b) => b.status === "active");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");

  // Filter approved donors for Donors List (Section 1)
  const approvedDonors = donations.filter(
    (d) => d.status === "approved" || d.payment_status === "verified"
  );

  // Requirement 3 & 4: Only APPROVED advertisements on homepage with auto-scrolling carousel
  const approvedAds = advertisements.filter((a) => a.status === "approved");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scrolling carousel effect for Advertisements with pause on hover
  useEffect(() => {
    if (approvedAds.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % approvedAds.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [approvedAds.length, isHovered]);

  const handlePrevAd = () => {
    setCarouselIndex((prev) => (prev - 1 + approvedAds.length) % approvedAds.length);
  };

  const handleNextAd = () => {
    setCarouselIndex((prev) => (prev + 1) % approvedAds.length);
  };

  return (
    <div className="pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-ivory-50 to-ivory-100 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-14">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-saffron-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-forest-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 text-[11px] sm:text-xs font-bold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
            <span>શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-charcoal-900 tracking-tight leading-tight">
            “આપણો સમાજ,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 via-saffron-600 to-saffron-800">
              આપણો પરિવાર”
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-charcoal-600 max-w-2xl mx-auto font-normal leading-relaxed">
            અડાઆઠમ દરજી સેવા સમિતિના તમામ પરિવારોને જોડતું સત્તાવાર ડિજિટલ પોર્ટલ. પરિવાર વિગતો શોધો, સભ્યો સાથે જોડાઓ અને સમાજના વ્યવસાયોને પ્રોત્સાહન આપો.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/family-tree"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 group hover:scale-[1.02]"
            >
              <GitFork className="w-4 h-4" />
              <span>પરિવાર શોધો</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              <span>સમાજ સાથે જોડાઓ</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-charcoal-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-forest-600" />
              <span>૧૦૦% ચકાસાયેલા પરિવારો</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              <span>સંપૂર્ણ અંગત સુરક્ષા & ગોપનીયતા</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REQUIREMENT 16: OFFICE BEARERS SECTION (Continuous Horizontal Auto-Scroll) */}
      <section className="bg-ivory-50 border-y border-ivory-300 py-8 sm:py-10">
        <AutoScrollSlider<CommitteeMember>
          items={committee}
          speedSeconds={26}
          direction="left"
          icon={<Award className="w-5 h-5 text-saffron-600" />}
          title="શ્રી અડાઆઠમ દરજી સેવા સમિતિ હોદ્દેદારો"
          subtitle="સમાજ કલ્યાણ, સેવા અને પ્રગતિ માટે સમર્પિત કાર્યકારી કારોબારી સમિતિ (સતત ઓટો-સ્ક્રોલિંગ)"
          headerRight={
            <Link
              href="/committee"
              className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <span>સંપૂર્ણ સમિતિ ({committee.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          }
          renderItem={(member) => (
            <div className="w-[170px] sm:w-[190px] bg-white rounded-2xl border border-ivory-300 p-3.5 text-center shadow-card hover:shadow-hover hover:border-saffron-300 transition-all flex flex-col items-center justify-between h-[185px] group">
              <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 mb-2">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full h-full rounded-2xl object-cover border-2 border-ivory-300 shadow-2xs group-hover:scale-105 transition-transform"
                />
                {member.is_lifetime_member && (
                  <span
                    className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs border-2 border-white"
                    title="આજીવન સભ્ય"
                  >
                    ★
                  </span>
                )}
              </div>
              <div className="w-full">
                <h3 className="font-bold text-xs text-charcoal-900 truncate group-hover:text-saffron-700 transition-colors" title={member.name}>
                  {member.name.split(" ")[0]} {member.name.split(" ")[1] || ""}
                </h3>
                <span className="inline-block mt-1 text-[10px] font-bold text-saffron-800 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-200 truncate max-w-full">
                  {member.designation}
                </span>
              </div>
            </div>
          )}
        />

        <div className="mt-5 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/committee"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-800 hover:text-saffron-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <span>સંપૂર્ણ સમિતિ અને આજીવન સભ્યોની યાદી જુઓ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Subsequent Sections with Consistent Vertical Rhythm */}
      <div className="space-y-12 sm:space-y-16 mt-12 sm:mt-16">
        {/* 3. COMMUNITY DATA / STATISTICS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-ivory-300 shadow-md p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-ivory-200">
            {/* Stat 1: Members */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-saffron-100 text-saffron-800 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalMembers}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-charcoal-600">
                  નોંધાયેલા સભ્યો
                </span>
              </div>
            </div>

            {/* Stat 2: Families */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0">
                <GitFork className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalFamilies}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-charcoal-600">
                  જોડાયેલા પરિવારો
                </span>
              </div>
            </div>

            {/* Stat 3: Businesses */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalBusinesses}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-charcoal-600">
                  સમાજના વ્યવસાયો
                </span>
              </div>
            </div>

            {/* Stat 4: Events */}
            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalEvents}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-charcoal-600">
                  યોજાયેલા કાર્યક્રમો
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. APPROVED BUSINESS ADVERTISEMENTS CAROUSEL */}
      {approvedAds.length > 0 && (
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-saffron-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                  માન્ય વ્યવસાય જાહેરાતો (Business Advertisements)
                </h2>
                {isHovered && (
                  <span className="text-[10px] bg-ivory-200 text-charcoal-600 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                    ઓટો-સ્ક્રોલ થોભાયેલ છે
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">
                અડાઆઠમ દરજી સેવા સમિતિ દ્વારા માન્ય કરાયેલ સભ્યોના વ્યવસાયો અને વિશેષ ઑફર્સ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={handlePrevAd}
                  className="p-1.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-700 shadow-2xs transition-colors"
                  title="પાછળ"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextAd}
                  className="p-1.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-700 shadow-2xs transition-colors"
                  title="આગળ"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/advertisements"
                className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors"
              >
                બધી જુઓ ({approvedAds.length})
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${carouselIndex * 100}%)`,
              }}
            >
              {approvedAds.map((ad, idx) => (
                <div key={ad.id} className="w-full flex-shrink-0 px-1">
                  <div className="bg-white rounded-3xl border border-ivory-300 p-5 sm:p-6 shadow-card hover:shadow-hover transition-all flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-full md:w-5/12 aspect-[16/10] rounded-2xl overflow-hidden bg-ivory-200 relative shadow-xs flex-shrink-0">
                      <img
                        src={ad.image_url}
                        alt={ad.business_name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        પ્રાયોજિત જાહેરાત
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {ad.category}
                      </span>
                    </div>

                    <div className="w-full md:w-7/12 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-md">
                            {ad.category}
                          </span>
                          <span className="text-[11px] text-charcoal-400">
                            જાહેરાત {idx + 1} / {approvedAds.length}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-charcoal-900 leading-snug">
                          {ad.business_name}
                        </h3>
                        <p className="text-xs sm:text-sm text-charcoal-600 mt-2 line-clamp-3 leading-relaxed">
                          {ad.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-ivory-200 text-xs text-charcoal-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-saffron-700 flex-shrink-0" />
                          <span>માલિક: <strong>{ad.owner_name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                          <span className="truncate">{ad.address}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <a
                          href={`tel:${ad.contact_number}`}
                          className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>સંપર્ક કરો ({ad.contact_number})</span>
                        </a>

                        {ad.website_link ? (
                          <a
                            href={ad.website_link.startsWith("http") ? ad.website_link : `https://${ad.website_link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-800 hover:text-saffron-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>વેબસાઇટ જુઓ</span>
                            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          </a>
                        ) : (
                          <Link
                            href="/advertisements"
                            className="px-4 py-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-800 hover:text-saffron-700 font-bold text-xs transition-colors"
                          >
                            વિગતો જુઓ (View Details) →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {approvedAds.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {approvedAds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    carouselIndex === i ? "w-6 bg-saffron-600" : "w-2 bg-ivory-300 hover:bg-ivory-400"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5 HORIZONTAL AUTO-SCROLLING SLIDERS (MARQUEE / INFINITE LOOP)             */}
      {/* ========================================================================= */}

      {/* 1. દાતાઓની યાદી (Donors List - Continuous Horizontal Auto-Scroll) */}
      <AutoScrollSlider<Donation>
        items={approvedDonors}
        speedSeconds={28}
        direction="left"
        icon={<Heart className="w-5 h-5 text-rose-600 fill-rose-100" />}
        title="દાતાઓની યાદી (Donors List)"
        subtitle="સમાજ વિકાસ, શિક્ષણ અને આરોગ્ય ભંડોળમાં ઉદાર હાથે દાન આપનાર સન્માનનીય દાતાઓ. (સતત ઓટો-સ્ક્રોલિંગ)"
        headerRight={
          <div className="flex items-center gap-2">
            <Link
              href="/donations"
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
            >
              <span>તમામ દાતાઓ ({approvedDonors.length})</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            {currentUser && (
              <Link
                href="/donations"
                className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors hidden sm:inline-flex"
              >
                + દાન નોંધાવો
              </Link>
            )}
          </div>
        }
        renderItem={(donor) => (
          <div className="w-[280px] sm:w-[320px] bg-white rounded-3xl border border-ivory-300 p-4 sm:p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between h-[210px] relative overflow-hidden group">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-saffron-500 to-amber-500" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Award className="w-3 h-3 text-rose-600" />
                  <span>વર્ષ {donor.donation_year}</span>
                </span>
                <span className="text-[10px] font-bold text-charcoal-400">
                  {donor.donation_id}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-rose-100 border-2 border-rose-200 flex-shrink-0 shadow-2xs">
                  {donor.donor_photo ? (
                    <img
                      src={donor.donor_photo}
                      alt={donor.donor_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-rose-700 text-base">
                      {donor.donor_name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-charcoal-900 truncate group-hover:text-rose-700 transition-colors">
                    {donor.donor_name}
                  </h4>
                  <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                    {donor.donation_purpose}
                  </p>
                </div>
              </div>

              {donor.hasthe_names && donor.hasthe_names.length > 0 && (
                <p className="text-[10px] text-charcoal-500 mt-2 truncate bg-ivory-50 px-2 py-1 rounded-lg border border-ivory-200">
                  હસ્તે: <strong>{donor.hasthe_names.join(", ")}</strong>
                </p>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-ivory-200 flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-600">દાન રાશિ:</span>
              <span className="text-sm font-black text-forest-800 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded-lg shadow-2xs font-mono">
                ₹{donor.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}
      />

      {/* 2. મહત્વપૂર્ણ સૂચનાઓ (Important Notices - Continuous Horizontal Auto-Scroll) */}
      <AutoScrollSlider<Announcement>
        items={announcements}
        speedSeconds={45}
        direction="left"
        icon={<Megaphone className="w-5 h-5 text-saffron-600" />}
        title="મહત્વપૂર્ણ સૂચનાઓ (Important Notices)"
        subtitle="સમાજના પરિવારો માટે નવીનતમ અધિકૃત સૂચનાઓ અને મહત્વની જાહેરાતો. (વાંચવા માટે હોવર કરો)"
        headerRight={
          <Link
            href="/advertisements"
            className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors flex items-center gap-1"
          >
            <span>બધી સૂચનાઓ</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        }
        renderItem={(item) => (
          <div className="w-[300px] sm:w-[340px] md:w-[380px] bg-white rounded-3xl border border-ivory-300 p-4 sm:p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between h-[230px] group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.is_urgent
                      ? "bg-red-100 text-red-800 border border-red-200 animate-pulse"
                      : "bg-saffron-100 text-saffron-800"
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-[11px] text-charcoal-500 font-medium">{item.date}</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 mb-1.5 leading-snug line-clamp-2 group-hover:text-saffron-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed">
                {item.body}
              </p>
            </div>

            <div className="pt-2.5 mt-2 border-t border-ivory-200 flex items-center justify-between text-[11px] text-charcoal-500">
              <span className="truncate">સૂચક: {item.author}</span>
              <span className="font-bold text-saffron-700 cursor-pointer hover:underline flex-shrink-0">
                વાંચો →
              </span>
            </div>
          </div>
        )}
      />

      {/* 3. પરિપત્રો (Circulars - Continuous Horizontal Auto-Scroll) */}
      <AutoScrollSlider<Circular>
        items={circulars}
        speedSeconds={42}
        direction="left"
        icon={<FileText className="w-5 h-5 text-amber-600" />}
        title="સત્તાવાર પરિપત્રો (Official Circulars)"
        subtitle="શ્રી અડાઆઠમ દરજી સેવા સમિતિ દ્વારા બહાર પાડવામાં આવેલ અધિકૃત પરિપત્રો અને ઠરાવો."
        headerRight={
          <Link
            href="/committee"
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors flex items-center gap-1"
          >
            <span>તમામ પરિપત્રો</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        }
        renderItem={(circ) => (
          <div className="w-[300px] sm:w-[340px] md:w-[380px] bg-white rounded-3xl border border-amber-200/80 p-4 sm:p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between h-[230px] group relative overflow-hidden">
            {/* Stamp Style Watermark */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full border-4 border-amber-100/60 pointer-events-none flex items-center justify-center text-[10px] font-black text-amber-200 uppercase -rotate-12">
              સત્તાવાર
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-mono">
                  {circ.circular_no}
                </span>
                <span className="text-[11px] text-charcoal-500">{circ.date}</span>
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm text-charcoal-900 mb-1 leading-snug line-clamp-2 group-hover:text-amber-800 transition-colors">
                {circ.title}
              </h3>
              <p className="text-[11px] text-amber-800 font-medium mb-1 truncate">
                વિષય: {circ.subject}
              </p>
              <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                {circ.body}
              </p>
            </div>

            <div className="pt-2 mt-2 border-t border-ivory-200 flex items-center justify-between text-[11px] text-charcoal-600">
              <span className="truncate">સહી: {circ.signatory}</span>
              <span className="font-bold text-amber-800 cursor-pointer hover:underline flex-shrink-0 flex items-center gap-1">
                <span>વિગત</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      />

      {/* 4. સમાજના વ્યવસાયો અને ઉદ્યોગો (Community Businesses & Industries - Continuous Horizontal Auto-Scroll) */}
      <AutoScrollSlider<BusinessItem>
        items={activeBusinesses}
        speedSeconds={34}
        direction="left"
        icon={<Briefcase className="w-5 h-5 text-forest-700" />}
        title="સમાજના વ્યવસાયો અને ઉદ્યોગો (Community Businesses & Industries)"
        subtitle="સમાજના ભાઈ-બહેનોના વ્યવસાયોને પ્રથમ પ્રાધાન્ય આપો અને પરસ્પર સહકાર વધારો."
        headerRight={
          <div className="flex items-center gap-2">
            <Link
              href="/businesses"
              className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors"
            >
              બધા ({activeBusinesses.length})
            </Link>
            {currentUser && (
              <Link
                href="/businesses"
                className="px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors hidden sm:inline-flex"
              >
                + ઉમેરો
              </Link>
            )}
          </div>
        }
        renderItem={(biz) => (
          <div className="w-[280px] sm:w-[310px] md:w-[330px] bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col group h-[310px]">
            <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200 flex-shrink-0">
              <img
                src={biz.cover_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600"}
                alt={biz.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {biz.is_featured && (
                <span className="absolute top-2 left-2 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  ફીચર્ડ
                </span>
              )}
              <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-2xs text-charcoal-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                {biz.category}
              </span>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 group-hover:text-saffron-700 transition-colors line-clamp-1">
                  {biz.name}
                </h3>
                <p className="text-[10px] text-charcoal-500 mt-0.5 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 text-saffron-600 flex-shrink-0" />
                  <span>સંચાલક: {biz.owner_name}</span>
                </p>
                <p className="text-[10px] text-charcoal-600 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-forest-700 flex-shrink-0" />
                  <span className="truncate">{biz.city}</span>
                </p>
                <p className="text-[11px] text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                  {biz.description}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-ivory-200 flex items-center justify-between text-xs">
                <a
                  href={`tel:${biz.phone}`}
                  className="flex items-center gap-1 text-forest-800 font-bold hover:underline text-[11px]"
                >
                  <Phone className="w-3 h-3" />
                  <span>સંપર્ક</span>
                </a>
                <Link
                  href={`/businesses/${biz.id}`}
                  className="text-saffron-700 font-bold hover:underline text-[11px]"
                >
                  વિગતો →
                </Link>
              </div>
            </div>
          </div>
        )}
      />

      {/* 5. આગામી કાર્યક્રમો (Upcoming Events - Continuous Horizontal Auto-Scroll) */}
      <AutoScrollSlider<CommunityEvent>
        items={upcomingEvents.length > 0 ? upcomingEvents : events}
        speedSeconds={38}
        direction="left"
        icon={<Calendar className="w-5 h-5 text-saffron-600" />}
        title="આગામી સમાજ કાર્યક્રમો (Upcoming Events)"
        subtitle="સ્નેહમિલન, સાંસ્કૃતિક ઉત્સવો, રક્તદાન કેમ્પ અને ધાર્મિક મહોત્સવો."
        headerRight={
          <Link
            href="/events"
            className="px-3.5 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-xl border border-saffron-200 transition-colors flex items-center gap-1 group"
          >
            <span>સંપૂર્ણ યાદી</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
        renderItem={(evt) => (
          <div className="w-[290px] sm:w-[320px] md:w-[340px] bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col group h-[310px]">
            <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
              <img
                src={evt.cover_image}
                alt={evt.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 bg-white/95 text-saffron-800 font-bold text-xs px-2 py-0.5 rounded-lg shadow-2xs">
                {evt.date}
              </div>
              <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-forest-900/80 text-white px-2 py-0.5 rounded-md">
                {evt.organizer}
              </span>
            </div>

            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug line-clamp-1">
                  {evt.title}
                </h3>
                <p className="text-[11px] text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-ivory-200 space-y-1 text-[11px] text-charcoal-600">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-saffron-600 flex-shrink-0" />
                  <span className="truncate">{evt.location}, {evt.city}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-forest-700 font-semibold">{evt.time}</span>
                  <Link
                    href={`/events/${evt.id}`}
                    className="text-saffron-700 font-bold hover:underline"
                  >
                    વિગતો →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      />
      </div>
    </div>
  );
}
