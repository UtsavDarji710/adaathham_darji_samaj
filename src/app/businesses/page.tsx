"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Plus,
  CheckCircle,
  X,
  Filter,
  Lock,
  LogIn,
  UserPlus,
  Shield,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { BusinessItem, DEFAULT_BUSINESS_COVER } from "@/types";

export default function BusinessDirectoryPage() {
  const { businesses, members, addBusiness, addLog } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmittingBusiness, setIsSubmittingBusiness] = useState(false);

  // New business form state
  const [bizName, setBizName] = useState("");
  const [category, setCategory] = useState("ટેલરિંગ & ફેશન ડિઝાઇનિંગ");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState(currentUser?.city || "મોડાસા");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPaidAd, setIsPaidAd] = useState(false);

  // Categories list
  const categories = [
    "ટેલરિંગ & ફેશન ડિઝાઇનિંગ",
    "જ્વેલર્સ & સોના-ચાંદી વેપાર",
    "કરિયાણું & દૈનિક જરૂરિયાતો",
    "સીએ & નાણાકીય સેવાઓ",
    "મેડિકલ & આરોગ્ય સેવાઓ",
    "ટેક્સટાઇલ & કાપડ ઉત્પાદન",
    "ઇલેક્ટ્રોનિક્સ & મોબાઇલ",
    "બાંધકામ & આર્કિટેક્ચર",
    "અન્ય વ્યવસાય",
  ];

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // 1. Privacy filter: exclude any business marked non-public or inactive
      if (b.status !== "active" || b.is_public === false) return false;

      // 2. Cross-check owning member's profile privacy preference if linked to a member
      const cleanPhone = b.phone ? b.phone.replace(/\D/g, "") : "";
      const ownerMember = members.find(
        (m) =>
          (b.owner_id && (m.id === b.owner_id || m.auth_user_id === b.owner_id)) ||
          (cleanPhone && m.phone && m.phone.replace(/\D/g, "") === cleanPhone)
      );
      if (ownerMember) {
        // If owner explicitly cleared their business or set to private in profile
        if (
          ownerMember.business &&
          (!ownerMember.business.business_name?.trim() || ownerMember.business.is_public === false)
        ) {
          return false;
        }
        // If owner set their overall business privacy to private
        if (ownerMember.privacy?.business === "private") {
          return false;
        }
      }

      const matchSearch =
        searchQuery.trim() === "" ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.owner_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = selectedCategory === "all" || b.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [businesses, members, searchQuery, selectedCategory]);

  const handleAddBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAddModal(false);
      setShowLoginPrompt(true);
      return;
    }
    if (!bizName.trim() || !phone.trim()) return;

    setIsSubmittingBusiness(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      addBusiness({
        owner_id: currentUser.id,
        owner_name: currentUser.name,
        name: bizName,
        category,
        description,
        city,
        address,
        phone: phone || currentUser.phone,
        email: email || undefined,
        website: website || undefined,
        cover_url: coverUrl.trim() || null,
        is_featured: isPaidAd,
        is_paid: isPaidAd,
        paid_amount: isPaidAd ? 1500 : 0,
        status: "active",
      });

      addLog(
        "નવો વ્યવસાય ઉમેર્યો",
        bizName,
        `કેટેગરી: ${category}, શહેર: ${city}`,
        currentUser.name,
        currentUser.role || "member"
      );

      setShowAddModal(false);
      setBizName("");
      setDescription("");
      setAddress("");
      setSuccessToast("વ્યવસાય સફળતાપૂર્વક ડિરેક્ટરીમાં ઉમેરાઈ ગયો છે!");
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setIsSubmittingBusiness(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <Briefcase className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સમાજ વ્યવસાય ડિરેક્ટરી (Business Directory)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            અડાઆઠમ દરજી સમાજના સભ્યોના ઉદ્યોગો, વ્યવસાયો અને ટેલરિંગ કેન્દ્રોની અધિકૃત યાદી.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-sm mb-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="વ્યવસાયનું નામ, સંચાલક અથવા શહેર શોધો..."
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-500 font-semibold whitespace-nowrap">કેટેગરી:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 border border-ivory-300 rounded-xl text-xs font-medium bg-white focus:border-saffron-500 focus:outline-none"
          >
            <option value="all">બધી કેટેગરી</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBusinesses.map((biz) => (
          <div
            key={biz.id}
            className="bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
                <img
                  src={
                    biz.cover_url && !biz.cover_url.includes("images.unsplash.com/photo-1558769132")
                      ? biz.cover_url
                      : DEFAULT_BUSINESS_COVER
                  }
                  alt={biz.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_BUSINESS_COVER;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {biz.is_featured && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    ફીચર્ડ બિઝનેસ
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-charcoal-800 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs">
                  {biz.category}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-base text-charcoal-900 group-hover:text-saffron-700 transition-colors">
                  {biz.name}
                </h3>

                <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-charcoal-800">સંચાલક:</span> {biz.owner_name}
                </p>

                <p className="text-xs text-charcoal-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                  <span className="truncate">{biz.address}, {biz.city}</span>
                </p>

                <p className="text-xs text-charcoal-600 mt-3 line-clamp-3 leading-relaxed">
                  {biz.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-ivory-200 mt-4 flex items-center justify-between text-xs">
              <a
                href={`tel:${biz.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-50 text-forest-800 font-bold rounded-xl border border-forest-200 hover:bg-forest-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{biz.phone}</span>
              </a>

              <Link
                href={`/businesses/${biz.id}`}
                className="font-bold text-saffron-700 hover:underline"
              >
                સંપૂર્ણ વિગતો →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-ivory-300">
          <p className="text-sm font-bold text-charcoal-700">કોઈ વ્યવસાય મળ્યો નથી.</p>
          <p className="text-xs text-charcoal-500 mt-1">કૃપા કરીને અન્ય કેટેગરી અથવા સર્ચ ફિલ્ટર અજમાવો.</p>
        </div>
      )}

      {/* Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-forest-100 text-forest-700">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-base text-charcoal-900">
                  આપનો વ્યવસાય ડિરેક્ટરીમાં ઉમેરો
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusinessSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  વ્યવસાય / દુકાનનું નામ *
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="દા.ત. શ્રી અંબિકા ટેલર્સ એન્ડ બુટીક"
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  વ્યવસાય કેટેગરી *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:border-saffron-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                <label className="block font-bold text-charcoal-700 mb-1">દુકાન / પેઢીનું સરનામું</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="દુકાન નં., શોપિંગ સેન્ટર, માર્કેટનું નામ"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય પરિચય / સેવાઓ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="આપના વ્યવસાયની વિશેષતાઓ, ઉત્પાદનો અને સેવાઓ વિશે ટૂંકમાં લખો..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              {/* Paid Ad Checkbox */}
              <div className="p-3.5 rounded-xl bg-saffron-50 border border-saffron-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaidAd}
                    onChange={(e) => setIsPaidAd(e.target.checked)}
                    className="rounded text-saffron-600 focus:ring-saffron-500"
                  />
                  <span className="font-bold text-saffron-900">
                    ફીચર્ડ જાહેરાત (Sponsored Advertisement) તરીકે પ્રમોટ કરવો છે
                  </span>
                </label>
                <p className="text-[11px] text-charcoal-600 mt-1 pl-5">
                  હોમપેજ અને બિઝનેસ ડિરેક્ટરીમાં ટોચ પર દર્શાવવા માટે સમિતિ માન્ય માસિક ચાર્જ લાગુ થશે.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl font-semibold hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBusiness}
                  className="px-5 py-2 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingBusiness ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>નોંધણી થઈ રહી છે...</span>
                    </>
                  ) : (
                    <span>વ્યવસાય નોંધણી કરો</span>
                  )}
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
                વ્યવસાય ઉમેરવા માટે લૉગિન કરો
              </h3>
              <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                અડાઆઠમ દરજી સમાજની સત્તાવાર ડિરેક્ટરીમાં આપના વ્યવસાયની નોંધણી માત્ર માન્ય સભ્યો જ કરી શકે છે. આપના ખાતામાં લૉગિન કરો અથવા નવા સભ્ય તરીકે જોડાઓ.
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
          </div>
        </div>
      )}
    </div>
  );
}
