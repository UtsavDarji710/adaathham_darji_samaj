# શ્રી અડાઆઠમ દરજી સેવા સમિતિ (ADSS)
## Dynamic Data Architecture & Static-to-Dynamic Migration Guide

---

## ૧. પરિચય (Overview)

આ દસ્તાવેજ ADSS એપ્લિકેશનમાં અગાઉ વપરાતી **સ્ટેટિક/ડમી (Dummy Mock Data)** સિસ્ટમ અને હવે લાગુ કરાયેલી **૧૦૦% ડાયનેમિક (Live Dynamic Data)** આર્કિટેક્ચરનું સંપૂર્ણ ટેકનિકલ માળખું સ્પષ્ટ કરે છે.

કોડબેઝમાંથી તમામ નકલી/કાલ્પનિક ડમી ડેટા (દા.ત. `mem-1` થી `mem-20` વાળા નકલી સભ્યો, ડમી દુકાનો, ડમી નોકરીઓ, ડમી દાન અને ડમી કાર્યક્રમો) કાયમી ધોરણે દૂર કરવામાં આવ્યા છે. હવે પોર્ટલ પર માત્ર લાઈવ ડેટાબેઝ (**Supabase PostgreSQL**) અને લાઈવ ઓથેન્ટિકેશન (**Supabase Auth**) દ્વારા પ્રમાણિત સાચો ડેટા જ પ્રદર્શિત થાય છે.

---

## ૨. અગાઉનું સ્ટેટિક ડેટા ફોર્મેટ (Legacy Static Data Format)

અગાઉ `src/lib/mockData.ts` માં નીચે મુજબના કલેક્શન હાર્ડકોડેડ એરે સ્વરૂપે સંગ્રહિત હતા:

### ૨.૧ સ્ટેટિક સભ્યો (Legacy `Member` Format)
અગાઉ ૨૦ જેટલા કાલ્પનિક સભ્યો (દિનેશભાઈ, જયશ્રીબેન, ભાવિનભાઈ, મહેન્દ્રભાઈ વગેરે) સ્ટેટિક કોડમાં હતા:

```typescript
// Legacy Interface
export interface Member {
  id: string; // e.g. "mem-1", "mem-2"
  name: string; // e.g. "દિનેશભાઈ બાબુલાલ દરજી"
  username?: string;
  photo_url: string; // Unsplash placeholder photo
  phone: string; // Fake phone e.g. "98250 00001"
  email?: string; // Fake email e.g. "dinesh.darji@example.com"
  address: string;
  city: string; // "મોડાસા"
  district?: string; // "અરવલ્લી"
  native_place: string; // "અડાઆઠમ"
  pincode?: string;
  father_name?: string;
  grandfather_name?: string;
  maternal_uncle_name?: string;
  maternal_grandfather_name?: string;
  marital_status?: string;
  gender: "male" | "female" | "other";
  role: AdminRole;
  is_lifetime_member: boolean;
  privacy: PrivacySettings;
  family_relations?: FamilyRelationDetail[];
  business?: MemberBusinessDetail;
  employment?: EmploymentDetail;
  education?: EducationDetail;
  matrimony?: MatrimonyProfile;
}
```

#### ઉદાહરણ (Legacy Static JSON):
```json
{
  "id": "mem-1",
  "username": "dinesh",
  "name": "દિનેશભાઈ બાબુલાલ દરજી",
  "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
  "phone": "98250 00001",
  "email": "dinesh.darji@example.com",
  "city": "મોડાસા",
  "native_place": "અડાઆઠમ",
  "marital_status": "પરણિત (Married)",
  "role": "president"
}
```

### ૨.૨ સ્ટેટિક વ્યવસાયો (Legacy `BusinessItem` Format)
અગાઉ ૬ નકલી દુકાનો/પેઢીઓ (`biz-1` થી `biz-6`) કોડમાં હતી:

```typescript
export interface BusinessItem {
  id: string; // "biz-1"
  name: string; // "શ્રી હરિ જ્વેલર્સ"
  category: string; // "જ્વેલરી / સોના-ચાંદી"
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  description: string;
  status: "active" | "pending" | "rejected";
}
```

