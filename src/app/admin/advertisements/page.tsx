"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles,
  Phone,
  Clock,
  Eye,
  Globe,
  MapPin,
  User,
  Filter,
  AlertTriangle,
  ExternalLink,
  X,
  Plus,
  Search,
  Building,
  Check,
  Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { BusinessAdvertisement, Member } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const AD_CATEGORIES = [
  "ટેલરિંગ & ફેશન",
  "કાપડ & ટેક્સટાઇલ",
  "જ્વેલરી & સોના-ચાંદી",
  "કરિયાણું & અનાજ પ્રોવિઝન",
  "ઇલેક્ટ્રોનિક્સ & મોબાઇલ",
  "હાર્ડવેર & સેનિટરી",
  "મેડિકલ & ફાર્મસી",
  "ટૂર્સ & ટ્રાવેલ્સ",
  "ઓટોમોબાઇલ & ગેરેજ",
  "સર્વિસ & કન્સલ્ટિંગ",
  "અન્ય વ્યવસાય (Other)",
];

export default function AdminAdvertisementsPage() {
  const {
    members,
    advertisements,
    addAdvertisement,
    approveAdvertisement,
    rejectAdvertisement,
    deleteAdvertisement,
    addLog,
  } = useData();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Action Loading States
  const [processingAdId, setProcessingAdId] = useState<string | null>(null);
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [isRejectingAd, setIsRejectingAd] = useState(false);

  // Modal states
  const [previewAd, setPreviewAd] = useState<BusinessAdvertisement | null>(null);
  const [rejectingAd, setRejectingAd] = useState<BusinessAdvertisement | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  // Add Advertisement on behalf of user state
  const [showAddModal, setShowAddModal] = useState(false);
  const [ownerSource, setOwnerSource] = useState<"member" | "custom">("member");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [addBusinessName, setAddBusinessName] = useState("");
  const [addCategory, setAddCategory] = useState(AD_CATEGORIES[0]);
  const [addDescription, setAddDescription] = useState("");
  const [addOwnerName, setAddOwnerName] = useState("");
  const [addContactNumber, setAddContactNumber] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addWebsiteLink, setAddWebsiteLink] = useState("");
  const [addBannerUrl, setAddBannerUrl] = useState("");
  const [addStatus, setAddStatus] = useState<"approved" | "pending">("approved");

  const resetAddForm = () => {
    setOwnerSource("member");
    setMemberSearchQuery("");
    setSelectedMember(null);
    setAddBusinessName("");
    setAddCategory(AD_CATEGORIES[0]);
    setAddDescription("");
    setAddOwnerName("");
    setAddContactNumber("");
    setAddAddress("");
    setAddWebsiteLink("");
    setAddBannerUrl("");
    setAddStatus("approved");
  };

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setAddOwnerName(m.name);
    setAddContactNumber(m.phone || "");
    setAddAddress(m.address || m.city || "");
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBusinessName.trim() || !addDescription.trim() || !addContactNumber.trim() || !addAddress.trim()) {
      alert("કૃપા કરીને બધી ફરજિયાત વિગતો ભરો.");
      return;
    }

    setIsCreatingAd(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const approverName = currentUser?.name || "એડમિન કમિટી";

      addAdvertisement({
        business_name: addBusinessName.trim(),
        category: addCategory,
        description: addDescription.trim(),
        owner_name: addOwnerName.trim() || (selectedMember ? selectedMember.name : "સમાજ સભ્ય"),
        contact_number: addContactNumber.trim(),
        address: addAddress.trim(),
        image_url: addBannerUrl.trim() || null, // null if no banner uploaded (NO dummy image!)
        website_link: addWebsiteLink.trim() || undefined,
        status: addStatus,
        submitted_by: selectedMember ? selectedMember.id : currentUser?.id,
        approved_by: addStatus === "approved" ? approverName : undefined,
        approved_at: addStatus === "approved" ? new Date().toISOString() : undefined,
      });

      addLog(
        addStatus === "approved" ? "વ્યવસાય જાહેરાત પ્રકાશિત (એડમિન)" : "વ્યવસાય જાહેરાત અરજી નોંધાઈ (પેન્ડિંગ)",
        addBusinessName.trim(),
        `માલિક: ${addOwnerName.trim() || "સભ્ય"}, સંપર્ક: ${addContactNumber.trim()}`,
        approverName,
        currentUser?.role || "secretary"
      );

      setShowAddModal(false);
      resetAddForm();
      setSuccessToast(`"${addBusinessName.trim()}" જાહેરાત સફળતાપૂર્વક ઉમેરાઈ ગઈ!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setIsCreatingAd(false);
    }
  };

  const pendingCount = advertisements.filter((a) => a.status === "pending").length;
  const approvedCount = advertisements.filter((a) => a.status === "approved").length;
  const rejectedCount = advertisements.filter((a) => a.status === "rejected").length;

  const filteredAds = advertisements.filter((a) => {
    if (activeFilter === "all") return true;
    return a.status === activeFilter;
  });

  const handleApprove = async (ad: BusinessAdvertisement) => {
    setProcessingAdId(ad.id);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const approverName = currentUser?.name || "એડમિન કમિટી";
      approveAdvertisement(ad.id, approverName);
      addLog(
        "વ્યવસાય જાહેરાત મંજૂર",
        ad.business_name,
        `જાહેરાત માન્ય કરવામાં આવી અને હોમપેજ/પોર્ટલ પર સક્રિય કરાઈ.`,
        approverName,
        currentUser?.role || "secretary"
      );
      setSuccessToast(`"${ad.business_name}" જાહેરાત સફળતાપૂર્વક મંજૂર કરવામાં આવી!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setProcessingAdId(null);
    }
  };

  const handleOpenRejectModal = (ad: BusinessAdvertisement) => {
    setRejectingAd(ad);
    setRejectionRemarks(ad.rejection_remarks || "");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAd) return;

    setIsRejectingAd(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const rejecterName = currentUser?.name || "એડમિન કમિટી";
      const remarks = rejectionRemarks.trim() || "વિગતો અથવા બેનર યોગ્ય નથી. કૃપા કરીને સુધારીને ફરી મોકલો.";

      rejectAdvertisement(rejectingAd.id, remarks, rejecterName);
      addLog(
        "વ્યવસાય જાહેરાત અસ્વીકાર",
        rejectingAd.business_name,
        `કારણ: ${remarks}`,
        rejecterName,
        currentUser?.role || "secretary"
      );

      setRejectingAd(null);
      setRejectionRemarks("");
      setSuccessToast(`"${rejectingAd.business_name}" જાહેરાત અસ્વીકાર કરવામાં આવી.`);
      setTimeout(() => setSuccessToast(null), 3500);
    } finally {
      setIsRejectingAd(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`શું તમે ખરેખર "${name}" જાહેરાત કાઢી નાખવા માંગો છો?`)) {
      setProcessingAdId(id);
      try {
        await new Promise((r) => setTimeout(r, 450));
        deleteAdvertisement(id);
        setSuccessToast("જાહેરાત ડિલીટ કરવામાં આવી.");
        setTimeout(() => setSuccessToast(null), 3000);
      } finally {
        setProcessingAdId(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Megaphone className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-charcoal-900">
              વ્યવસાય જાહેરાત અરજીઓ (Business Advertisement Requests)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            સભ્યો દ્વારા મૂકાયેલી વ્યવસાય જાહેરાતોની ચકાસણી કરો. માન્ય કરેલી જાહેરાતો જ હોમપેજ અને જાહેર પોર્ટલ પર દર્શાવાશે.
          </p>
        </div>

        <button
          onClick={() => {
            resetAddForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>+ નવી જાહેરાત ઉમેરો</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-ivory-100/80 rounded-2xl border border-ivory-300 w-max max-w-full">
        <button
          onClick={() => setActiveFilter("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeFilter === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-charcoal-700 hover:bg-white/70"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>પેન્ડિંગ અરજીઓ</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeFilter === "pending"
                  ? "bg-white text-amber-900"
                  : "bg-amber-200 text-amber-900"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter("approved")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeFilter === "approved"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-charcoal-700 hover:bg-white/70"
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>માન્ય / મંજૂર ({approvedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("rejected")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeFilter === "rejected"
              ? "bg-red-600 text-white shadow-sm"
              : "text-charcoal-700 hover:bg-white/70"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>અસ્વીકાર કરેલ ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFilter === "all"
              ? "bg-charcoal-900 text-white shadow-sm"
              : "text-charcoal-700 hover:bg-white/70"
          }`}
        >
          <span>તમામ ({advertisements.length})</span>
        </button>
      </div>

      {/* Advertisement Cards Grid */}
      {filteredAds.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-ivory-100 text-charcoal-400 mx-auto flex items-center justify-center">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-charcoal-800">
            {activeFilter === "pending"
              ? "હાલમાં કોઈ પેન્ડિંગ જાહેરાત અરજી નથી."
              : activeFilter === "approved"
              ? "કોઈ માન્ય જાહેરાતો નથી."
              : activeFilter === "rejected"
              ? "કોઈ અસ્વીકાર કરેલ જાહેરાત નથી."
              : "કોઈ જાહેરાત નોંધાયેલી નથી."}
          </h3>
          <p className="text-xs text-charcoal-500">
            સભ્યો નવી જાહેરાતો સબમિટ કરશે ત્યારે અહીં મંજૂરી માટે દર્શાવાશે.
          </p>
          <button
            onClick={() => {
              resetAddForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ નવી જાહેરાત ઉમેરો</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-3xl border border-ivory-300 shadow-card hover:shadow-hover transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Banner Image Preview */}
                <div
                  className="relative aspect-[16/9] bg-ivory-200 overflow-hidden cursor-pointer group"
                  onClick={() => setPreviewAd(ad)}
                  title="મોટો ફોટો જોવા ક્લિક કરો"
                >
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
                      <span className="text-[10px] text-charcoal-400 mt-0.5">ફોટો ઉપલબ્ધ નથી</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>બેનર પ્રિવ્યૂ જુઓ</span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 ${
                      ad.status === "approved"
                        ? "bg-emerald-600 text-white"
                        : ad.status === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {ad.status === "approved" && <CheckCircle className="w-3 h-3" />}
                    {ad.status === "rejected" && <XCircle className="w-3 h-3" />}
                    {ad.status === "pending" && <Clock className="w-3 h-3" />}
                    <span>
                      {ad.status === "approved"
                        ? "મંજૂર (Approved)"
                        : ad.status === "rejected"
                        ? "અસ્વીકાર (Rejected)"
                        : "ચકાસણી પેન્ડિંગ (Pending)"}
                    </span>
                  </span>

                  <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {ad.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900 line-clamp-1">
                      {ad.business_name}
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 line-clamp-2 leading-relaxed">
                      {ad.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-charcoal-700 bg-ivory-50 p-3 rounded-2xl border border-ivory-200">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-saffron-700 flex-shrink-0" />
                      <span className="truncate">માલિક: <strong>{ad.owner_name}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <a href={`tel:${ad.contact_number}`} className="font-bold text-forest-800 hover:underline">
                        {ad.contact_number}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-500 flex-shrink-0" />
                      <span className="truncate text-charcoal-600">{ad.address}</span>
                    </div>
                    {ad.website_link && (
                      <div className="flex items-center gap-1.5 pt-0.5">
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

                  {/* Rejection remarks if rejected */}
                  {ad.status === "rejected" && ad.rejection_remarks && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">અસ્વીકાર કારણ / શેરો:</span>
                        <span>{ad.rejection_remarks}</span>
                      </div>
                    </div>
                  )}

                  {/* Approval metadata */}
                  {ad.status === "approved" && ad.approved_by && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✓ {ad.approved_by} દ્વારા મંજૂર ({ad.approved_at})
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-ivory-50/70 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewAd(ad)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-ivory-300 hover:border-saffron-500 text-charcoal-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>વિગત</span>
                </button>

                <div className="flex items-center gap-2">
                  {ad.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(ad)}
                      disabled={processingAdId === ad.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      {processingAdId === ad.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>મંજૂર થઈ રહ્યું છે...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>મંજૂર કરો</span>
                        </>
                      )}
                    </button>
                  )}

                  {ad.status !== "rejected" && (
                    <button
                      onClick={() => handleOpenRejectModal(ad)}
                      disabled={processingAdId === ad.id}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>અસ્વીકાર</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(ad.id, ad.business_name)}
                    disabled={processingAdId === ad.id}
                    className="p-1.5 rounded-xl text-charcoal-400 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    title="ડિલીટ કરો"
                  >
                    {processingAdId === ad.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner / Details Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-ivory-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-charcoal-900">
                  {previewAd.business_name}
                </h3>
                <span className="text-xs text-charcoal-500 font-medium">{previewAd.category}</span>
              </div>
              <button
                onClick={() => setPreviewAd(null)}
                className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {/* Full Image Banner */}
              <div className="rounded-2xl overflow-hidden border border-ivory-300 shadow-sm bg-black/5">
                {previewAd.image_url ? (
                  <img
                    src={previewAd.image_url}
                    alt={previewAd.business_name}
                    className="w-full max-h-[360px] object-contain mx-auto"
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-saffron-50 via-saffron-100/40 to-ivory-200 flex flex-col items-center justify-center text-center p-4">
                    <Megaphone className="w-12 h-12 text-saffron-600/30 mb-2" />
                    <span className="text-sm font-bold text-saffron-900/70">{previewAd.business_name}</span>
                    <span className="text-xs text-charcoal-400 mt-1">આ જાહેરાત માટે કોઈ બેનર ફોટો અપલોડ થયેલ નથી</span>
                  </div>
                )}
              </div>

              {/* Details table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-charcoal-500 font-medium block">વ્યવસાય માલિક:</span>
                  <strong className="text-charcoal-900 text-sm">{previewAd.owner_name}</strong>
                </div>
                <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200">
                  <span className="text-charcoal-500 font-medium block">સંપર્ક નંબર:</span>
                  <strong className="text-forest-800 text-sm">{previewAd.contact_number}</strong>
                </div>
                <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 sm:col-span-2">
                  <span className="text-charcoal-500 font-medium block">સરનામું:</span>
                  <span className="text-charcoal-900">{previewAd.address}</span>
                </div>
                {previewAd.website_link && (
                  <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 sm:col-span-2">
                    <span className="text-charcoal-500 font-medium block">વેબસાઇટ / લિંક:</span>
                    <a
                      href={previewAd.website_link.startsWith("http") ? previewAd.website_link : `https://${previewAd.website_link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{previewAd.website_link}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 sm:col-span-2">
                  <span className="text-charcoal-500 font-medium block">વ્યવસાય વિગત:</span>
                  <p className="text-charcoal-800 mt-1 leading-relaxed">{previewAd.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-ivory-200 bg-ivory-50 flex items-center justify-end gap-2">
              {previewAd.status !== "approved" && (
                <button
                  disabled={processingAdId === previewAd.id}
                  onClick={async () => {
                    const ad = previewAd;
                    await handleApprove(ad);
                    setPreviewAd(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {processingAdId === previewAd.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>મંજૂર કરી રહ્યા છીએ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>મંજૂર કરો</span>
                    </>
                  )}
                </button>
              )}
              {previewAd.status !== "rejected" && (
                <button
                  onClick={() => {
                    const target = previewAd;
                    setPreviewAd(null);
                    handleOpenRejectModal(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>અસ્વીકાર કરો</span>
                </button>
              )}
              <button
                onClick={() => setPreviewAd(null)}
                className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Remarks Modal */}
      {rejectingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-bold text-base text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>જાહેરાત અસ્વીકાર (Reject Advertisement)</span>
              </h3>
              <button
                onClick={() => setRejectingAd(null)}
                className="w-7 h-7 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600">
              તમે <strong>&ldquo;{rejectingAd.business_name}&rdquo;</strong> ની જાહેરાત અસ્વીકાર કરી રહ્યા છો. કૃપા કરીને સભ્યને જણાવવા માટે અસ્વીકારનું કારણ અથવા શેરો લખો:
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  અસ્વીકાર કારણ / રિમાર્ક્સ *
                </label>
                <textarea
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  required
                  rows={3}
                  placeholder="દા.ત. બેનરની ક્વોલિટી યોગ્ય નથી, અથવા સરનામું અધૂરું છે..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setRejectingAd(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={isRejectingAd}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  {isRejectingAd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>અસ્વીકાર થઈ રહ્યો છે...</span>
                    </>
                  ) : (
                    <span>અસ્વીકાર કન્ફર્મ કરો</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Advertisement on behalf of user */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-ivory-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    નવી વ્યવસાય જાહેરાત ઉમેરો (Add Advertisement)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    એડમિન કોઈપણ સભ્ય અથવા અન્ય વ્યવસાયી વતી સીધી જાહેરાત બનાવી શકે છે.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Creator Mode / On behalf of */}
              <div className="space-y-2">
                <label className="block font-bold text-charcoal-800">
                  કોના વતી જાહેરાત ઉમેરવી છે? (On Behalf Of)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOwnerSource("member");
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      ownerSource === "member"
                        ? "border-saffron-600 bg-saffron-50/60 font-bold text-saffron-900 shadow-2xs"
                        : "border-ivory-300 bg-white hover:bg-ivory-50 text-charcoal-700"
                    }`}
                  >
                    <User className="w-4 h-4 text-saffron-600" />
                    <div>
                      <span className="block font-bold text-xs">સમાજ સભ્ય વતી</span>
                      <span className="block text-[10px] text-charcoal-500 font-normal">ડિરેક્ટરીમાંથી સભ્ય પસંદ કરો</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOwnerSource("custom");
                      setSelectedMember(null);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      ownerSource === "custom"
                        ? "border-saffron-600 bg-saffron-50/60 font-bold text-saffron-900 shadow-2xs"
                        : "border-ivory-300 bg-white hover:bg-ivory-50 text-charcoal-700"
                    }`}
                  >
                    <Building className="w-4 h-4 text-saffron-600" />
                    <div>
                      <span className="block font-bold text-xs">અન્ય પેઢી / માલિક</span>
                      <span className="block text-[10px] text-charcoal-500 font-normal">નવી વિગત મેન્યુઅલી દાખલ કરો</span>
                    </div>
                  </button>
                </div>

                {/* Member Search if ownerSource === 'member' */}
                {ownerSource === "member" && (
                  <div className="mt-2 space-y-2 p-3 bg-ivory-50 rounded-2xl border border-ivory-200">
                    <span className="font-bold text-charcoal-700 block">સભ્ય શોધો (Search Samaj Member):</span>
                    <div className="relative">
                      <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="સભ્યનું નામ, ફોન અથવા ગામ લખીને શોધો..."
                        className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                      />
                    </div>

                    {/* Matching members list */}
                    {memberSearchQuery.trim() && (
                      <div className="max-h-40 overflow-y-auto space-y-1 bg-white border border-ivory-300 rounded-xl p-1 shadow-sm">
                        {members
                          .filter((m) => {
                            const q = memberSearchQuery.toLowerCase();
                            return (
                              m.name?.toLowerCase().includes(q) ||
                              m.phone?.includes(q) ||
                              m.native_place?.toLowerCase().includes(q) ||
                              m.city?.toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 5)
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                handleSelectMember(m);
                                setMemberSearchQuery("");
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-saffron-50 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-charcoal-900">{m.name}</span>
                                <span className="text-[10px] text-charcoal-500 font-normal">({m.native_place || m.city})</span>
                              </div>
                              <span className="text-[11px] text-forest-700 font-medium">{m.phone}</span>
                            </button>
                          ))}
                      </div>
                    )}

                    {selectedMember ? (
                      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-emerald-950 block">{selectedMember.name}</span>
                            <span className="text-[10px] text-emerald-700">ફોન: {selectedMember.phone} • {selectedMember.native_place || selectedMember.city}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMember(null)}
                          className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                        >
                          બદલો
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-charcoal-500 italic">
                        ઉપરથી સભ્ય સર્ચ કરીને પસંદ કરો અથવા સીધી નીચે વિગત ભરો.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Business Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">પેઢી / વ્યવસાયનું નામ *</label>
                  <input
                    type="text"
                    value={addBusinessName}
                    onChange={(e) => setAddBusinessName(e.target.value)}
                    required
                    placeholder="દા.ત. શ્રી ગણેશ ટ્રેડર્સ"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય કેટેગરી *</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  >
                    {AD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Owner Name, Phone, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય માલિકનું પૂરું નામ *</label>
                  <input
                    type="text"
                    value={addOwnerName}
                    onChange={(e) => setAddOwnerName(e.target.value)}
                    required
                    placeholder="દા.ત. રમેશભાઈ દરજી"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સંપર્ક / મોબાઇલ નંબર *</label>
                  <input
                    type="tel"
                    value={addContactNumber}
                    onChange={(e) => setAddContactNumber(e.target.value)}
                    required
                    placeholder="૧૦ અંકનો મોબાઇલ નંબર"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સરનામું / દુકાનનું સ્થળ *</label>
                  <input
                    type="text"
                    value={addAddress}
                    onChange={(e) => setAddAddress(e.target.value)}
                    required
                    placeholder="દુકાન નં, માર્કેટ, શહેર"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">વેબસાઇટ / ઇન્સ્ટાગ્રામ લિંક (વૈકલ્પિક)</label>
                  <input
                    type="text"
                    value={addWebsiteLink}
                    onChange={(e) => setAddWebsiteLink(e.target.value)}
                    placeholder="https://... અથવા instagram.com/..."
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય વર્ણન / સેવાની વિગતો *</label>
                <textarea
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="વ્યવસાયમાં મળતી સેવાઓ, વિશેષતા અને પ્રોડક્ટ્સ વિશે ટૂંકમાં લખો..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>

              {/* Banner Image Upload (Optional, No dummy image) */}
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal-800 block">જાહેરાત બેનર ફોટો (Banner Image - વૈકલ્પિક)</span>
                    <span className="text-[10px] text-charcoal-500">
                      જો ફોટો ઉપલબ્ધ ન હોય તો ખાલી રાખી શકો છો (કોઈ ડમી ફોટો સેટ થશે નહીં).
                    </span>
                  </div>
                  {addBannerUrl && (
                    <button
                      type="button"
                      onClick={() => setAddBannerUrl("")}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ફોટો હટાવો</span>
                    </button>
                  )}
                </div>

                {addBannerUrl ? (
                  <div className="relative aspect-[16/9] max-h-48 rounded-xl overflow-hidden border border-ivory-300 bg-white">
                    <img src={addBannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <ImageUploadWithCrop
                    currentImageUrl={addBannerUrl}
                    onImageCropped={(url) => setAddBannerUrl(url)}
                    aspectRatio={16 / 9}
                    aspectRatioLabel="૧૬:૯ (બેનર)"
                    category="advertisement-banners"
                    label="બેનર ફોટો પસંદ કરો"
                    helperText="JPG, PNG ફાઇલ અપલોડ કરો અને ક્રોપ કરો"
                  />
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">જાહેરાત સ્થિતિ (Status)</label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as "approved" | "pending")}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-saffron-500"
                >
                  <option value="approved">માન્ય (Approved - સીધી પોર્ટલ પર લાઈવ કરો)</option>
                  <option value="pending">પેન્ડિંગ (Pending - ચકાસણી યાદીમાં રાખો)</option>
                </select>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAd}
                  className="px-6 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  {isCreatingAd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>જાહેરાત સાચવી રહ્યા છીએ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>જાહેરાત સાચવો & ઉમેરો</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
