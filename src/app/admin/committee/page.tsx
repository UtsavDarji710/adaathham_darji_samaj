"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  Phone,
  MapPin,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { CommitteeMember, AdminRole } from "@/types";

export default function AdminCommitteePage() {
  const { committee, addLog } = useData();
  const { currentUser } = useAuth();

  const [successToast, setSuccessToast] = useState<string | null>(null);

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
            <Award className="w-6 h-6 text-purple-700" />
            <span>કારોબારી સમિતિ & આજીવન સભ્ય વ્યવસ્થાપન</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            પ્રમુખ, મંત્રી, સહમંત્રી, ખજાનચી અને ટ્રસ્ટી મંડળના હોદ્દેદારોની સૂચિ.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">ક્રમ</th>
              <th className="py-3 px-4 font-bold">હોદ્દેદારનું નામ</th>
              <th className="py-3 px-4 font-bold">સત્તાવાર હોદ્દો</th>
              <th className="py-3 px-4 font-bold">શહેર</th>
              <th className="py-3 px-4 font-bold">સંપર્ક નંબર</th>
              <th className="py-3 px-4 font-bold">કાર્યકાળ / મુદત</th>
              <th className="py-3 px-4 font-bold">આજીવન સભ્ય</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {committee.map((c) => (
              <tr key={c.id} className="hover:bg-ivory-50/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-charcoal-500">{c.order}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.photo_url}
                      alt={c.name}
                      className="w-8 h-8 rounded-lg object-cover border border-ivory-300"
                    />
                    <span className="font-bold text-charcoal-900">{c.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[11px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full">
                    {c.designation}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">{c.city}</td>
                <td className="py-3.5 px-4 font-mono text-charcoal-800">{c.phone}</td>
                <td className="py-3.5 px-4 text-charcoal-500">{c.term}</td>
                <td className="py-3.5 px-4">
                  {c.is_lifetime_member ? (
                    <span className="text-emerald-700 font-bold text-[11px]">✓ હા</span>
                  ) : (
                    <span className="text-charcoal-400 text-[11px]">ના</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
