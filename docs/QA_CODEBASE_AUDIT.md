# QA Codebase Audit & System Architecture Report
**Project:** શ્રી અડાઆઠમ દરજી સેવા સમિતિ (Adaatham Darji Samaj Digital Portal)  
**Date:** November 9, 2026  
**Auditor:** Senior QA Automation Engineer & Application Auditor  
**Repository:** `AdaadthamSamaj`

---

## 1. Application Architecture & Technology Stack

The application is a full-stack progressive web application (PWA) built on modern TypeScript and Next.js, integrating Supabase for cloud persistence, authentication, and file storage, with resilient fallbacks for offline and zero-config deployment.

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER (PWA)                                 |
|  +--------------------+  +--------------------+  +------------------+  +--------------+ |
|  | Desktop/Mobile Web |  |  Image Cropper     |  |  Recharts /      |  | React Flow   | |
|  | Lucide Icons / PWA |  |  (Canvas Aspect)   |  |  Confetti Canvas |  | Family Tree  | |
|  +--------------------+  +--------------------+  +------------------+  +--------------+ |
+--------------------------------------------|--------------------------------------------+
                                             | HTTP / HTTPS / Cookies (`ad8_session`)
+--------------------------------------------v--------------------------------------------+
|                                   NEXT.JS APP ROUTER                                    |
|  +--------------------+  +-------------------------------------+  +-------------------+ |
|  |    Middleware      |  | React Contexts (State & Sync)       |  | App Pages & Admin | |
|  | (`src/middleware`) |  |  - `AuthContext` (User / Roles)     |  |  - Public Routes  | |
|  | Route & Cookie     |  |  - `DataContext` (Live Entities)   |  |  - `/profile`     | |
|  | Protection Guards  |  |  - LocalStorage Caching (`no-store`)|  |  - `/admin/*`     | |
|  +--------------------+  +-------------------------------------+  +-------------------+ |
+--------------------------------------------|--------------------------------------------+
                                             | Internal Server-Side APIs
+--------------------------------------------v--------------------------------------------+
|                                BACKEND API ROUTE HANDLERS                               |
|  `/api/auth/*`      -> `send-otp`, `verify-otp`, `register`, `login`, `logout`, `me`    |
|  `/api/members`     -> Dynamic members query + `member_matrimony` parallel join         |
|  `/api/profile`     -> Member profile update + Role-based permission validation         |
|  `/api/upload`      -> Multipart parser, 5MB limit, MIME check, Supabase Storage Sync   |
|  `/api/admin/*`     -> Delete user, role elevation, member management                   |
|  `/api/*`           -> Dynamic live feeds (businesses, jobs, events, donations, ads)    |
+--------------------------------------------|--------------------------------------------+
                                             |
         +-----------------------------------+-----------------------------------+
         |                                                                       |
