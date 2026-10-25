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
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminAdvertisementsPage() {
  const { businesses, updateBusiness, deleteBusiness, addLog } = useData();
  const { currentUser } = useAuth();

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleApprove = (id: string, name: string) => {
    updateBusiness(id, { status: "active", is_paid: true, is_featured: true });
    addLog(
      "જાહેરાત ચુકવણી માન્યતા & પ્રમોશન",
      name,
      "ચુકવણી ખરાઈ કરીને જાહેરાત લાઈવ કરવામાં આવી.",
      currentUser?.name || "એડમિન",
      currentUser?.role || "treasurer"
    );
    setSuccessToast("જાહેરાત સક્રિય અને માન્ય કરવામાં આવી!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleFeatured = (id: string, current: boolean, name: string) => {
    updateBusiness(id, { is_featured: !current });
    addLog(
      "ફીચર્ડ સ્ટેટસ બદલાયું",
      name,
      `નવું સ્ટેટસ: ${!current ? "ફીચર્ડ" : "સામાન્ય"}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "secretary"
    );
    setSuccessToast("સ્ટેટસ અપડેટ થયું!");
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

      <div>
        <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-600" />
          <span>પેઇડ જાહેરાતો & સ્પોન્સરશિપ સંચાલન (Ad Management)</span>
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          ચુકવણી પુષ્ટિ થયા બાદ જ જાહેરાતને ફીચર્ડ અને સક્રિય દરજ્જો આપવો.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">વ્યવસાય / જાહેરાત</th>
              <th className="py-3 px-4 font-bold">સંચાલક</th>
              <th className="py-3 px-4 font-bold">કેટેગરી & શહેર</th>
              <th className="py-3 px-4 font-bold">ચુકવણી સ્થિતિ</th>
              <th className="py-3 px-4 font-bold">ફીચર્ડ સ્ટેટસ</th>
              <th className="py-3 px-4 font-bold text-right">કાર્યવાહી</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-ivory-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={biz.cover_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=100"}
                      alt={biz.name}
                      className="w-10 h-10 rounded-xl object-cover border border-ivory-300"
                    />
                    <div>
                      <span className="font-bold text-charcoal-900 block">{biz.name}</span>
                      <span className="text-[11px] text-charcoal-500">{biz.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-charcoal-800">{biz.owner_name}</td>
                <td className="py-3.5 px-4 text-charcoal-600">
                  <span className="block font-medium">{biz.category}</span>
                  <span className="text-[11px] text-charcoal-400">{biz.city}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      biz.is_paid
                        ? "bg-forest-100 text-forest-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {biz.is_paid ? `ચુકવેલ (₹${biz.paid_amount || 1500})` : "ચકાસણી બાકી"}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleToggleFeatured(biz.id, biz.is_featured, biz.name)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      biz.is_featured
                        ? "bg-saffron-50 text-saffron-800 border-saffron-300"
                        : "bg-ivory-100 text-charcoal-600 border-ivory-300"
                    }`}
                  >
                    {biz.is_featured ? "★ ફીચર્ડ (લાઈવ)" : "સામાન્ય"}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {!biz.is_paid && (
                    <button
                      onClick={() => handleApprove(biz.id, biz.name)}
                      className="px-2.5 py-1 bg-forest-800 text-white font-bold rounded-lg text-[11px] hover:bg-forest-900 shadow-xs"
                    >
                      ચુકવણી મંજૂર કરો
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`શું તમે આ જાહેરાત દૂર કરવા માંગો છો? (${biz.name})`)) {
                        deleteBusiness(biz.id);
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
    </div>
  );
}
