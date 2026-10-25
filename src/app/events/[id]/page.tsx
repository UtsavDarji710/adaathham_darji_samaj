"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Users,
} from "lucide-react";
import { useData } from "@/context/DataContext";

export default function EventDetailPage() {
  const { id } = useParams();
  const { events } = useData();

  const event = events.find((e) => e.id === id) || events[0];

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal-900">કાર્યક્રમ મળ્યો નથી.</h2>
        <Link
          href="/events"
          className="mt-4 inline-block px-5 py-2 bg-saffron-600 text-white rounded-xl text-xs font-bold"
        >
          કાર્યક્રમોની યાદી પર જાઓ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700 hover:text-saffron-800 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>બધા કાર્યક્રમો પર પાછા જાઓ</span>
      </Link>

      <div className="bg-white rounded-3xl border border-ivory-300 shadow-card overflow-hidden">
        {/* Cover Image */}
        <div className="relative aspect-[21/9] bg-ivory-200">
          <img
            src={event.cover_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white/95 text-saffron-800 font-bold text-xs px-3 py-1 rounded-xl shadow-xs">
            {event.date}
          </div>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-bold bg-forest-100 text-forest-800 px-3 py-1 rounded-full inline-block mb-3">
              આયોજક: {event.organizer}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-charcoal-600">
              <span className="flex items-center gap-1.5 font-semibold">
                <Calendar className="w-4 h-4 text-saffron-600" />
                {event.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-forest-700" />
                {event.time}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-saffron-600" />
                {event.location}, {event.city}
              </span>
            </div>
          </div>

          <div className="border-t border-ivory-200 pt-6">
            <h3 className="font-bold text-sm text-charcoal-900 mb-2">કાર્યક્રમ પરિચય & રૂપરેખા</h3>
            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Video link */}
          {event.video_url && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-red-900">કાર્યક્રમ વિડિયો પ્રસારણ</h4>
                  <p className="text-[11px] text-red-700">લાઈવ રેકોર્ડિંગ અથવા હાઇલાઇટ્સ વિડિયો જુઓ.</p>
                </div>
              </div>
              <a
                href={event.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <span>વિડિયો જુઓ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Photo Gallery Grid */}
          {event.gallery.length > 0 && (
            <div className="border-t border-ivory-200 pt-6">
              <h3 className="font-bold text-sm text-charcoal-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-saffron-600" />
                <span>કાર્યક્રમ ફોટો ગેલેરી ({event.gallery.length} તસવીરો)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {event.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-ivory-300 shadow-xs group"
                  >
                    <img
                      src={img}
                      alt={`ફોટો ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
