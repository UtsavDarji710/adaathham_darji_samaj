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
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { BusinessAdvertisement } from "@/types";

export default function AdminAdvertisementsPage() {
  const {
    advertisements,
    approveAdvertisement,
    rejectAdvertisement,
    deleteAdvertisement,
    addLog,
  } = useData();
  const { currentUser } = useAuth();

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal states
  const [previewAd, setPreviewAd] = useState<BusinessAdvertisement | null>(null);
  const [rejectingAd, setRejectingAd] = useState<BusinessAdvertisement | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  const pendingCount = advertisements.filter((a) => a.status === "pending").length;
  const approvedCount = advertisements.filter((a) => a.status === "approved").length;
  const rejectedCount = advertisements.filter((a) => a.status === "rejected").length;

  const filteredAds = advertisements.filter((a) => {
    if (activeFilter === "all") return true;
    return a.status === activeFilter;
  });

  const handleApprove = (ad: BusinessAdvertisement) => {
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
  };

  const handleOpenRejectModal = (ad: BusinessAdvertisement) => {
    setRejectingAd(ad);
    setRejectionRemarks(ad.rejection_remarks || "");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAd) return;

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
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`શું તમે ખરેખર "${name}" જાહેરાત કાઢી નાખવા માંગો છો?`)) {
      deleteAdvertisement(id);
      setSuccessToast("જાહેરાત ડિલીટ કરવામાં આવી.");
      setTimeout(() => setSuccessToast(null), 3000);
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
                  <img
                    src={ad.image_url}
                    alt={ad.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>મંજૂર કરો</span>
                    </button>
                  )}

                  {ad.status !== "rejected" && (
                    <button
                      onClick={() => handleOpenRejectModal(ad)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>અસ્વીકાર</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(ad.id, ad.business_name)}
                    className="p-1.5 rounded-xl text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="ડિલીટ કરો"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
                <img
                  src={previewAd.image_url}
                  alt={previewAd.business_name}
                  className="w-full max-h-[360px] object-contain mx-auto"
                />
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
                  onClick={() => {
                    handleApprove(previewAd);
                    setPreviewAd(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>મંજૂર કરો</span>
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
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  અસ્વીકાર કન્ફર્મ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
