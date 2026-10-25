"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowLeft,
  Shield,
  Edit3,
  Trash2,
  CheckCircle,
  Plus,
  Lock,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Member, AdminRole } from "@/types";

export default function AdminMembersPage() {
  const { members, updateMember, deleteMember, addLog } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.city.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMember(editingMember.id, editingMember);

    addLog(
      "સભ્ય વિગતો સુધારી",
      editingMember.name,
      `ભૂમિકા: ${editingMember.role}, હોદ્દો: ${editingMember.committee_role || "સભ્ય"}`,
      currentUser?.name || "એડમિન",
      currentUser?.role || "secretary"
    );

    setEditingMember(null);
    setSuccessToast("સભ્યની વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-saffron-600" />
            <span>સભ્ય સંચાલન & પ્રોફાઇલ સહાય (Member Management)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            વૃદ્ધ અથવા ટેકનોલોજીથી અજાણ સભ્યોની વિગતો સુધારવા માટે એડમિન સહાય સુવિધા.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="નામ, શહેર અથવા મોબાઈલ શોધો..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-ivory-300 rounded-xl bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Members Management Table */}
      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">ફોટો & નામ</th>
              <th className="py-3 px-4 font-bold">વતન & શહેર</th>
              <th className="py-3 px-4 font-bold">મોબાઇલ</th>
              <th className="py-3 px-4 font-bold">ભૂમિકા / હોદ્દો</th>
              <th className="py-3 px-4 font-bold">આજીવન સભ્ય</th>
              <th className="py-3 px-4 font-bold text-right">કાર્યવાહી</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-ivory-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      className="w-9 h-9 rounded-xl object-cover border border-ivory-300"
                    />
                    <span className="font-bold text-charcoal-900">{m.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">
                  <span className="font-medium">{m.native_place}</span>
                  <span className="text-charcoal-400 block text-[11px]">{m.city}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-charcoal-800">{m.phone}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-block text-[11px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full">
                    {m.committee_role || (m.role === "member" ? "સભ્ય" : m.role)}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {m.is_lifetime_member ? (
                    <span className="text-emerald-700 font-bold text-[11px]">✓ હા</span>
                  ) : (
                    <span className="text-charcoal-400 text-[11px]">ના</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    onClick={() => setEditingMember(m)}
                    className="p-1.5 text-saffron-700 hover:bg-saffron-50 rounded-lg transition-colors"
                    title="વિગતો સુધારો"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`શું તમે ${m.name} નું ખાતું દૂર કરવા માંગો છો?`)) {
                        deleteMember(m.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ખાતું કાઢી નાખો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-charcoal-900 pb-3 border-b border-ivory-200">
              સભ્ય વિગતો સુધારો (Admin Assistance)
            </h3>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">પૂરું નામ</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">મોબાઇલ નંબર</label>
                  <input
                    type="tel"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">શહેર</label>
                  <input
                    type="text"
                    value={editingMember.city}
                    onChange={(e) => setEditingMember({ ...editingMember, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">હોદ્દો / ભૂમિકા</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as AdminRole })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="member">સામાન્ય સભ્ય</option>
                    <option value="president">પ્રમુખ</option>
                    <option value="secretary">મંત્રી</option>
                    <option value="joint_secretary">સહમંત્રી</option>
                    <option value="treasurer">ખજાનચી</option>
                    <option value="admin">એડમિન</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">આજીવન સભ્યપદ</label>
                  <select
                    value={editingMember.is_lifetime_member ? "true" : "false"}
                    onChange={(e) => setEditingMember({ ...editingMember, is_lifetime_member: e.target.value === "true" })}
                    className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="false">ના (સામાન્ય)</option>
                    <option value="true">હા (આજીવન સભ્ય)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-charcoal-700 mb-1">કમિટી હોદ્દો લેબલ</label>
                <input
                  type="text"
                  value={editingMember.committee_role || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, committee_role: e.target.value })}
                  placeholder="દા.ત. પ્રમુખ શ્રી, ટ્રસ્ટી શ્રી"
                  className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-ivory-300 text-charcoal-700 rounded-xl font-semibold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold shadow-sm"
                >
                  સુધારો સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
