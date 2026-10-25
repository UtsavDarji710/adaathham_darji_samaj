"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle,
  Copy,
  Eye,
  LogOut,
  HelpCircle,
  Check,
  ChevronDown,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CREDENTIALS, RoleCredential } from "@/lib/roleCredentials";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, loginAs, currentUser, logout } = useAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>("president");

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await loginWithPhone(phone, pin);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        if (currentUser?.role && currentUser.role !== "member") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      }, 700);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg("કૃપા કરીને માન્ય ૧૦ આંકડાનો મોબાઇલ નંબર દાખલ કરો.");
      return;
    }
    setOtpSent(true);
    setErrorMsg(null);
  };

  const handleFastLogin = (cred: RoleCredential) => {
    loginAs(cred.role, cred.memberId);
    setSuccessMsg(`${cred.gujaratiTitle} (${cred.name}) તરીકે લૉગિન સફળ!`);
    setTimeout(() => {
      if (cred.role !== "member" && cred.role !== "guest") {
        router.push("/admin");
      } else if (cred.role === "member") {
        router.push("/profile");
      }
    }, 600);
  };

  const handleAutofill = (cred: RoleCredential) => {
    setPhone(cred.phone);
    setPin(cred.pin);
    setErrorMsg(null);
    setSuccessMsg(`ઓળખપત્ર ફોર્મમાં ભરાઈ ગયું: ${cred.gujaratiTitle}`);
  };

  const copyCreds = (phoneVal: string, roleName: string) => {
    navigator.clipboard.writeText(phoneVal.replace(/\s+/g, ""));
    setCopiedRole(roleName);
    setTimeout(() => setCopiedRole(null), 2000);
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
          સભ્ય લૉગિન & ભૂમિકા ઓળખપત્ર (Role Credentials)
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600">
          દરેક ભૂમિકા (પ્રમુખ, મંત્રી, સહમંત્રી, ખજાનચી, સભ્ય, અતિથિ) ના અધિકારો અને ફીચર્સ ચકાસવા માટે નીચે આપેલા ઓળખપત્ર વાપરો.
        </p>
      </div>

      {/* Currently Logged-in Status Pill */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-lg">
            {currentUser ? currentUser.name.charAt(0) : "🌐"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal-500 font-medium">હાલ સક્રિય સત્ર:</span>
              <strong className="text-xs text-charcoal-900">
                {currentUser ? currentUser.name : "અતિથિ (Logged Out / Public Guest)"}
              </strong>
              {currentUser && (
                <span className="text-[10px] bg-saffron-100 text-saffron-800 font-bold px-2 py-0.5 rounded-full">
                  {currentUser.committee_role || currentUser.role}
                </span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              {currentUser
                ? `મોબાઇલ: ${currentUser.phone} • શહેર: ${currentUser.city}`
                : "કોઈ પણ સત્ર સક્રિય નથી. તમે જાહેર મુલાકાતી તરીકે પોર્ટલ જોઈ રહ્યા છો."}
            </p>
          </div>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="px-3 py-1.5 rounded-lg border border-ivory-300 hover:border-saffron-400 text-xs font-bold text-charcoal-700 bg-ivory-50 transition-colors"
            >
              પ્રોફાઇલ
            </Link>
            {currentUser.role !== "member" && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg bg-forest-800 text-white text-xs font-bold shadow-xs hover:bg-forest-900 transition-colors"
              >
                એડમિન પેનલ
              </Link>
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>લૉગઆઉટ (અતિથિ બનો)</span>
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
            સાર્વજનિક મોડ સક્રિય
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: The Login Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-ivory-300 p-6 sm:p-7 shadow-card space-y-5">
          <div>
            <img
              src="/logo.png"
              alt="અડાઆઠમ દરજી સેવા સમિતિ"
              width={56}
              height={56}
              style={{ width: "56px", height: "56px", minWidth: "56px" }}
              className="w-14 h-14 object-contain rounded-full shadow-xs mb-3"
            />
            <h2 className="text-lg font-bold text-charcoal-900">
              સભ્ય / એડમિન લૉગિન
            </h2>
            <p className="text-xs text-charcoal-500">
              મોબાઈલ નંબર અને સિક્યુરિટી પિન દાખલ કરો.
            </p>
          </div>

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

          <form onSubmit={handlePhoneLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">
                નોંધાયેલ મોબાઈલ નંબર *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-charcoal-500">+૯૧</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98250 00001"
                  required
                  className="w-full pl-12 pr-3 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold text-charcoal-900"
                />
              </div>
            </div>

            {!isOtpMode ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-charcoal-700">સિક્યુરિટી પાસવર્ડ / પિન *</label>
                  <button
                    type="button"
                    onClick={() => setIsOtpMode(true)}
                    className="text-[11px] text-saffron-700 font-semibold hover:underline"
                  >
                    OTP વડે લોગિન
                  </button>
                </div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="દા.ત. 123456"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-mono"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-charcoal-700">મોબાઇલ OTP *</label>
                  <button
                    type="button"
                    onClick={() => setIsOtpMode(false)}
                    className="text-[11px] text-saffron-700 font-semibold hover:underline"
                  >
                    પાસવર્ડ મોડ
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="૬ આંકડાનો OTP"
                    className="flex-1 px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-2 bg-ivory-100 border border-ivory-300 rounded-xl font-bold text-charcoal-700 hover:bg-saffron-50"
                  >
                    {otpSent ? "OTP મોકલ્યો ✓" : "OTP મોકલો"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? "ચકાસણી ચાલુ છે..." : "લૉગિન કરો"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-charcoal-600 border-t border-ivory-200 pt-3">
            હજુ સમાજના સભ્ય નથી?{" "}
            <Link href="/register" className="font-bold text-saffron-700 hover:underline">
              નવા સભ્યની નોંધણી કરો →
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Role Testing Cards & Feature Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-saffron-600" />
                <span>ભૂમિકા-આધારિત ટેસ્ટ ઓળખપત્ર (Test Credentials)</span>
              </h2>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                ૧-ક્લિકમાં કોઈ પણ ભૂમિકા વડે લૉગિન કરો અથવા વિગતો ફોર્મમાં ભરો:
              </p>
            </div>
            <span className="text-[10px] font-bold bg-ivory-200 text-charcoal-700 px-2 py-0.5 rounded-md">
              પિન: 123456
            </span>
          </div>

          <div className="space-y-3">
            {ROLE_CREDENTIALS.map((cred) => {
              const isActive = cred.role === "guest" ? !currentUser : currentUser?.role === cred.role;
              const isExpanded = expandedRole === cred.role;

              return (
                <div
                  key={cred.role}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isActive
                      ? "bg-white border-saffron-400 shadow-sm ring-1 ring-saffron-400/30"
                      : "bg-white border-ivory-300 shadow-2xs hover:border-ivory-400"
                  }`}
                >
                  {/* Card Header Strip */}
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ivory-100 flex items-center justify-center text-xl flex-shrink-0">
                        {cred.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-charcoal-900">
                            {cred.gujaratiTitle}
                          </span>
                          <span className="text-[10px] text-charcoal-500 font-semibold">
                            ({cred.englishTitle})
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold bg-forest-100 text-forest-800 px-2 py-0.2 rounded-full border border-forest-300">
                              ✓ સક્રિય
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-600 mt-0.5">
                          {cred.name} {cred.cleanPhone && <span className="font-mono text-charcoal-500 font-semibold">• {cred.phone}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Fast Login & Autofill */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {cred.cleanPhone && (
                        <button
                          type="button"
                          onClick={() => handleAutofill(cred)}
                          className="px-2.5 py-1.5 rounded-lg border border-ivory-300 hover:border-saffron-400 text-[11px] font-bold text-charcoal-700 bg-ivory-50 transition-colors"
                          title="આ ઓળખપત્ર ફોર્મમાં ભરો"
                        >
                          ફોર્મમાં ભરો
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleFastLogin(cred)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 ${
                          isActive
                            ? "bg-forest-800 text-white"
                            : "bg-saffron-600 hover:bg-saffron-700 text-white"
                        }`}
                      >
                        <span>{cred.role === "guest" ? "અતિથિ બનો" : "૧-ક્લિક લૉગિન"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedRole(isExpanded ? null : cred.role)}
                        className="p-1.5 rounded-lg border border-ivory-300 text-charcoal-500 hover:text-charcoal-800 transition-colors"
                        title="ફીચર્સ અને પરવાનગી વિગત"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Permissions Breakdown */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-ivory-200 bg-ivory-50/60 text-xs space-y-2.5">
                      <p className="text-charcoal-600 text-[11px] leading-relaxed italic">
                        {cred.summary}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* What this user can see/do */}
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                          <span className="font-bold text-[11px] text-forest-800 flex items-center gap-1 mb-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-forest-600" />
                            શું જોઈ / કરી શકે છે?
                          </span>
                          <ul className="space-y-1 text-[11px] text-charcoal-700">
                            {cred.canSee.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-forest-600">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* What is restricted */}
                        <div className="bg-white p-2.5 rounded-xl border border-red-100 shadow-2xs">
                          <span className="font-bold text-[11px] text-red-800 flex items-center gap-1 mb-1.5">
                            <XCircle className="w-3.5 h-3.5 text-red-500" />
                            શું પ્રતિબંધિત છે?
                          </span>
                          <ul className="space-y-1 text-[11px] text-charcoal-700">
                            {cred.cannotSee.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-red-500">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
