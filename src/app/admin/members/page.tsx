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
  ExternalLink,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  UserPlus,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Member, AdminRole, SAMITI_NATIVE_PLACES, SAMITI_EDUCATION_CATEGORIES } from "@/types";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import { UserAvatar } from "@/components/UserAvatar";

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
      (m.native_place || "").toLowerCase().includes(search.toLowerCase()) ||
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
    setSuccessToast("સભ્યની તમામ વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ!");
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>એડમિન ડેશબોર્ડ પર પાછા જાઓ</span>
        </Link>

        {/* Add Member Button (Admin Add Member Flow) */}
        <Link
          href="/profile?action=new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-saffron-600 to-amber-600 hover:from-saffron-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ સભ્ય ઉમેરો (Add Member)</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-saffron-600" />
            <span>સભ્ય સંચાલન & પ્રોફાઇલ સહાય (Member Management)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            કારોબારી હોદ્દેદારો કોઈપણ સભ્યની તમામ વિગતો જોઈ અને સંપૂર્ણપણે સંપાદિત કરી શકે છે.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="નામ, ગામ, શહેર અથવા મોબાઈલ શોધો..."
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
              <th className="py-3 px-4 font-bold">મોબાઇલ / ઇમેઇલ</th>
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
                    <UserAvatar
                      src={m.photo_url}
                      alt={m.name}
                      className="w-9 h-9 rounded-xl border border-ivory-300"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-charcoal-900">{m.name}</span>
                        {m.dod && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-1.5 py-0.5 rounded">
                            સ્વર્ગસ્થ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-charcoal-400 block">
                        {m.marital_status || "લગ્ન સ્થિતિ નથી"} {m.jati ? `• ${m.jati}` : ""}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">
                  <span className="font-medium text-charcoal-900">{m.native_place}</span>
                  <span className="text-charcoal-400 block text-[11px]">{m.city}</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-charcoal-800">
                  <span className="block font-bold">{m.phone}</span>
                  <span className="text-[10px] text-charcoal-500 font-sans">{m.email || "ઇમેઇલ નથી"}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-block text-[11px] font-bold bg-saffron-100 text-saffron-800 px-2 py-0.5 rounded-full">
                    {m.committee_role ||
                      (m.role === "president"
                        ? "પ્રમુખ શ્રી"
                        : m.role === "secretary"
                        ? "મંત્રી શ્રી"
                        : m.role === "joint_secretary"
                        ? "સહમંત્રી શ્રી"
                        : m.role === "treasurer"
                        ? "ખજાનચી શ્રી"
                        : m.role === "assistant_treasurer"
                        ? "સહ ખજાનચી શ્રી"
                        : m.role === "admin"
                        ? "એડમિન"
                        : "સામાન્ય સભ્ય")}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {m.is_lifetime_member ? (
                    <span className="text-emerald-700 font-bold text-[11px]">✓ હા</span>
                  ) : (
                    <span className="text-charcoal-400 text-[11px]">ના</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                  {/* Edit User via Full Profile Flow (Admin Edit Flow) */}
                  <Link
                    href={`/profile?memberId=${m.id}`}
                    className="p-1.5 text-saffron-700 hover:bg-saffron-50 rounded-lg transition-colors inline-block align-middle cursor-pointer"
                    title="સંપૂર્ણ પ્રોફાઇલ ખોલો અને સુધારો (Full Profile Edit Flow)"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  {/* View Details */}
                  <Link
                    href={`/profile?memberId=${m.id}`}
                    className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors inline-block align-middle cursor-pointer"
                    title="પ્રોફાઇલ જુઓ"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`શું તમે ${m.name} નું ખાતું દૂર કરવા માંગો છો?`)) {
                        deleteMember(m.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block align-middle"
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

      {/* Comprehensive Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-ivory-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-charcoal-900">
                  સભ્ય સંપૂર્ણ વિગતો સુધારો (Admin Full Edit Access)
                </h3>
                <p className="text-xs text-charcoal-500">
                  હાલ સંપાદિત થઈ રહેલ સભ્ય: <strong className="text-charcoal-900">{editingMember.name}</strong> ({editingMember.id})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/profile?memberId=${editingMember.id}`}
                  className="px-3 py-1.5 text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>સંપૂર્ણ પ્રોફાઇલ પેજમાં ખોલો</span>
                </Link>

                <button
                  onClick={() => setEditingMember(null)}
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6 text-xs">
              {/* વિભાગ ૧: સામાન્ય & વ્યક્તિગત માહિતી */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-saffron-800 pb-1 border-b border-saffron-200">
                  ૧. સામાન્ય & વ્યક્તિગત માહિતી
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">પૂરું નામ *</label>
                    <input
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">મોબાઇલ નંબર *</label>
                    <input
                      type="tel"
                      value={editingMember.phone}
                      onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">ઈમેલ એડ્રેસ</label>
                    <input
                      type="email"
                      value={editingMember.email || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      placeholder="દા.ત. member@gmail.com"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:border-saffron-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">લિંગ (Gender)</label>
                    <select
                      value={editingMember.gender}
                      onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="male">પુરુષ (Male)</option>
                      <option value="female">સ્ત્રી (Female)</option>
                      <option value="other">અન્ય</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">જાતિ (Jati / Caste)</label>
                    <input
                      type="text"
                      value={editingMember.jati || "અડાઆઠમ દરજી"}
                      onChange={(e) => setEditingMember({ ...editingMember, jati: e.target.value })}
                      placeholder="દા.ત. અડાઆઠમ દરજી / દરજી"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">જન્મ તારીખ (DOB)</label>
                    <input
                      type="date"
                      value={editingMember.dob || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">અવસાન તારીખ (DOD - જો સ્વર્ગસ્થ હોય)</label>
                    <input
                      type="date"
                      value={editingMember.dod || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, dod: e.target.value, is_deceased: !!e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">બ્લડ ગ્રુપ</label>
                    <select
                      value={editingMember.blood_group || "B+"}
                      onChange={(e) => setEditingMember({ ...editingMember, blood_group: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">વૈવાહિક સ્થિતિ (Marital Status)</label>
                    <select
                      value={editingMember.marital_status || "પરણિત (Married)"}
                      onChange={(e) => setEditingMember({ ...editingMember, marital_status: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="અપરણિત (Unmarried)">અપરણિત (Unmarried)</option>
                      <option value="પરણિત (Married)">પરણિત (Married)</option>
                      <option value="સગાઈ થયેલ (Engaged)">સગાઈ થયેલ (Engaged)</option>
                      <option value="વિધુર / વિધવા (Widowed)">વિધુર / વિધવા (Widowed)</option>
                      <option value="છૂટાછેડા (Divorced)">છૂટાછેડા (Divorced)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-charcoal-700 mb-1">
                      સભ્ય પ્રોફાઇલ ફોટો (Crop &amp; Upload)
                    </label>
                    <ImageUploadWithCrop
                      currentImageUrl={editingMember.photo_url || undefined}
                      onImageCropped={(url) => setEditingMember({ ...editingMember, photo_url: url })}
                      aspectRatio={1}
                      aspectRatioLabel="૧:૧ (અવતાર)"
                      circleOverlay={true}
                      category="member-photos"
                      label="પ્રોફાઇલ ફોટો અપલોડ &amp; ક્રોપ કરો"
                      helperText="ડ્રેગ &amp; ડ્રોપ અથવા ડિવાઇસમાંથી પસંદ કરો"
                    />
                  </div>
                </div>
              </div>

              {/* વિભાગ ૨: મૂળ વતન & સરનામું */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-forest-800 pb-1 border-b border-forest-200">
                  ૨. મૂળ વતન & સરનામું
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">મૂળ વતન (૩૬ ગામો) *</label>
                    <select
                      value={editingMember.native_place || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, native_place: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:border-forest-500 focus:outline-none font-bold"
                    >
                      {SAMITI_NATIVE_PLACES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">હાલનું શહેર *</label>
                    <input
                      type="text"
                      value={editingMember.city}
                      onChange={(e) => setEditingMember({ ...editingMember, city: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">પિનકોડ</label>
                    <input
                      type="text"
                      value={editingMember.pincode || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-bold text-charcoal-700 mb-1">પૂરું સરનામું</label>
                    <input
                      type="text"
                      value={editingMember.address || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                      placeholder="ઘર/ફ્લેટ નં, સોસાયટી, રોડ, વિસ્તાર"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* વિભાગ ૩: મોસાળ, સાસરી & વંશાવલી */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 pb-1 border-b border-amber-200">
                  ૩. મોસાળ, સાસરી & વંશાવલી
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">સાસરીનું નામ (Sasri Name)</label>
                    <input
                      type="text"
                      value={editingMember.sasri_name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, sasri_name: e.target.value })}
                      placeholder="દા.ત. મોડાસા, હિંમતનગર"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">પિયરનું નામ (Piyar Name)</label>
                    <input
                      type="text"
                      value={editingMember.piyar_name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, piyar_name: e.target.value })}
                      placeholder="દા.ત. અડાઆઠમ, ધનસુરા"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">પિતાનું નામ</label>
                    <input
                      type="text"
                      value={editingMember.father_name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, father_name: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">દાદાનું નામ</label>
                    <input
                      type="text"
                      value={editingMember.grandfather_name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, grandfather_name: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">મામાનું નામ (મોસાળ)</label>
                    <input
                      type="text"
                      value={editingMember.maternal_uncle_name || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, maternal_uncle_name: e.target.value })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* વિભાગ ૪: શિક્ષણ & વ્યવસાય */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-sky-800 pb-1 border-b border-sky-200">
                  ૪. શિક્ષણ & વ્યવસાય
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">શિક્ષણ કેટેગરી</label>
                    <select
                      value={editingMember.education?.education_category || "સ્નાતક (Graduate)"}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          education: {
                            ...(editingMember.education || {
                              highest_degree: "",
                              institution: "",
                              field_of_study: "",
                              passing_year: "",
                            }),
                            education_category: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      {SAMITI_EDUCATION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">શું અભ્યાસ કર્યો છે? (ડીગ્રી)</label>
                    <input
                      type="text"
                      value={editingMember.education?.education_details || editingMember.education?.highest_degree || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          education: {
                            ...(editingMember.education || {
                              highest_degree: "",
                              institution: "",
                              field_of_study: "",
                              passing_year: "",
                            }),
                            education_details: e.target.value,
                            highest_degree: e.target.value,
                          },
                        })
                      }
                      placeholder="દા.ત. B.Com, MBA, ITI"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">વ્યવસાય / કંપનીનું નામ</label>
                    <input
                      type="text"
                      value={editingMember.business?.business_name || editingMember.employment?.company || ""}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          business: {
                            ...(editingMember.business || {
                              business_name: "",
                              business_type: "",
                              address: "",
                              city: "",
                            }),
                            business_name: e.target.value,
                          },
                        })
                      }
                      placeholder="દા.ત. અંબિકા ટેલર્સ"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* વિભાગ ૫: સમાજ ભૂમિકા & મેટ્રિમોની */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 pb-1 border-b border-rose-200">
                  ૫. સમાજ વહીવટી ભૂમિકા & મેટ્રિમોની
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">હોદ્દો / ભૂમિકા</label>
                    <select
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value as AdminRole })}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none font-bold"
                    >
                      <option value="member">સામાન્ય સભ્ય</option>
                      <option value="president">પ્રમુખ શ્રી</option>
                      <option value="secretary">મંત્રી શ્રી</option>
                      <option value="joint_secretary">સહમંત્રી શ્રી</option>
                      <option value="treasurer">ખજાનચી શ્રી</option>
                      <option value="assistant_treasurer">સહ ખજાનચી શ્રી</option>
                      <option value="admin">એડમિન</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">કમિટી હોદ્દો લેબલ</label>
                    <input
                      type="text"
                      value={editingMember.committee_role || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, committee_role: e.target.value })}
                      placeholder="દા.ત. પ્રમુખ શ્રી, મંત્રી શ્રી"
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl focus:outline-none"
                    />
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

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">મેટ્રિમોનીમાં ઉપલબ્ધ?</label>
                    <select
                      value={editingMember.is_available_for_matrimony ? "true" : "false"}
                      onChange={(e) => {
                        const val = e.target.value === "true";
                        setEditingMember({
                          ...editingMember,
                          is_available_for_matrimony: val,
                          matrimony: {
                            ...(editingMember.matrimony || {
                              is_available: val,
                              privacy: {
                                show_photo: true,
                                show_name: true,
                                show_age: true,
                                show_native_place: true,
                                show_education: true,
                                show_occupation: true,
                                show_contact: true,
                              },
                            }),
                            is_available: val,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="false">ના (No)</option>
                      <option value="true">હા (Yes - ઉપલબ્ધ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-charcoal-700 mb-1">પબ્લિક લિસ્ટિંગમાં બતાવવું છે?</label>
                    <select
                      value={editingMember.matrimony?.is_public_listing ? "true" : "false"}
                      onChange={(e) => {
                        const val = e.target.value === "true";
                        setEditingMember({
                          ...editingMember,
                          matrimony: {
                            ...(editingMember.matrimony || {
                              is_available: true,
                              privacy: {
                                show_photo: true,
                                show_name: true,
                                show_age: true,
                                show_native_place: true,
                                show_education: true,
                                show_occupation: true,
                                show_contact: true,
                              },
                            }),
                            is_public_listing: val,
                            is_saved: true,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 border border-ivory-300 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="false">ના (Private Only)</option>
                      <option value="true">હા (Public Visible)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="w-full sm:w-auto px-5 py-2.5 border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 rounded-xl font-bold"
                >
                  રદ કરો
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>તમામ સુધારાઓ સાચવો (Save All Changes)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
