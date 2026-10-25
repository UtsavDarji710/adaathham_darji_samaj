"use client";

import React from "react";
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
  Lock,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { members, relationships, businesses, events, donations, announcements, committee } = useData();
  const { currentUser } = useAuth();

  // Statistics calculated dynamically from state
  const totalMembers = members.length;
  const totalFamilies = Math.max(12, Math.floor(members.length * 1.5));
  const totalBusinesses = businesses.filter((b) => b.status === "active").length;
  const totalEvents = events.length;

  const urgentAnnouncements = announcements.slice(0, 3);
  const featuredBusinesses = businesses.filter((b) => b.is_featured || b.status === "active").slice(0, 4);
  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 2);
  const verifiedDonations = donations.filter((d) => d.public_consent && !d.is_anonymous && d.payment_status === "verified").slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* 1. HERO SECTION — Optimized for Screen Fit */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-ivory-50 to-ivory-100 border-b border-ivory-300 pt-3 pb-6 sm:pt-5 sm:pb-8 lg:pt-6 lg:pb-10">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-saffron-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-forest-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-2.5 sm:space-y-3.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 text-[10px] sm:text-[11px] font-bold tracking-wide shadow-2xs">
                <Sparkles className="w-3 h-3 text-saffron-600" />
                <span>શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા</span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-charcoal-900 tracking-tight leading-tight">
                “આપણો સમાજ,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-700 via-saffron-600 to-saffron-800">
                  આપણો પરિવાર”
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl font-normal leading-relaxed">
                સમાજના દરેક પરિવારને જોડતું એક ડિજિટલ પ્લેટફોર્મ. પરિવાર વૃક્ષ દ્વારા વંશાવળી સાચવો, સભ્યો સાથે જોડાઓ, અને સમાજના વ્યવસાયોને સહકાર આપો.
              </p>

              {/* Call to action buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-0.5">
                {currentUser ? (
                  <Link
                    href="/family-tree"
                    className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 group"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>પરિવાર શોધો</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/members"
                    className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 group"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>સભ્યો શોધો</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                <Link
                  href="/businesses"
                  className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-white hover:bg-ivory-50 text-charcoal-800 hover:text-saffron-700 font-bold text-xs border border-ivory-300 shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-forest-700" />
                  <span>વ્યવસાય શોધો</span>
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>સમાજ સાથે જોડાઓ</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-5 text-[10px] sm:text-[11px] text-charcoal-500 font-medium">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-forest-600" />
                  <span>૧૦૦% ચકાસાયેલા સભ્યો</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-forest-600" />
                  <span>સંપૂર્ણ અંગત સુરક્ષા & ગોપનીયતા</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl sm:rounded-3xl bg-white p-2.5 sm:p-3.5 border border-ivory-300 shadow-md overflow-hidden">
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] mb-2.5 shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80"
                    alt="અડાઆઠમ દરજી સમાજ સ્નેહમિલન"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent flex items-end p-2.5">
                    <p className="text-white text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-saffron-400" />
                      સમાજ ભવન, મોડાસા — વાર્ષિક સ્નેહમિલન દર્શન
                    </p>
                  </div>
                </div>

                {/* Quick Community Spotlight in Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-charcoal-900">કુળદેવી શ્રી ચામુંડા માતાજી મંદિર</span>
                    <span className="text-forest-700 font-semibold text-[10px]">અડાઆઠમ, મોડાસા</span>
                  </div>
                  <div className="p-2 rounded-lg bg-ivory-100 border border-ivory-200 text-xs text-charcoal-700 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-saffron-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ૐ
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-900 text-[11px]">“પરસ્પર દેવો ભવ”</p>
                      <p className="text-[10px] text-charcoal-500">
                        સમાજના દરેક પરિવારોનું ગૌરવ અને પ્રગતિ આપણું લક્ષ્ય છે.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY STATISTICS SECTION — Compact Screen Fit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 sm:-mt-7 lg:-mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-ivory-300 shadow-md p-3 sm:p-4 lg:p-4.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-ivory-200">
            {/* Stat 1: Members */}
            <div className="flex items-center gap-2.5 pt-1.5 sm:pt-0 sm:px-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-saffron-100 text-saffron-800 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalMembers}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-charcoal-600">
                  નોંધાયેલા સભ્યો
                </span>
              </div>
            </div>

            {/* Stat 2: Families */}
            <div className="flex items-center gap-2.5 pt-1.5 sm:pt-0 sm:px-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0">
                <GitFork className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalFamilies}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-charcoal-600">
                  જોડાયેલા પરિવારો
                </span>
              </div>
            </div>

            {/* Stat 3: Businesses */}
            <div className="flex items-center gap-2.5 pt-1.5 sm:pt-0 sm:px-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalBusinesses}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-charcoal-600">
                  સમાજના વ્યવસાયો
                </span>
              </div>
            </div>

            {/* Stat 4: Events */}
            <div className="flex items-center gap-2.5 pt-1.5 sm:pt-0 sm:px-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-extrabold text-charcoal-900 leading-tight">
                  {totalEvents}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-charcoal-600">
                  યોજાયેલા કાર્યક્રમો
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPORTANT ANNOUNCEMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-saffron-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">મહત્વપૂર્ણ સૂચનાઓ & પરિપત્રો</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">સમાજની નવીનતમ અધિકૃત જાહેરાતો અને માહિતી.</p>
          </div>
          <Link
            href="/advertisements"
            className="text-xs font-bold text-saffron-700 hover:text-saffron-800 flex items-center gap-1 group"
          >
            <span>બધી જુઓ</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {urgentAnnouncements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-ivory-300 p-4 sm:p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      item.is_urgent
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-saffron-100 text-saffron-800"
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] text-charcoal-500">{item.date}</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-600 line-clamp-3 leading-relaxed">
                  {item.body}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-ivory-200 flex items-center justify-between text-[11px] text-charcoal-500">
                <span>સૂચક: {item.author}</span>
                <span className="font-bold text-saffron-700 cursor-pointer hover:underline">
                  વાંચો →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. COMMUNITY BUSINESS DIRECTORY HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-forest-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">સમાજના વ્યવસાયો & ઉદ્યોગો</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">
              સમાજના ભાઈ-બહેનોના વ્યવસાયોને પ્રથમ પ્રાધાન્ય આપો અને એકબીજાને સહકાર આપો.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/businesses"
              className="px-3 py-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 text-xs font-bold rounded-lg border border-saffron-200 transition-colors"
            >
              બધા ({businesses.length})
            </Link>
            <Link
              href="/businesses"
              className="px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
            >
              + ઉમેરો
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featuredBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-2xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
                <img
                  src={biz.cover_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600"}
                  alt={biz.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {biz.is_featured && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[9px] font-bold px-2 py-0.2 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    ફીચર્ડ
                  </span>
                )}
                <span className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-2xs text-charcoal-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md shadow-2xs">
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
                  <p className="text-[11px] text-charcoal-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {biz.description}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-ivory-200 flex items-center justify-between text-xs">
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
          ))}
        </div>
      </section>

      {/* 5. UPCOMING COMMUNITY EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-saffron-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">આગામી સમાજ કાર્યક્રમો</h2>
            </div>
            <p className="text-[11px] sm:text-xs text-charcoal-600 mt-0.5">સ્નેહમિલન, સાંસ્કૃતિક ઉત્સવો, અને ધાર્મિક મહોત્સવ.</p>
          </div>
          <Link
            href="/events"
            className="text-xs font-bold text-saffron-700 hover:text-saffron-800 flex items-center gap-1 group"
          >
            <span>સંપૂર્ણ યાદી</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col md:flex-row group"
            >
              <div className="md:w-5/12 relative aspect-[16/10] md:aspect-auto overflow-hidden">
                <img
                  src={evt.cover_image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 text-saffron-800 font-bold text-xs px-2 py-0.5 rounded-lg shadow-2xs">
                  {evt.date}
                </div>
              </div>

              <div className="md:w-7/12 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold bg-forest-100 text-forest-800 px-2 py-0.2 rounded-full inline-block mb-1.5">
                    {evt.organizer}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-[11px] text-charcoal-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-ivory-200 space-y-1 text-[11px] text-charcoal-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-saffron-600 flex-shrink-0" />
                    <span>{evt.location}, {evt.city}</span>
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
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY COMMITTEE DIRECTORY SECTION */}
      <section className="bg-ivory-50 border-y border-ivory-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[10px] font-bold text-saffron-700 uppercase tracking-wider bg-saffron-100 px-2.5 py-0.5 rounded-full">
              કારોબારી નેતૃત્વ
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 mt-1.5">
              શ્રી અડાઆઠમ દરજી સેવા સમિતિ હોદ્દેદારો
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {committee.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-ivory-300 p-3 text-center shadow-card hover:shadow-hover transition-all"
              >
                <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-2">
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full rounded-xl object-cover border-2 border-ivory-300 shadow-2xs"
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
                <h3 className="font-bold text-xs text-charcoal-900 truncate">
                  {member.name.split(" ")[0]} {member.name.split(" ")[1]}
                </h3>
                <span className="inline-block mt-0.5 text-[10px] font-bold text-saffron-800 bg-saffron-50 px-1.5 py-0.2 rounded border border-saffron-200">
                  {member.designation}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/committee"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-800 hover:text-saffron-700 text-xs font-bold shadow-2xs transition-colors"
            >
              <span>સંપૂર્ણ સમિતિ અને આજીવન સભ્યો જુઓ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. DONATIONS & CHARITABLE INITIATIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-charcoal-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left information */}
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-saffron-500/20 text-saffron-300 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-saffron-500/30">
                <Heart className="w-3 h-3 text-saffron-400 fill-saffron-400" />
                સમાજ સેવા અને દાન પ્રવૃત્તિઓ
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                સમાજ ભવન અને શિક્ષણ સહાય ભંડોળ
              </h2>

              <p className="text-xs text-charcoal-300 leading-relaxed">
                આપનું નાનું દાન પણ સમાજના જરૂરિયાતમંદ વિદ્યાર્થીઓના ઉચ્ચ શિક્ષણ, વિધવા સહાય તથા સમાજ ભવનના નવીનીકરણમાં મોટો સહારો બને છે. તમામ દાન ૧૦૦% પારદર્શકતા સાથે નોંધવામાં આવે છે.
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href="/donors"
                  className="px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  દાતા યાદી & દાન આપો
                </Link>
                <div className="text-[11px] text-charcoal-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>સંમતિ વગર વિગતો જાહેર થતી નથી.</span>
                </div>
              </div>
            </div>

            {/* Right: Recent verified public donations */}
            <div className="lg:col-span-5 bg-charcoal-800/80 rounded-2xl p-4 border border-charcoal-700">
              <h3 className="text-[11px] font-bold text-saffron-300 uppercase tracking-wider mb-2.5">
                તાજેતરના માન્ય દાતાઓ
              </h3>
              <div className="space-y-2">
                {verifiedDonations.map((don) => (
                  <div
                    key={don.id}
                    className="bg-charcoal-900/90 rounded-xl p-2.5 border border-charcoal-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block text-xs">{don.donor_name}</span>
                      <span className="text-[10px] text-charcoal-400">{don.purpose}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-saffron-400 text-xs">
                        ₹{don.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] text-charcoal-500 block">{don.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
