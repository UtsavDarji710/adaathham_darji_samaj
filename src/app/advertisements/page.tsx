"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Sparkles,
  CheckCircle,
  Plus,
  ShieldCheck,
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  Info,
  Lock,
  LogIn,
  UserPlus,
  Shield,
  X,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdvertisementsPage() {
  const { businesses, announcements, addBusiness, addLog } = useData();
  const { currentUser, isAdmin, loginAs } = useAuth();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state
  const [adTitle, setAdTitle] = useState("");
  const [category, setCategory] = useState("ટેલરિંગ & ફેશન ડિઝાઇનિંગ");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("મોડાસા");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [planDuration, setPlanDuration] = useState("1"); // 1 month, 3 months, 12 months
  const [coverUrl, setCoverUrl] = useState("");



  const paidBusinesses = businesses.filter((b) => b.is_featured || b.is_paid);

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowSubmitModal(false);
      setShowLoginPrompt(true);
      return;
    }
    const monthsNum = parseInt(planDuration);
    const cost = monthsNum === 1 ? 500 : monthsNum === 3 ? 1200 : 3500;

    addBusiness({
      owner_id: currentUser.id,
      owner_name: currentUser.name,
      name: adTitle,
      category,
      description,
      city,
      address: "મોડાસા",
      phone: phone || currentUser.phone,
      cover_url:
        coverUrl ||
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
      is_featured: true,
      is_paid: false, // Pending verification as requested: do not mark paid without confirmation
      paid_amount: cost,
      status: "pending", // Waiting for admin approval
    });

    addLog(
      "પેઇડ જાહેરાત સબમિટ",
      adTitle,
      `પ્લાન: ${monthsNum} મહિનો, રકમ: ₹${cost} (ચકાસણી પેન્ડિંગ)`,
      currentUser.name,
      currentUser.role || "member"
    );

    setShowSubmitModal(false);
    setAdTitle("");
    setDescription("");
    setSuccessToast("જાહેરાત મંજૂરી માટે મોકલાઈ ગઈ છે. સમિતિ દ્વારા ચકાસણી થયા બાદ સક્રિય થશે.");
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <Megaphone className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સમાજ જાહેરાતો (Advertisements)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            અડાઆઠમ દરજી સમાજના વ્યવસાયો, નવી દુકાનો અને સેવાઓનો સમાજવ્યાપી પ્રચાર.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              setShowLoginPrompt(true);
              return;
            }
            setShowSubmitModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>નવી જાહેરાત આપો</span>
        </button>
      </div>

      {/* Active Featured Advertisements Showcase */}
      <div>
        <h2 className="text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-saffron-600" />
          <span>માન્ય ફીચર્ડ જાહેરાતો (Active Showcase)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paidBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-ivory-200">
                  <img
                    src={biz.cover_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800"}
                    alt={biz.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    પ્રાયોજિત જાહેરાત
                  </span>
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-bold bg-ivory-200 text-charcoal-700 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    {biz.category}
                  </span>
                  <h3 className="font-bold text-base text-charcoal-900">{biz.name}</h3>
                  <p className="text-xs text-charcoal-600 mt-2 line-clamp-3 leading-relaxed">
                    {biz.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-ivory-200 mt-4 flex items-center justify-between text-xs">
                <a
                  href={`tel:${biz.phone}`}
                  className="font-bold text-forest-800 flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{biz.phone}</span>
                </a>
                <Link
                  href={`/businesses/${biz.id}`}
                  className="text-saffron-700 font-bold hover:underline"
                >
                  વિગત જુઓ →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Ad Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-bold text-base text-charcoal-900">
                નવી જાહેરાત સબમિટ કરો
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  જાહેરાત / વ્યવસાયનું શીર્ષક *
                </label>
                <input
                  type="text"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="જેમ કે શ્રી ગણેશ ફેશન સ્ટુડિયો"
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કેટેગરી *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">શહેર *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સંપર્ક નંબર *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">જાહેરાત સમયગાળો (અવધિ)</label>
                <select
                  value={planDuration}
                  onChange={(e) => setPlanDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                >
                  <option value="1">૧ મહિનો</option>
                  <option value="3">૩ મહિના</option>
                  <option value="12">૧ વર્ષ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">જાહેરાત લખાણ / સંદેશ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="ઓફર, ડિસ્કાઉન્ટ અથવા વ્યવસાયની માહિતી"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-ivory-100 text-[11px] text-charcoal-600 border border-ivory-200">
                <Info className="w-3.5 h-3.5 inline mr-1 text-saffron-700" />
                જાહેરાત સબમિટ થયા બાદ એડમિન દ્વારા ચુકવણીની પુષ્ટિ (Payment Verification) થશે અને ત્યારબાદ જ લાઈવ કરવામાં આવશે.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl font-semibold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold shadow-sm"
                >
                  જાહેરાત મોકલો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 p-2 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-ivory-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
                સુરક્ષિત સભ્ય ઝોન • લૉગિન આવશ્યક
              </span>
              <h3 className="font-extrabold text-xl text-charcoal-900">
                જાહેરાત આપવા માટે લૉગિન કરો
              </h3>
              <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                અડાઆઠમ દરજી સમાજના પોર્ટલ પર વ્યવસાયની જાહેરાત આપવા માટે સભ્ય લૉગિન આવશ્યક છે. આપના ખાતામાં લૉગિન કરો અથવા નવા સભ્ય તરીકે જોડાઓ.
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/login"
                className="w-full py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all group"
              >
                <LogIn className="w-4 h-4" />
                <span>સભ્ય લૉગિન કરો</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/register"
                className="w-full py-2.5 bg-white hover:bg-ivory-100 text-charcoal-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-ivory-300 shadow-2xs transition-colors"
              >
                <UserPlus className="w-4 h-4 text-forest-700" />
                <span>નવા સભ્યની નોંધણી કરો</span>
              </Link>
            </div>

            {/* Quick 1-click test buttons */}
            <div className="mt-6 pt-4 border-t border-ivory-200">
              <div className="text-[10px] text-charcoal-500 font-semibold mb-2 text-center">
                ટેસ્ટિંગ માટે ઝડપી ૧-ક્લિક લૉગિન & અનલૉક:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loginAs("president");
                    setShowLoginPrompt(false);
                    setShowSubmitModal(true);
                  }}
                  className="p-2 rounded-xl bg-saffron-50 hover:bg-saffron-100 border border-saffron-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs text-saffron-950">👑 પ્રમુખ શ્રી</div>
                  <div className="text-[10px] text-saffron-700">દિનેશભાઈ દરજી</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAs("member");
                    setShowLoginPrompt(false);
                    setShowSubmitModal(true);
                  }}
                  className="p-2 rounded-xl bg-forest-50 hover:bg-forest-100 border border-forest-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs text-forest-950">👤 સામાન્ય સભ્ય</div>
                  <div className="text-[10px] text-forest-700">ભાવિનકુમાર દરજી</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
