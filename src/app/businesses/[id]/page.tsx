"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sparkles,
  ArrowLeft,
  Users,
  Calendar,
  Share2,
} from "lucide-react";
import { useData } from "@/context/DataContext";

export default function BusinessDetailPage() {
  const { id } = useParams();
  const { businesses } = useData();

  const business = businesses.find((b) => b.id === id) || businesses[0];

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal-900">વ્યવસાય મળ્યો નથી.</h2>
        <Link
          href="/businesses"
          className="mt-4 inline-block px-5 py-2 bg-saffron-600 text-white rounded-xl text-xs font-bold"
        >
          ડિરેક્ટરી પર પાછા જાઓ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/businesses"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>બધા વ્યવસાયો પર પાછા જાઓ</span>
      </Link>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card overflow-hidden">
        {/* Cover Photo */}
        <div className="relative aspect-[21/9] bg-ivory-200">
          <img
            src={business.cover_url || "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200"}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          {business.is_featured && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-saffron-600 to-saffron-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ફીચર્ડ બિઝનેસ
            </span>
          )}
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
            <div>
              <span className="text-xs font-bold bg-saffron-100 text-saffron-800 px-3 py-1 rounded-full inline-block mb-2">
                {business.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                {business.name}
              </h1>
              <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-saffron-600" />
                <span>માલિક / સંચાલક: <strong>{business.owner_name}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${business.phone}`}
                className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>સંપર્ક કરો</span>
              </a>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-sm text-charcoal-900 mb-2">વ્યવસાય પરિચય & સેવાઓ</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed whitespace-pre-line">
              {business.description}
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ivory-200 text-xs">
            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
              <span className="text-charcoal-500 font-semibold block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                સ્થળ & સરનામું:
              </span>
              <p className="font-bold text-charcoal-900">{business.address}, {business.city}</p>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
              <span className="text-charcoal-500 font-semibold block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-saffron-600" />
                ફોન નંબર:
              </span>
              <p className="font-bold text-forest-800">{business.phone}</p>
            </div>

            {business.email && (
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
                <span className="text-charcoal-500 font-semibold block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-saffron-600" />
                  ઇમેઇલ:
                </span>
                <p className="font-bold text-charcoal-900">{business.email}</p>
              </div>
            )}

            {business.website && (
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
                <span className="text-charcoal-500 font-semibold block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-saffron-600" />
                  વેબસાઇટ:
                </span>
                <a
                  href={business.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-saffron-700 hover:underline"
                >
                  {business.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
