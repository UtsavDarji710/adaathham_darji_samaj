import { AdminRole } from "@/types";

export interface RoleCredential {
  role: AdminRole | "member" | "guest";
  memberId?: string;
  gujaratiTitle: string;
  englishTitle: string;
  name: string;
  phone: string;
  cleanPhone: string;
  pin: string;
  tagColor: string;
  bgLight: string;
  borderColor: string;
  emoji: string;
  summary: string;
  canSee: string[];
  cannotSee: string[];
}

export const ROLE_CREDENTIALS: RoleCredential[] = [
  {
    role: "president",
    memberId: "mem-1",
    gujaratiTitle: "પ્રમુખ શ્રી",
    englishTitle: "President",
    name: "દિનેશભાઈ બાબુલાલ દરજી",
    phone: "98250 00001",
    cleanPhone: "9825000001",
    pin: "123456",
    tagColor: "bg-purple-100 text-purple-900 border-purple-300",
    bgLight: "bg-purple-50/70 hover:bg-purple-50",
    borderColor: "border-purple-300",
    emoji: "👑",
    summary: "સમાજના સર્વોચ્ચ વહીવટી વડા — તમામ મોડ્યુલ્સ અને પરિવાર સંબંધોની આખરી મંજૂરી સત્તા.",
    canSee: [
      "સંપૂર્ણ એડમિન ડેશબોર્ડ & ઓડિટ ટ્રેઇલ",
      "પરિવાર વૃક્ષ સંબંધોની આખરી મંજૂરી / રદ",
      "સભ્યોની નવી નોંધણી & આજીવન સભ્યપદ મંજૂરી",
      "નાણાકીય હિસાબ & દાન સમીક્ષા",
      "જાહેરાતો & સ્પોન્સરશિપ મંજૂરી",
    ],
    cannotSee: ["કોઈ પ્રતિબંધ નથી — તમામ સુવિધાઓ ખુલ્લી છે."],
  },
  {
    role: "secretary",
    memberId: "mem-4",
    gujaratiTitle: "મંત્રી શ્રી",
    englishTitle: "General Secretary",
    name: "મહેન્દ્રભાઈ કાનજીભાઈ દરજી",
    phone: "98250 00002",
    cleanPhone: "9825000002",
    pin: "123456",
    tagColor: "bg-blue-100 text-blue-900 border-blue-300",
    bgLight: "bg-blue-50/70 hover:bg-blue-50",
    borderColor: "border-blue-300",
    emoji: "📋",
    summary: "દૈનિક વહીવટી સંચાલક — સભ્યો, અધિકૃત પરિપત્રો, સભાઓ અને કાર્યક્રમોના મુખ્ય સંયોજક.",
    canSee: [
      "સભ્ય ડિરેક્ટરી સંપાદન & ચકાસણી",
      "પરિપત્રો & મહત્વપૂર્ણ જાહેરાતો પ્રકાશન",
      "કાર્યક્રમો, સ્નેહમિલન & ફોટો ગેલેરી સંચાલન",
      "પરિવાર સંબંધોની પ્રાથમિક તપાસ",
    ],
    cannotSee: [
      "બેંક ખાતા & દાન પાવતી વેરિફિકેશન (માત્ર ખજાનચી શ્રી હસ્તક)",
    ],
  },
  {
    role: "joint_secretary",
    memberId: "mem-5",
    gujaratiTitle: "સહમંત્રી શ્રી",
    englishTitle: "Joint Secretary",
    name: "હસમુખભાઈ રણછોડભાઈ દરજી",
    phone: "98250 00003",
    cleanPhone: "9825000003",
    pin: "123456",
    tagColor: "bg-amber-100 text-amber-900 border-amber-300",
    bgLight: "bg-amber-50/70 hover:bg-amber-50",
    borderColor: "border-amber-300",
    emoji: "🤝",
    summary: "સહાયક વહીવટી સંચાલક — સભ્યોની મદદ, વ્યવસાયોની સમીક્ષા અને કાર્યક્રમ આયોજન સહાય.",
    canSee: [
      "સભ્યોની પૂછપરછ & પ્રોફાઇલ સહાય",
      "વ્યવસાય ડિરેક્ટરી & જાહેરાતોની સમીક્ષા",
      "કાર્યક્રમો & ફોટો અપલોડિંગ સહાય",
      "પરિવાર વૃક્ષ વિનંતી સમીક્ષા",
    ],
    cannotSee: [
      "નાણાકીય પાવતી પ્રમાણીકરણ (ખજાનચી હસ્તક)",
      "અંતિમ નીતિગત નિર્ણયો (પ્રમુખ હસ્તક)",
    ],
  },
  {
    role: "treasurer",
    memberId: "mem-6",
    gujaratiTitle: "ખજાનચી શ્રી",
    englishTitle: "Treasurer",
    name: "રમેશભાઈ મગનલાલ દરજી",
    phone: "98250 00004",
    cleanPhone: "9825000004",
    pin: "123456",
    tagColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    bgLight: "bg-emerald-50/70 hover:bg-emerald-50",
    borderColor: "border-emerald-300",
    emoji: "💰",
    summary: "નાણાકીય નિયંત્રક — બેંક વ્યવહાર, UPI વેરિફિકેશન, દાન પાવતી અને ખર્ચ ઓડિટિંગ.",
    canSee: [
      "દાન પાવતી વેરિફિકેશન & 80G રસીદ જનરેશન",
      "UPI & UTR નંબર બેંક એકાઉન્ટ ઓડિટ",
      "જાહેરાતોની પેમેન્ટ ચકાસણી",
      "ગુપ્ત દાતાઓના નાણાકીય હિસાબ",
    ],
    cannotSee: [
      "સભ્યપદ મંજૂરી / રદ કરવી (મંત્રી / પ્રમુખ હસ્તક)",
      "પરિવાર સંબંધોની મંજૂરી (પ્રમુખ હસ્તક)",
    ],
  },
  {
    role: "member",
    memberId: "mem-3",
    gujaratiTitle: "સામાન્ય સભ્ય",
    englishTitle: "Registered Member",
    name: "ભાવિનકુમાર રમણલાલ દરજી",
    phone: "98250 00005",
    cleanPhone: "9825000005",
    pin: "123456",
    tagColor: "bg-saffron-100 text-saffron-900 border-saffron-300",
    bgLight: "bg-saffron-50/70 hover:bg-saffron-50",
    borderColor: "border-saffron-300",
    emoji: "👤",
    summary: "નોંધાયેલ સમાજ સભ્ય — પરિવાર વૃક્ષ જોડાણ, સભ્ય ડિરેક્ટરી, વ્યવસાય નોંધણી અને પ્રોફાઇલ.",
    canSee: [
      "પરિવાર વૃક્ષમાં સભ્ય જોડવાની વિનંતી કરવી",
      "સભ્યોની યાદી & સભ્ય-સ્તરીય સંપર્કો જોવા",
      "પોતાની પ્રોફાઇલ & ૪-સ્તરીય પ્રાઇવસી બદલવી",
      "પોતાનો વ્યવસાય ઉમેરવો & જાહેરાત વિનંતી",
      "દાન કરવું & પોતાની ડિજિટલ પાવતી ડાઉનલોડ કરવી",
    ],
    cannotSee: [
      "કોઈ પણ એડમિન પેનલ (/admin/*) ઍક્સેસ નથી",
      "અન્ય સભ્યોની ખાનગી / પરિવાર-માત્ર વિગતો",
      "અન્ય સભ્યોના સંબંધોની મંજૂરી આપવી",
    ],
  },
  {
    role: "guest",
    gujaratiTitle: "અતિથિ / મુલાકાતી",
    englishTitle: "Public Guest (Logged out)",
    name: "જાહેર મુલાકાતી",
    phone: "લૉગિન વગર",
    cleanPhone: "",
    pin: "-",
    tagColor: "bg-slate-100 text-slate-800 border-slate-300",
    bgLight: "bg-slate-50/70 hover:bg-slate-50",
    borderColor: "border-slate-300",
    emoji: "🌐",
    summary: "સામાન્ય ઇન્ટરનેટ મુલાકાતી — માત્ર જાહેર માહિતી જોઈ શકે છે, ખાનગી ડેટા સંપૂર્ણ સુરક્ષિત.",
    canSee: [
      "હોમ પેજ & ચામુંડા માતાજી મંદિર દર્શન",
      "સમાજના જાહેર વ્યવસાયો & જાહેરાતો",
      "કાર્યક્રમોની જાહેર તસવીરો & વીડિયો",
      "કારોબારી સમિતિના હોદ્દેદારોની યાદી",
      "જાહેર સંમતિ ધરાવતા દાતાઓનું લિસ્ટ",
    ],
    cannotSee: [
      "પરિવાર વૃક્ષ ટેબ & ડિજિટલ વંશાવળી (માત્ર લૉગિન પછી જ ઉપલબ્ધ 🔒)",
      "સભ્યોના ફોન નંબર & ઘરના સરનામાં (લૉક 🔒)",
      "વ્યવસાય/જાહેરાત/દાન ઉમેરવાની સગવડ (લૉગિન જરૂરી)",
      "પ્રોફાઇલ ડેશબોર્ડ & એડમિન પેનલ",
    ],
  },
];
