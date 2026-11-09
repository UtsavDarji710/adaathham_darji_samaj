"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-ivory-100 border-t-4 border-saffron-600">
      {/* Upper Footer with Community Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Col 1: About Society */}
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="અડાઆઠમ દરજી સેવા સમિતિ"
                width={48}
                height={48}
                style={{ width: "48px", height: "48px", minWidth: "48px" }}
                className="w-12 h-12 object-contain rounded-full shadow-md"
              />
              <div>
                <h3 className="font-bold text-lg text-white leading-tight">
                  અડાઆઠમ દરજી સેવા સમિતિ
                </h3>
                <p className="text-xs text-saffron-300">શ્રી અડાઆઠમ દરજી સેવા સમિતિ</p>
              </div>
            </div>

            <p className="text-xs text-charcoal-400 leading-relaxed">
              “આપણો સમાજ, આપણો પરિવાર” — સમાજના દરેક પરિવારને ડિજિટલ માધ્યમથી જોડવું, પરસ્પર સહકાર વધારવો, તેજસ્વી વિદ્યાર્થીઓ અને વ્યવસાયોને પ્રોત્સાહન આપવું એ આપણો મુખ્ય સંકલ્પ છે.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold bg-saffron-950/80 text-saffron-300 px-3 py-1.5 rounded-lg border border-saffron-800/60">
                <Heart className="w-3.5 h-3.5 text-saffron-400 fill-saffron-400" />
                જય શ્રી ચામુંડા માતાજી
              </span>
            </div>
          </div>

          {/* Col 2: Contact & Office */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-saffron-500 rounded-full"></span>
              સંપર્ક & કાર્યાલય
            </h4>
            <div className="space-y-3 text-xs text-charcoal-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-saffron-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Shop No 10, Meghdut Apartment, Near Swaminarayan Temple,<br />
                  Rampark, Modasa, Arvalli, Gujarat – 383315
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-saffron-400 flex-shrink-0" />
                <a href="tel:7383755226" className="hover:text-white transition-colors font-mono font-bold">
                  7383755226
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-saffron-400 flex-shrink-0" />
                <a
                  href="mailto:adaathamdarjisevasamitimodasa@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  adaathamdarjisevasamitimodasa@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-charcoal-400">
                  ગોપનીયતા બાંહેધરી: કોઈ પણ સભ્યનો અંગત ફોન નંબર કે સરનામું તેમની મંજૂરી વગર જાહેર કરવામાં આવતું નથી.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-charcoal-800 bg-charcoal-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-400">
          <p>© {new Date().getFullYear()} અડાઆઠમ દરજી સમાજ. સર્વ હક સુરક્ષિત.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-saffron-400 transition-colors">
              ગોપનીયતા નીતિ
            </Link>
            <span>•</span>
            <Link href="/donors" className="hover:text-saffron-400 transition-colors">
              દાન નિયમો
            </Link>
            <span>•</span>
            <span className="text-charcoal-500">મોડાસા, ગુજરાત</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
