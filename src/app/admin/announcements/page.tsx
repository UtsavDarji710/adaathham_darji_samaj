"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Check,
  X,
  AlertCircle,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Tag,
  Sparkles,
  Info,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Announcement } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const CATEGORIES: Array<Announcement["category"]> = [
  "સામાન્ય",
  "અગત્યનું",
  "શોક સંદેશ",
  "આનંદના સમાચાર",
  "સમિતિ નિર્ણય",
];

export default function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, addLog } = useData();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<"all" | "urgent" | "normal">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Announcement["category"]>("સામાન્ય");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [author, setAuthor] = useState(currentUser?.name || "મંત્રી શ્રી");
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setCategory("સામાન્ય");
    setDate(new Date().toISOString().split("T")[0]);
    setAuthor(currentUser?.name || "મંત્રી શ્રી");
    setIsUrgent(false);
    setImageUrl("");
    setEditingAnnouncement(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setBody(ann.body);
    setCategory(ann.category);
    setDate(ann.date || new Date().toISOString().split("T")[0]);
    setAuthor(ann.author || currentUser?.name || "મંત્રી શ્રી");
    setIsUrgent(!!ann.is_urgent);
    setImageUrl(ann.image_url || "");
    setShowAddModal(true);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === "all" || ann.category === selectedCategory;

      const matchPriority =
        selectedPriority === "all" ||
        (selectedPriority === "urgent" && ann.is_urgent) ||
        (selectedPriority === "normal" && !ann.is_urgent);

      return matchSearch && matchCategory && matchPriority;
    });
  }, [announcements, searchQuery, selectedCategory, selectedPriority]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      alert("કૃપા કરીને શીર્ષક અને વિગત દાખલ કરો.");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 450));

      if (editingAnnouncement) {
        // Update existing announcement
        updateAnnouncement(editingAnnouncement.id, {
          title: title.trim(),
          body: body.trim(),
          category,
          date,
          author: author.trim() || "મંત્રી શ્રી",
          is_urgent: isUrgent,
          image_url: imageUrl.trim() || undefined,
        });

        addLog(
          "સૂચના સુધારી",
          title.trim(),
          `શ્રેણી: ${category}, તારીખ: ${date}`,
          currentUser?.name || "એડમિન",
          currentUser?.role || "secretary"
        );
        showToast("સૂચના સફળતાપૂર્વક સુધારાઈ ગઈ છે!");
      } else {
        // Add new announcement
        addAnnouncement({
          title: title.trim(),
          body: body.trim(),
          category,
          date,
          author: author.trim() || "મંત્રી શ્રી",
          is_urgent: isUrgent,
          image_url: imageUrl.trim() || undefined,
        });

        addLog(
          "નવી સૂચના ઉમેરી",
          title.trim(),
          `શ્રેણી: ${category}, તાત્કાલિક: ${isUrgent ? "હા" : "ના"}`,
          currentUser?.name || "એડમિન",
          currentUser?.role || "secretary"
        );
        showToast("નવી સૂચના સફળતાપૂર્વક ઉમેરાઈ અને હોમપેજ પર પ્રકાશિત થઈ ગઈ!");
      }

      setShowAddModal(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (ann: Announcement) => {
    if (!confirm(`શું તમે ખરેખર આ સૂચના દૂર કરવા માંગો છો?\n"${ann.title}"`)) {
      return;
    }

    setProcessingId(ann.id);
    try {
      await new Promise((r) => setTimeout(r, 450));
      deleteAnnouncement(ann.id);

      addLog(
        "સૂચના કાઢી નાખી",
        ann.title,
        `શ્રેણી: ${ann.category}`,
        currentUser?.name || "એડમિન",
        currentUser?.role || "secretary"
      );
      showToast("સૂચના સફળતાપૂર્વક દૂર કરવામાં આવી.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-ivory-600/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Back to Admin Navigation */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
      </Link>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5 text-amber-700" />
            <span>સૂચનાઓ & પરિપત્રો પોર્ટલ સંચાલન</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            મહત્વપૂર્ણ સૂચનાઓ & પરિપત્રો (Announcements & Notices)
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            હોમપેજ અને સમગ્ર સમાજ પોર્ટલ પર પ્રદર્શિત થતી મહત્વપૂર્ણ સૂચનાઓ, શોક સંદેશ, આનંદના સમાચાર અને નિર્ણયોનું સંચાલન.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ નવી સૂચના ઉમેરો (Add New Notice)</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-4 sm:p-5 shadow-card space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="શીર્ષક, વિગત, શ્રેણી અથવા લેખક દ્વારા શોધો..."
            className="w-full pl-9 pr-4 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs font-bold text-charcoal-700 focus:outline-none focus:border-saffron-500"
          >
            <option value="all">તમામ શ્રેણી (All)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="flex-1 sm:flex-initial px-3 py-2.5 bg-ivory-50 border border-ivory-300 rounded-xl text-xs font-bold text-charcoal-700 focus:outline-none focus:border-saffron-500"
          >
            <option value="all">બધી અગત્યતા</option>
            <option value="urgent">માત્ર તાત્કાલિક / Urgent</option>
            <option value="normal">સામાન્ય</option>
          </select>
        </div>
      </div>

      {/* Announcements Table & List */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card overflow-hidden">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-charcoal-800">કોઈ સૂચના મળી નથી</h3>
            <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
              હાલ કોઈ સૂચના નોંધાયેલી નથી અથવા આપના શોધ માપદંડ મુજબ કોઈ રેકોર્ડ મળ્યો નથી.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>પ્રથમ સૂચના ઉમેરો</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
                  <th className="py-3.5 px-4 font-bold">અગત્યતા</th>
                  <th className="py-3.5 px-4 font-bold">શીર્ષક & સંદેશ</th>
                  <th className="py-3.5 px-4 font-bold">શ્રેણી</th>
                  <th className="py-3.5 px-4 font-bold">તારીખ</th>
                  <th className="py-3.5 px-4 font-bold">લેખક / હોદ્દો</th>
                  <th className="py-3.5 px-4 font-bold text-right">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {filteredAnnouncements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-ivory-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ann.is_urgent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span>તાત્કાલિક</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-charcoal-500 bg-ivory-100 border border-ivory-200 px-2 py-0.5 rounded-full">
                          સામાન્ય
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-extrabold text-charcoal-900 text-sm mb-1 leading-snug">
                        {ann.title}
                      </div>
                      <div className="text-charcoal-600 line-clamp-2 leading-relaxed">
                        {ann.body}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {ann.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-charcoal-600">
                      {ann.date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-charcoal-700 font-semibold">
                      {ann.author}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button */}
                        <button
                          onClick={() => setViewingAnnouncement(ann)}
                          className="p-1.5 text-charcoal-500 hover:text-charcoal-900 hover:bg-ivory-100 rounded-lg transition-colors"
                          title="સંપૂર્ણ સૂચના જુઓ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(ann)}
                          className="p-1.5 text-charcoal-500 hover:text-saffron-700 hover:bg-saffron-50 rounded-lg transition-colors"
                          title="સૂચના સુધારો"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          disabled={processingId === ann.id}
                          onClick={() => handleDelete(ann)}
                          className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="સૂચના દૂર કરો"
                        >
                          {processingId === ann.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT ANNOUNCEMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-ivory-300 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-saffron-50/80 to-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-saffron-600 text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    {editingAnnouncement ? "સૂચના સુધારો (Edit Notice)" : "નવી સૂચના ઉમેરો (Add New Notice)"}
                  </h3>
                  <p className="text-[11px] text-charcoal-600 mt-0.5">
                    સમાજના તમામ સભ્યો માટે હોમપેજ સ્લાઇડરમાં પ્રદર્શિત થશે.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-ivory-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Field 1: Title */}
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  સૂચનાનું શીર્ષક (Notice Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="દા.ત. વાર્ષિક સ્નેહસંમેલન તથા વિદ્યાર્થી સન્માન સમારોહ ૨૦૨૬"
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-bold"
                />
              </div>

              {/* Grid: Category, Date, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    શ્રેણી (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white font-bold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    તારીખ (Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-charcoal-800 mb-1">
                    લેખક / હોદ્દો (Author) *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="દા.ત. મંત્રી શ્રી અથવા પ્રમુખ શ્રી"
                    className="w-full px-3 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 font-bold"
                  />
                </div>
              </div>

              {/* Field: Urgent Toggle */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>તાત્કાલિક / અગત્યની સૂચના તરીકે દર્શાવો (Urgent Highlight)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    આ વિકલ્પ પસંદ કરવાથી હોમપેજ પર લાલ બેજ સાથે હાઇલાઇટ થશે.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-5 h-5 text-saffron-600 rounded border-ivory-300 focus:ring-saffron-500 cursor-pointer"
                />
              </div>

              {/* Field: Body Content */}
              <div>
                <label className="block font-bold text-charcoal-800 mb-1">
                  સૂચનાની સંપૂર્ણ વિગત (Notice Description / Body) *
                </label>
                <textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="સમાજના પરિવારો માટે જરૂરી માહિતી, નિયમો, સ્થળ, સમય અથવા પરિપત્રનું સંપૂર્ણ લખાણ અહીં લખો..."
                  className="w-full px-3.5 py-2.5 border border-ivory-300 rounded-xl text-xs focus:outline-none focus:border-saffron-500 leading-relaxed"
                />
              </div>

              {/* Optional Image / Banner */}
              <div className="border border-ivory-200 rounded-2xl p-3.5 bg-ivory-50/50">
                <label className="block font-bold text-charcoal-800 mb-1">
                  સૂચના ફોટો / પરિપત્ર છબી (Optional Banner / Image)
                </label>
                <ImageUploadWithCrop
                  currentImageUrl={imageUrl}
                  onImageCropped={(url) => setImageUrl(url)}
                  aspectRatio={16 / 9}
                  aspectRatioLabel="૧૬:૯ (બેનર)"
                  category="samiti-assets"
                  label="ફોટો અપલોડ & ક્રોપ કરો"
                  helperText="JPG, PNG ફાઇલ અપલોડ કરી શકાય છે (ઓપ્શનલ)"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100 transition-colors"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>સાચવી રહ્યા છીએ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingAnnouncement ? "સૂચના સુધારો" : "સૂચના પ્રકાશિત કરો"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ANNOUNCEMENT DETAIL MODAL */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-ivory-300 w-full max-w-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 sm:p-6 border-b border-ivory-200 flex items-center justify-between bg-gradient-to-r from-ivory-50 to-ivory-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  {viewingAnnouncement.category}
                </span>
                {viewingAnnouncement.is_urgent && (
                  <span className="text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
                    તાત્કાલિક
                  </span>
                )}
              </div>
              <button
                onClick={() => setViewingAnnouncement(null)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-full hover:bg-ivory-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-charcoal-900 leading-snug">
                {viewingAnnouncement.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500 pb-3 border-b border-ivory-200">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>{viewingAnnouncement.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>{viewingAnnouncement.author}</span>
                </div>
              </div>

              {viewingAnnouncement.image_url && (
                <div className="rounded-2xl overflow-hidden border border-ivory-200 max-h-60">
                  <img
                    src={viewingAnnouncement.image_url}
                    alt={viewingAnnouncement.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <div className="text-xs sm:text-sm text-charcoal-800 whitespace-pre-line leading-relaxed bg-ivory-50/70 p-4 rounded-2xl border border-ivory-200">
                {viewingAnnouncement.body}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const toEdit = viewingAnnouncement;
                    setViewingAnnouncement(null);
                    openEditModal(toEdit);
                  }}
                  className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>સૂચના સુધારો</span>
                </button>
                <button
                  onClick={() => setViewingAnnouncement(null)}
                  className="px-4 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-700 font-bold text-xs rounded-xl transition-colors"
                >
                  બંધ કરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
