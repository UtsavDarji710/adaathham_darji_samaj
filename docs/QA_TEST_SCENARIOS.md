# QA Comprehensive Test Scenario Inventory
**Project:** શ્રી અડાઆઠમ દરજી સેવા સમિતિ (Adaatham Darji Samaj Digital Portal)  
**Date:** November 9, 2026  
**Auditor:** Senior QA Automation Engineer & Security Tester  

---

## 1. Test Suite Architecture

| Suite ID | Focus Area / Target Role | Total Scenarios | Automated / Scriptable |
|---|---|:---:|:---:|
| `TS-01` | Normal User / Samaj Member Journey | 14 | Yes |
| `TS-02` | President / Pramukh Administrative Operations | 10 | Yes |
| `TS-03` | Super Admin Full-Spectrum Management | 12 | Yes |
| `TS-04` | Public Website & Unauthenticated Browsing | 8 | Yes |
| `TS-05` | Cross-Role Impact & State Propagation | 6 | Yes |
| `TS-06` | Supabase RLS, Storage Buckets & Security Bounds | 8 | Yes |
| `TS-07` | Negative, Stress & Edge-Case Resilience | 10 | Yes |
| **TOTAL**| **Complete Application Scope** | **68** | **All Executable** |

---

## 2. Test Scenarios by Suite

### Suite TS-01: Normal User / Samaj Member
- `TS01-01`: Unauthenticated registration page field validation (Required: name, phone, email, username, password).
- `TS01-02`: Email OTP Generation via `/api/auth/send-otp` (6-digit code, SHA-256 hash in `otp_codes`).
- `TS01-03`: Invalid / Expired OTP verification attempt via `/api/auth/verify-otp`.
- `TS01-04`: Duplicate phone & duplicate username registration rejection.
- `TS01-05`: Valid registration completion & session cookie `ad8_session` issuance.
- `TS01-06`: Normal user login with valid credentials (`utsav710`).
- `TS01-07`: Normal user login failure with incorrect password.
- `TS01-08`: Session persistence across reload & valid response from `/api/auth/me`.
- `TS01-09`: Member profile update (Own personal & contact details via `/api/profile`).
- `TS01-10`: Profile photo upload via `/api/upload` (JPEG aspect ratio crop, 5MB limit check, Supabase Storage sync).
- `TS01-11`: Unmarried member matrimony opt-in & biodata saving into `member_matrimony`.
- `TS01-12`: Interactive Family Tree search & relative listing (`/family-tree`).
- `TS01-13`: Access Restriction: Normal user attempting to access `/admin` (Must be blocked with Access Denied).
- `TS01-14`: Access Restriction: Normal user attempting cross-member profile update via direct `/api/profile` call (Must return HTTP 403).

### Suite TS-02: President / Pramukh
- `TS02-01`: President login (`pramukh_test`, `role: "president"`).
- `TS02-02`: Access `/admin` dashboard overview (Must allow access and show administrative counters).
- `TS02-03`: President viewing complete members directory in `/admin/members`.
- `TS02-04`: President editing permitted member information (Designation, Native Place, Contact).
- `TS02-05`: President moderating submitted business advertisements in `/admin/advertisements`.
- `TS02-06`: President auditing submitted donations and receipts in `/admin/donations`.
- `TS02-07`: President reviewing matrimony candidates in `/admin/matrimony`.
- `TS02-08`: President moderating cross-family connection requests in `/admin/families`.
- `TS02-09`: President uploading official assets to `samiti-assets` storage bucket (Must be permitted).
- `TS02-10`: Verification that President actions generate entries in `activity_logs`.

### Suite TS-03: Super Admin
- `TS03-01`: Super Admin login (`dharmik31`, `role: "admin"`).
- `TS03-02`: Access `/admin` and all administrative sub-modules without restriction.
- `TS03-03`: Super Admin editing any user profile via `/api/profile`.
- `TS03-04`: Super Admin assigning and changing user roles (`member` -> `committee` -> `admin`).
- `TS03-05`: Super Admin toggling lifetime membership (`is_lifetime_member`).
- `TS03-06`: Super Admin committee hierarchy reordering (`committee_order`: 1 to 99).
- `TS03-07`: Super Admin creating a new community event in `events` table.
- `TS03-08`: Super Admin publishing an urgent announcement in `announcements` table.
- `TS03-09`: Super Admin approving a donation and issuing formal receipt number.
- `TS03-10`: Super Admin approving a business advertisement with display dates.
- `TS03-11`: Super Admin permanent user deletion via `/api/admin/delete-user` (Purging from Auth, `members`, and storage).
- `TS03-12`: Verification of Super Admin audit trail logging in `activity_logs`.

