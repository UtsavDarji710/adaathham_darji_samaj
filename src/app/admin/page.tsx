"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  GitFork,
  Briefcase,
  Megaphone,
  Calendar,
  Heart,
  Award,
  Clock,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3,
  UserCheck,
  Settings,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { AdminRole } from "@/types";

export default function AdminDashboardPage() {
  const {
    members,
    relationships,
    businesses,
    events,
    donations,
    announcements,
    committee,
    logs,
    resetDemoData,
  } = useData();
  const { currentUser, loginAs, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  // Filter pending approvals
  const pendingRelationships = relationships.filter((r) => r.status === "pending");
  const pendingBusinesses = businesses.filter((b) => b.status === "pending");
  const pendingDonations = donations.filter((d) => d.payment_status === "pending");

  const totalFunds = donations
    .filter((d) => d.payment_status === "verified")
    .reduce((sum, d) => sum + d.amount, 0);

  // Chart data: Donations by purpose
  const donationChartData = [
    { name: "ભવન ફંડ", value: 51000 },
    { name: "શિક્ષણ સહાય", value: 25000 },
    { name: "આરોગ્ય સહાય", value: 21000 },
    { name: "આજીવન સભ્યપદ", value: 31000 },
    { name: "ધાર્મિક ઉત્સવ", value: 11000 },
  ];

  const cityChartData = [
    { name: "મોડાસા", count: members.filter((m) => m.city.includes("મોડાસા")).length },
    { name: "અડાઆઠમ", count: members.filter((m) => m.city.includes("અડાઆઠમ")).length },
    { name: "અમદાવાદ", count: members.filter((m) => m.city.includes("અમદાવાદ")).length },
    { name: "ગાંધીનગર", count: 1 },
    { name: "ધનસુરા", count: 1 },
  ];

  const COLORS = ["#c2410c", "#166534", "#d97706", "#2563eb", "#7c3aed"];

  const adminRolesList: { role: AdminRole; label: string; name: string; desc: string }[] = [
    { role: "president", label: "પ્રમુખ", name: "દિનેશભાઈ બાબુલાલ દરજી", desc: "સર્વોચ્ચ સંચાલન, પરિવાર સંબંધ અને નીતિગત મંજૂરી" },
    { role: "secretary", label: "મંત્રી", name: "મહેન્દ્રભાઈ કાનજીભાઈ દરજી", desc: "સભ્યો, સૂચનાઓ, પરિપત્રો અને કાર્યક્રમો" },
    { role: "joint_secretary", label: "સહમંત્રી", name: "હસમુખભાઈ રણછોડભાઈ દરજી", desc: "સહાયક વ્યવસ્થા અને દસ્તાવેજ સંચાલન" },
    { role: "treasurer", label: "ખજાનચી", name: "રમેશભાઈ મગનલાલ દરજી", desc: "દાન, બેંક ખાતા, પાવતી અને નાણાકીય હિસાબ" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-forest-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-charcoal-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-forest-800/80 text-emerald-300 font-bold px-3 py-1 rounded-full text-xs border border-forest-600 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            સત્તાવાર એડમિન પોર્ટલ
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            અડાઆઠમ દરજી સમાજ — મુખ્ય વહીવટી ડેશબોર્ડ
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-300 mt-1">
            હાલ સક્રિય હોદ્દેદાર: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.committee_role || "એડમિન"})
          </p>
        </div>

        {/* Quick Role Switcher */}
        <div className="bg-charcoal-800/90 rounded-2xl p-3 border border-charcoal-700 flex flex-col gap-1 text-xs">
          <span className="text-[11px] text-charcoal-400 font-bold">હોદ્દેદાર ભૂમિકા બદલો:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {adminRolesList.map((item) => (
              <button
                key={item.role}
                onClick={() => loginAs(item.role)}
                className={`px-3 py-1.5 rounded-lg text-left transition-colors font-bold ${
                  currentUser?.role === item.role
                    ? "bg-saffron-600 text-white shadow-xs"
                    : "bg-charcoal-700/60 hover:bg-charcoal-700 text-charcoal-200"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-saffron-100 text-saffron-800 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 block">કુલ સભ્યો</span>
            <span className="text-2xl font-extrabold text-charcoal-900">{members.length}</span>
            <span className="text-[10px] text-forest-700 font-bold block mt-0.5">૧૦૦% ચકાસાયેલા</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 block">માન્ય પારિવારિક સંબંધો</span>
            <span className="text-2xl font-extrabold text-charcoal-900">
              {relationships.filter((r) => r.status === "approved").length}
            </span>
            <span className="text-[10px] text-saffron-700 font-bold block mt-0.5">
              {pendingRelationships.length} મંજૂરી માટે પેન્ડિંગ
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 block">સમાજના વ્યવસાયો</span>
            <span className="text-2xl font-extrabold text-charcoal-900">{businesses.length}</span>
            <span className="text-[10px] text-charcoal-500 font-semibold block mt-0.5">
              {businesses.filter((b) => b.is_featured).length} ફીચર્ડ જાહેરાતો
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-ivory-300 p-5 shadow-card flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charcoal-500 block">કુલ જમા દાન ભંડોળ</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-800">
              ₹{totalFunds.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-forest-800 font-bold block mt-0.5">
              {donations.length} ચકાસાયેલ પાવતીઓ
            </span>
          </div>
        </div>
      </div>

      {/* Admin Modules Navigation Grid */}
      <div>
        <h2 className="text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-saffron-700" />
          <span>વહીવટી મોડ્યુલ્સ (Admin Modules)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Members Management */}
          <Link
            href="/admin/members"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-saffron-100 text-saffron-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-saffron-700 transition-colors">
                સભ્ય સંચાલન (Members Management)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                નવા સભ્યોની મંજૂરી, વિગતો સુધારણા સહાય, અને ભૂમિકા ફાળવણી.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-saffron-700">
              <span>{members.length} સભ્યો નોંધાયેલા</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: Family Relationships */}
          <Link
            href="/admin/families"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-forest-800 transition-colors">
                પરિવાર સંબંધ મંજૂરી (Family Workflow)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                પરિવાર વૃક્ષમાં વિનંતી કરાયેલ સંબંધોની ખરાઈ, મંજૂરી અને સુધારણા.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-forest-800">
              <span>{pendingRelationships.length} વિનંતીઓ પેન્ડિંગ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Advertisements & Sponsored */}
          <Link
            href="/admin/advertisements"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-amber-800 transition-colors">
                જાહેરાતો & સ્પોન્સરશિપ (Ads Management)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                પેઇડ એડવર્ટાઇઝમેન્ટની ચુકવણી ચકાસણી, પ્રમોશન અવધિ અને સ્ટેટસ.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-amber-800">
              <span>{businesses.length} વ્યવસાયો</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Events & Media */}
          <Link
            href="/admin/events"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-sky-800 transition-colors">
                કાર્યક્રમો & ફોટો ગેલેરી (Events & Media)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                વાર્ષિક સ્નેહમિલન, કેમ્પ અને ઉત્સવોનું આયોજન તથા આલ્બમ અપલોડ.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-sky-800">
              <span>{events.length} કાર્યક્રમો</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 5: Donations & Accounts */}
          <Link
            href="/admin/donations"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-emerald-800 transition-colors">
                દાન & પાવતી હિસાબ (Treasurer / Donations)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                ખજાનચી સંચાલન, પાવતી જનરેશન, બેંક જમા ચકાસણી અને દાન યાદી.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>₹{totalFunds.toLocaleString("en-IN")} જમા</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 6: Committee & Lifetime */}
          <Link
            href="/admin/committee"
            className="bg-white rounded-3xl border border-ivory-300 p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-charcoal-900 group-hover:text-purple-800 transition-colors">
                સમિતિ & આજીવન સભ્યો (Committee Setup)
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                પ્રમુખ, મંત્રી, ખજાનચી અને ટ્રસ્ટી મંડળના હોદ્દેદારોનું સંચાલન.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-ivory-200 flex items-center justify-between text-xs font-bold text-purple-800">
              <span>{committee.length} હોદ્દેદારો</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donation by Project Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-ivory-300 p-6 shadow-card">
          <h3 className="font-bold text-sm text-charcoal-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-saffron-600" />
            <span>પ્રોજેક્ટ અનુસાર દાન ભંડોળ (Donations by Campaign)</span>
          </h3>
          <p className="text-xs text-charcoal-500 mb-6">સમાજના વિવિધ ભંડોળમાં આવેલ દાનની વિગત.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`} />
                <Bar dataKey="value" fill="#c2410c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member City Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-ivory-300 p-6 shadow-card">
          <h3 className="font-bold text-sm text-charcoal-900 mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-forest-700" />
            <span>શહેરો અનુસાર સભ્યો (Members by City)</span>
          </h3>
          <p className="text-xs text-charcoal-500 mb-4">મોડાસા, અડાઆઠમ, અમદાવાદ વગેરેમાં વસતા પરિવારો.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="count"
                  label={({ name, value }: any) => `${name} (${value})`}
                  labelLine={false}
                >
                  {cityChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Trail & Activity Logs */}
      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-saffron-600" />
              <span>એડમિન પ્રવૃત્તિ નોંધ (Security & Access Audit Trail)</span>
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              સુરક્ષા અને પારદર્શિતા હેતુ દરેક મહત્વપૂર્ણ વહીવટી ફેરફારનું ઓડિટ લોગ.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm("શું તમે ડેમો ડેટા રીસેટ કરવા માંગો છો?")) {
                resetDemoData();
              }
            }}
            className="px-3 py-1.5 border border-ivory-300 hover:bg-ivory-100 rounded-xl text-xs font-semibold text-charcoal-600"
          >
            ડેમો ડેટા રીસેટ કરો
          </button>
        </div>

        <div className="divide-y divide-ivory-200">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-charcoal-900">{log.action}: </span>
                <span className="text-charcoal-700 font-medium">{log.target}</span>
                <p className="text-[11px] text-charcoal-500 mt-0.5">{log.details}</p>
              </div>

              <div className="text-right sm:flex-shrink-0">
                <span className="font-bold text-forest-800 text-[11px] block">
                  {log.admin_name} ({log.admin_role})
                </span>
                <span className="text-[10px] text-charcoal-400 font-mono">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
