"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  GitFork,
  Briefcase,
  Megaphone,
  Calendar,
  Heart,
  ShieldCheck,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AdminRole } from "@/types";
import { ROLE_CREDENTIALS } from "@/lib/roleCredentials";

export default function Header() {
  const pathname = usePathname();
  const { currentUser, logout, loginAs, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Removed "મુખ્ય પૃષ્ઠ" tab as requested: logo/brand is the default home
  // "પરિવાર વૃક્ષ" tab is only shown for logged-in members (not shown in public mode)
  const navLinks = [
    ...(currentUser
      ? [
          {
            href: "/family-tree",
            label: "પરિવાર વૃક્ષ",
            icon: GitFork,
            badge: "વિશેષ",
          },
        ]
      : []),
    { href: "/members", label: "સભ્યો", icon: Users },
    { href: "/businesses", label: "વ્યવસાય", icon: Briefcase },
    { href: "/advertisements", label: "જાહેરાતો", icon: Megaphone },
    { href: "/events", label: "કાર્યક્રમો", icon: Calendar },
    { href: "/donors", label: "દાતાઓ", icon: Heart },
    { href: "/committee", label: "સમિતિ", icon: ShieldCheck },
  ];

  const adminRoles: { role: AdminRole; label: string; name: string }[] = [
    { role: "president", label: "પ્રમુખ", name: "દિનેશભાઈ દરજી" },
    { role: "secretary", label: "મંત્રી", name: "મહેન્દ્રભાઈ દરજી" },
    { role: "joint_secretary", label: "સહમંત્રી", name: "હસમુખભાઈ દરજી" },
    { role: "treasurer", label: "ખજાનચી", name: "રમેશભાઈ દરજી" },
  ];

  const getGujaratiRoleLabel = (role?: AdminRole) => {
    switch (role) {
      case "president":
        return "પ્રમુખ શ્રી";
      case "secretary":
        return "મંત્રી શ્રી";
      case "joint_secretary":
        return "સહમંત્રી શ્રી";
      case "treasurer":
        return "ખજાનચી શ્રી";
      case "admin":
        return "એડમિન";
      default:
        return "સભ્ય";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ivory-300 shadow-soft">
      {/* Top Announcements & Quick Switcher Strip */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-saffron-950 text-white text-[11px] px-3 sm:px-6 py-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 bg-saffron-600/30 text-saffron-300 font-semibold px-2 py-0.2 rounded-full border border-saffron-500/40 text-[10px]">
            <Sparkles className="w-3 h-3 text-saffron-400" />
            જય શ્રી ચામુંડા માતાજી
          </span>
          <span className="hidden sm:inline text-ivory-200 truncate">
            શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા — સત્તાવાર ડિજિટલ પોર્ટલ
          </span>
        </div>

        {/* Quick Role Switcher for demonstration & testing */}
        <div className="flex items-center gap-2 ml-auto text-[11px] flex-shrink-0">
          <span className="hidden md:inline text-ivory-300 text-[10px]">ભૂમિકા પર સ્વિચ કરો:</span>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white font-medium transition-colors border border-white/20 text-[11px]"
              title="ડેમો માટે ભૂમિકા બદલો"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`}></span>
              <span>
                {currentUser
                  ? `${getGujaratiRoleLabel(currentUser.role)}: ${currentUser.name.split(" ")[0]}`
                  : "અતિથિ (Guest)"}
              </span>
              <ChevronDown className="w-3 h-3 text-ivory-300" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 bg-white text-charcoal-900 rounded-xl shadow-hover border border-ivory-300 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-charcoal-500 uppercase tracking-wider border-b border-ivory-200 flex items-center justify-between">
                  <span>ભૂમિકા ટેસ્ટ ઓળખપત્ર</span>
                  <span className="text-[9px] font-normal text-saffron-700">પિન: 123456</span>
                </div>

                <div className="py-1 max-h-72 overflow-y-auto">
                  {ROLE_CREDENTIALS.map((cred) => {
                    const isSelected = cred.role === "guest" ? !currentUser : currentUser?.role === cred.role;
                    return (
                      <button
                        key={cred.role}
                        onClick={() => loginAs(cred.role, cred.memberId)}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-saffron-50 flex items-center justify-between transition-colors ${
                          isSelected ? "bg-saffron-50/80 font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cred.emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-charcoal-900">{cred.gujaratiTitle}</span>
                              {cred.cleanPhone && (
                                <span className="text-[9px] text-charcoal-400 font-mono">({cred.phone.split(" ")[1] || cred.phone})</span>
                              )}
                            </div>
                            <span className="text-charcoal-500 block text-[10px] truncate max-w-[140px]">{cred.name}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] text-forest-700 font-bold bg-forest-50 px-1.5 py-0.5 rounded border border-forest-200">
                            ✓ સક્રિય
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-ivory-200 p-2 text-center bg-ivory-50">
                  <Link
                    href="/login"
                    className="text-[11px] font-bold text-saffron-700 hover:underline block"
                  >
                    બધા ઓળખપત્ર & વિગત જુઓ →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16">
          {/* Brand Logo & Name (Default Home Page) */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0"
            title="અડાઆઠમ દરજી સમાજ — હોમ પેજ"
          >
            <img
              src="/logo.png"
              alt="અડાઆઠમ દરજી સેવા સમિતિ"
              width={44}
              height={44}
              style={{ width: "44px", height: "44px", minWidth: "44px" }}
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-full shadow-2xs group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base lg:text-lg text-charcoal-900 tracking-tight leading-none group-hover:text-saffron-700 transition-colors">
                  અડાઆઠમ દરજી સમાજ
                </span>
                <span className="hidden 2xl:inline text-[9px] font-semibold bg-saffron-100 text-saffron-800 px-1.5 py-0.2 rounded-full border border-saffron-200">
                  મોડાસા
                </span>
              </div>
              <p className="text-[10px] text-charcoal-500 font-medium mt-0.5 hidden 2xl:block">
                શ્રી અડાઆઠમ દરજી સેવા સમિતિ
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links — All Tabs Managed Cleanly in a Single Row */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-nowrap">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1 px-1.5 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "text-saffron-700 bg-saffron-50 font-bold"
                      : "text-charcoal-700 hover:text-saffron-700 hover:bg-ivory-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0 ${isActive ? "text-saffron-600" : "text-charcoal-400"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="hidden xl:inline text-[9px] bg-gradient-to-r from-saffron-600 to-saffron-700 text-white font-bold px-1.5 py-0.2 rounded-full leading-none">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-saffron-600 rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Admin Link in Navbar */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`relative flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-bold transition-all whitespace-nowrap ml-0.5 ${
                  pathname.startsWith("/admin")
                    ? "bg-forest-800 text-white"
                    : "text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0 text-forest-700" />
                <span>
                  <span className="xl:hidden">એડમિન</span>
                  <span className="hidden xl:inline">એડમિન પેનલ</span>
                </span>
              </Link>
            )}
          </nav>

          {/* Right Action / Profile Button */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/profile"
                  className={`flex items-center gap-1.5 px-2 xl:px-2.5 py-1 rounded-xl border transition-all ${
                    pathname === "/profile"
                      ? "bg-saffron-50 border-saffron-300 text-saffron-800 shadow-2xs"
                      : "bg-white border-ivory-300 hover:border-saffron-400 text-charcoal-800 shadow-2xs"
                  }`}
                >
                  <img
                    src={currentUser.photo_url}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-saffron-400 flex-shrink-0"
                  />
                  <div className="text-left text-xs leading-none">
                    <span className="font-bold text-[11px] block">{currentUser.name.split(" ")[0]}</span>
                    <span className="text-[9px] text-charcoal-500 hidden xl:block">પ્રોફાઇલ</span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="p-1 xl:p-1.5 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="લોગઆઉટ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 font-semibold text-charcoal-800 hover:text-saffron-700 hover:bg-ivory-100 rounded-lg transition-colors"
                >
                  લોગિન
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 font-bold bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg shadow-2xs transition-colors"
                >
                  સભ્ય બનો
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button (< lg) */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser && (
              <Link href="/profile" className="p-0.5 rounded-full border border-saffron-400">
                <img
                  src={currentUser.photo_url}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-charcoal-700 hover:text-saffron-700 hover:bg-ivory-100 transition-colors focus:outline-none"
              aria-label="મેનુ ખોલો"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-ivory-300 shadow-xl animate-in slide-in-from-top-3 duration-200">
          <div className="px-4 pt-2.5 pb-5 space-y-1 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-saffron-700 bg-saffron-50 border border-saffron-200"
                      : "text-charcoal-800 hover:bg-ivory-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-saffron-600" : "text-charcoal-500"}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] bg-saffron-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="border-t border-ivory-200 pt-2.5 mt-2 space-y-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200"
                >
                  <ShieldCheck className="w-4 h-4 text-forest-700" />
                  <span>એડમિન ડેશબોર્ડ</span>
                </Link>
              )}

              {currentUser ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-800 hover:bg-ivory-100"
                  >
                    <User className="w-4 h-4 text-saffron-600" />
                    <span>મારી પ્રોફાઇલ ({currentUser.name})</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>લોગઆઉટ</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 rounded-xl font-semibold border border-ivory-300 text-charcoal-800 hover:bg-ivory-100 text-xs"
                  >
                    લોગિન
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 rounded-xl font-bold bg-saffron-600 text-white shadow-xs text-xs"
                  >
                    નોંધણી કરો
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
