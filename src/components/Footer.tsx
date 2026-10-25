"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Shield,
  FileText,
  ExternalLink,
  ChevronRight,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { currentUser } = useAuth();
  return (
    <footer className="bg-charcoal-900 text-ivory-100 border-t-4 border-saffron-600">
      {/* Upper Footer with Community Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: About Society */}
          <div className="space-y-4">
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
                  અડાઆઠમ દરજી સમાજ
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

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-saffron-500 rounded-full"></span>
              ઝડપી લિંક્સ
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link href="/" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                  મુખ્ય પૃષ્ઠ (Home)
                </Link>
              </li>
              {currentUser && (
                <li>
                  <Link href="/family-tree" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                    પરિવાર વૃક્ષ (Family Tree)
                  </Link>
                </li>
              )}
              <li>
                <Link href="/members" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                  સભ્યોની ડિરેક્ટરી
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                  સમાજના વ્યવસાયો
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                  વાર્ષિક કાર્યક્રમો & ઉત્સવો
                </Link>
              </li>
              <li>
                <Link href="/donors" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-saffron-500" />
                  દાતાશ્રીઓની યાદી
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Policies */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-forest-500 rounded-full"></span>
              સંચાલન & નીતિ
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link href="/committee" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500" />
                  હોદ્દેદારો & કારોબારી સમિતિ
                </Link>
              </li>
              <li>
                <Link href="/committee#lifetime" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500" />
                  આજીવન સભ્યોની યાદી
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500" />
                  ગોપનીયતા નીતિ (Privacy Policy)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500" />
                  એડમિન પેનલ (સત્તાવાર લોગિન)
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-saffron-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-forest-500" />
                  નવા પરિવાર સભ્યની નોંધણી
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-saffron-500 rounded-full"></span>
              સંપર્ક & કાર્યાલય
            </h4>
            <div className="space-y-3 text-xs text-charcoal-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-saffron-400 flex-shrink-0 mt-0.5" />
                <span>
                  શ્રી અડાઆઠમ દરજી સેવા સમિતિ કાર્યાલય,<br />
                  સમાજ વાડી પરિસર, અડાઆઠમ રોડ,<br />
                  મોડાસા - ૩૮૩૩૧૫, જિ. અરવલ્લી, ગુજરાત.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-saffron-400 flex-shrink-0" />
                <span>+૯૧ ૯૮૨૫૦ ૧૨૩૪૫ / ૯૮૨૫૪ ૪૫૬૭૮</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-saffron-400 flex-shrink-0" />
                <span>contact@adaadhamsamaj.org</span>
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
