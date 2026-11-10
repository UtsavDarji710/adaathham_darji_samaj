"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowLeft,
  Trash2,
  Plus,
  CheckCircle,
  MapPin,
  Clock,
  Search,
  User,
  Building,
  Check,
  X,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Member } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

export default function AdminEventsPage() {
  const { events, members, deleteEvent, addEvent, addLog } = useData();
  const { currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add Event Form State
  const [organizerSource, setOrganizerSource] = useState<"samiti" | "member" | "custom">("samiti");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [customOrganizer, setCustomOrganizer] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("સવારે ૯:૦૦");
  const [location, setLocation] = useState("શ્રી અડાઆઠમ દરજી સમાજ વાડી, મોડાસા");
  const [city, setCity] = useState("મોડાસા");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"upcoming" | "past">("upcoming");

  const resetForm = () => {
    setOrganizerSource("samiti");
    setMemberSearchQuery("");
    setSelectedMember(null);
    setCustomOrganizer("");
    setTitle("");
    setDate("");
    setTime("સવારે ૯:૦૦");
    setLocation("શ્રી અડાઆઠમ દરજી સમાજ વાડી, મોડાસા");
    setCity("મોડાસા");
    setDescription("");
    setVideoUrl("");
    setCoverImageUrl("");
    setStatus("upcoming");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert("કૃપા કરીને કાર્યક્રમનું શીર્ષક અને તારીખ દાખલ કરો.");
      return;
    }

    // Determine organizer label
    let finalOrganizer = "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા";
    if (organizerSource === "member") {
      finalOrganizer = selectedMember
        ? `શ્રી ${selectedMember.name}${selectedMember.city ? ` (${selectedMember.city})` : ""}`
        : "સમાજ સભ્ય";
    } else if (organizerSource === "custom") {
      finalOrganizer = customOrganizer.trim() || "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા";
    }

    const eventYear = new Date(date).getFullYear() || new Date().getFullYear();

    addEvent({
      title: title.trim(),
      description: description.trim(),
      date,
      time: time.trim() || "સવારે ૯:૦૦",
      location: location.trim() || "સમાજ વાડી",
      city: city.trim() || "મોડાસા",
      cover_image: coverImageUrl.trim() || null, // null if not provided (NO dummy unsplash image!)
      gallery: [],
      video_url: videoUrl.trim() || undefined,
      status,
      year: eventYear,
      organizer: finalOrganizer,
    });

    addLog(
      "કાર્યક્રમ પ્રકાશિત (એડમિન)",
      title.trim(),
      `તારીખ: ${date}, આયોજક: ${finalOrganizer}, સ્થળ: ${location.trim()}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "secretary"
    );

    setShowAddModal(false);
    resetForm();
    setSuccessToast(`"${title.trim()}" કાર્યક્રમ સફળતાપૂર્વક ઉમેરાઈ ગયો!`);
    setTimeout(() => setSuccessToast(null), 3500);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-700" />
            <span>કાર્યક્રમ સંચાલન & મીડિયા (Events Management)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            વાર્ષિક સ્નેહમિલન, સમારોહ, સ્મૃતિઓ અને આગામી ઉત્સવોનું આયોજન.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>+ નવો કાર્યક્રમ ઉમેરો</span>
        </button>
      </div>

      {/* Events List / Table */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ivory-300 p-12 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-charcoal-800">હાલમાં કોઈ કાર્યક્રમ નોંધાયેલ નથી.</h3>
          <p className="text-xs text-charcoal-500">
            સમાજના આગામી કે સંપન્ન થયેલ ઉત્સવ કે સ્નેહમિલન ઉમેરવા ઉપરના બટન પર ક્લિક કરો.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ નવો કાર્યક્રમ ઉમેરો</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
                <th className="py-3 px-4 font-bold">ફોટો</th>
                <th className="py-3 px-4 font-bold">કાર્યક્રમ & આયોજક</th>
                <th className="py-3 px-4 font-bold">તારીખ & સમય</th>
                <th className="py-3 px-4 font-bold">સ્થળ</th>
                <th className="py-3 px-4 font-bold">સ્થિતિ</th>
                <th className="py-3 px-4 font-bold text-right">કાર્યવાહી</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-ivory-50/60 transition-colors">
                  {/* Thumbnail / Icon */}
                  <td className="py-3.5 px-4 w-16">
                    {evt.cover_image && !evt.cover_image.includes("unsplash") ? (
                      <img
                        src={evt.cover_image}
                        alt={evt.title}
                        className="w-12 h-12 rounded-xl object-cover border border-ivory-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 flex-shrink-0">
                        <Calendar className="w-5 h-5 opacity-70" />
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-charcoal-900 block text-sm">{evt.title}</span>
                    <span className="text-[11px] text-charcoal-500 font-medium">આયોજક: {evt.organizer}</span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-700">
                    <span className="font-semibold block">{evt.date}</span>
                    <span className="text-charcoal-400 block text-[11px]">{evt.time}</span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-700">
                    <span className="block">{evt.location}</span>
                    <span className="text-[11px] text-charcoal-400">{evt.city}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        evt.status === "upcoming"
                          ? "bg-forest-100 text-forest-800"
                          : "bg-ivory-200 text-charcoal-700"
                      }`}
                    >
                      {evt.status === "upcoming" ? "આગામી" : "સંપન્ન"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`શું તમે આ કાર્યક્રમ દૂર કરવા માંગો છો? (${evt.title})`)) {
                          deleteEvent(evt.id);
                          addLog(
                            "કાર્યક્રમ ડિલીટ",
                            evt.title,
                            `તારીખ: ${evt.date}`,
                            currentUser?.name || "એડમિન",
                            currentUser?.role || "secretary"
                          );
                          setSuccessToast("કાર્યક્રમ કાઢી નાખવામાં આવ્યો.");
                          setTimeout(() => setSuccessToast(null), 3000);
                        }
                      }}
                      className="p-2 text-charcoal-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="કાર્યક્રમ ડિલીટ કરો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add Event on behalf of user / samiti */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-ivory-200 flex items-center justify-between bg-ivory-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-100 text-sky-800">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-charcoal-900">
                    નવો કાર્યક્રમ ઉમેરો (Add Community Event)
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    સમિતી અથવા કોઈપણ સભ્ય વતી કાર્યક્રમનું આયોજન પ્રકાશિત કરો.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 sm:p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Organizer / Host Selection (On behalf of) */}
              <div className="space-y-2">
                <label className="block font-bold text-charcoal-800">
                  આયોજક / યજમાન પસંદગી (Organizer / On Behalf Of)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrganizerSource("samiti");
                      setSelectedMember(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      organizerSource === "samiti"
                        ? "border-sky-600 bg-sky-50/60 font-bold text-sky-900 shadow-2xs"
                        : "border-ivory-300 bg-white hover:bg-ivory-50 text-charcoal-700"
                    }`}
                  >
                    <Building className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="block font-bold text-xs">સમિતિ દ્વારા</span>
                    <span className="block text-[10px] text-charcoal-500 font-normal">સત્તાવાર સમિતિ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrganizerSource("member");
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      organizerSource === "member"
                        ? "border-sky-600 bg-sky-50/60 font-bold text-sky-900 shadow-2xs"
                        : "border-ivory-300 bg-white hover:bg-ivory-50 text-charcoal-700"
                    }`}
                  >
                    <User className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="block font-bold text-xs">સભ્ય વતી</span>
                    <span className="block text-[10px] text-charcoal-500 font-normal">ડિરેક્ટરીમાંથી પસંદ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrganizerSource("custom");
                      setSelectedMember(null);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      organizerSource === "custom"
                        ? "border-sky-600 bg-sky-50/60 font-bold text-sky-900 shadow-2xs"
                        : "border-ivory-300 bg-white hover:bg-ivory-50 text-charcoal-700"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <span className="block font-bold text-xs">કસ્ટમ નામ</span>
                    <span className="block text-[10px] text-charcoal-500 font-normal">પોતાનું નામ લખો</span>
                  </button>
                </div>

                {/* Member Search if organizerSource === 'member' */}
                {organizerSource === "member" && (
                  <div className="mt-2 space-y-2 p-3 bg-ivory-50 rounded-2xl border border-ivory-200">
                    <span className="font-bold text-charcoal-700 block">સભ્ય શોધો (Search Samaj Member):</span>
                    <div className="relative">
                      <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        placeholder="સભ્યનું નામ, ફોન અથવા ગામ લખીને શોધો..."
                        className="w-full pl-9 pr-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
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
                                setSelectedMember(m);
                                setMemberSearchQuery("");
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-sky-50 flex items-center justify-between text-xs transition-colors"
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
                      <div className="flex items-center justify-between p-2.5 bg-sky-50 border border-sky-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-sky-600" />
                          <div>
                            <span className="font-bold text-sky-950 block">{selectedMember.name}</span>
                            <span className="text-[10px] text-sky-700">આયોજક તરીકે: શ્રી {selectedMember.name} ({selectedMember.city || selectedMember.native_place})</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMember(null)}
                          className="text-[11px] font-bold text-sky-800 underline hover:text-sky-950"
                        >
                          બદલો
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-charcoal-500 italic">
                        ઉપરથી સભ્ય સર્ચ કરીને પસંદ કરો.
                      </p>
                    )}
                  </div>
                )}

                {/* Custom Organizer input if organizerSource === 'custom' */}
                {organizerSource === "custom" && (
                  <div className="mt-2">
                    <label className="block font-bold text-charcoal-700 mb-1">આયોજક / મંડળનું પૂરું નામ *</label>
                    <input
                      type="text"
                      value={customOrganizer}
                      onChange={(e) => setCustomOrganizer(e.target.value)}
                      placeholder="દા.ત. શ્રી અડાઆઠમ યુવા મંડળ અથવા દાતા શ્રી..."
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કાર્યક્રમ શીર્ષક (Event Title) *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="દા.ત. વાર્ષિક સ્નેહ સંમેલન ૨૦૨૬"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Date, Time, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">તારીખ *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સમય</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="સવારે ૯:૦૦"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સ્થિતિ (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "upcoming" | "past")}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="upcoming">આગામી (Upcoming)</option>
                    <option value="past">સંપન્ન (Past Event)</option>
                  </select>
                </div>
              </div>

              {/* Location & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સ્થળ (Location Venue) *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="દા.ત. સમાજ વાડી, મોડાસા"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">શહેર (City)</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="મોડાસા"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Video Link */}
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">યુટ્યુબ / વિડિયો લિંક (વૈકલ્પિક)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કાર્યક્રમ વિગત / વર્ણન</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="કાર્યક્રમની રૂપરેખા, મુખ્ય અતિથિ વિશેષ અથવા કાર્યસૂચિ વિશે લખો..."
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Cover Image Upload (Optional, NO dummy image) */}
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal-800 block">કાર્યક્રમ કવર ફોટો (Cover Image - વૈકલ્પિક)</span>
                    <span className="text-[10px] text-charcoal-500">
                      જો ફોટો ઉપલબ્ધ ન હોય તો ખાલી રાખી શકો છો (કોઈ ડમી ફોટો સેટ થશે નહીં).
                    </span>
                  </div>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ફોટો હટાવો</span>
                    </button>
                  )}
                </div>

                {coverImageUrl ? (
                  <div className="relative aspect-[16/9] max-h-48 rounded-xl overflow-hidden border border-ivory-300 bg-white">
                    <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <ImageUploadWithCrop
                    currentImageUrl={coverImageUrl}
                    onImageCropped={(url) => setCoverImageUrl(url)}
                    aspectRatio={16 / 9}
                    aspectRatioLabel="૧૬:૯ (બેનર)"
                    category="samiti-assets"
                    label="કવર ફોટો પસંદ કરો"
                    helperText="JPG, PNG ફાઇલ અપલોડ કરો અને ક્રોપ કરો"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-ivory-300 text-charcoal-700 font-bold text-xs hover:bg-ivory-100"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>કાર્યક્રમ સાચવો & પ્રકાશિત કરો</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
