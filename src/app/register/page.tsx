"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  RefreshCw,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function RegisterPage() {
  const router = useRouter();
  const { sendEmailOtp, verifyEmailOtp, setCurrentUser } = useAuth();
  const { addMember, addLog } = useData();

  // Step 1: Input details, Step 2: OTP verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nativePlace, setNativePlace] = useState("અડાઆઠમ");
  const [city, setCity] = useState("મોડાસા");
  const [address, setAddress] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification state
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cooldown timer interval
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle Step 1: Submit Details & Request Email OTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!agreeTerms) {
      setErrorMsg("કૃપા કરીને સમાજ નિયમો અને શરતો સાથે સંમતિ આપો.");
      return;
    }

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3) {
      setErrorMsg("કૃપા કરીને લઘુત્તમ ૩ અક્ષરનું યુઝરનેમ (Username) દાખલ કરો.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUser)) {
      setErrorMsg("યુઝરનેમમાં માત્ર અંગ્રેજી અક્ષરો, અંકો અથવા અંડરસ્કોર (_) જ માન્ય છે (૩ થી ૩૦ અક્ષર).");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("કૃપા કરીને માન્ય ઈમેઈલ સરનામું દાખલ કરો.");
      return;
    }

    // Validate 10-digit Indian mobile number
    const cleanPhone = phone.replace(/\D/g, "");
    let digits = cleanPhone;
    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    }
    if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
      setErrorMsg("કૃપા કરીને માન્ય ૧૦-આંકડાનો ભારતીય મોબાઇલ નંબર દાખલ કરો (દા.ત. 98250 12345).");
      return;
    }

    // Password validation
    if (!password || password.trim().length < 6) {
      setErrorMsg("પાસવર્ડ લઘુત્તમ ૬ અક્ષરનો હોવો આવશ્યક છે.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("પાસવર્ડ અને કન્ફર્મ પાસવર્ડ બંને એકસમાન હોવા જોઈએ.");
      return;
    }

    setLoading(true);

    const result = await sendEmailOtp(email, "signup", { name, phone: digits });
    setLoading(false);

    if (result.success) {
      setStep(2);
      setCooldown(result.cooldownSeconds || 60);
      setSuccessMsg(
        `આપના ઈમેઈલ (${email}) પર ૬-આંકડાનો ઓટીપી મોકલવામાં આવ્યો છે. કૃપા કરીને નીચે દાખલ કરો.`
      );
    } else {
      setErrorMsg(result.message);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = await sendEmailOtp(email, "signup", { name, phone });
    setLoading(false);

    if (result.success) {
      setCooldown(result.cooldownSeconds || 60);
      setSuccessMsg("નવો ઓટીપી આપના ઈમેઈલ પર મોકલવામાં આવ્યો છે.");
    } else {
      setErrorMsg(result.message);
    }
  };

  // Handle Step 2: Verify OTP & Activate Account
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg("કૃપા કરીને ૬-આંકડાનો માન્ય ઓટીપી દાખલ કરો.");
      return;
    }

    setLoading(true);

    // Verify OTP first
    const verifyRes = await verifyEmailOtp(email, cleanOtp, "signup");

    if (!verifyRes.success) {
      setLoading(false);
      setErrorMsg(verifyRes.message);
      return;
    }

    // Now call register API to create verified member record
    try {
      const cleanPhone = phone.replace(/\D/g, "");
      const cleanUser = username.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          name,
          email,
          phone: cleanPhone,
          password: password.trim(),
          isEmailVerified: true,
          native_place: nativePlace,
          city,
          address,
        }),
      });

      const regData = await res.json();
      setLoading(false);

      if (regData.success && regData.member) {
        // Establish authenticated state
        setCurrentUser(regData.member);
        addMember(regData.member);
        addLog(
          "નવા સભ્યની નોંધણી (Email OTP Verified)",
          name,
          `ઈમેઈલ: ${email}, ફોન: +91${cleanPhone}`,
          name,
          "member"
        );

        setSuccessMsg("ઓટીપી ચકાસણી સફળ! આપનું ખાતું સક્રિય થઈ ગયું છે. પ્રોફાઇલ પર જઈ રહ્યા છો...");
        setTimeout(() => {
          router.push("/profile");
        }, 1200);
      } else {
        setErrorMsg(regData.message || "ખાતું સક્રિય કરવામાં ક્ષતિ આવી.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg("સર્વર જોડાણમાં ક્ષતિ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-12">
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-10 shadow-card">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="અડાઆઠમ દરજી સેવા સમિતિ"
            width={64}
            height={64}
            style={{ width: "64px", height: "64px", minWidth: "64px" }}
            className="w-16 h-16 object-contain rounded-full shadow-md mx-auto mb-3"
          />
          <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
            નવા સભ્યની નોંધણી (Member Registration)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            અડાઆઠમ દરજી સમાજ પરિવાર ડિરેક્ટરી સાથે જોડાઓ • સુરક્ષિત ઈમેઈલ ઓટીપી ચકાસણી
          </p>

          {/* Stepper Progress Pill */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                step === 1
                  ? "bg-saffron-600 text-white shadow-2xs"
                  : "bg-forest-100 text-forest-800"
              }`}
            >
              ૧. વિગતો દાખલ કરો
            </span>
            <span className="text-charcoal-300">→</span>
            <span
              className={`px-3 py-1 rounded-full transition-all ${
                step === 2
                  ? "bg-saffron-600 text-white shadow-2xs"
                  : "bg-ivory-200 text-charcoal-500"
              }`}
            >
              ૨. ઈમેઈલ ઓટીપી ચકાસણી
            </span>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-forest-600" />
            <span>{successMsg}</span>
          </div>
        )}


        {/* STEP 1: REGISTRATION DETAILS FORM */}
        {step === 1 && (
          <form onSubmit={handleInitiateSignup} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  પૂરું નામ (Full Name) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="નામ પિતાનું નામ અટક"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-saffron-600" />
                    <span>યુઝરનેમ (Username) *</span>
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-normal">૩-૩૦ અક્ષર</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""))}
                  placeholder="દા.ત. utsav અથવા utsav_darji"
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-mono font-medium"
                />
                <p className="text-[10px] text-charcoal-400 mt-0.5">
                  (લૉગિન કરવા માટે આ જ યુઝરનેમનો ઉપયોગ કરવાનો રહેશે)
                </p>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-saffron-600" />
                  <span>ઈમેઈલ એડ્રેસ (Email Address) *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="તમારો ઈમેઈલ (ઓટીપી આના પર આવશે)"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-forest-700" />
                  <span>મોબાઈલ નંબર (Mobile Number) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-charcoal-500">+૯૧</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98250 12345"
                    required
                    className="w-full pl-12 pr-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-saffron-600" />
                    <span>પાસવર્ડ (Password) *</span>
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-normal">લઘુત્તમ ૬ અક્ષર</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 pr-10 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-saffron-600" />
                  <span>કન્ફર્મ પાસવર્ડ (Confirm Password) *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 pr-10 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-charcoal-400 hover:text-charcoal-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">મૂળ વતન (Native Place) *</label>
                <input
                  type="text"
                  value={nativePlace}
                  onChange={(e) => setNativePlace(e.target.value)}
                  placeholder="અડાઆઠમ, ધનસુરા વગેરે"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">હાલનું શહેર (Current City) *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="મોડાસા, અમદાવાદ વગેરે"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">રહેઠાણનું સરનામું (Address)</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ઘર નંબર, સોસાયટીનું નામ, રોડ, વિસ્તાર..."
                rows={2}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 text-saffron-600 rounded border-ivory-300 focus:ring-saffron-500"
              />
              <label htmlFor="terms" className="text-xs text-charcoal-600">
                હું શ્રી અડાઆઠમ દરજી સેવા સમિતિના નિયમો અને આચારસંહિતા સ્વીકારું છું.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 text-sm"
            >
              <span>{loading ? "ઓટીપી મોકલી રહ્યા છીએ..." : "ઓટીપી મેળવો અને આગળ વધો"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION SCREEN */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndComplete} className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-saffron-50/70 border border-saffron-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-600">નોંધાયેલ ઈમેઈલ સરનામું:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-saffron-700 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>ઈમેઈલ બદલો</span>
                </button>
              </div>
              <p className="font-bold text-charcoal-900 text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-saffron-600" />
                <span>{email}</span>
              </p>
              <p className="text-[11px] text-charcoal-500">
                આ ઈમેઈલ પર ૬-આંકડાનો વેરિફિકેશન કોડ મોકલવામાં આવ્યો છે. (માન્યતા: ૫ મિનિટ)
              </p>
            </div>

            <div>
              <label className="block font-bold text-charcoal-800 text-sm mb-2 text-center">
                ૬-આંકડાનો સુરક્ષિત OTP દાખલ કરો *
              </label>
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  className="w-full text-center tracking-[12px] text-2xl font-black py-3 border-2 border-saffron-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-saffron-100 bg-white shadow-xs font-mono"
                />
              </div>
            </div>

            {/* Cooldown and Resend OTP */}
            <div className="flex items-center justify-between pt-2 border-t border-ivory-200">
              <span className="text-charcoal-500">ઓટીપી મળ્યો નથી?</span>
              {cooldown > 0 ? (
                <span className="text-xs font-semibold text-charcoal-500">
                  ફરીથી મોકલો: {cooldown} સેકન્ડ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-saffron-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ફરીથી OTP મોકલો (Resend)</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4 text-sm disabled:opacity-50"
            >
              <span>{loading ? "ચકાસણી ચાલુ છે..." : "ઓટીપી ચકાસો અને નોંધણી પૂર્ણ કરો"}</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-ivory-200 text-center text-xs text-charcoal-500">
          પહેલેથી જ નોંધાયેલા છો?{" "}
          <Link href="/login" className="font-bold text-saffron-700 hover:underline">
            અહીં લૉગિન કરો
          </Link>
        </div>
      </div>
    </div>
  );
}