### ૨.૩ સ્ટેટિક નોકરીઓ (Legacy `JobPosting` Format)
અગાઉ ૪ કાલ્પનિક જોબ પોસ્ટિંગ્સ (`job-1` થી `job-4`) કોડમાં હતી:

```typescript
export interface JobPosting {
  id: string; // "job-1"
  title: string; // "ટેક્સટાઇલ સેલ્સ એક્ઝિક્યુટિવ"
  company: string;
  city: string;
  salary_range: string;
  contact_phone: string;
  created_at: string;
}
```

### ૨.૪ સ્ટેટિક જાહેરાતો (Legacy `BusinessAdvertisement` Format)
અગાઉ ૪ કાલ્પનિક બેનર જાહેરાતો (`adv-1` થી `adv-4`) કોડમાં હતી:

```typescript
export interface BusinessAdvertisement {
  id: string; // "adv-1"
  business_name: string;
  category: string;
  image_url: string;
  owner_name: string;
  phone: string;
  status: "approved" | "pending" | "rejected";
}
```

### ૨.૫ સ્ટેટિક દાન (Legacy `Donation` Format)
અગાઉ ૮ કાલ્પનિક દાન રસીદો (`donation-1` થી `donation-8`) કોડમાં હતી:

```typescript
export interface Donation {
  id: string; // "donation-1"
  donation_id: string; // "REC-2024-001"
  donor_name: string;
  amount: number; // 51000
  donation_purpose: string;
  payment_status: "verified" | "pending";
}
```

### ૨.૬ સ્ટેટિક કાર્યક્રમો (Legacy `CommunityEvent` Format)
અગાઉ ૪ કાલ્પનિક કાર્યક્રમો (`event-1` થી `event-4`) કોડમાં હતા:

```typescript
export interface CommunityEvent {
  id: string; // "event-1"
  title: string;
  event_date: string;
  venue: string;
  status: "upcoming" | "past";
}
```

---

## ૩. નવું ડાયનેમિક ડેટા આર્કિટેક્ચર (New Dynamic Data Architecture)

નવી આર્કિટેક્ચરમાં **ડેટાબેઝ-ફર્સ્ટ (Database-First)** સિદ્ધાંત અપનાવવામાં આવ્યો છે:

```
[ યુઝર / ક્લાયન્ટ બ્રાઉઝર ]
         │
         ▼
[ Next.js API Routes (Serverless) ]
  • /api/members
  • /api/auth/register
  • /api/auth/login
  • /api/auth/me
  • /api/profile
  • /api/upload
         │
         ▼
[ Supabase Backend Cloud ]
  ├── Supabase Authentication (auth.users)
  ├── Supabase PostgreSQL Database (public.* tables)
  └── Supabase Storage Buckets (member-photos, business-photos, etc.)
```

### ૩.૧ Supabase PostgreSQL ડેટાબેઝ ટેબલ્સ (Database Schema)

| ટેબલનું નામ | હેતુ | પ્રાથમિક કી | વિશેષતા |
| :--- | :--- | :--- | :--- |
| `public.members` | તમામ સભ્યોની પ્રોફાઇલ, ગોપનીયતા & સંપર્ક | `id (UUID)` | `auth_user_id REFERENCES auth.users`, Unique `username`, Unique `phone`, Unique `email` |
| `public.businesses` | સભ્યોના વ્યવસાયો & પેઢીઓની યાદી | `id (UUID)` | `owner_id REFERENCES members`, Admin Approval |
| `public.business_advertisements` | પ્રાયોજિત બેનર જાહેરાતો | `id (UUID)` | `status: 'approved' \| 'pending'` |
| `public.job_postings` | સમાજના રોજગાર અને નોકરીઓની તકો | `id (UUID)` | સભ્ય કે એડમિન દ્વારા પોસ્ટ |
| `public.events` | સ્નેહમિલન, સમૂહ લગ્ન વગેરે કાર્યક્રમો | `id (UUID)` | કમિટી દ્વારા પોસ્ટ & લાઈવ અપડેટ |
| `public.donations` | દાતાઓનું દાન અને ડિજિટલ રસીદો | `id (UUID)` | `receipt_number`, ખજાનચી વેરિફિકેશન |
| `public.family_relationships` | સભ્યો વચ્ચેના પારિવારિક સંબંધો | `id (UUID)` | બંને પક્ષે પરસ્પર સંમતિ & મંજૂરી |
| `public.announcements` | સમિતિની સત્તાવાર જાહેરાતો | `id (UUID)` | તાત્કાલિક નોટિફિકેશન |
| `public.activity_logs` | વહીવટી ઓડિટ ટ્રેઇલ | `id (UUID)` | એડમિન ક્રિયાઓનો ટાઈમસ્ટેમ્પ્ડ રેકોર્ડ |

