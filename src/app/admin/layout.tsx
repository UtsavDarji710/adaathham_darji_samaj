"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  GitFork,
  Briefcase,
  Megaphone,
  Calendar,
  Heart,
  Award,
  ArrowLeft,
  Lock,
  ChevronRight,
  Info,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CREDENTIALS } from "@/lib/roleCredentials";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, loginAs, isAdmin } = useAuth();

  const adminNav = [
    { href: "/admin", label: "વહીવટી સમરી", icon: ShieldCheck, exact: true },
    { href: "/admin/members", label: "સભ્યો", icon: Users },
    { href: "/admin/families", label: "પરિવાર સંબંધો", icon: GitFork },
    { href: "/admin/advertisements", label: "જાહેરાતો", icon: Megaphone },
    { href: "/admin/events", label: "કાર્યક્રમો", icon: Calendar },
    { href: "/admin/donations", label: "દાન & હિસાબ", icon: Heart },
    { href: "/admin/committee", label: "સમિતિ", icon: Award },
  ];

  // 1. If not logged in at all (Guest)
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-ivory-300 p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-saffron-100 text-saffron-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full uppercase tracking-wider">
              સુરક્ષિત એડમિન પોર્ટલ
            </span>
            <h1 className="text-2xl font-black text-charcoal-900 mt-2">
              કારોબારી એડમિન લૉગિન જરૂરી છે
            </h1>
            <p className="text-xs text-charcoal-600 max-w-md mx-auto mt-2 leading-relaxed">
              આ પાનું માત્ર શ્રી અડાઆઠમ દરજી સેવા સમિતિના અધિકૃત હોદ્દેદારો (પ્રમુખ, મંત્રી, સહમંત્રી, ખજાનચી) માટે આરક્ષિત છે.
            </p>
          </div>

          {/* Quick 1-Click Role Switcher for Testing */}
          <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-4 text-left">
            <span className="text-xs font-bold text-charcoal-700 block mb-2">
              ડેમો ટેસ્ટિંગ માટે એડમિન ભૂમિકા પસંદ કરો:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ROLE_CREDENTIALS.filter((c) => c.role !== "member" && c.role !== "guest").map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => loginAs(cred.role, cred.memberId)}
                  className="p-3 rounded-xl bg-white hover:bg-saffron-50 border border-ivory-300 hover:border-saffron-400 font-bold text-left flex items-center gap-2.5 transition-all shadow-2xs"
                >
                  <span className="text-xl">{cred.emoji}</span>
                  <div>
                    <span className="block text-charcoal-900">{cred.gujaratiTitle}</span>
                    <span className="text-[10px] text-charcoal-500 font-normal">{cred.name.split(" ")[0]} ({cred.phone})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-xs">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold shadow-xs transition-colors"
            >
              લૉગિન પેજ પર જાઓ
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-semibold transition-colors"
            >
              મુખ્ય પૃષ્ઠ પર પાછા ફરો
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. If logged in as a normal member without admin powers
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-amber-200 p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase tracking-wider">
              ઍક્સેસ પ્રતિબંધિત (Access Denied)
            </span>
            <h1 className="text-2xl font-black text-charcoal-900 mt-2">
              સામાન્ય સભ્ય માટે એડમિન પરવાનગી નથી
            </h1>
            <p className="text-xs text-charcoal-600 max-w-md mx-auto mt-2 leading-relaxed">
              નમસ્તે <strong className="text-charcoal-900">{currentUser.name}</strong>, તમે હાલ <strong>સામાન્ય સભ્ય</strong> તરીકે લૉગિન છો. એડમિન ડેશબોર્ડ માત્ર સમિતિના અધિકૃત હોદ્દેદારો માટે છે.
            </p>
          </div>

          {/* Quick Switch to Admin for testing */}
          <div className="bg-ivory-50 border border-ivory-200 rounded-2xl p-4 text-left">
            <span className="text-xs font-bold text-charcoal-700 block mb-2">
              ટેસ્ટિંગ માટે નીચેનામાંથી કોઈ પણ એડમિન ભૂમિકામાં સ્વિચ કરો:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ROLE_CREDENTIALS.filter((c) => c.role !== "member" && c.role !== "guest").map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => loginAs(cred.role, cred.memberId)}
                  className="p-3 rounded-xl bg-white hover:bg-saffron-50 border border-ivory-300 hover:border-saffron-400 font-bold text-left flex items-center gap-2.5 transition-all shadow-2xs"
                >
                  <span className="text-xl">{cred.emoji}</span>
                  <div>
                    <span className="block text-charcoal-900">{cred.gujaratiTitle}</span>
                    <span className="text-[10px] text-charcoal-500 font-normal">{cred.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-xs">
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold shadow-xs transition-colors"
            >
              મારી સભ્ય પ્રોફાઇલ જુઓ
            </Link>
            <Link
              href="/members"
              className="px-5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-semibold transition-colors"
            >
              સભ્યોની ડિરેક્ટરી
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is an authorized Admin (President, Secretary, Joint Secretary, Treasurer)
  const currentCred = ROLE_CREDENTIALS.find((c) => c.role === currentUser.role);

  return (
    <div className="min-h-screen bg-ivory-50/60 pb-16">
      {/* Admin Top Navigation & Role Bar */}
      <div className="bg-white border-b border-ivory-300 sticky top-[88px] sm:top-[92px] z-40 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-ivory-200">
            {/* Left: Active Role Badge */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 p-1 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 text-xs font-semibold transition-colors pr-2"
                title="મુખ્ય વેબસાઇટ પર પાછા જાઓ"
              >
                <img
                  src="/logo.png"
                  alt="અડાઆઠમ દરજી સેવા સમિતિ"
                  width={28}
                  height={28}
                  style={{ width: "28px", height: "28px", minWidth: "28px" }}
                  className="w-7 h-7 object-contain rounded-full"
                />
                <span className="hidden sm:inline">પોર્ટલ</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xl">{currentCred?.emoji || "🛡️"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-charcoal-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        currentCred?.tagColor || "bg-forest-100 text-forest-800 border-forest-300"
                      }`}
                    >
                      {currentUser.committee_role || currentCred?.gujaratiTitle || "એડમિન"}
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal-500 block leading-tight">
                    સત્તાવાર હોદ્દેદાર પોર્ટલ — {currentUser.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Switcher Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-charcoal-500 font-bold hidden xl:inline">
                હોદ્દો બદલો:
              </span>
              {ROLE_CREDENTIALS.filter((c) => c.role !== "guest").map((c) => {
                const isSelected = currentUser.role === c.role;
                return (
                  <button
                    key={c.role}
                    onClick={() => loginAs(c.role, c.memberId)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-charcoal-900 text-white border-charcoal-900 shadow-2xs"
                        : "bg-white text-charcoal-700 border-ivory-300 hover:border-saffron-400 hover:bg-ivory-100"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.gujaratiTitle.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar text-xs font-bold">
            {adminNav.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-forest-800 text-white shadow-2xs"
                      : "text-charcoal-700 hover:text-forest-900 hover:bg-ivory-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Notice Advisor */}
      {currentUser.role === "treasurer" && !pathname.includes("donations") && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-emerald-700" />
            <span>
              <strong>ખજાનચી શ્રી નોંધ:</strong> આપનું મુખ્ય નિયંત્રણ <strong>દાન & નાણાકીય હિસાબ</strong> પર છે. સભ્ય અને કાર્યક્રમ મંજૂરી માટે મંત્રી શ્રી/પ્રમુખ શ્રીની મંજૂરી સત્તા રહેલી છે.
            </span>
          </div>
        </div>
      )}

      {currentUser.role === "secretary" && pathname.includes("donations") && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0 text-blue-700" />
            <span>
              <strong>મંત્રી શ્રી નોંધ:</strong> બેંક ખાતા વેરીફિકેશન, UPI UTR ચકાસણી અને પાવતી પ્રમાણીકરણ મુખ્યત્વે <strong>ખજાનચી શ્રી</strong> દ્વારા માન્ય કરવામાં આવે છે.
            </span>
          </div>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
    </div>
  );
}
