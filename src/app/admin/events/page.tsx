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
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminEventsPage() {
  const { events, deleteEvent, addEvent, addLog } = useData();
  const { currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    addEvent({
      title,
      description,
      date,
      time: time || "સવારે ૯:૦૦",
      location: location || "સમાજ વાડી",
      city: "મોડાસા",
      cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      gallery: [],
      status: "upcoming",
      year: new Date(date).getFullYear(),
      organizer: "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા",
    });

    addLog(
      "કાર્યક્રમ પ્રકાશિત",
      title,
      `તારીખ: ${date}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "secretary"
    );

    setShowAddModal(false);
    setTitle("");
    setDate("");
    setSuccessToast("કાર્યક્રમ સફળતાપૂર્વક ઉમેરાઈ ગયો!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sky-700" />
            <span>કાર્યક્રમ સંચાલન & મીડિયા (Events Management)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            વાર્ષિક સ્નેહમિલન, સ્મૃતિઓ અને આગામી ઉત્સવોનું આયોજન.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
        >
          <Plus className="w-4 h-4" />
          <span>નવો કાર્યક્રમ ઉમેરો</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">કાર્યક્રમ</th>
              <th className="py-3 px-4 font-bold">તારીખ & સમય</th>
              <th className="py-3 px-4 font-bold">સ્થળ</th>
              <th className="py-3 px-4 font-bold">સ્થિતિ</th>
              <th className="py-3 px-4 font-bold text-right">કાર્યવાહી</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-ivory-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-bold text-charcoal-900 block">{evt.title}</span>
                  <span className="text-[11px] text-charcoal-500">{evt.organizer}</span>
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">
                  <span className="font-semibold">{evt.date}</span>
                  <span className="text-charcoal-400 block text-[11px]">{evt.time}</span>
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">{evt.location}, {evt.city}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                      }
                    }}
                    className="p-1 text-charcoal-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6">
            <h3 className="font-bold text-base text-charcoal-900 pb-3 border-b border-ivory-200">
              નવો કાર્યક્રમ ઉમેરો
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કાર્યક્રમ શીર્ષક *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
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
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">સમય</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="સવારે ૯:૦૦"
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">સ્થળ</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="સમાજ વાડી, મોડાસા"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">વર્ણન</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
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
                  ઉમેરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
