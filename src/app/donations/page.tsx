"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  CreditCard,
  QrCode,
  Copy,
  CheckCircle,
  Plus,
  Trash2,
  Lock,
  Filter,
  Sparkles,
  LogIn,
  Search,
  Calendar,
  Phone,
  User,
  Users,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Donation, SAMITI_DONATION_PURPOSES } from "@/types";
import { FALLBACK_DONORS } from "@/lib/mockData";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const PURPOSES = [...SAMITI_DONATION_PURPOSES];

const YEARS = ["2026", "2025", "2024", "2023", "2022"];

export default function DonationsPage() {
  const { donations, bankDetails, addDonation, addLog } = useData();
  const { currentUser, isAdmin } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedPurpose, setSelectedPurpose] = useState("all");

  // UI state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  // Form State
  const [donorName, setDonorName] = useState(currentUser?.name || "");
  const [hastheNames, setHastheNames] = useState<string[]>([""]);
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || "");
  const [donorPhotoPreview, setDonorPhotoPreview] = useState<string>("");
  const [donationPurpose, setDonationPurpose] = useState(PURPOSES[0]);
  const [specificPurpose, setSpecificPurpose] = useState("");
  const [donationYear, setDonationYear] = useState("2026");
  const [amount, setAmount] = useState("");
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("");

  // Keep pre-filled fields in sync if user loads
  React.useEffect(() => {
    if (currentUser) {
      if (!donorName) setDonorName(currentUser.name);
      if (!mobileNumber) setMobileNumber(currentUser.phone);
    }
  }, [currentUser]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Add more "હસ્તે" name entry
  const handleAddHastheName = () => {
    setHastheNames((prev) => [...prev, ""]);
  };

  const handleUpdateHastheName = (index: number, val: string) => {
    setHastheNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveHastheName = (index: number) => {
    setHastheNames((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload handler for Donor Photo
  const handleDonorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ફોટો સાઇઝ ૫ MB કરતાં ઓછી હોવી જોઈએ.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setDonorPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload handler for Payment Proof (Admin only)
  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("ચુકવણી પ્રૂફ સાઇઝ ૮ MB કરતાં ઓછી હોવી જોઈએ.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPaymentProofPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Donation Form
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setShowDonateModal(false);
      setShowLoginPrompt(true);
      return;
    }

    if (!donorName.trim()) {
      alert("કૃપા કરીને દાન આપનારનું નામ દાખલ કરો.");
      return;
    }

    if (!mobileNumber.trim()) {
      alert("કૃપા કરીને મોબાઇલ નંબર દાખલ કરો.");
      return;
    }

    if (!paymentProofPreview) {
      alert("કૃપા કરીને બેંક ટ્રાન્સફર / UPI ચુકવણીનો ફોટો (સ્ક્રીનશોટ) અપલોડ કરો.");
      return;
    }

    setIsSubmittingDonation(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      // Clean hasthe names
      const cleanedHasthe = hastheNames.map((n) => n.trim()).filter((n) => n.length > 0);

      const numAmount = parseFloat(amount) || 0;
      const year = donationYear || "2026";
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const donationId = `DON-${year}-${randomCode}`;

      addDonation({
        donation_id: donationId,
        user_id: currentUser.id,
        donor_id: currentUser.id,
        donor_name: donorName.trim(),
        mobile_number: mobileNumber.trim(),
        donor_photo: donorPhotoPreview || undefined,
        hasthe_names: cleanedHasthe,
        donation_purpose: donationPurpose,
        specific_purpose: specificPurpose.trim() || undefined,
        donation_year: year,
        amount: numAmount,
        date: new Date().toISOString().split("T")[0],
        payment_proof: paymentProofPreview,
        status: "pending",
        payment_status: "pending",
        is_anonymous: false,
        public_consent: true,
      });

      addLog(
        "દાન નોંધણી સબમિટ",
        `${donorName.trim()} (${donationId})`,
        `હેતુ: ${donationPurpose}, રકમ: ₹${numAmount} (ચકાસણી પેન્ડિંગ)`,
        currentUser.name,
        currentUser.role || "member"
      );

      // Reset Form
      setShowDonateModal(false);
      setSpecificPurpose("");
      setAmount("");
      setDonorPhotoPreview("");
      setPaymentProofPreview("");
      setHastheNames([""]);
      setSuccessToast(
        `આપનું દાન સફળતાપૂર્વક નોંધાયું છે (Donation ID: ${donationId}). સમિતિ દ્વારા બેંક ચકાસણી બાદ માન્ય થશે.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  // Public approved donations only (Fallback to authentic Samiti records if database is empty)
  const approvedDonations = useMemo(() => {
    const live = donations.filter((d) => d.status === "approved" || d.payment_status === "verified");
    return live.length > 0 ? live : FALLBACK_DONORS;
  }, [donations]);

  // Filtered approved donations
  const filteredDonations = useMemo(() => {
    return approvedDonations.filter((d) => {
      // Search by donor name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.donor_name?.toLowerCase().includes(q);
        const matchesHasthe = d.hasthe_names?.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesHasthe) return false;
      }

      // Filter by donation year
      if (selectedYear !== "all") {
        if (d.donation_year !== selectedYear && !d.date?.startsWith(selectedYear)) {
          return false;
        }
      }

      // Filter by donation purpose
      if (selectedPurpose !== "all") {
        if (d.donation_purpose !== selectedPurpose && d.purpose !== selectedPurpose) {
          return false;
        }
      }

      return true;
    });
  }, [approvedDonations, searchQuery, selectedYear, selectedPurpose]);

  // Verified total calculation
  const totalVerifiedAmount = useMemo(() => {
    return approvedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [approvedDonations]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-saffron-50 via-ivory-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-saffron-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-saffron-600 text-white shadow-xs">
                <Heart className="w-6 h-6 fill-white" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                દાન પોર્ટલ & સદ્કાર્ય સહાય (Donation Portal)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-2 max-w-2xl leading-relaxed">
              શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા — સમાજ ભવન, શિક્ષણ સહાય, આરોગ્ય અને સામાજિક કલ્યાણ પ્રવૃત્તિઓમાં સહયોગ આપવા માટે આપનું દાન સમર્પિત કરો.
            </p>
          </div>

          {currentUser && (
            <button
              onClick={() => setShowDonateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>દાન નોંધણી કરો (Submit Donation)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Official Bank Details & Payment QR Code Section (Requirement 13.2.C & 13.7) */}
      <section className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-forest-100 text-forest-800">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
              સત્તાવાર બેંક વિગતો & QR કોડ (Bank & Payment QR)
            </h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            નીચે દર્શાવેલ સત્તાવાર બેંક ખાતામાં અથવા QR કોડ સ્કેન કરીને દાનની રકમ જમા કરાવો. ત્યારબાદ ચુકવણીનો ફોટો અપલોડ કરીને નોંધણી કરો.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Bank Account Info Card (with 1-click copy) */}
          <div className="lg:col-span-7 bg-ivory-50 rounded-2xl p-5 sm:p-6 border border-ivory-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">ખાતાનું નામ (Account Name)</span>
                <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900">
                  {bankDetails.account_holder}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold border border-forest-200">
                સત્તાવાર ટ્રસ્ટ ખાતું
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Bank Name */}
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-charcoal-400 block text-[10px] font-bold">બેંકનું નામ:</span>
                <span className="font-bold text-charcoal-900 text-xs sm:text-sm">{bankDetails.bank_name}</span>
              </div>

              {/* Branch */}
              <div className="p-3 bg-white rounded-xl border border-ivory-200">
                <span className="text-charcoal-400 block text-[10px] font-bold">શાખા (Branch):</span>
                <span className="font-bold text-charcoal-900 text-xs sm:text-sm">{bankDetails.branch_name}</span>
              </div>

              {/* Account Number with Copy */}
              <div className="p-3 bg-white rounded-xl border border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="text-charcoal-400 block text-[10px] font-bold">ખાતા નંબર (Account Number):</span>
                  <span className="font-extrabold text-charcoal-950 font-mono text-sm sm:text-base">
                    {bankDetails.account_number}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.account_number, "acc")}
                  className="p-2 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 transition-colors"
                  title="ખાતા નંબર કોપી કરો"
                >
                  {copiedKey === "acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* IFSC Code with Copy */}
              <div className="p-3 bg-white rounded-xl border border-ivory-200 flex items-center justify-between">
                <div>
                  <span className="text-charcoal-400 block text-[10px] font-bold">IFSC Code:</span>
                  <span className="font-extrabold text-charcoal-950 font-mono text-sm sm:text-base">
                    {bankDetails.ifsc_code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.ifsc_code, "ifsc")}
                  className="p-2 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 transition-colors"
                  title="IFSC કોડ કોપી કરો"
                >
                  {copiedKey === "ifsc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* UPI ID */}
            {bankDetails.upi_id && (
              <div className="p-3 bg-white rounded-xl border border-ivory-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-charcoal-400 block text-[10px] font-bold">UPI ID (Google Pay, PhonePe, Paytm):</span>
                  <span className="font-extrabold text-forest-800 font-mono text-xs sm:text-sm">
                    {bankDetails.upi_id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankDetails.upi_id!, "upi")}
                  className="p-2 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 transition-colors"
                  title="UPI ID કોપી કરો"
                >
                  {copiedKey === "upi" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Official Payment QR Code Display (Requirement 13.2.10 & 13.7) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-ivory-50 rounded-2xl border border-ivory-200 text-center space-y-3">
            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-forest-300 shadow-sm">
              <img
                src={bankDetails.qr_code_url || "/bank_qr_code.jpg"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/bank_qr_code.jpg";
                }}
                alt="સત્તાવાર પેમેન્ટ QR કોડ"
                className="w-48 h-48 object-contain mx-auto rounded-lg"
              />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 bg-forest-100 px-3 py-1 rounded-full">
                <QrCode className="w-3.5 h-3.5" />
                <span>સ્કેન કરી સીધું દાન કરો (Scan & Pay)</span>
              </span>
              <p className="text-[11px] text-charcoal-500 mt-1">
                કોઈપણ UPI એપ (GPay, PhonePe, Paytm, BHIM) દ્વારા સ્કેન કરો.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Public Donation Listing Section (Requirement 13.5) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-saffron-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                માન્ય દાતાશ્રીઓની યાદી (Approved Donations)
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              સમિતિ દ્વારા ચકાસાયેલ અને મંજૂર થયેલા દાનની અધિકૃત વિગત.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-forest-50 border border-forest-200 text-right w-max">
            <span className="text-[10px] text-forest-700 font-bold block">કુલ સદ્કાર્ય ભંડોળ:</span>
            <span className="text-lg font-extrabold text-forest-900">
              ₹{totalVerifiedAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Filters and Search (Requirement 13.5) */}
        <div className="bg-white rounded-3xl border border-ivory-300 p-4 sm:p-5 shadow-card space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search by Donor Name */}
            <div className="relative">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="દાતાનું નામ અથવા હસ્તે નામ શોધો..."
                className="w-full pl-10 pr-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-ivory-50/50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-charcoal-400 hover:text-charcoal-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter by Donation Year */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="all">બધા વર્ષ (All Years)</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    વર્ષ {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Donation Purpose */}
            <div>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white"
              >
                <option value="all">બધા હેતુ (All Purposes)</option>
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Public Cards Grid */}
        {filteredDonations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3">
            <Heart className="w-10 h-10 text-charcoal-300 mx-auto" />
            <h3 className="font-bold text-charcoal-800 text-sm">
              આ માપદંડ મુજબ કોઈ માન્ય દાન મળ્યું નથી.
            </h3>
            <p className="text-xs text-charcoal-500">
              કૃપા કરીને અન્ય નામ અથવા વર્ષ પસંદ કરીને તપાસો.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDonations.map((don) => (
              <div
                key={don.id}
                className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card hover:shadow-hover transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Donor Info Header */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        don.donor_photo ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={don.donor_name}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-ivory-300 shadow-2xs flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full inline-block mb-1">
                        વર્ષ: {don.donation_year || don.date.split("-")[0]}
                      </span>
                      <h3 className="font-extrabold text-sm sm:text-base text-charcoal-900 truncate">
                        {don.donor_name}
                      </h3>
                      <p className="text-[11px] text-charcoal-500 font-medium">
                        હેતુ: <strong className="text-charcoal-800">{don.donation_purpose || don.purpose}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Specific purpose if any */}
                  {don.specific_purpose && (
                    <p className="text-xs text-charcoal-600 mt-3 p-2.5 bg-ivory-50 rounded-xl border border-ivory-200 leading-relaxed">
                      {don.specific_purpose}
                    </p>
                  )}

                  {/* Multiple "હસ્તે" Names (Requirement 13.5) */}
                  {don.hasthe_names && don.hasthe_names.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ivory-200">
                      <span className="text-[10px] font-bold text-saffron-800 block mb-1">
                        હસ્તે (On Behalf Of):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {don.hasthe_names.map((hName, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-saffron-50 text-saffron-900 font-semibold px-2.5 py-0.5 rounded-lg border border-saffron-200"
                          >
                            {hName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Amount & Approved Stamp (Strictly NO payment proof / private bank details shown) */}
                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between">
                  <div>
                    {don.amount > 0 && (
                      <span className="text-base font-extrabold text-forest-800 block">
                        ₹{don.amount.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span className="text-[10px] text-charcoal-400">તારીખ: {don.date}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>માન્ય દાન</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. DONATION SUBMISSION FORM MODAL (Requirement 13.2 & 13.3) */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-saffron-50 to-ivory-50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-saffron-600 text-white shadow-xs">
                  <Heart className="w-5 h-5 fill-white" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    દાન નોંધણી ફોર્મ (Donation Form)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    આપની દાન વિગત ભરો. એડમિન/ખજાનચી સમિતિ દ્વારા ચકાસણી બાદ માન્ય થશે.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDonateModal(false)}
                className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitDonation} className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* SECTION A: DONOR INFORMATION */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-saffron-800 border-b border-ivory-200 pb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>દાતાશ્રીની માહિતી (Donor Information)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Donor Name */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      દાન આપનારનું નામ (Donor Name) *
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="દા.ત. દિનેશભાઈ બાબુલાલ દરજી"
                      required
                      className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-medium"
                    />
                  </div>

                  {/* Field 3: Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      મોબાઇલ નંબર (Mobile Number) *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="દા.ત. 98250 12345"
                      required
                      className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-bold"
                    />
                  </div>
                </div>

                {/* Field 2: હસ્તે (Donated By / On Behalf Of) - Supports Multiple Names */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-saffron-700" />
                      <span>હસ્તે (Donated By / On Behalf Of)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddHastheName}
                      className="px-2.5 py-1 rounded-lg bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ અન્ય હસ્તે નામ ઉમેરો (Add More)</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-charcoal-500">
                    જેમના હસ્તે અથવા જેમની તરફથી દાન અર્પણ કરવામાં આવે છે તેમના નામો ઉમેરો.
                  </p>

                  <div className="space-y-2 pt-1">
                    {hastheNames.map((nameVal, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-charcoal-400 w-5 text-right">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={nameVal}
                          onChange={(e) => handleUpdateHastheName(idx, e.target.value)}
                          placeholder="દા.ત. ભાવિન દરજી અથવા નીતાબેન દરજી"
                          className="flex-1 px-3 py-2 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white"
                        />
                        {hastheNames.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHastheName(idx)}
                            className="p-2 rounded-xl text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="કાઢી નાખો"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Field 4: Donor Photo (with Drag & Drop Crop Editor) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-charcoal-800">
                    દાન આપનારનો ફોટો (Donor Photo - વૈકલ્પિક)
                  </label>
                  <ImageUploadWithCrop
                    currentImageUrl={donorPhotoPreview}
                    onImageCropped={(url) => setDonorPhotoPreview(url)}
                    aspectRatio={1}
                    aspectRatioLabel="૧:૧ (ચોરસ અવતાર)"
                    circleOverlay={true}
                    category="donor-photos"
                    label="દાતાશ્રીનો ફોટો પસંદ અથવા ડ્રોપ કરો"
                    helperText="PNG અથવા JPG • ૧:૧ ક્રોપ સપોર્ટ"
                  />
                </div>
              </div>

              {/* SECTION B: DONATION DETAILS */}
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-saffron-800 border-b border-ivory-200 pb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>દાનની વિગત (Donation Details)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 5: Donation For Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      દાન શેના માટે છે? (Donation For) *
                    </label>
                    <select
                      value={donationPurpose}
                      onChange={(e) => setDonationPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white"
                    >
                      {PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 7: Donation Year */}
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      દાનનું વર્ષ (Donation Year) *
                    </label>
                    <select
                      value={donationYear}
                      onChange={(e) => setDonationYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white font-bold"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field 6: Specific Purpose / Description (shown if Other or optional detail) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    વિશેષ વિગત / પ્રોજેક્ટ વર્ણન (Specific Purpose)
                    {donationPurpose.includes("અન્ય") && " *"}
                  </label>
                  <input
                    type="text"
                    value={specificPurpose}
                    onChange={(e) => setSpecificPurpose(e.target.value)}
                    required={donationPurpose.includes("અન્ય")}
                    placeholder="દા.ત. ચામુંડા માતાજી હવન ભોજન પ્રસાદ, અથવા પુસ્તકાલય વિકાસ"
                    className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-medium"
                  />
                </div>

                {/* Donation Amount */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 mb-1">
                    દાનની રકમ (Amount in ₹) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="દા.ત. 11000"
                    min="1"
                    required
                    className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-extrabold text-forest-800 text-sm"
                  />
                </div>

                {/* Field 8: Payment Proof (ચુકવણીનો ફોટો) - Admin Verification only */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <label className="text-xs font-bold text-amber-950">
                      ચુકવણીનો ફોટો / સ્ક્રીનશોટ (Payment Proof) *
                    </label>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    બેંક ટ્રાન્સફર અથવા UPI દ્વારા ચુકવણી પૂર્ણ કર્યા પછી તેનો સ્ક્રીનશોટ અથવા રસીદ અપલોડ કરો. આ ફોટો માત્ર એડમિન ખરાઈ માટે છે અને ક્યારેય જાહેર પોર્ટલ પર પ્રદર્શિત થશે નહીં.
                  </p>

                  <ImageUploadWithCrop
                    currentImageUrl={paymentProofPreview}
                    onImageCropped={(url) => setPaymentProofPreview(url)}
                    aspectRatio={4 / 5}
                    aspectRatioLabel="૪:૫ (રસીદ/સ્ક્રીનશોટ)"
                    category="payment-proofs"
                    label="ચુકવણીનો સ્ક્રીનશોટ અપલોડ &amp; ક્રોપ કરો (Upload Proof) *"
                    helperText="UPI / બેંક ટ્રાન્સફર રસીદ • ડ્રેગ &amp; ડ્રોપ સપોર્ટ"
                  />
                </div>
              </div>

              {/* Submit CTAs */}
              <div className="pt-4 border-t border-ivory-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100 transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDonation}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingDonation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ચકાસણી માટે મોકલી રહ્યા છીએ...</span>
                    </>
                  ) : (
                    <span>Submit for Verification (દાન સબમિટ કરો)</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal if Guest clicks Donate */}
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
              દાન નોંધણી કરવા માટે કૃપા કરીને આપના રજિસ્ટર્ડ સભ્ય એકાઉન્ટમાં લૉગિન કરો જેથી દાન આપના પ્રોફાઇલમાં પણ સાચવી શકાય.
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