+--------v----------------------------------+   +--------------------------------v--------+
|       SUPABASE CLOUD INFRASTRUCTURE       |   |        LOCAL SERVER FALLBACKS           |
| - Supabase Auth (`auth.users`)            |   | - `src/lib/memberStore.ts`              |
| - PostgreSQL Database (12 Tables + RLS)   |   |   (Encrypted PBKDF2 file store:         |
| - Storage Buckets (6 Public/Private)      |   |    `.data/members.json`)                |
| - Nodemailer Email Service (6-digit OTP)  |   | - In-memory mock data purged on launch  |
+-------------------------------------------+   +-----------------------------------------+
```

### Technology Stack Details:
- **Framework:** Next.js `14.2.22` (App Router)
- **Language:** TypeScript `5.x`
- **UI & Styling:** Tailwind CSS `3.4.1`, Lucide React `1.61.0`, Tailwind Merge, CLSX
- **State Management:** React Context API (`AuthContext`, `DataContext`) with live Supabase synchronization
- **Forms & Validation:** React Hook Form `7.90.0`, Zod `4.6.7`
- **Cryptography & Security:** Node.js native `crypto` (PBKDF2 with 10,000 iterations, unique 16-byte hex salts, SHA-256 OTP hashing)
- **Email Service:** Nodemailer `10.3.1` (SMTP with Gmail App Password integration)
- **Visualization:** React Flow `11.11.4` (Family Graph), Recharts `3.10.1`, Canvas Confetti `1.9.4`
- **Database & Storage:** Supabase PostgreSQL (`@supabase/supabase-js 2.118.0`, `@supabase/ssr 0.12.7`)

---

## 2. Complete Route Inventory

### A. Public Navigation & Browsing Routes (No Auth Required on Desktop)
| Route Path | Page Title / Purpose | Auth Required | Features / Sub-components |
|---|---|:---:|---|
| `/` | હોમપેજ (Home Dashboard) | No | Hero Banner, AutoScroll Marquee, Committee Slider, Live Statistics (Members, Families, Businesses, Events), Donors List, Latest Circulars, Footer |
| `/members` | સભ્યો ડિરેક્ટરી (Members Directory) | No | Member search, Village filter, Blood group filter, Confidentiality privacy toggles, Phone call/message, Detail view |
| `/businesses` | વ્યવસાય ડિરેક્ટરી (Business Directory) | No | Business search, Category filter, Village filter, Owner details, Contact, Location |
| `/businesses/[id]` | વ્યવસાય વિગત (Business Details) | No | Single business details, Owner info, Services, Gallery, Call to action |
| `/jobs` | નોકરી / રોજગાર (Job Opportunities) | No | Job listings, Category filter, Full-time/Part-time filter, Salary range, Direct HR call/email |
| `/advertisements` | પ્રાયોજિત જાહેરાતો (Advertisements) | No | Approved sponsor banner showcase, Business promotion |
| `/events` | સામાજિક કાર્યક્રમો (Community Events) | No | Upcoming & past events, Photo gallery, Video link, Venue, Date & Time |
| `/events/[id]` | કાર્યક્રમ વિગત (Event Details) | No | Event deep dive, Photo gallery, Video, Venue location |
| `/donations` | દાન અને આર્થિક સહયોગ (Donations) | No | Official Samiti Bank details & QR code, Online donation form, Screenshot upload, Approved donors list |
| `/donors` | દાતાઓનું ગૌરવ મંચ (Donors Honor Roll) | No | Lifetime donors, Annual donors, Specific purpose donors, Amount search |
| `/committee` | કારોબારી સમિતિ (Executive Committee) | No | Samiti office bearers, Designation, Native place, Term, Contact |
| `/matrimony` | લગ્ન વિષયક ડિરેક્ટરી (Matrimony Directory) | No | Strictly Unmarried candidates, Groom/Bride filter, Education & Native place filters, Bio specs modal |
| `/privacy` | ગોપનીયતા નીતિ (Privacy Policy) | No | Samiti data privacy rules, Member privacy guarantees, Consent disclosure |
| `/login` | લૉગિન (Login Portal) | No (Redirects if logged in) | Single Username + Password form, Show/hide password, Forgot Password Email OTP modal |
| `/register` | નવી નોંધણી (New Member Signup) | No (Redirects if logged in) | Multi-step signup: Basic info, Native place, Father name, Email OTP verification, Password setup |

### B. Strictly Protected Member Routes (Session Cookie Required)
| Route Path | Page Title / Purpose | Auth Required | Role Restriction | Notes |
|---|---|:---:|:---:|---|
| `/profile` | મારી પ્રોફાઇલ (My Profile & Settings) | **Yes** | Any logged-in member (`member`, `committee`, `admin`) | General info, Address, Privacy toggles, Business/Job, Matrimony biodata & consent, Family relations, Password change |
| `/family-tree` | પરિવાર વૃક્ષ (Family Tree Explorer) | **Yes** | Any logged-in member | Interactive family tree search, Village filter, Direct relatives list, Father/Grandfather relationship linking |

### C. Strictly Protected Admin Routes (Admin Role Required)
| Route Path | Page Title / Purpose | Auth Required | Role Restriction | Notes |
|---|---|:---:|:---:|---|
| `/admin` | વહીવટી સમરી (Admin Dashboard Overview) | **Yes** | `president`, `secretary`, `joint_secretary`, `treasurer`, `assistant_treasurer`, `admin` | Summary counters, Quick stats, Recent activity audit logs, Nav tiles |
| `/admin/members` | સભ્ય સંચાલન (Member Management) | **Yes** | Admin roles | View all members, Search, Edit any member details, Assign role, Toggle lifetime membership, Delete member |
| `/admin/committee` | સમિતિ સંચાલન (Committee Management) | **Yes** | Admin roles | Add/remove committee office bearers, Reorder committee hierarchy (1-99) |
| `/admin/matrimony` | મેટ્રિમોની સંચાલન (Matrimony Management) | **Yes** | Admin roles | Manage unmarried candidates, Toggle public listing, Review candidate privacy |
| `/admin/donations` | દાન મંજૂરી & હિસાબ (Donation Management) | **Yes** | Admin roles | Review submitted donations, Verify payment proof screenshots, Approve/Reject donations, Receipt issuance |
| `/admin/advertisements`| જાહેરાત મંજૂરી (Ad Approval Portal) | **Yes** | Admin roles | Review submitted business ads, Banner preview, Approve or Reject with remarks |
| `/admin/events` | કાર્યક્રમો વ્યવસ્થાપન (Event Management) | **Yes** | Admin roles | Create new community event, Edit/delete, Upload cover and gallery, Change status (upcoming/past) |
| `/admin/families` | પરિવાર સંબંધ મંજૂરી (Family Relationship Moderation) | **Yes** | Admin roles | Moderate submitted cross-member relationship requests (Approve / Reject) |

---

## 3. Complete API Inventory

| API Endpoint | HTTP Method | Auth Required | Access Level | Purpose & Supabase Interaction |
|---|:---:|:---:|:---:|---|
| `/api/auth/send-otp` | POST | No | Public | Generates 6-digit cryptographic OTP, hashes with SHA-256, stores in `otp_codes` (expires in 10 mins), sends email via Nodemailer. |
| `/api/auth/verify-otp` | POST | No | Public | Verifies entered OTP against `otp_codes` table within expiry time, marks `is_verified: true`. |
| `/api/auth/register` | POST | No | Public | Validates OTP verification, checks username/phone/email uniqueness, hashes password with PBKDF2 + salt, inserts into `members` table, sets `ad8_session` cookie. |
| `/api/auth/login` | POST | No | Public | Authenticates via Supabase Auth & PBKDF2 verification, checks `members` record, issues 7-day HTTP-only `ad8_session` cookie. |
| `/api/auth/logout` | POST | Yes | Authenticated | Clears `ad8_session` cookie, invalidates server session. |
| `/api/auth/me` | GET | Yes | Authenticated | Resolves session cookie, loads member details from Supabase `members` + `member_matrimony`. |
| `/api/auth/forgot-password` | POST | No | Public | Generates reset password OTP for registered email. |
| `/api/auth/reset-password` | POST | No | Public | Verifies OTP and updates member `password_hash` & `salt` in Supabase `members` and Supabase Auth. |
| `/api/members` | GET | No | Public (`force-dynamic`) | Fetches all live members from `members` table, joins `member_matrimony` data in parallel, attaches matrimony details for unmarried members. |
| `/api/profile` | POST / PUT | Yes | Member (Self) or Admin | Updates personal, contact, employment, education, and upserts into `member_matrimony`. Rejects unauthorized cross-member updates with 403 Forbidden. |
| `/api/upload` | POST | Yes | Member / Admin | Validates MIME type, enforces 5MB limit, checks zero bytes, uploads to Supabase Storage bucket, auto-syncs `photo_url` for `member-photos`. Requires Admin for `samiti-assets`. |
| `/api/admin/delete-user` | POST | Yes | Admin Only | Deletes user from Supabase Auth (`auth.admin.deleteUser`), removes from `public.members`, deletes uploaded photos from storage buckets. |
| `/api/businesses` | GET / POST | GET: Public / POST: Auth | Public / Member | Fetches active businesses (`GET`) or adds a business (`POST`) into `businesses` table. |
| `/api/jobs` | GET / POST | GET: Public / POST: Auth | Public / Member | Fetches active job postings (`GET`) or posts a job (`POST`) into `job_postings` table. |
| `/api/advertisements` | GET / POST | GET: Public / POST: Auth | Public / Member | Fetches approved ads (`GET`) or submits new ad request (`POST`) into `business_advertisements` table. |
| `/api/events` | GET / POST | GET: Public / POST: Admin | Public / Admin | Fetches community events (`GET`) or creates event (`POST`) into `events` table. |
| `/api/donations` | GET / POST | GET: Public / POST: Auth | Public / Member | Fetches approved public donations (`GET`) or submits new donation with payment proof (`POST`) into `donations` table. |
| `/api/announcements` | GET / POST | GET: Public / POST: Admin | Public / Admin | Fetches circulars & announcements (`GET`) or posts new bulletin (`POST`) into `announcements` table. |

---

## 4. Database Table & Entity Inventory

The database is built on PostgreSQL inside Supabase (`opshugwobopselcmgsko.supabase.co`) with 12 distinct relational tables:

1. **`members`**: Master member repository. Columns: `id` (UUID), `auth_user_id` (UUID FK), `username` (UNIQUE), `name`, `phone` (UNIQUE), `email` (UNIQUE), `password_hash`, `salt`, `is_email_verified`, `email_verified_at`, `photo_url`, `address`, `city`, `district`, `native_place`, `pincode`, `father_name`, `grandfather_name`, `maternal_uncle_name`, `maternal_grandfather_name`, `sasri_name`, `piyar_name`, `is_public_in_family`, `marital_status`, `gender`, `dob`, `blood_group`, `role`, `is_lifetime_member`, `committee_role`, `committee_order`, `privacy_*` columns, `family_relations` (JSONB), `employment` (JSONB), `education` (JSONB), `completeness`, `created_at`, `updated_at`.
2. **`otp_codes`**: Temporary 6-digit email OTPs. Columns: `id`, `email`, `hashed_code`, `purpose` (`signup`, `login`, `profile_update`), `attempts`, `expires_at`, `is_verified`, `created_at`.
3. **`member_matrimony`**: Matrimony biodata & privacy. Columns: `id`, `member_id` (UUID FK UNIQUE), `is_available`, `height`, `weight`, `complexion`, `subcaste_gotra`, `about_me`, `partner_expectations`, `hobbies`, `privacy_settings` (JSONB), `created_at`, `updated_at`.
4. **`family_relationships`**: Inter-member connection requests. Columns: `id`, `from_member_id` (FK), `to_member_id` (FK), `relationship`, `relationship_label`, `status` (`pending`, `approved`, `rejected`), `requested_by`, `approved_by`, `created_at`, `approved_at`.
5. **`businesses`**: Commercial directory. Columns: `id`, `owner_id` (FK), `owner_name`, `name`, `category`, `description`, `city`, `address`, `phone`, `email`, `website`, `logo_url`, `cover_url`, `is_featured`, `is_paid`, `status` (`active`, `pending`, `rejected`), `created_at`.
6. **`business_advertisements`**: Paid sponsor banners. Columns: `id`, `business_name`, `category`, `description`, `owner_name`, `contact_number`, `address`, `image_url`, `website_link`, `status` (`pending`, `approved`, `rejected`), `rejection_remarks`, `submitted_by` (FK), `approved_by` (FK), `created_at`.
7. **`job_postings`**: Community jobs. Columns: `id`, `title`, `company_name`, `category`, `job_type`, `city`, `salary_range`, `experience`, `description`, `contact_person`, `contact_phone`, `contact_email`, `posted_by` (FK), `status` (`active`, `closed`), `created_at`.
8. **`events`**: Samaj events. Columns: `id`, `title`, `description`, `date`, `time`, `location`, `city`, `cover_image`, `gallery` (text[]), `video_url`, `status` (`upcoming`, `past`, `archived`), `year`, `organizer`, `created_at`.
9. **`donations`**: Donation submissions. Columns: `id`, `donation_id` (UNIQUE), `user_id` (FK), `donor_name`, `mobile_number`, `donor_photo`, `hasthe_names` (JSONB), `donation_purpose`, `amount`, `date`, `payment_proof` (Private path), `status` (`pending`, `approved`, `rejected`), `is_anonymous`, `public_consent`, `receipt_number`, `approved_by`, `approved_at`, `created_at`.
10. **`samiti_bank_details`**: Official bank account & QR code. Columns: `id`, `account_holder`, `bank_name`, `account_number`, `ifsc_code`, `branch_name`, `upi_id`, `qr_code_url`, `updated_at`.
11. **`announcements`**: Circulars & press releases. Columns: `id`, `title`, `body`, `date`, `category`, `image_url`, `author`, `is_urgent`, `created_at`.
12. **`activity_logs`**: Admin audit trail. Columns: `id`, `admin_id` (FK), `admin_name`, `admin_role`, `action`, `target`, `details`, `timestamp`.

---

## 5. Storage Bucket Inventory

| Bucket ID | Access Policy | Max Size | Allowed Content | Access Constraints |
|---|:---:|:---:|---|---|
| `member-photos` | **PUBLIC** | 5 MB | JPG, PNG, WEBP, GIF | Authenticated users can upload; public can read. |
| `business-photos`| **PUBLIC** | 5 MB | JPG, PNG, WEBP, GIF | Authenticated business owners upload; public can read. |
| `advertisement-banners` | **PUBLIC** | 5 MB | JPG, PNG, WEBP | Public sponsor banners approved by committee. |
| `donor-photos` | **PUBLIC** | 5 MB | JPG, PNG, WEBP | Photos of donors with public consent. |
| `samiti-assets` | **PUBLIC** | 5 MB | SVG, PNG, JPG | Official logos, QR codes. **Upload restricted strictly to Admin roles.** |
| `payment-proofs` | **PRIVATE** | 5 MB | JPG, PNG, PDF | Sensitive payment transaction screenshots. **Read strictly restricted to uploader & Admins.** |

---

## 6. Role & Permission Architecture

The application defines 3 functional tiers:
1. **Unauthenticated Visitor (`guest`):** Public browsing access. Blocked from `/profile`, `/family-tree`, `/admin/*`, and write APIs.
2. **Normal Member (`member`):** Logged-in verified community member. Can view public portal, search family tree, edit own profile, manage own matrimony biodata, post jobs/business/donations. Strictly blocked from `/admin/*`, cross-member updates, and system settings.
3. **Executive Committee Office Bearers / Admins (`president`, `secretary`, `joint_secretary`, `treasurer`, `assistant_treasurer`, `admin`):** Full administrative authority. Can access `/admin/*`, edit any member profile, assign committee roles, moderate donations, approve advertisements, delete members, view private payment proofs and audit logs.

---

## 7. Identified Risks & Architecture Enhancements

1. **Client-side Cache Invalidation:** Handled by injecting `export const dynamic = "force-dynamic"`, `revalidate = 0`, and `Cache-Control: no-store` on all live GET endpoints.
2. **Matrimony Eligibility Constraint:** Strictly enforced in `isMemberEligibleForPublicMatrimony`: Married members (`પરણિત`) are forbidden from appearing in the matrimony directory regardless of checkboxes.
3. **Zero-Byte File Upload Attack:** Guarded by verifying `file.size > 0` before touching storage buffers.
4. **Credential Isolation:** Passwords and OTP codes are strictly salted & hashed; never returned in API payloads.

---
**Verification Result:** Codebase investigation completed. Phase 1 ready for Execution.

