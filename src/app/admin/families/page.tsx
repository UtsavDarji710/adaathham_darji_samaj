"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitFork,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminFamiliesPage() {
  const { relationships, approveRelationship, rejectRelationship, deleteRelationship, addLog } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filtered = relationships.filter(
    (r) =>
      r.from_member_name.toLowerCase().includes(search.toLowerCase()) ||
      r.to_member_name.toLowerCase().includes(search.toLowerCase()) ||
      r.relationship_label.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string, pair: string) => {
    approveRelationship(id, currentUser?.name || "એડમિન");
    addLog(
      "પરિવાર સંબંધ મંજૂરી",
      pair,
      "સંબંધને માન્યતા આપી પરિવાર વૃક્ષમાં દર્શાવ્યો.",
      currentUser?.name || "એડમિન",
      currentUser?.role || "president"
    );
    setSuccessToast("સંબંધ સફળતાપૂર્વક મંજૂર કરવામાં આવ્યો!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleReject = (id: string, pair: string) => {
    rejectRelationship(id);
    addLog(
      "પરિવાર સંબંધ નામંજૂર",
      pair,
      "સંબંધની વિનંતી નામંજૂર કરવામાં આવી.",
      currentUser?.name || "એડમિન",
      currentUser?.role || "president"
    );
    setSuccessToast("સંબંધ વિનંતી નામંજૂર કરવામાં આવી.");
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
            <GitFork className="w-6 h-6 text-forest-700" />
            <span>પરિવાર સંબંધ મંજૂરી વર્કફ્લો (Family Workflow)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            સભ્યો દ્વારા વિનંતી કરાયેલ પારિવારિક સંબંધોની ખરાઈ અને મંજૂરી વ્યવસ્થાપન.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="સભ્યનું નામ શોધો..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">વિનંતી કરનાર સભ્ય</th>
              <th className="py-3 px-4 font-bold">સંબંધ પ્રકાર</th>
              <th className="py-3 px-4 font-bold">સામેની વ્યક્તિ</th>
              <th className="py-3 px-4 font-bold">સ્થિતિ</th>
              <th className="py-3 px-4 font-bold">તારીખ</th>
              <th className="py-3 px-4 font-bold text-right">મંજૂરી / કાર્યવાહી</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {filtered.map((rel) => {
              const pairName = `${rel.from_member_name} ↔ ${rel.to_member_name}`;
              return (
                <tr key={rel.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-charcoal-900">
                    {rel.from_member_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold bg-saffron-100 text-saffron-800 px-2.5 py-0.5 rounded-full">
                      {rel.relationship_label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-charcoal-900">
                    {rel.to_member_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        rel.status === "approved"
                          ? "bg-forest-100 text-forest-800"
                          : rel.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {rel.status === "approved"
                        ? "મંજૂર ✓"
                        : rel.status === "rejected"
                        ? "નામંજૂર ✗"
                        : "પેન્ડિંગ..."}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-500 text-[11px]">
                    {rel.created_at.split("T")[0]}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {rel.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(rel.id, pairName)}
                        className="px-2.5 py-1 bg-forest-100 text-forest-800 hover:bg-forest-200 font-bold rounded-lg transition-colors"
                        title="મંજૂર કરો"
                      >
                        મંજૂર કરો
                      </button>
                    )}
                    {rel.status === "pending" && (
                      <button
                        onClick={() => handleReject(rel.id, pairName)}
                        className="px-2.5 py-1 bg-red-100 text-red-800 hover:bg-red-200 font-bold rounded-lg transition-colors"
                        title="નામંજૂર કરો"
                      >
                        નામંજૂર
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`શું તમે આ સંબંધ દૂર કરવા માંગો છો? (${pairName})`)) {
                          deleteRelationship(rel.id);
                        }
                      }}
                      className="p-1 text-charcoal-400 hover:text-red-600 rounded"
                      title="સંબંધ રદ કરો"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