---

## ૪. ડાયનેમિક ડેટા કેવી રીતે પ્રદર્શિત થાય છે? (How Dynamic Data Works Now)

### ૪.૧ સભ્યોની લાઈવ ડિરેક્ટરી (`/api/members` & `/members`)
1. જ્યારે કોઈપણ યુઝર અથવા પેજ લોડ થાય છે, ત્યારે `DataContext` અગાઉથી નક્કી કરેલા ફેક ડેટાને બદલે `/api/members` API કોલ કરે છે.
2. `/api/members` સીધું Supabase ના `public.members` ટેબલમાંથી `created_at DESC` ઓર્ડરમાં તમામ રજીસ્ટર્ડ સભ્યો ફેચ કરે છે.
3. ડેટાબેઝમાંથી આવતો પ્રત્યેક રેકોર્ડ `dbRowToMember()` હેલ્પર દ્વારા આપોઆપ ટાઇપ-સેફ `Member` ઓબ્જેક્ટમાં રૂપાંતરિત થાય છે.
4. **ડમી ડેટા પર્જર (Legacy Cache Purger):** જો યુઝરના બ્રાઉઝરના `localStorage` માં જૂના સત્રના ફેક સભ્યો (`mem-1`, `mem-2`...) સેવ હોય તો એપ્લિકેશન લોડ થતાં જ તેમને ફિલ્ટર કરીને સંપૂર્ણ સાફ કરી નાખે છે.

### ૪.૨ સભ્ય નોંધણી (Live User Registration - `/register`)
1. યુઝર રજીસ્ટ્રેશન ફોર્મમાં માત્ર જરૂરી વિગતો ભરે છે:
   - પૂરું નામ
   - યુઝરનેમ (Username)
   - ઈમેઈલ (OTP ચકાસણી)
   - મોબાઇલ નંબર
   - પાસવર્ડ & કન્ફર્મ પાસવર્ડ
   - મૂળ વતન & હાલનું શહેર
   - રહેઠાણનું સરનામું
2. ઈમેઈલ OTP વેરિફાઈ થયા બાદ `/api/auth/register` API:
   - **Supabase Auth (`auth.users`)** માં યુઝર એકાઉન્ટ બનાવે છે.
   - **`public.members`** ટેબલમાં યુઝરનેમ, ફોન, ઈમેઈલ, પાસવર્ડ હેશ અને પ્રોફાઇલ કાયમી સેવ કરે છે.
   - બ્રાઉઝરમાં ૭ દિવસની સુરક્ષિત `ad8_session` કૂકી સેટ કરે છે.
3. નોંધણી થતાં જ નવો સભ્ય તરત જ સભ્યોની યાદીમાં લાઈવ દેખાવા લાગે છે.

### ૪.૩ યુઝરનેમ લૉગિન (Strict Username + Password Login - `/login`)
1. યુઝર માત્ર પોતાનું **Username** અને **Password** દાખલ કરે છે.
2. `/api/auth/login` API:
   - Supabase માં યુઝરનેમ શોધી તેનું રજીસ્ટર્ડ ઈમેઈલ મેળવે છે.
   - **Supabase Auth (`signInWithPassword`)** દ્વારા પાસવર્ડ પ્રમાણિત કરે છે.
   - સફળ થતાં `public.members` માંથી યુઝરની સંપૂર્ણ પ્રોફાઇલ રિટર્ન કરે છે અને સત્ર ચાલુ કરે છે.

