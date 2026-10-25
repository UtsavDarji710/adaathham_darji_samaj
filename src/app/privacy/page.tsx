import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Users, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-forest-100 text-forest-800 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-charcoal-900">
          ગોપનીયતા નીતિ (Privacy Policy)
        </h1>
        <p className="text-xs text-charcoal-500">
          શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા — સભ્યોના અંગત ડેટા અને બાળ સુરક્ષાની પ્રતિબદ્ધતા
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-10 shadow-card space-y-6 text-xs text-charcoal-700 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-charcoal-900 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-saffron-600" />
            <span>૧. ગોપનીયતા નિયંત્રણ સિદ્ધાંત</span>
          </h2>
          <p>
            અડાઆઠમ દરજી સમાજના પોર્ટલ પર દરેક નોંધાયેલ સભ્ય પોતાની અંગત વિગતો (જેમ કે મોબાઈલ નંબર, ઘરનું સરનામું, પ્રોફાઇલ ફોટો, પરિવાર વૃક્ષ, રોજગાર અને શૈક્ષણિક વિગતો) કોણ જોઈ શકે તેનું સંપૂર્ણ નિયંત્રણ ધરાવે છે. સભ્યની સ્પષ્ટ સંમતિ વગર કોઈ પણ સંવેદનશીલ વિગત સાર્વજનિક ઇન્ટરનેટ પર પ્રદર્શિત કરવામાં આવતી નથી.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-charcoal-900 mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-forest-700" />
            <span>૨. ચાર-સ્તરીય વિઝિબિલિટી (૪ લેવલ વિકલ્પો)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
              <span className="font-bold text-saffron-900 block mb-1">૧. જાહેર (Public):</span>
              <p className="text-[11px] text-charcoal-600">વેબસાઇટની મુલાકાત લેનાર કોઈપણ વ્યક્તિ જોઈ શકે છે (જેમ કે બિઝનેસ નામ).</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
              <span className="font-bold text-saffron-900 block mb-1">૨. માત્ર લોગિન કરેલા સભ્યો (Members Only):</span>
              <p className="text-[11px] text-charcoal-600">માત્ર ચકાસાયેલા અને લોગિન થયેલા સમાજના સભ્યો જ જોઈ શકે છે.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
              <span className="font-bold text-saffron-900 block mb-1">૩. મંજૂર પરિવારના સભ્યો (Family Only):</span>
              <p className="text-[11px] text-charcoal-600">માત્ર પરિવાર વૃક્ષમાં સ્વીકૃત થયેલા નિકટના સગાં-સંબંધીઓ જ જોઈ શકે છે.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-ivory-50 border border-ivory-200">
              <span className="font-bold text-saffron-900 block mb-1">૪. ખાનગી (Private):</span>
              <p className="text-[11px] text-charcoal-600">માત્ર આપ પોતે અને અધિકૃત એડમિન સિવાય અન્ય કોઈને દેખાશે નહીં.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-charcoal-900 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-saffron-600" />
            <span>૩. બાળકો અને સગીરોની સુરક્ષા (Child Protection)</span>
          </h2>
          <p>
            બાળકોના શિક્ષણ અને ઓળખની વિગતો માતા-પિતા કે અધિકૃત વાલી દ્વારા જ સંચાલિત થાય છે અને ડિફોલ્ટ રૂપે સંપૂર્ણ ખાનગી રાખવામાં આવે છે. કોઈ પણ સગીર બાળકની વ્યક્તિગત વિગત અથવા ફોટો જાહેર કરવામાં આવતો નથી.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-charcoal-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-forest-700" />
            <span>૪. દાતા યાદી અને નાણાકીય પારદર્શિતા</span>
          </h2>
          <p>
            કોઈ પણ દાતાશ્રીનું નામ કે રકમ તેમની લેખિત અથવા ડિજિટલ સંમતિ વગર જાહેર કરવામાં આવતી નથી. ગુપ્ત દાન (Anonymous Donations) માત્ર રકમ અને હેતુ સાથે જ ઑડિટ માટે નોંધવામાં આવે છે.
          </p>
        </div>

        <div className="pt-4 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="text-charcoal-500">અંતિમ અપડેટ: ઓક્ટોબર ૨૦૨૫</span>
          <Link
            href="/profile"
            className="px-4 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-xl shadow-xs"
          >
            મારી ગોપનીયતા સેટિંગ્સ બદલો
          </Link>
        </div>
      </div>
    </div>
  );
}
