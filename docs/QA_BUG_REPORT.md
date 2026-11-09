# QA Bug & Remediation Report
**Project:** શ્રી અડાઆઠમ દરજી સેવા સમિતિ (Adaatham Darji Samaj Digital Portal)  
**Date:** November 9, 2026  
**Auditor:** Senior Full-Stack Engineer & Application Auditor  

---

## 1. Summary of Discovered & Resolved Issues

| Bug ID | Severity | Affected Role | Affected Module | Root Cause | Resolution Status |
|---|:---:|---|---|---|:---:|
| `BUG-01` | **HIGH** | Normal Member / All | Matrimony Directory (`/matrimony`, `/profile`) | `member_matrimony` table existed in Supabase, but was disconnected from `/api/members` and `supabaseMembers.ts`. Profile updates did not persist matrimony biodata or privacy settings, causing 0 candidates to appear in matrimony directory. | **RESOLVED** |
| `BUG-02` | **HIGH** | All Users | Dynamic API Endpoints (`/api/*`) | Route handlers lacked `export const dynamic = "force-dynamic"` and `Cache-Control: no-store`, leading Next.js / Vercel to statically cache GET responses at build time. | **RESOLVED** |
| `BUG-03` | **MEDIUM** | Unmarried Candidates | Matrimony Modal (`/matrimony`) | "વિગતો જુઓ" candidate modal bio specs grid omitted the Age field, so unchecking "ઉંમર / જન્મતારીખ" had no visual counterpart in the detail modal. | **RESOLVED** |
| `BUG-04` | **MEDIUM** | Guest / Public | Committee Slider (`/`) | `AutoScrollSlider.tsx` duplicated items 4x when item count was <= 3, causing a single committee member to appear 3-4 times side by side. | **RESOLVED** |
| `BUG-05` | **LOW** | Normal Member | Family Tree (`/family-tree`) | When a member had no saved relatives, an empty blank box was rendered instead of a helpful prompt to add family members. | **RESOLVED** |
| `BUG-06` | **LOW** | Guest / Member | Avatar Components (`/members`, Header) | Avatar fallbacks pointed to external Unsplash URLs which could fail if offline or rate-limited. | **RESOLVED** |

---

## 2. Detailed Bug Profiles

### Bug BUG-01: Disconnected Supabase `member_matrimony` Table
- **Severity:** High
- **Affected Role:** Normal Member (Unmarried), Committee, Public Visitors
- **Affected Module:** `/matrimony`, `/profile`, `/api/members`, `/api/profile`
- **Steps to Reproduce:**
  1. Login as an unmarried member.
  2. Navigate to `/profile` -> Matrimony tab.
  3. Fill out height, partner expectations, and privacy settings. Click "મેટ્રિમોની પ્રોફાઇલ સાચવો".
  4. Navigate to `/matrimony`.
- **Expected Behavior:** Candidate should appear under Groom/Bride directory with saved biodata and privacy controls applied.
- **Actual Behavior:** 0 candidates displayed ("કોઈ મેળ ખાતા ઉમેદવાર મળ્યા નથી") because `updateSupabaseMember` ignored `updates.matrimony` and `/api/members` never queried `member_matrimony`.
- **Resolution:**
  - Implemented `matrimonyDbRowToProfile()` and updated `dbRowToMember()` to join `member_matrimony`.
  - Updated `updateSupabaseMember()` to upsert into `member_matrimony` with `{ onConflict: 'member_id' }`.
  - Updated `/api/members` to query `members` and `member_matrimony` concurrently via `Promise.all`.
- **Verification:** Verified via `scratch/execute_e2e_audit.mjs` test `TS01-11`. Candidate `utsav710` successfully persisted and listed.

---

### Bug BUG-02: Next.js Static Route Handler Caching on Vercel
- **Severity:** High
- **Affected Role:** All Roles
- **Affected Module:** `/api/members`, `/api/businesses`, `/api/jobs`, `/api/events`, `/api/donations`, `/api/announcements`
- **Steps to Reproduce:**
  1. Deploy application to Vercel.
  2. Update a member's privacy or add a business in database.
  3. Load `/api/members` in browser.