### ૪.૪ પ્રોફાઇલ અને ફોટો સાચવણી (Profile & Photo Upload Persistence)
1. જ્યારે સભ્ય પ્રોફાઇલ ફોટો ક્રોપ કરીને અપલોડ કરે છે, ત્યારે `/api/upload` ફાઇલને **Supabase Storage (`member-photos`)** બકેટમાં સેવ કરે છે.
2. તે જ ક્ષણે `updateSupabaseMemberPhoto()` દ્વારા `public.members.photo_url` કોલમમાં કાયમી URL અપડેટ થાય છે.
3. યુઝર લૉગઆઉટ કરે કે બીજા ડિવાઇસ પરથી લૉગિન કરે, ફોટો ક્યારેય ગાયબ થતો નથી અને ડેટાબેઝમાંથી જ લોડ થાય છે.

### ૪.૫ વ્યવસાયો, જાહેરાતો, નોકરીઓ અને દાન (User-Driven Dynamic Modules)
- **વ્યવસાયો (`/businesses`):** સભ્યો પોતાની પ્રોફાઇલમાંથી વ્યવસાયની વિગતો ઉમેરી શકે છે. જ્યાં સુધી કોઈ સભ્ય વ્યવસાય ન ઉમેરે ત્યાં સુધી ક્લીન એમ્પ્ટી સ્ટેટ *"કોઈ વ્યવસાય મળ્યા નથી"* દેખાય છે.
- **જાહેરાતો (`/advertisements`):** સભ્ય જાહેરાત સબમિટ કરે ત્યારે તે એડમિન પેનલમાં `pending` તરીકે આવે છે. એડમિન મંજૂર કરે એટલે હોમપેજના ઓટો-સ્ક્રોલર તથા જાહેરાત પેજ પર લાઈવ થઈ જાય છે.
- **દાન (`/donations`):** દાન નોંધાયા બાદ ખજાનચી વેરિફાય કરે ત્યારે જ દાતાઓની યાદીમાં રકમ સાથે પ્રદર્શિત થાય છે.

---

## ૫. તુલનાત્મક સારાંશ (Comparison Summary)

| બાબત | અગાઉ (Static Mock Data) | હવે (Live Dynamic Data) |
| :--- | :--- | :--- |
| **ડેટા સ્ત્રોત** | હાર્ડકોડેડ `mockData.ts` ફાઇલ (૧૫૦૦ લાઇન) | **Supabase PostgreSQL & Supabase Auth** |
| **સભ્યોની સંખ્યા** | ૨૦ નકલી/કાલ્પનિક સભ્યો | **માત્ર વાસ્તવિક લાઈવ સભ્યો (`utsavdarji`, `dharmik`...)** |
| **નવી નોંધણી** | સર્વરની કામચલાઉ મેમરીમાં (સર્વર રીસ્ટાર્ટ થતાં ડિલીટ) | **Supabase ડેટાબેઝમાં કાયમી સ્ટોરેજ** |
| **પ્રોફાઇલ ફોટો** | લૉગઆઉટ પછી ગાયબ થઈ જતો | **Supabase Storage માં કાયમી લિંક** |
| **લૉગિન પદ્ધતિ** | મલ્ટિપલ ટેબ્સ / લોકલ ચકાસણી | **સિંગલ Username + Password (Supabase પ્રમાણિત)** |
| **બિઝનેસ & જોબ્સ** | ૬ નકલી દુકાનો અને ૪ નકલી નોકરીઓ | **સભ્યો દ્વારા વાસ્તવિક સબમિશન & એડમિન મંજૂરી** |
| **એમ્પ્ટી સ્ટેટ્સ** | નહોતા (હંમેશા નકલી ડેટા દેખાતો) | **સુવ્યવસ્થિત ગુજરાતી એમ્પ્ટી સ્ટેટ કાર્ડ્સ** |

---

## ૬. નિષ્કર્ષ (Conclusion)

હવે એપ્લિકેશન કોઈપણ પ્રકારના હાર્ડકોડેડ કે બનાવટી ડેટા પર નિર્ભર નથી. સભ્યોનું રજીસ્ટ્રેશન, લૉગિન, પ્રોફાઇલ અપડેટ, પારિવારિક સંબંધો અને તમામ સેવાઓ સંપૂર્ણપણે **સ્વતંત્ર, સુરક્ષિત અને ડાયનેમિક ક્લાઉડ ડેટાબેઝ** દ્વારા સંચાલિત થાય છે.