### Suite TS-04: Public Website & Unauthenticated Browsing
- `TS04-01`: Homepage (`/`) loads without login, renders stats, marquee, footer, and committee slider.
- `TS04-02`: Members directory (`/members`) browsable on desktop without authentication.
- `TS04-03`: Business directory (`/businesses`) renders active businesses without login.
- `TS04-04`: Job board (`/jobs`) renders active jobs without login.
- `TS04-05`: Advertisements (`/advertisements`) renders approved sponsor banners without login.
- `TS04-06`: Events (`/events`) renders upcoming & past community events without login.
- `TS04-07`: Donations (`/donations`) renders official bank QR and public donors without exposing payment proofs.
- `TS04-08`: Matrimony directory (`/matrimony`) strictly displays only unmarried candidates with public consent.

### Suite TS-05: Cross-Role Impact & State Propagation
- `TS05-01`: Profile Update Impact: Normal user updates name/phone -> immediately visible in `/admin/members` and `/members`.
- `TS05-02`: Matrimony Opt-In Impact: Unmarried member toggles public listing -> immediately visible in `/matrimony`.
- `TS05-03`: Married Member Exclusion: Member with `marital_status: "પરણિત"` -> strictly excluded from `/matrimony`.
- `TS05-04`: Donation Submission Flow: User submits donation -> enters `donations` as `pending` -> Admin approves -> visible on `/donors` honor roll.
- `TS05-05`: Advertisement Submission Flow: User submits ad -> enters `business_advertisements` as `pending` -> Admin approves -> visible on `/advertisements`.
- `TS05-06`: Event Creation Flow: Admin creates event in `/admin/events` -> immediately visible to public on `/events`.

### Suite TS-06: Supabase Database, RLS & Storage Security
- `TS06-01`: Direct query to `otp_codes` from browser client is blocked by RLS (`FOR ALL USING (false)`).
- `TS06-02`: Unapproved donations with `status = 'pending'` are hidden from public SELECT queries.
- `TS06-03`: Anonymous donations (`is_anonymous = true`) conceal donor identity on public selects.
- `TS06-04`: Storage bucket `payment-proofs` is strictly private; blocked from public unauthenticated URLs.
- `TS06-05`: Storage bucket `samiti-assets` rejects upload from normal members without admin role.
- `TS06-06`: Member update RLS ensures user cannot modify another user's row via direct Supabase client.
- `TS06-07`: Relational integrity: Cascade delete of member removes corresponding `member_matrimony` row.
- `TS06-08`: Password hash isolation: Passwords use PBKDF2 with unique salts; never stored in plaintext.

### Suite TS-07: Negative, Stress & Edge-Case Resilience
- `TS07-01`: Zero-byte file upload to `/api/upload` is rejected with HTTP 400.
- `TS07-02`: File exceeding 5MB upload limit is rejected with HTTP 400.
- `TS07-03`: Disallowed MIME type (e.g. `.exe`, `.pdf` to image bucket) is rejected with HTTP 400.
- `TS07-04`: Unauthenticated call to `/api/profile` returns HTTP 401.
- `TS07-05`: Non-admin call to `/api/admin/delete-user` returns HTTP 403 Forbidden.
- `TS07-06`: Expired OTP verification returns HTTP 400 Expired Code.
- `TS07-07`: Login attempt with nonexistent username returns HTTP 401 User Not Found.
- `TS07-08`: Malformed JSON or empty body to API routes is handled gracefully without 500 crash.
- `TS07-09`: SQL injection / XSS payload in member search returns sanitized results.
- `TS07-10`: Browser back/forward navigation retains state without auth desynchronization.

---
**Status:** Scenario checklist finalized. Ready for end-to-end execution.
