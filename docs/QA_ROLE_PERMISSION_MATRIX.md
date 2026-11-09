# QA Role & Permission Matrix
**Project:** શ્રી અડાઆઠમ દરજી સેવા સમિતિ (Adaatham Darji Samaj Digital Portal)  
**Date:** November 9, 2026  
**Auditor:** Senior QA Automation Engineer & Security Tester  

---

## 1. Discovered Application Roles

Inspection of `src/types/index.ts`, `src/lib/roleCredentials.ts`, `src/lib/memberStore.ts`, and `database.sql` reveals eight distinct user roles and statuses:

1. **`guest` (Unauthenticated Visitor):** Anyone browsing without logging in.
2. **`member` (Normal Samaj Member):** A registered and verified community member.
3. **`president` (પ્રમુખ શ્રી / President):** Executive committee chief with overarching administrative and moderation powers.
4. **`secretary` (મંત્રી શ્રી / General Secretary):** Primary administrative officer responsible for registrations, circulars, and committee records.
5. **`joint_secretary` (સહમંત્રી શ્રી / Joint Secretary):** Operational administrator for advertisements, business listings, and member coordination.
6. **`treasurer` (ખજાનચી શ્રી / Treasurer):** Financial administrator managing donations, accounts, receipts, and payment verification.
7. **`assistant_treasurer` (સહખજાનચી / Assistant Treasurer):** Financial support officer with payment audit and donation verification capabilities.
8. **`admin` (સુપર એડમિન / Super Admin):** Technical and system administrator with unrestricted control over all database records, user deletion, and role assignments.

---

## 2. Complete Role-Based Permission Matrix

| Feature / Functional Module | Guest | Normal Member | President / Pramukh | General Secretary | Treasurer | Super Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Public Homepage & Navigation (`/`)** | View Only | View | View | View | View | View |
| **Members Directory (`/members`)** | View (Public Info) | View (Members Info) | View All | View All | View All | View All |
| **Business Directory (`/businesses`)** | View Public | View + Add Own | View + Manage | View + Manage | View + Manage | View + Manage |
| **Job Board (`/jobs`)** | View Public | View + Post Job | View + Manage | View + Manage | View + Manage | View + Manage |
| **Advertisements Showcase (`/advertisements`)** | View Approved | View + Submit Ad | View + Approve/Reject | View + Approve/Reject | View + Moderate | View + Approve/Reject |
| **Community Events (`/events`)** | View Public | View Public | View + Create/Edit | View + Create/Edit | View + Manage | View + Create/Edit/Delete |
| **Donations & Bank QR (`/donations`)** | View Bank Info | View + Submit Donation | View + Audit/Receipt | View + Audit/Receipt | View + Full Financial Audit | View + Full Financial Audit |
| **Donors Honor List (`/donors`)** | View Public | View Public | View All | View All | View All | View All |
| **Executive Committee (`/committee`)** | View Public | View Public | View + Order/Designate | View + Order/Designate | View + Manage | View + Order/Designate |
| **Matrimony Directory (`/matrimony`)** | View Unmarried (Opt-in) | View Unmarried (Opt-in) | View + Audit Candidates | View + Audit Candidates | View Candidates | View + Audit Candidates |
| **Interactive Family Tree (`/family-tree`)** | **Restricted** (401/Login) | View + Search Relatives | View + Audit Relations | View + Audit Relations | View Relations | View + Full Tree Graph |
| **Personal Profile (`/profile`)** | **Restricted** (401/Login) | View/Update Self Only | View/Update Self & All | View/Update Self & All | View/Update Self & All | View/Update Self & All |
| **Matrimony Biodata Opt-in** | **Restricted** | Unmarried Self Only | Unmarried Self + Audit | Unmarried Self + Audit | Unmarried Self + Audit | Unmarried Self + Audit |
| **File / Photo Upload (`/api/upload`)** | **Restricted** | Allowed (Self/Ads/Proof) | Allowed (All + Assets) | Allowed (All + Assets) | Allowed (All + Assets) | Allowed (All + Assets) |
| **Admin Dashboard (`/admin`)** | **Restricted** (Blocked) | **Restricted** (403 Blocked) | View + Full Dashboard | View + Full Dashboard | View + Full Dashboard | View + Full Dashboard |
| **Member Role Elevation / Edit** | **Restricted** | **Restricted** | Permitted | Permitted | Permitted | Permitted |
| **Donation Verification / Receipt** | **Restricted** | **Restricted** | Permitted | Permitted | Primary Authority | Permitted |
| **Ad Banner Approval / Rejection** | **Restricted** | **Restricted** | Permitted | Permitted | Permitted | Permitted |
| **Family Connection Moderation** | **Restricted** | **Restricted** | Permitted | Permitted | Permitted | Permitted |
| **Permanent User Deletion (`/api/admin/delete-user`)** | **Restricted** | **Restricted** | Permitted | Permitted | Permitted | Full Authority |

---

## 3. Enforcement Layers: Frontend vs. Backend

### Layer 1: Edge Middleware (`src/middleware.ts`)
- Unauthenticated requests to `/profile`, `/family-tree`, `/admin/*` are automatically intercepted and redirected to `/login?callbackUrl=...`.
- Direct unauthenticated POST/PUT calls to `/api/profile`, `/api/upload`, and admin routes return **HTTP 401 Unauthorized**.

### Layer 2: Client Layout Guards (`src/app/admin/layout.tsx`)
- If an unauthenticated user enters `/admin`, a formal lock screen is presented.
- If a logged-in user with `role: "member"` enters `/admin`, the layout intercepts the render and displays an **Access Denied (403)** alert preventing any admin component mounting.

### Layer 3: Backend API Authorization (`src/app/api/profile/route.ts` & `/api/upload/route.ts`)
- Profile updates verify caller identity:
  ```ts
  const isAuthorized = canUserEditTarget(currentUser, targetId);
  // Allowed IF user is editing their own profile OR currentUser.role is an AdminRole
  if (!isAuthorized) return 403 Forbidden;
  ```
- File uploads to protected buckets (e.g. `samiti-assets`) require:
  ```ts
  if (bucketConfig.requireAdmin && !isAdminRole(user.role)) return 403 Forbidden;
  ```
- User deletion endpoint `/api/admin/delete-user` strictly enforces:
  ```ts
  if (!isAdminRole(user.role)) return 403 Forbidden;
  ```

### Layer 4: Supabase PostgreSQL Row Level Security (RLS)
- `members` table: `FOR SELECT USING (true)`, `FOR UPDATE USING (auth.uid() = auth_user_id)`.
- `otp_codes` table: `FOR ALL USING (false)` (strictly service-role only; no browser client access).
- `donations` table: Public select strictly requires `status = 'approved' AND public_consent = true AND is_anonymous = false`.
- Storage `payment-proofs`: Only the uploader (`auth.uid() = owner`) or committee administrators (`president`, `treasurer`, `secretary`, `admin`) can read.

---
**Status:** Permission matrix verified across both frontend and backend layers.

