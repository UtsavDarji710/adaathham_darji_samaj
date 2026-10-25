"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Lock,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function CommitteePage() {
  const { committee, members } = useData();
  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"committee" | "lifetime">("committee");

  // Filter lifetime members from members list or committee
  const lifetimeMembers = members.filter((m) => m.is_lifetime_member);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest-100 text-forest-800">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              સમાજ સમિતિ & આજીવન સભ્યો
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસાના વરિષ્ઠ હોદ્દેદારો અને આજીવન દાતા સભ્યો.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin/committee"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors w-max"
          >
            <span>સમિતિ સંચાલન (Admin)</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ivory-300 space-x-2">
        <button
          onClick={() => setActiveTab("committee")}
          className={`py-3 px-5 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "committee"
              ? "border-saffron-600 text-saffron-700 bg-saffron-50/50 rounded-t-xl"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>કારોબારી સમિતિ હોદ્દેદારો ({committee.length})</span>
        </button>

        <button
          id="lifetime"
          onClick={() => setActiveTab("lifetime")}
          className={`py-3 px-5 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "lifetime"
              ? "border-saffron-600 text-saffron-700 bg-saffron-50/50 rounded-t-xl"
              : "border-transparent text-charcoal-600 hover:text-charcoal-900"
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>આજીવન સભ્યો (Lifetime Members) ({lifetimeMembers.length})</span>
        </button>
      </div>

      {/* TAB 1: COMMITTEE MEMBERS DIRECTORY */}
      {activeTab === "committee" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {committee.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-ivory-300 group-hover:border-saffron-400 transition-colors shadow-xs"
                    />
                    {member.is_lifetime_member && (
                      <span
                        className="absolute -bottom-1 -right-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs"
                        title="આજીવન સભ્ય"
                      >
                        ★
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold bg-saffron-100 text-saffron-800 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      {member.designation}
                    </span>
                    <h3 className="font-bold text-base text-charcoal-900 group-hover:text-saffron-700 transition-colors">
                      {member.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-ivory-200 text-xs text-charcoal-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                    <span>ગામ / શહેર: <strong>{member.city}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    <span>મુદત / કાર્યકાળ: {member.term}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs">
                {currentUser || isAdmin ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center gap-1.5 font-bold text-forest-800 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{member.phone}</span>
                  </a>
                ) : (
                  <span className="text-charcoal-400 italic flex items-center gap-1 text-[11px]">
                    <Lock className="w-3 h-3" /> ફોન લોગિન પછી દેખાશે
                  </span>
                )}

                {currentUser ? (
                  <Link
                    href="/family-tree"
                    className="font-bold text-saffron-700 hover:underline text-xs"
                  >
                    પરિવાર વૃક્ષ →
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-charcoal-400">અડાઆઠમ દરજી સમાજ</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIFETIME MEMBERS */}
      {activeTab === "lifetime" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">આજીવન સભ્યપદ સન્માન</h4>
              <p className="mt-0.5">
                શ્રી અડાઆઠમ દરજી સેવા સમિતિના કાયમી ભંડોળમાં યોગદાન આપી આજીવન સભ્યપદ ધારણ કરનાર વંદનીય સમાજજનો.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lifetimeMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card hover:shadow-hover transition-all flex items-center gap-4"
              >
                <div className="relative">
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
                  />
                  <span className="absolute -top-1 -left-1 bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ★
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-1">
                    આજીવન સભ્ય
                  </span>
                  <h3 className="font-bold text-sm text-charcoal-900 truncate">
                    {m.name}
                  </h3>
                  <p className="text-xs text-charcoal-500 truncate mt-0.5">
                    વતન: {m.native_place} • હાલ: {m.city}
                  </p>
                  <p className="text-[11px] text-forest-800 font-semibold mt-1">
                    {m.employment?.company || "સમાજ સભ્ય"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
