"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";

export default function RegisterPage() {
  const router = useRouter();
  const { registerMember } = useAuth();
  const { addMember, addLog } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nativePlace, setNativePlace] = useState("અડાઆઠમ");
  const [city, setCity] = useState("મોડાસા");
  const [district, setDistrict] = useState("અરવલ્લી");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("383315");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [profession, setProfession] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setErrorMsg("કૃપા કરીને સમાજ નિયમો અને શરતો સાથે સંમતિ આપો.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const result = await registerMember({
      name,
      phone,
      native_place: nativePlace,
      city,
      district,
      address,
      pincode,
      gender,
      employment: profession
        ? {
            company: profession,
            job_title: profession,
            industry: "સામાન્ય",
            city,
            experience_years: "1 વર્ષ",
          }
        : undefined,
    });

    setLoading(false);

    if (result.success && result.member) {
      addMember(result.member);
      addLog(
        "નવા સભ્યની નોંધણી",
        name,
        `ગામ: ${nativePlace}, શહેર: ${city}, ફોન: ${phone}`,
        name,
        "member"
      );
      router.push("/profile");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-10 shadow-card">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="અડાઆઠમ દરજી સેવા સમિતિ"
            width={64}
            height={64}
            style={{ width: "64px", height: "64px", minWidth: "64px" }}
            className="w-16 h-16 object-contain rounded-full shadow-md mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-charcoal-900">
            નવા સભ્યની નોંધણી (Member Registration)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            અડાઆઠમ દરજી સમાજ પરિવાર ડિરેક્ટરી સાથે જોડાઓ
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">પૂરું નામ *</label>
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
              <label className="block font-bold text-charcoal-700 mb-1">મોબાઈલ નંબર *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="૧૦ આંકડાનો નંબર"
                required
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">મૂળ વતન *</label>
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
              <label className="block font-bold text-charcoal-700 mb-1">હાલનું શહેર *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="મોડાસા, અમદાવાદ વગેરે"
                required
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">જિલ્લો</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">જાતિ / લિંગ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl bg-white focus:outline-none"
              >
                <option value="male">પુરુષ</option>
                <option value="female">મહિલા</option>
                <option value="other">અન્ય</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય / રોજગાર</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="ટેલરિંગ, વેપાર, નોકરી, અભ્યાસ વગેરે"
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-charcoal-700 mb-1">સરનામું</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="ઘર નંબર, સોસાયટી અથવા વિસ્તાર"
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded text-saffron-600 focus:ring-saffron-500 mt-0.5"
              />
              <span className="text-[11px] text-charcoal-600 leading-normal">
                હું ખાતરી આપું છું કે આપેલ માહિતી સત્ય છે અને હું શ્રી અડાઆઠમ દરજી સેવા સમિતિના નિયમોનું પાલન કરીશ. મારી ગોપનીયતા પસંદગી અનુસાર જ મારો ડેટા ડિરેક્ટરીમાં પ્રદર્શિત થશે.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? "નોંધણી ચાલુ છે..." : "નોંધણી પૂર્ણ કરો"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-600 border-t border-ivory-200 pt-4">
          પહેલેથી નોંધાયેલા છો?{" "}
          <Link href="/login" className="font-bold text-saffron-700 hover:underline">
            અહીં લોગિન કરો →
          </Link>
        </div>
      </div>
    </div>
  );
}
