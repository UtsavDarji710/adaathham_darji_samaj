"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle,
  LogOut,
  Users,
  Heart,
  Building,
  FileText,
  HelpCircle,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, loginWithEmailOtp, sendEmailOtp, currentUser, logout } = useAuth();

  // Mode: "email_otp" vs "phone_pin"
  const [authTab, setAuthTab] = useState<"email_otp" | "phone_pin">("email_otp");

  // Email OTP state
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Phone + PIN state
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  // Shared UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Request Email OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes("@")) {
      setErrorMsg("કૃપા કરીને માન્ય ઈમેઈલ એડ્રેસ દાખલ કરો.");
      return;
    }

    setLoading(true);
    const result = await sendEmailOtp(email, "login");
    setLoading(false);

    if (result.success) {
      setOtpSent(true);
      setCooldown(result.cooldownSeconds || 60);
      setSuccessMsg(`લૉગિન ઓટીપી આપના ઈમેઈલ (${email}) પર મોકલવામાં આવ્યો છે.`);
    } else {
      setErrorMsg(result.message);
    }
  };

  // Helper to resolve deep link callbackUrl
  const getRedirectUrl = (role?: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const callback = params.get("callbackUrl") || params.get("redirect");
      if (callback && !callback.startsWith("/login") && !callback.startsWith("/register")) {
        return callback;
      }
    }
    return role && role !== "member" ? "/admin" : "/";
  };

  // Verify Login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = emailOtp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg("કૃપા કરીને ૬-આંકડાનો માન્ય ઓટીપી દાખલ કરો.");
      return;
    }

    setLoading(true);
    const result = await loginWithEmailOtp(email, cleanOtp);
    setLoading(false);

    if (result.success) {
      setSuccessMsg("લૉગિન સફળ! પોર્ટલ પર લઈ જઈ રહ્યા છીએ...");
      setTimeout(() => {
        router.push(getRedirectUrl());
      }, 600);
    } else {
      setErrorMsg(result.message);
    }
  };

  // Phone + PIN Login
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("કૃપા કરીને ૧૦ અંકનો માન્ય મોબાઇલ નંબર દાખલ કરો.");
      return;
    }
    if (!pin) {
      setErrorMsg("કૃપા કરીને સિક્યોરિટી પિન દાખલ કરો.");
      return;
    }

    setLoading(true);
    const result = await loginWithPhone(cleanPhone, pin);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        router.push(getRedirectUrl());
      }, 600);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Title & Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
          <span>શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
          સભ્ય લૉગિન (Member Login)
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600">
          સુરક્ષિત ઈમેઈલ ઓટીપી અથવા મોબાઇલ નંબર વડે પોર્ટલમાં પ્રવેશ મેળવો.
        </p>
      </div>

      {/* Currently Logged-in Status Pill */}
      {currentUser && (
        <div className="bg-white rounded-2xl border border-forest-300 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-charcoal-500 font-medium">હાલ સક્રિય સત્ર:</span>
                <strong className="text-xs text-charcoal-900">{currentUser.name}</strong>
                <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded-full border border-forest-200">
                  {currentUser.committee_role || "સભ્ય"}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                ઈમેઈલ: {currentUser.email || "નોંધાયેલ નથી"} • શહેર: {currentUser.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-2xs transition-colors"
            >
              પ્રોફાઇલ જુઓ →
            </Link>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>લૉગઆઉટ</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Layout: Login Form on Left, Community Portal Benefits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Clean Login Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
          {/* Method Tabs: Email OTP vs Phone PIN */}
          <div className="grid grid-cols-2 p-1 bg-ivory-100 rounded-2xl border border-ivory-300 text-xs font-bold text-charcoal-600">
            <button
              type="button"
              onClick={() => {
                setAuthTab("email_otp");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authTab === "email_otp"
                  ? "bg-white text-saffron-800 shadow-2xs"
                  : "hover:text-charcoal-900"
              }`}
            >
              <Mail className="w-4 h-4 text-saffron-600" />
              <span>ઈમેઈલ ઓટીપી</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab("phone_pin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                authTab === "phone_pin"
                  ? "bg-white text-saffron-800 shadow-2xs"
                  : "hover:text-charcoal-900"
              }`}
            >
              <Phone className="w-4 h-4 text-forest-700" />
              <span>મોબાઇલ & પિન</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-forest-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: EMAIL OTP LOGIN */}
          {authTab === "email_otp" && (
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                // Step 1: Request OTP
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">
                      નોંધાયેલ ઈમેઈલ એડ્રેસ *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="તમારું ઈમેઈલ (દા.ત. name@gmail.com)"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-1">
                      આ ઈમેઈલ પર ૬-આંકડાનો સુરક્ષિત વેરિફિકેશન કોડ મોકલવામાં આવશે.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>
                      {loading
                        ? "મોકલી રહ્યું છે..."
                        : cooldown > 0
                        ? `ફરી મોકલવા માટે રાહ જુઓ (${cooldown}s)`
                        : "ઓટીપી મોકલો"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                // Step 2: Verify OTP
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-charcoal-500 font-semibold block">ઈમેઈલ:</span>
                      <span className="font-bold text-charcoal-900">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setEmailOtp("");
                      }}
                      className="text-saffron-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>બદલો</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">
                      ૬-આંકડાનો વેરિફિકેશન ઓટીપી *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      required
                      autoFocus
                      className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px] text-charcoal-500">
                      <span>ઓટીપી ૫ મિનિટ માટે માન્ય છે</span>
                      <button
                        type="button"
                        disabled={cooldown > 0 || loading}
                        onClick={handleRequestOtp}
                        className="text-saffron-700 font-bold hover:underline disabled:opacity-40"
                      >
                        {cooldown > 0 ? `ફરી મોકલો (${cooldown}s)` : "ફરી ઓટીપી મોકલો"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || emailOtp.length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? "ચકાસણી ચાલુ છે..." : "ચકાસો & લૉગિન કરો"}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PHONE + PIN LOGIN */}
          {authTab === "phone_pin" && (
            <form onSubmit={handlePhoneLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">નોંધાયેલ મોબાઇલ નંબર *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-500 font-bold">
                    +૯૧
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="૯૮૨૫૦ ૧૨૩૪૫"
                    required
                    maxLength={14}
                    className="w-full pl-12 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold text-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">સિક્યુરિટી પાસવર્ડ / પિન *</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="તમારો સિક્રેટ પાસવર્ડ અથવા ૬-આંકડાનો પિન"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? "ચકાસણી ચાલુ છે..." : "લૉગિન કરો"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center text-xs text-charcoal-600 border-t border-ivory-200 pt-3">
            હજુ સમાજના સભ્ય નથી?{" "}
            <Link href="/register" className="font-bold text-saffron-700 hover:underline">
              નવા સભ્યની નોંધણી કરો →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Community Portal Services Showcase (Production Grade) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-saffron-950 text-white rounded-3xl p-6 sm:p-8 shadow-card border border-charcoal-700 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="અડાઆઠમ દરજી સેવા સમિતિ"
                className="w-14 h-14 object-contain rounded-full shadow-md bg-white/10 p-1"
              />
              <div>
                <span className="text-[11px] text-saffron-300 font-bold uppercase tracking-wider block">
                  સત્તાવાર ડિજિટલ પોર્ટલ
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed">
              સમાજના પ્રત્યેક પરિવારને એક સૂત્રમાં બાંધવા અને સામાજિક, શૈક્ષણિક તથા વ્યાપારિક સહકાર આપવા માટે ડિજિટલ મંચ.
            </p>

            {/* Portal Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-saffron-300">
                  <Users className="w-4 h-4" />
                  <span>સભ્ય & વંશાવળી ડિરેક્ટરી</span>
                </div>
                <p className="text-[11px] text-ivory-300 leading-relaxed">
                  પરિવારના સભ્યો, મૂળ વતન અને સંબંધોની સંપૂર્ણ પ્રમાણિત માહિતી.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                  <Heart className="w-4 h-4" />
                  <span>વૈવાહિક મંચ (Matrimony)</span>
                </div>
                <p className="text-[11px] text-ivory-300 leading-relaxed">
                  અપરણિત યુવક-યુવતીઓના યોગ્ય જીવનસાથીની પસંદગી માટે સુરક્ષિત વ્યવસ્થા.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <Building className="w-4 h-4" />
                  <span>વ્યવસાય & રોજગાર</span>
                </div>
                <p className="text-[11px] text-ivory-300 leading-relaxed">
                  સમાજના ઉદ્યોગો, દુકાનો, સેવાઓની જાહેરાત અને યુવાનો માટે નોકરીની તકો.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                  <FileText className="w-4 h-4" />
                  <span>પરિપત્રો & કાર્યક્રમો</span>
                </div>
                <p className="text-[11px] text-ivory-300 leading-relaxed">
                  સમિતિના સત્તાવાર પરિપત્રો, વાર્ષિક ઉત્સવો અને સ્નેહમિલનની સમયસર સૂચનાઓ.
                </p>
              </div>
            </div>
          </div>

          {/* Help & Support Assistance Box */}
          <div className="bg-white rounded-3xl border border-ivory-300 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-saffron-100 text-saffron-800 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-charcoal-900">
                  લૉગિન કરવામાં સહાયતા જોઈએ છે?
                </h4>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  જો આપનો મોબાઇલ કે ઈમેઈલ બદલાયો હોય તો કાર્યાલયનો સંપર્ક કરો.
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[11px] text-charcoal-400 block">સહાયતા હેલ્પલાઇન:</span>
              <span className="font-bold text-saffron-800 font-mono">+૯૧ ૯૮૨૫૦ ૧૨૩૪૫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