- **Expected Behavior:** API should return fresh real-time database rows.
- **Actual Behavior:** Vercel served stale build-time static cache.
- **Resolution:**
  - Added `export const dynamic = "force-dynamic";` and `export const revalidate = 0;` across all GET API routes.
  - Added explicit header: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
  - Added `{ cache: "no-store" }` to client fetches in `DataContext.tsx`.
- **Verification:** Verified live fetch returns latest timestamp without HTTP 304 or stale cache hit.

---

### Bug BUG-03: Candidate Detail Modal Omitted Age Attribute
- **Severity:** Medium
- **Affected Role:** Unmarried Member, Guest
- **Affected Module:** `/matrimony` Candidate Detail Modal
- **Steps to Reproduce:**
  1. Toggle "ઉંમર / જન્મતારીખ" privacy setting in profile.
  2. Open candidate card on `/matrimony` and click "વિગતો જુઓ".
- **Expected Behavior:** Modal bio specs grid should display Age (if public) or "ગોપનીય" (if private).
- **Actual Behavior:** Modal completely lacked an Age field in the Bio Specs grid.
- **Resolution:**
  - Injected Age grid cell into `src/app/matrimony/page.tsx` lines 664-676.
  - Dynamically renders `${calculateAge(selectedCandidate.dob)} વર્ષ` when `show_age !== false`, and `"ગોપનીય"` when `show_age === false`.
- **Verification:** Verified in `src/app/matrimony/page.tsx`.

---

### Bug BUG-04: Committee Slider 4x Duplication on Low Item Count
- **Severity:** Medium
- **Affected Role:** Guest, Public Visitor
- **Affected Module:** Homepage (`/`), `AutoScrollSlider.tsx`
- **Steps to Reproduce:**
  1. When committee members count is 1.
  2. Open homepage.
- **Expected Behavior:** Render exactly 1 centered card.
- **Actual Behavior:** AutoScrollSlider forced 4 repeats for `<= 3` items, duplicating the member card 4 times.
- **Resolution:**
  - Added clean condition in `AutoScrollSlider.tsx`: When `items.length <= 3`, render a static flex row without duplication.
- **Verification:** Verified single card rendered without duplicate DOM elements.

---

### Bug BUG-05: Empty Family Relations Box Lacked Guidance
- **Severity:** Low
- **Affected Role:** Normal Member
- **Affected Module:** `/family-tree`
- **Steps to Reproduce:**
  1. Log in with a fresh account that has no relatives entered.
  2. Visit `/family-tree`.
- **Expected Behavior:** Informative message prompting the user to add family members.
- **Actual Behavior:** Blank container with red border rendered nothing.
- **Resolution:**
  - Added fallback in `src/app/family-tree/page.tsx`: If `getFamilyMembers(currentUser.id).length === 0`, display a friendly prompt with a direct link to `/profile`.
- **Verification:** Verified in `src/app/family-tree/page.tsx`.

---

### Bug BUG-06: External Unsplash Fallback Image Dependencies
- **Severity:** Low
- **Affected Role:** Guest, Normal Member
- **Affected Module:** Global Avatars, Header, Member Cards
- **Steps to Reproduce:**
  1. Disconnect internet or block `images.unsplash.com`.
  2. Open member cards where user has no custom photo.
- **Expected Behavior:** Local reliable avatar displayed.
- **Actual Behavior:** Broken image icon displayed.
- **Resolution:**
  - Created standalone vector asset `public/default-avatar.svg`.
  - Created reusable component `src/components/UserAvatar.tsx` with automatic SVG fallback.
- **Verification:** Tested local SVG rendering across all avatar instances.

---
**Status:** All 6 identified bugs have been completely remediated, verified, and pushed to `main`.
