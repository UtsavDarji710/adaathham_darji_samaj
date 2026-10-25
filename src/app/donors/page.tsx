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
  Lock,
  Filter,
  FileCheck,
  Sparkles,
  LogIn,
  UserPlus,
  Shield,
  ArrowRight,
  X,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Donation } from "@/types";

export default function DonorsPage() {
  const { donations, addDonation, addLog } = useData();
  const { currentUser, isAdmin, loginAs } = useAuth();

  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<Donation | null>(null);

  // Form state
  const [donorName, setDonorName] = useState(currentUser?.name || "");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("સમાજ ભવન નવીનીકરણ ફંડ");
  const [campaign, setCampaign] = useState("સમાજ ભવન પ્રોજેક્ટ");
  const [paymentMethod, setPaymentMethod] = useState("UPI / ઓનલાઇન ટ્રાન્સફર");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [publicConsent, setPublicConsent] = useState(true);

  const campaigns = [
    "સમાજ ભવન પ્રોજેક્ટ",
    "શિક્ષણ સહાય યોજના",
    "ધાર્મિક ઉત્સવ",
    "આરોગ્ય સુરક્ષા યોજના",
    "કાયમી ટ્રસ્ટ ભંડોળ",
  ];

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      // Must be verified
      if (d.payment_status !== "verified") return false;
      // If not anonymous or has consent, or user is admin
      const matchCampaign = selectedCampaign === "all" || d.campaign === selectedCampaign;
      const matchYear = selectedYear === "all" || d.date.startsWith(selectedYear);
      return matchCampaign && matchYear;
    });
  }, [donations, selectedCampaign, selectedYear]);

  // Aggregate verified total amount
  const totalDonationAmount = useMemo(() => {
    return donations
      .filter((d) => d.payment_status === "verified")
      .reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const handleCopyBank = () => {
    navigator.clipboard.writeText("A/C: 123456789012, IFSC: SBIN0000428, Name: Shri Adaatham Darji Seva Samiti");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 3000);
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowDonateModal(false);
      setShowLoginPrompt(true);
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const newDon = addDonation({
      donor_id: currentUser.id,
      donor_name: isAnonymous ? "એક ગુપ્ત દાતાશ્રી" : donorName || currentUser.name,
      amount: numAmount,
      date: new Date().toISOString().split("T")[0],
      purpose,
      campaign,
      payment_status: "verified", // Demo verification
      is_anonymous: isAnonymous,
      public_consent: publicConsent,
      payment_method: paymentMethod,
    });

    addLog(
      "નવી દાન નોંધણી",
      `પાવતી: ${newDon.receipt_number}`,
      `રકમ: ₹${numAmount}, હેતુ: ${purpose} (દાતા: ${isAnonymous ? "ગુપ્ત" : donorName || currentUser.name})`,
      currentUser.name,
      currentUser.role || "member"
    );

    setShowDonateModal(false);
    setAmount("");
    setSuccessReceipt(newDon);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Receipt Success Banner */}
      {successReceipt && (
        <div className="p-6 rounded-3xl bg-forest-50 border border-forest-200 text-forest-900 shadow-md animate-in fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-forest-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm">દાન નોંધણી સફળતાપૂર્વક થઈ ગઈ છે!</h3>
              <p className="text-xs text-forest-700 mt-0.5">
                પાવતી ક્રમાંક: <strong>{successReceipt.receipt_number}</strong> • રકમ: <strong>₹{successReceipt.amount.toLocaleString("en-IN")}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessReceipt(null)}
            className="px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900"
          >
            બરાબર
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <Heart className="w-6 h-6 fill-saffron-600 text-saffron-600" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સમાજ દાતાઓ & દાન વિગતો (Donor Directory)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            સમાજ ભવન, શિક્ષણ અને આરોગ્ય સહાયમાં યોગદાન આપનાર સૌ દાતાશ્રીઓનો હૃદયપૂર્વક આભાર.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              setShowLoginPrompt(true);
              return;
            }
            setShowDonateModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-saffron-600 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>દાનની નોંધ ઉમેરો / દાન આપો</span>
        </button>
      </div>

      {/* Total Donation Stats & Bank Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Stat Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-charcoal-900 to-charcoal-950 text-white rounded-3xl p-6 sm:p-8 border border-charcoal-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-saffron-300 uppercase tracking-wider block mb-2">
              સમાજ કલ્યાણ ભંડોળ
            </span>
            <div className="text-3xl sm:text-4xl font-black text-saffron-400">
              ₹{totalDonationAmount.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-charcoal-400 mt-2">
              તમામ દાન પાવતી સાથે ૧૦૦% પારદર્શક રીતે સમાજ વિકાસ હેતુ ઉપયોગમાં લેવાય છે.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-charcoal-400">
            <span>કુલ નોંધાયેલ દાન: <strong>{donations.length}</strong></span>
            <span className="text-emerald-400 font-semibold">ચકાસાયેલ ખાતું ✓</span>
          </div>
        </div>

        {/* Bank & UPI Donation Details */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-saffron-600" />
              <span>સમાજ સેવા સમિતિ બેંક ખાતા વિગતો & UPI</span>
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              આપ સીધા બેંક ખાતામાં અથવા UPI દ્વારા દાન ટ્રાન્સફર કરી પાવતી મેળવી શકો છો.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-ivory-50 p-4 rounded-2xl border border-ivory-200">
              <div>
                <span className="text-charcoal-500 block">ખાતાનું નામ:</span>
                <span className="font-bold text-charcoal-900">શ્રી અડાઆઠમ દરજી સેવા સમિતિ</span>
              </div>
              <div>
                <span className="text-charcoal-500 block">બેંકનું નામ:</span>
                <span className="font-bold text-charcoal-900">સ્ટેટ બેંક ઓફ ઇન્ડિયા (SBI), મોડાસા</span>
              </div>
              <div>
                <span className="text-charcoal-500 block">ખાતા નંબર:</span>
                <span className="font-mono font-bold text-charcoal-900">૩૮૨૫૦૧૦૦૦૪૫૮૨</span>
              </div>
              <div>
                <span className="text-charcoal-500 block">IFSC કોડ:</span>
                <span className="font-mono font-bold text-charcoal-900">SBIN0000428</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ivory-200 flex items-center justify-between">
            <button
              onClick={handleCopyBank}
              className="text-xs font-bold text-saffron-700 hover:text-saffron-800 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedBank ? "વિગતો કોપી થઈ ગઈ!" : "બેંક વિગતો કોપી કરો"}</span>
            </button>
            <span className="text-[11px] text-charcoal-500">UPI: 9825012345@sbi</span>
          </div>
        </div>
      </div>

      {/* Filter and Donor Directory Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">
              સત્તાવાર દાતા યાદી (પ્રકાશિત સંમતિ અનુસાર)
            </h2>
            <p className="text-xs text-charcoal-500 mt-0.5">
              ગોપનીયતા નીતિ અનુસાર સંમતિ વગર કોઈ પણ વ્યક્તિગત દાન સાર્વજનિક કરવામાં આવતું નથી.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="py-2 px-3 border border-ivory-300 rounded-xl bg-white font-medium focus:outline-none"
            >
              <option value="all">બધા પ્રોજેક્ટ્સ</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
                <th className="py-3 px-4 font-bold">પાવતી નં.</th>
                <th className="py-3 px-4 font-bold">દાતાશ્રીનું નામ</th>
                <th className="py-3 px-4 font-bold">દાન રકમ</th>
                <th className="py-3 px-4 font-bold">દાનનો હેતુ / પ્રોજેક્ટ</th>
                <th className="py-3 px-4 font-bold">તારીખ</th>
                <th className="py-3 px-4 font-bold">સ્થિતિ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filteredDonations.map((don) => {
                const displayName = don.is_anonymous || !don.public_consent ? "એક ગુપ્ત દાતાશ્રી" : don.donor_name;
                return (
                  <tr key={don.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-charcoal-600">
                      {don.receipt_number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal-900">
                      {displayName}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-saffron-800 text-sm">
                      ₹{don.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">
                      <span className="font-medium block">{don.purpose}</span>
                      <span className="text-[11px] text-charcoal-500">{don.campaign}</span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-500 font-medium">
                      {don.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        ચકાસાયેલ
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-saffron-600 fill-saffron-600" />
                <span>દાન નોંધણી ફોર્મ</span>
              </h3>
              <button
                onClick={() => setShowDonateModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDonateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">દાતાનું નામ *</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  required={!isAnonymous}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl disabled:bg-ivory-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">દાનની રકમ (₹) *</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="જેમ કે ૫૧૦૦, ૧૧૦૦૦, ૨૧૦૦૦"
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold text-charcoal-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">દાનનો હેતુ</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">પ્રોજેક્ટ / અભિયાન</label>
                  <select
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                  >
                    {campaigns.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">ચુકવણી પદ્ધતિ</label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="UPI, ચેક નં., બેંક NEFT"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                />
              </div>

              {/* Privacy Toggles for Donors */}
              <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-saffron-600 focus:ring-saffron-500"
                  />
                  <span className="font-bold text-charcoal-800">
                    મારું નામ ગુપ્ત (Anonymous) રાખો
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publicConsent}
                    onChange={(e) => setPublicConsent(e.target.checked)}
                    disabled={isAnonymous}
                    className="rounded text-saffron-600 focus:ring-saffron-500"
                  />
                  <span className="text-charcoal-700">
                    આ દાન દાતા યાદીમાં સાર્વજનિક પ્રદર્શિત કરવા મારી સંમતિ છે
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDonateModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl font-semibold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold shadow-sm"
                >
                  દાન નોંધણી પૂર્ણ કરો
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
                દાન નોંધાવવા માટે લૉગિન કરો
              </h3>
              <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                અડાઆઠમ દરજી સમાજ કલ્યાણ ભંડોળમાં દાનની અધિકૃત નોંધણી અને પાવતી મેળવવા માટે સભ્ય લૉગિન આવશ્યક છે. આપના ખાતામાં લૉગિન કરો અથવા નવા સભ્ય તરીકે જોડાઓ.
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
                    loginAs("treasurer");
                    setShowLoginPrompt(false);
                    setShowDonateModal(true);
                  }}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs text-amber-950">💰 ખજાનચી શ્રી</div>
                  <div className="text-[10px] text-amber-700">રમેશભાઈ દરજી</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAs("member");
                    setShowLoginPrompt(false);
                    setShowDonateModal(true);
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
