"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
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
  Eye,
  EyeOff,
  KeyRound,
  X,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const {
    loginWithPassword,
    forgotPassword,
    resetPassword,
    currentUser,
    logout,
  } = useAuth();

  // Login Credentials (Strict Username + Password)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Shared UI states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password Modal State (Email Verification)
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Forgot password cooldown countdown timer
  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldown]);

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

  // Submit Username + Password Login
  const handleUsernamePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMsg("કૃપા કરીને આપનું યુઝરનેમ (Username) દાખલ કરો.");
      return;
    }
    if (!password) {
      setErrorMsg("કૃપા કરીને આપનો પાસવર્ડ (Password) દાખલ કરો.");
      return;
    }

    setLoading(true);
    const result = await loginWithPassword(cleanUser, password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || "લૉગિન સફળ! પોર્ટલ પર લઈ જઈ રહ્યા છીએ...");
      setTimeout(() => {
        router.push(getRedirectUrl(result.user?.role));
      }, 500);
    } else {
      setErrorMsg(result.message);
    }
  };

  // Open Forgot Password Modal
  const openForgotPasswordModal = () => {
    setErrorMsg(null);
    setForgotError(null);
    setForgotSuccess(null);
    setForgotStep(1);
    setForgotEmail("");
    setForgotUsername("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setIsForgotOpen(true);
  };

  // Forgot Password Step 1: Send Reset OTP to registered Email
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      setForgotError("કૃપા કરીને માન્ય નોંધાયેલું ઈમેઈલ સરનામું દાખલ કરો.");
      return;
    }

    setForgotLoading(true);
    const result = await forgotPassword(targetEmail);
    setForgotLoading(false);

    if (result.success) {
      if (result.username) {
        setForgotUsername(result.username);
      }
      setForgotStep(2);
      setForgotCooldown(result.cooldownSeconds || 60);
      setForgotSuccess(
        `પાસવર્ડ રીસેટ ઓટીપી આપના ઈમેઈલ (${targetEmail}) પર મોકલવામાં આવ્યો છે.`
      );
    } else {
      setForgotError(result.message);
    }
  };

  // Forgot Password Resend OTP
  const handleResendResetOtp = async () => {
    if (forgotCooldown > 0 || forgotLoading) return;
    setForgotError(null);
    setForgotSuccess(null);

    setForgotLoading(true);
    const result = await forgotPassword(forgotEmail.trim().toLowerCase());
    setForgotLoading(false);

    if (result.success) {
      setForgotCooldown(result.cooldownSeconds || 60);
      setForgotSuccess("નવો રીસેટ ઓટીપી આપના ઈમેઈલ પર મોકલવામાં આવ્યો છે.");
    } else {
      setForgotError(result.message);
    }
  };

  // Forgot Password Step 2: Verify OTP & Set New Password
  const handlePerformResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const cleanOtp = forgotOtp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setForgotError("કૃપા કરીને ૬-આંકડાનો માન્ય ઓટીપી દાખલ કરો.");
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError("નવો પાસવર્ડ લઘુત્તમ ૬ અક્ષરનો હોવો આવશ્યક છે.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("નવો પાસવર્ડ અને કન્ફર્મ પાસવર્ડ બંને એકસમાન હોવા જોઈએ.");
      return;
    }

    setForgotLoading(true);
    const result = await resetPassword(
      forgotEmail.trim().toLowerCase(),
      cleanOtp,
      forgotNewPassword
    );
    setForgotLoading(false);

    if (result.success) {
      const resolvedUsername = result.username || forgotUsername;
      setIsForgotOpen(false);
      if (resolvedUsername) {
        setUsername(resolvedUsername);
      }
      setPassword("");
      setSuccessMsg(
        resolvedUsername
          ? `પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે આપના યુઝરનેમ (${resolvedUsername}) અને નવા પાસવર્ડ વડે લૉગિન કરો.`
          : "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે! હવે આપના યુઝરનેમ અને નવા પાસવર્ડ વડે લૉગિન કરો."
      );
    } else {
      setForgotError(result.message);
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
          આપના યુઝરનેમ (Username) અને પાસવર્ડ વડે સભ્ય ખાતામાં સુરક્ષિત પ્રવેશ કરો.
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
                યુઝરનેમ: <span className="font-mono font-bold text-charcoal-700">{currentUser.username || "સેટ નથી"}</span> • શહેર: {currentUser.city}
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

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Clean Username + Password Login Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-ivory-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-saffron-700" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
                  સુરક્ષિત સભ્ય પ્રવેશ
                </h2>
                <p className="text-[11px] text-charcoal-500">
                  યુઝરનેમ અને પાસવર્ડ દ્વારા સીધું લૉગિન
                </p>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-forest-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SINGLE LOGIN FLOW: USERNAME & PASSWORD */}
          <form onSubmit={handleUsernamePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">
                યુઝરનેમ (Username) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="દા.ત. utsav અથવા આપનું યુઝરનેમ"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-mono font-medium text-charcoal-900"
                />
              </div>
              <p className="text-[10px] text-charcoal-400 mt-1">
                નોંધણી વખતે પસંદ કરેલ યુઝરનેમ દાખલ કરો
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-charcoal-700">પાસવર્ડ (Password) *</label>
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-[11px] font-bold text-saffron-700 hover:text-saffron-800 hover:underline"
                >
                  પાસવર્ડ ભૂલી ગયા?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="તમારો સિક્રેટ પાસવર્ડ"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "ચકાસણી ચાલુ છે..." : "લૉગિન કરો (Login)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Test Credentials Quick Reference */}
          <div className="p-3 rounded-2xl bg-ivory-50 border border-ivory-200 text-[11px] text-charcoal-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-charcoal-800">
              <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
              <span>ટેસ્ટ ડેમો એકાઉન્ટ્સ (Demo Credentials):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div
                onClick={() => {
                  setUsername("utsav");
                  setPassword("Samaj@123");
                }}
                className="p-2 rounded-xl bg-white border border-ivory-300 hover:border-saffron-400 cursor-pointer transition-all shadow-2xs"
              >
                <span className="block font-bold text-saffron-800">👑 એડમિન (Admin)</span>
                <span className="text-charcoal-700">યુઝર: utsav</span>
                <span className="block text-charcoal-500">પાસ: Samaj@123</span>
              </div>
              <div
                onClick={() => {
                  setUsername("dinesh");
                  setPassword("Samaj@123");
                }}
                className="p-2 rounded-xl bg-white border border-ivory-300 hover:border-forest-400 cursor-pointer transition-all shadow-2xs"
              >
                <span className="block font-bold text-forest-800">👤 સભ્ય (Member)</span>
                <span className="text-charcoal-700">યુઝર: dinesh</span>
                <span className="block text-charcoal-500">પાસ: Samaj@123</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-charcoal-600 border-t border-ivory-200 pt-3">
            હજુ સુધી ખાતું નથી?{" "}
            <Link href="/register" className="font-bold text-saffron-700 hover:underline">
              નવી સભ્ય નોંધણી (Register Here) →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Community Portal Services Showcase */}
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
                  ADSS સત્તાવાર ડિજિટલ પોર્ટલ
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
                  જો આપ યુઝરનેમ ભૂલી ગયા હોવ અથવા ઈમેઈલ બદલાયો હોય તો કાર્યાલયનો સંપર્ક કરો.
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[11px] text-charcoal-400 block">સહાયતા હેલ્પલાઇન:</span>
              <a href="tel:7383755226" className="font-bold text-saffron-800 font-mono hover:underline">
                7383755226
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT / RESET PASSWORD MODAL (EMAIL OTP VERIFICATION) */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-ivory-300 max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-ivory-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-saffron-100 text-saffron-800 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-charcoal-900 text-base">
                    પાસવર્ડ રીસેટ કરો (Reset Password)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    {forgotStep === 1
                      ? "આપના નોંધાયેલા ઈમેઈલ પર ઓટીપી મોકલી પાસવર્ડ રીસેટ કરો."
                      : "ઓટીપી ચકાસી નવો પાસવર્ડ સેટ કરો."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-ivory-100 text-charcoal-400 hover:text-charcoal-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Alerts inside Modal */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-forest-600 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Enter Registered Email & Request OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    નોંધાયેલું ઈમેઈલ એડ્રેસ (Registered Email) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="દા.ત. utsavdarji102001@gmail.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    પાસવર્ડ રીસેટ કરવા માટે આ નોંધાયેલા ઈમેઈલ પર ૬-આંકડાનો સુરક્ષિત ઓટીપી મોકલવામાં આવશે.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-bold cursor-pointer"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotCooldown > 0}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{forgotLoading ? "મોકલી રહ્યું છે..." : "રીસેટ ઓટીપી મોકલો"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Verify Email OTP & Set New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handlePerformResetPassword} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-300 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-charcoal-500 font-semibold block">ઈમેઈલ:</span>
                    <span className="font-bold text-charcoal-900">{forgotEmail}</span>
                    {forgotUsername && (
                      <span className="text-[11px] text-saffron-800 font-mono block mt-0.5">
                        યુઝરનેમ: <strong>{forgotUsername}</strong>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotOtp("");
                    }}
                    className="text-saffron-700 hover:underline flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>બદલો</span>
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    ૬-આંકડાનો રીસેટ ઓટીપી (Email OTP) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    required
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-charcoal-500">
                    <span>ઓટીપી ૧૦ મિનિટ માટે માન્ય છે</span>
                    <button
                      type="button"
                      disabled={forgotCooldown > 0 || forgotLoading}
                      onClick={handleResendResetOtp}
                      className="text-saffron-700 font-bold hover:underline disabled:opacity-40 cursor-pointer"
                    >
                      {forgotCooldown > 0 ? `ફરી મોકલો (${forgotCooldown}s)` : "ફરી ઓટીપી મોકલો"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    નવો પાસવર્ડ (New Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotPass ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="ઓછામાં ઓછા ૬ અક્ષર"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                    >
                      {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    નવો પાસવર્ડ કન્ફર્મ કરો (Confirm Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotConfirm ? "text" : "password"}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="ફરીથી પાસવર્ડ દાખલ કરો"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirm(!showForgotConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                    >
                      {showForgotConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-bold cursor-pointer"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{forgotLoading ? "અપડેટ ચાલુ છે..." : "નવો પાસવર્ડ સેટ કરો"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
