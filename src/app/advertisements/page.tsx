"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Sparkles,
  CheckCircle,
  Plus,
  Phone,
  ArrowRight,
  MapPin,
  Globe,
  Upload,
  Image as ImageIcon,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  LogIn,
  ExternalLink,
  X,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { BusinessAdvertisement } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const CATEGORIES = [
  "ટેલરિંગ & ફેશન ડિઝાઇનિંગ (Tailoring & Fashion)",
  "એમ્બ્રોઇડરી & બુટિક (Embroidery & Boutique)",
  "ટેક્સટાઇલ & કાપડ વેપાર (Textile & Fabric)",
  "રેડીમેડ ગારમેન્ટ્સ (Readymade Garments)",
  "જ્વેલરી & આભૂષણ (Jewelry & Accessories)",
  "ઇલેક્ટ્રોનિક્સ & હાર્ડવેર (Electronics & Hardware)",
  "પ્રોફેશનલ સેવાઓ (CA, Advocate, IT)",
  "અન્ય વ્યવસાય (Other Business)",
];

export default function AdvertisementsPage() {
  const { advertisements, addAdvertisement, addLog } = useData();
  const { currentUser } = useAuth();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState(currentUser?.name || "");
  const [contactNumber, setContactNumber] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address ? `${currentUser.address}, ${currentUser.city || "મોડાસા"}` : "મોડાસા, અરવલ્લી");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [activeTab, setActiveTab] = useState<"showcase" | "my_ads">("showcase");

  // Keep owner name and phone up to date if currentUser loads
  React.useEffect(() => {
    if (currentUser) {
      if (!ownerName) setOwnerName(currentUser.name);
      if (!contactNumber) setContactNumber(currentUser.phone);
    }
  }, [currentUser]);

  // Publicly visible approved advertisements only!
  const approvedAdvertisements = advertisements.filter((a) => a.status === "approved");

  // Current user's own submitted advertisements (pending, approved, rejected)
  const mySubmittedAds = currentUser
    ? advertisements.filter(
        (a) =>
          a.submitted_by === currentUser.id ||
          a.contact_number === currentUser.phone ||
          a.owner_name.toLowerCase() === currentUser.name.toLowerCase()
      )
    : [];

  // Handle banner image upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ફોટો સાઈઝ ૫ MB કરતાં ઓછી હોવી જોઈએ.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBannerPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowSubmitModal(false);
      setShowLoginPrompt(true);
      return;
    }

    if (!businessName.trim() || !description.trim() || !contactNumber.trim() || !address.trim()) {
      alert("કૃપા કરીને બધી ફરજિયાત વિગતો ભરો.");
      return;
    }

    const defaultBanner = bannerPreview || null;

    // Submit for approval (Status: pending)
    addAdvertisement({
      business_name: businessName.trim(),
      category,
      description: description.trim(),
      owner_name: ownerName.trim() || currentUser.name,
      contact_number: contactNumber.trim(),
      address: address.trim(),
      image_url: defaultBanner,
      website_link: websiteLink.trim() || undefined,
      status: "pending",
      submitted_by: currentUser.id,
    });

    addLog(
      "વ્યવસાય જાહેરાત અરજી સબમિટ",
      businessName.trim(),
      `કેટેગરી: ${category}, માલિક: ${ownerName.trim() || currentUser.name} (ચકાસણી પેન્ડિંગ)`,
      currentUser.name,
      currentUser.role || "member"
    );

    // Reset and close
    setShowSubmitModal(false);
    setBusinessName("");
    setDescription("");
    setBannerPreview("");
    setWebsiteLink("");
    setSuccessToast("તમારી વ્યવસાય જાહેરાત એડમિન સમિતિને મંજૂરી માટે મોકલાઈ ગઈ છે. ચકાસણી બાદ હોમપેજ પર પ્રદર્શિત થશે.");
    setTimeout(() => setSuccessToast(null), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-saffron-50 via-ivory-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-saffron-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-saffron-600 text-white shadow-sm">
              <Megaphone className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              વ્યવસાય જાહેરાત પોર્ટલ (Business Advertisements)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-2xl leading-relaxed">
            અડાઆઠમ દરજી સેવા સમિતિના સભ્યો માટે પોતાના વ્યવસાય, દુકાન, બુટિક કે સેવાઓનો સમગ્ર સમાજમાં પ્રચાર કરવા માટેનું સત્તાવાર પ્લેટફોર્મ.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>વ્યવસાય જાહેરાત મૂકો (Submit Ad)</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs (Showcase vs My Ads) */}
      {currentUser && (
        <div className="flex items-center gap-2 border-b border-ivory-300 pb-2">
          <button
            onClick={() => setActiveTab("showcase")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === "showcase"
                ? "bg-saffron-600 text-white shadow-xs"
                : "text-charcoal-700 hover:bg-ivory-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>માન્ય વ્યવસાય જાહેરાતો ({approvedAdvertisements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("my_ads")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === "my_ads"
                ? "bg-saffron-600 text-white shadow-xs"
                : "text-charcoal-700 hover:bg-ivory-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>મારી સબમિટ કરેલી જાહેરાતો ({mySubmittedAds.length})</span>
          </button>
        </div>
      )}

      {/* 1. PUBLIC SHOWCASE OF APPROVED ADVERTISEMENTS */}
      {activeTab === "showcase" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-saffron-600" />
              <span>માન્ય થયેલી વ્યવસાય જાહેરાતો (Active Advertisements)</span>
            </h2>
            <span className="text-xs text-charcoal-500 font-medium">
              કમિટી દ્વારા માન્ય {approvedAdvertisements.length} જાહેરાતો
            </span>
          </div>

          {approvedAdvertisements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3">
              <Megaphone className="w-10 h-10 text-charcoal-300 mx-auto" />
              <h3 className="font-bold text-charcoal-800 text-sm">હાલમાં કોઈ જાહેરાત લાઇવ નથી.</h3>
              <p className="text-xs text-charcoal-500">
                આપ પણ આપના વ્યવસાયની જાહેરાત મૂકી શકો છો.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedAdvertisements.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-ivory-200">
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-saffron-50 via-saffron-100/40 to-ivory-200 flex flex-col items-center justify-center p-4 text-center">
                          <Megaphone className="w-10 h-10 text-saffron-600/30 mb-1" />
                          <span className="text-xs font-bold text-saffron-900/60 line-clamp-1">{ad.business_name}</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        પ્રાયોજિત જાહેરાત
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {ad.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base text-charcoal-900 group-hover:text-saffron-700 transition-colors">
                          {ad.business_name}
                        </h3>
                        <p className="text-xs text-charcoal-600 mt-1.5 line-clamp-3 leading-relaxed">
                          {ad.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-ivory-200 space-y-1.5 text-xs text-charcoal-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-saffron-700 flex-shrink-0" />
                          <span>માલિક: <strong>{ad.owner_name}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                          <span className="truncate">{ad.address}</span>
                        </div>
                        {ad.website_link && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                            <a
                              href={ad.website_link.startsWith("http") ? ad.website_link : `https://${ad.website_link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-700 font-bold hover:underline truncate"
                            >
                              {ad.website_link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer CTAs */}
                  <div className="p-4 pt-3 border-t border-ivory-200 bg-ivory-50/50 flex items-center justify-between">
                    <a
                      href={`tel:${ad.contact_number}`}
                      className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>સંપર્ક કરો ({ad.contact_number})</span>
                    </a>

                    {ad.website_link ? (
                      <a
                        href={ad.website_link.startsWith("http") ? ad.website_link : `https://${ad.website_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-saffron-700 font-bold text-xs hover:underline flex items-center gap-1"
                      >
                        <span>વેબસાઇટ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-charcoal-400 text-[11px] font-medium">સમાજ માન્ય</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. LOGGED IN USER'S SUBMITTED ADVERTISEMENTS */}
      {currentUser && activeTab === "my_ads" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
              <User className="w-5 h-5 text-saffron-700" />
              <span>મારી સબમિટ કરેલી જાહેરાતો (My Ads)</span>
            </h2>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-saffron-600 text-white text-xs font-bold hover:bg-saffron-700 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>નવી જાહેરાત ઉમેરો</span>
            </button>
          </div>

          {mySubmittedAds.length === 0 ? (
            <div className="bg-white rounded-3xl border border-ivory-300 p-10 text-center space-y-3">
              <p className="text-xs text-charcoal-500">
                તમે હજી સુધી કોઈ વ્યવસાય જાહેરાત સબમિટ કરી નથી.
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-saffron-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                પ્રથમ જાહેરાત સબમિટ કરો
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mySubmittedAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {ad.image_url ? (
                        <img
                          src={ad.image_url}
                          alt={ad.business_name}
                          className="w-14 h-14 rounded-xl object-cover border border-ivory-300"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-saffron-50 border border-saffron-200 flex items-center justify-center text-saffron-600 flex-shrink-0">
                          <Megaphone className="w-6 h-6 opacity-60" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-sm text-charcoal-900">{ad.business_name}</h4>
                        <span className="text-[11px] text-charcoal-500">{ad.category}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        ad.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : ad.status === "rejected"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {ad.status === "approved" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {ad.status === "rejected" && <XCircle className="w-3 h-3 text-red-600" />}
                      {ad.status === "pending" && <Clock className="w-3 h-3 text-amber-600" />}
                      <span>
                        {ad.status === "approved"
                          ? "માન્ય (Approved)"
                          : ad.status === "rejected"
                          ? "અસ્વીકાર (Rejected)"
                          : "પેન્ડિંગ (Pending)"}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-2">
                    {ad.description}
                  </p>

                  {/* Rejection remarks if rejected */}
                  {ad.status === "rejected" && ad.rejection_remarks && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">એડમિન કમિટી શેરો:</span>
                        <span>{ad.rejection_remarks}</span>
                      </div>
                    </div>
                  )}

                  {ad.status === "approved" && (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      ✓ આ જાહેરાત હોમપેજ અને પબ્લિક પોર્ટલ પર લાઈવ છે.
                    </p>
                  )}

                  {ad.status === "pending" && (
                    <p className="text-[11px] text-amber-700 font-semibold">
                      ⏳ સમિતિ દ્વારા ચકાસણી પ્રક્રિયામાં છે. મંજૂરી બાદ જાહેરમાં દેખાશે.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER BUSINESS ADVERTISEMENT SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-saffron-50 to-ivory-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-saffron-600 text-white shadow-xs">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    વ્યવસાય જાહેરાત સબમિટ કરો (Submit Ad)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    વિગતો ભર્યા બાદ એડમિન કમિટીને મંજૂરી માટે મોકલાશે.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitAd} className="p-5 overflow-y-auto space-y-4">
              {/* Field 1: Business Name */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  વ્યવસાયનું નામ (Business Name) *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="દા.ત. ચામુંડા ટેલર્સ & બુટિક"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-medium"
                />
              </div>

              {/* Field 2: Business Category */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  વ્યવસાય કેટેગરી (Business Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Business Description */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  વ્યવસાયની વિગત / વર્ણન (Business Description) *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="તમારા વ્યવસાય, પ્રોડક્ટ્સ અને વિશેષ સેવાઓ વિશે જણાવો..."
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-medium leading-relaxed"
                />
              </div>

              {/* Field 4 & 5: Owner Name and Contact Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    વ્યવસાય માલિકનું નામ (Owner Name) *
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    સંપર્ક નંબર (Contact Number) *
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-bold"
                  />
                </div>
              </div>

              {/* Field 6: Business Address */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  વ્યવસાયનું સરનામું (Business Address) *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="દા.ત. ૧૦, મહાવીર કોમ્પ્લેક્ષ, માલપુર રોડ, મોડાસા"
                  required
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>

              {/* Field 7: Business Image / Advertisement Banner (with Drag & Drop Crop Editor) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-charcoal-800">
                  વ્યવસાય ફોટો / બેનર (Business Image / Banner) *
                </label>
                <ImageUploadWithCrop
                  currentImageUrl={bannerPreview}
                  onImageCropped={(url) => setBannerPreview(url)}
                  aspectRatio={16 / 9}
                  aspectRatioLabel="૧૬:૯ (વાઈડ બેનર)"
                  category="advertisement-banners"
                  label="જાહેરાત બેનર અપલોડ &amp; ક્રોપ કરો"
                  helperText="ડ્રેગ &amp; ડ્રોપ કરો અથવા ડિવાઇસમાંથી પસંદ કરો • JPG, PNG, WebP (મહત્તમ ૫ MB)"
                />
              </div>

              {/* Field 8: Optional Website or Social Media Link */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  વેબસાઇટ અથવા સોશિયલ મીડિયા લિંક (Website / Social Link - વૈકલ્પિક)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="https://instagram.com/yourbusiness અથવા www.example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-ivory-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100 transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
                >
                  Submit for Approval (મંજૂરી માટે મોકલો)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal if Guest Clicks Add Ad */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-charcoal-900">
              સભ્ય લૉગિન જરૂરી છે
            </h3>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              વ્યવસાય જાહેરાત સબમિટ કરવા માટે કૃપા કરીને આપના નોંધાયેલા સભ્ય એકાઉન્ટમાં લૉગિન કરો.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                લૉગિન કરો
              </Link>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 font-bold text-xs rounded-xl transition-colors"
              >
                પાછા જાઓ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
