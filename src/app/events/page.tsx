"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  Video,
  Image as ImageIcon,
  CheckCircle,
  Filter,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { CommunityEvent } from "@/types";

export default function EventsPage() {
  const { events, addEvent, addLog } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "past">("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Event Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("મોડાસા");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const years = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.year))).sort((a, b) => b - a);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchTab = filterTab === "all" || e.status === filterTab;
      const matchYear = selectedYear === "all" || e.year === parseInt(selectedYear);
      return matchTab && matchYear;
    });
  }, [events, filterTab, selectedYear]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const eventYear = new Date(date).getFullYear() || 2025;
    const isUpcoming = new Date(date) >= new Date();

    addEvent({
      title,
      description,
      date,
      time: time || "સવારે ૯:૦૦",
      location,
      city,
      cover_image:
        coverImage ||
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
      gallery: [],
      video_url: videoUrl || undefined,
      status: isUpcoming ? "upcoming" : "past",
      year: eventYear,
      organizer: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા",
    });

    addLog(
      "નવો કાર્યક્રમ ઉમેર્યો",
      title,
      `તારીખ: ${date}, સ્થળ: ${location}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "secretary"
    );

    setShowAddModal(false);
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setSuccessToast("નવો કાર્યક્રમ સફળતાપૂર્વક ઉમેરાઈ ગયો છે!");
    setTimeout(() => setSuccessToast(null), 4000);
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

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
              <Calendar className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સમાજના કાર્યક્રમો & ફોટો ગેલેરી
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            વાર્ષિક સ્નેહમિલન, ચામુંડા માતાજી પાટોત્સવ અને રક્તદાન શિબિરોની સ્મૃતિઓ.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
          >
            <Plus className="w-4 h-4" />
            <span>નવો કાર્યક્રમ ઉમેરો</span>
          </button>
        )}
      </div>

      {/* Filter Tabs and Year Selector */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center bg-ivory-200 p-1 rounded-xl border border-ivory-300 text-xs font-bold">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTab === "all" ? "bg-white text-saffron-800 shadow-sm" : "text-charcoal-600"
            }`}
          >
            બધા કાર્યક્રમો ({events.length})
          </button>
          <button
            onClick={() => setFilterTab("upcoming")}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTab === "upcoming" ? "bg-white text-saffron-800 shadow-sm" : "text-charcoal-600"
            }`}
          >
            આગામી કાર્યક્રમો
          </button>
          <button
            onClick={() => setFilterTab("past")}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterTab === "past" ? "bg-white text-saffron-800 shadow-sm" : "text-charcoal-600"
            }`}
          >
            યોજાઈ ગયેલા કાર્યક્રમો
          </button>
        </div>

        {/* Year Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-charcoal-500 font-semibold">વર્ષ પ્રમાણે ફિલ્ટર:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-2 px-3 border border-ivory-300 rounded-xl bg-white font-bold text-charcoal-800 focus:outline-none"
          >
            <option value="all">બધા વર્ષો</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-ivory-300 overflow-hidden shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
                <img
                  src={evt.cover_image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-saffron-800 font-bold text-xs px-2.5 py-1 rounded-xl shadow-xs">
                  {evt.date}
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  {evt.gallery.length > 0 && (
                    <span className="bg-charcoal-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {evt.gallery.length} ફોટા
                    </span>
                  )}
                  {evt.video_url && (
                    <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      વિડિયો
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <span className="text-[10px] font-bold bg-forest-100 text-forest-800 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {evt.organizer}
                </span>

                <h3 className="font-bold text-base text-charcoal-900 group-hover:text-saffron-700 transition-colors leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-charcoal-600 mt-2 line-clamp-3 leading-relaxed">
                  {evt.description}
                </p>

                <div className="mt-4 pt-3 border-t border-ivory-200 space-y-1 text-xs text-charcoal-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                    <span className="truncate">{evt.location}, {evt.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={`/events/${evt.id}`}
                className="w-full py-2.5 bg-ivory-100 hover:bg-saffron-50 border border-ivory-300 hover:border-saffron-400 text-saffron-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>વિગતો અને ફોટો ગેલેરી જુઓ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-ivory-300">
          <p className="text-sm font-bold text-charcoal-700">કોઈ કાર્યક્રમ મળ્યો નથી.</p>
          <p className="text-xs text-charcoal-500 mt-1">કૃપા કરીને અન્ય ફિલ્ટર પસંદ કરો.</p>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-bold text-base text-charcoal-900">
                નવો કાર્યક્રમ ઉમેરો
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કાર્યક્રમનું શીર્ષક *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="દા.ત. વાર્ષિક સ્નેહમિલન ૨૦૨૫"
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">તારીખ *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સમય</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="દા.ત. સવારે ૯:૩૦ થી"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સ્થળ</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="સમાજ વાડી, મોડાસા"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">શહેર</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">વિગતવાર વર્ણન</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="કાર્યક્રમની રૂપરેખા અને આમંત્રણ સંદેશ"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl font-semibold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold shadow-sm"
                >
                  કાર્યક્રમ પ્રકાશિત કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
