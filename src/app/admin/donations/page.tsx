"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  CheckCircle,
  FileCheck,
  CreditCard,
  Lock,
  Plus,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminDonationsPage() {
  const { donations, verifyDonation, addLog } = useData();
  const { currentUser } = useAuth();

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalVerified = donations
    .filter((d) => d.payment_status === "verified")
    .reduce((sum, d) => sum + d.amount, 0);

  const handleVerify = (id: string, receiptNo: string, amount: number) => {
    verifyDonation(id);
    addLog(
      "દાન પાવતી ચકાસણી & પુષ્ટિ",
      `પાવતી નં. ${receiptNo}`,
      `રકમ ₹${amount} બેંક જમા થયાની ખજાનચી તરીકે ખરાઈ કરી.`,
      currentUser?.name || "ખજાનચી",
      currentUser?.role || "treasurer"
    );
    setSuccessToast("દાન ચુકવણી સફળતાપૂર્વક ચકાસાયેલ તરીકે નોંધાઈ!");
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
            <Heart className="w-6 h-6 text-emerald-700" />
            <span>દાન સંચાલન & ખજાનચી હિસાબ (Treasurer / Donations)</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            પાવતી નંબર, બેંક જમા ચકાસણી, ઓડિટ રેકોર્ડ અને દાતા ગોપનીયતા રક્ષણ.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-forest-50 border border-forest-200 text-right">
          <span className="text-[11px] text-forest-700 font-bold block">કુલ જમા ભંડોળ:</span>
          <span className="text-xl font-extrabold text-forest-900">
            ₹{totalVerified.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card p-6 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-600">
              <th className="py-3 px-4 font-bold">પાવતી નં.</th>
              <th className="py-3 px-4 font-bold">દાતાનું નામ</th>
              <th className="py-3 px-4 font-bold">રકમ</th>
              <th className="py-3 px-4 font-bold">હેતુ & પ્રોજેક્ટ</th>
              <th className="py-3 px-4 font-bold">ગોપનીયતા સંમતિ</th>
              <th className="py-3 px-4 font-bold">સ્થિતિ</th>
              <th className="py-3 px-4 font-bold text-right">કાર્યવાહી</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {donations.map((d) => (
              <tr key={d.id} className="hover:bg-ivory-50/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-charcoal-800">
                  {d.receipt_number}
                </td>
                <td className="py-3.5 px-4 font-bold text-charcoal-900">
                  {d.donor_name}
                  {d.is_anonymous && (
                    <span className="text-[10px] text-amber-700 block font-normal">
                      (સાર્વજનિક રૂપે ગુપ્ત)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-extrabold text-saffron-800 text-sm">
                  ₹{d.amount.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-charcoal-700">
                  <span className="font-semibold block">{d.purpose}</span>
                  <span className="text-[11px] text-charcoal-400">{d.campaign}</span>
                </td>
                <td className="py-3.5 px-4">
                  {d.public_consent && !d.is_anonymous ? (
                    <span className="text-emerald-700 font-bold text-[11px]">✓ જાહેર માન્ય</span>
                  ) : (
                    <span className="text-charcoal-400 italic text-[11px]">ખાનગી / અપ્રકાશિત</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      d.payment_status === "verified"
                        ? "bg-forest-100 text-forest-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {d.payment_status === "verified" ? "ચકાસાયેલ" : "પેન્ડિંગ"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {d.payment_status !== "verified" ? (
                    <button
                      onClick={() => handleVerify(d.id, d.receipt_number, d.amount)}
                      className="px-2.5 py-1 bg-forest-800 text-white font-bold rounded-lg text-[11px] hover:bg-forest-900"
                    >
                      ચકાસણી પૂર્ણ કરો
                    </button>
                  ) : (
                    <span className="text-[11px] text-forest-700 font-bold">ઓડિટ પૂર્ણ ✓</span>
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
