# Backend Gaps, Third-Party Services & Screen-Flow Audit — Vemtap Clinic

**Date:** 2026-10-22
**Branch:** `logic` @ `4c99ae8`
**Scope:** `apps/web` API usage vs. `apps/api` routes (Part 1), the external services the API depends on (Part 2), and incomplete or broken screen flows in `apps/web` (Part 3)

---

## Summary

| Category | Count |
|---|---|
| Frontend API calls scanned | 298 |
| Backend routes scanned | 319 |
| Calls that match a real route | 288 |
| **Live frontend calls hitting a missing route** | **8** |
| **Existing routes that are unreachable (shadowed)** | **4** |
| **Realtime (Socket.io) wiring defects** | **2** |
| Features on mock pages with no backend at all | 8 |
| Third-party services needing API keys | 4 (only Resend is used today) |
| Broken links / redirects (routes that don't exist) | 3 |
| Auth / session flow defects | 6 (including 1 likely security hole) |
| Fake actions (show success, save nothing) | 20+ across 18 pages |
| Pages with dead buttons (no handler) | 9 |

**Method:** a script pulled every `api.get/post/put/patch/delete(...)` call from `apps/web` and every `@Controller` + `@Get/@Post/...` route from `apps/api/src`, then matched them by HTTP method and path. Every flagged result was then confirmed by reading the code. Two cashier calls the script flagged (`/cashier/transactions` and `/cashier/products` with a query string attached) were false alarms and are not listed.

---

# Part 1 — Missing Required Endpoints

## A. Frontend calls that 404 today

| # | Frontend call | Caller | Backend state |
|---|---|---|---|
| 1 | `GET /hmo/plans/:hmoId` | `web/services/hmo.service.ts:234`, used on `clinic/hmo` | `HmoService.findAllPlans` exists but has **no route**. The call actually lands on `GET /hmo/:id`, so it gets the wrong data or a 404. |
| 2 | `POST /hmo/plans` | `web/services/hmo.service.ts:239` | `createPlan` and `CreateHMOPlanDto` exist, but there's no route |
| 3 | `PUT /hmo/plans/:id` | `web/services/hmo.service.ts:244` | `updatePlan` and `UpdateHMOPlanDto` exist, but there's no route |
| 4 | `DELETE /hmo/plans/:id` | `web/services/hmo.service.ts:249` | `removePlan` exists, but there's no route |
| 5 | `GET /hmo/remittances/all` | `web/services/hmo.service.ts:174`, used on `clinic/hmo-advanced/reconciliation` | `findAllRemittances` exists, but there's no route |
| 6 | `POST /hmo/remittances` | `web/services/hmo.service.ts:179` | `createRemittance` and `CreateRemittanceDto` exist, but there's no route |
| 7 | `PUT /hmo/remittances/:id/match` | `web/services/hmo.service.ts:184` | `MatchRemittanceDto` exists, but there's **no service method and no route** |
| 8 | `PUT /queue/:id` | `web/services/queue.service.ts:152`, used on `reception/queue` and `clinic/queue` | No `update` method in `QueueService` and no route. Only `/complete` and `/cancel` exist. |

**Fix:**
- Items 1–6 only need controller routes added to `apps/api/src/hmo/hmo.controller.ts`; the service logic is already written. Declare them **above** the catch-all `GET/PUT /hmo/:id` routes at lines 216–222.
- Item 7 also needs `HmoService.matchRemittance()`.
- Item 8 needs `UpdateQueueEntryDto`, `QueueService.update()` and a `PUT /queue/:id` route.

## B. Routes that exist but are never reached because of declaration order

In Express, a `GET :id` route declared first catches any later literal path at the same position. All four routes below are called by the frontend. Each returns a "not found" error or a database error on a UUID cast instead of a list.

| Unreachable route | Shadowed by | Frontend caller |
|---|---|---|
| `GET /queue/announcements` (L69) | `GET /queue/:id` (`queue.controller.ts:42`) | `web/services/queue.service.ts:177` |
| `GET /returns/refunds` (L90) | `GET /returns/:id` (`returns.controller.ts:41`) | `web/services/returns.service.ts:59` |
| `GET /debtors/payment-plans` (L83) | `GET /debtors/:id` (`debtors.controller.ts:55`) | `web/services/debtors.service.ts:74` |
| `GET /debtors/activities` (L110) | `GET /debtors/:id` (`debtors.controller.ts:55`) | `web/services/debtors.service.ts` |

**Fix:** move each `:id` route below the literal routes, or add `ParseUUIDPipe` so non-UUID paths fall through.

## C. Realtime: the frontend listens for events the backend never sends

1. **No events are ever emitted.**
   - The frontend listens for `queue:new`, `queue:update`, `queue:call`, `notification:new` and `notification:unread-count`.
   - `QueueGateway` and `NotificationsGateway` define emit helpers, but **no service ever injects or calls them**.
2. **The socket can't authenticate.**
   - `web/hooks/useSocket.ts:18` reads the token from `localStorage.vemtap_access_token`, but the token is actually stored inside the `vemtap-auth` Zustand entry (`lib/auth-state.ts`). Use `getAccessToken()` instead.
   - The gateways read `payload.sub` and `payload.clinicId`, but the JWT payload is `{ user_id, roles }` (`auth.service.ts:252`). Either add `clinicId` to the token or look the user up by `user_id`.

## D. Pages still on mock data that need endpoints which don't exist anywhere

| Feature | Page(s) | What's missing |
|---|---|---|
| Two-factor login | `app/2fa` | 2FA setup and verify endpoints, plus 2FA fields on `User` |
| Staff invitations | `app/accept-invite` | Invite create and accept endpoints, plus an invite token entity |
| Doctor availability | `app/doctor/settings/availability` | Schedule or availability fields on `Staff`, and their CRUD endpoints |
| Per-user preferences (notifications, display, region) | `doctor`, `nurse`, `reception`, `pharmacy` and `optician` settings pages | Settings are stored per clinic only (`clinic_settings` has no `userId`). Profile update also has no endpoint (`/auth/profile` is GET only). |
| Platform overview and analytics (MRR, revenue by plan, ARPU, feature adoption, top clinics) | `app/admin/dashboard`, `app/admin/analytics` | `Clinic` has no plan or subscription data, and there are no endpoints that aggregate across clinics |
| Platform settings, integrations and API keys | `app/admin/settings` | Nothing exists |
| Workflow blueprints | `app/admin/config/workflows` | Nothing exists |
| Knowledge base and FAQ | `app/clinic/support` and the role support pages | Nothing exists (support tickets **do** exist) |

> **Design gap:** `UserRole.ADMIN` is used both for a clinic's own admin and for the platform-wide (SaaS) admin. The cross-clinic `admin/*` endpoints above need a separate `SUPER_ADMIN` role, or a clinic admin could see every clinic's data.

## E. Mock pages that only need wiring (the backend is already there)

| Page(s) | Existing backend |
|---|---|
| `admin/clinics`, `admin/clinics/[id]` | `/clinics` (CRUD + stats) |
| `clinic/support`, `*/support` tickets | `/support-tickets` (14 endpoints) |
| `admin/config/hmo` | `/hmo` (after A1–A4 are added) |
| `admin/config/templates` | `/clinical-reporting/templates` |
| `doctor/reports` | `/clinical-reporting`, `/analytics` |
| `clinic/pharmacy` | `/drugs`, `/prescriptions` |

---

# Part 2 — Third-Party Services & API Keys

At the time of this audit, `apps/api/.env` contains only the database, JWT and app settings. **None of the third-party keys below are set.**

## Needed now

### Resend — email (the only service the app currently calls)

| Env var | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | ✅ | `re_…` |
| `EMAIL_FROM` | optional | Defaults to `noreply@vemtap.com`. The sending domain must be verified in Resend. |
| `EMAIL_FROM_NAME` | optional | Defaults to "Vemtap Health Clinic" |

- **Used by:** `auth.service.ts` and `patient-portal.service.ts` (password-reset emails), and `billing.service.ts` (payment receipts).
- **Without the key:** nothing crashes. Emails are skipped with a console warning, so password reset won't actually deliver anything.

## Code exists, but no feature uses it yet

`PaymentService`, `FileStorageService` and `SmsService` are registered in `CommonModule`, but **no module calls them**. Keys for these won't change anything until they're connected to a feature.

### Paystack — payments

| Env var | Notes |
|---|---|
| `PAYSTACK_SECRET_KEY` | Use `sk_test_…` while developing |
| `PAYSTACK_PUBLIC_KEY` | Use `pk_test_…` while developing |

- **Status:** `PaymentService` can start, verify and refund a payment, but billing and the cashier don't call it. There's also no webhook endpoint, which you'll need to confirm payments.

### Cloudinary — file storage

| Env var | Notes |
|---|---|
| `FILE_STORAGE_PROVIDER` | `local` (default) or `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `UPLOAD_DIR` | Local storage folder; defaults to `./uploads` |

- **Without it:** files are stored on local disk in `./uploads`. That's fine for development, but on Vercel or any serverless host the files would be lost.
- ⚠️ If you set `FILE_STORAGE_PROVIDER=cloudinary` and leave any of the three Cloudinary keys out, **the API fails to start**.
- **Status:** the `file-upload` module only saves file records in the database and never calls `FileStorageService`, so nothing actually uploads files yet.

### SMS — choose one provider and set `SMS_PROVIDER`

If `SMS_PROVIDER` isn't set, the code assumes Twilio.

| Provider | `SMS_PROVIDER` | Env vars |
|---|---|---|
| **Termii** (recommended for Nigeria) | `termii` | `TERMII_API_KEY`, `TERMII_SENDER_ID` (the sender ID must be approved by Termii) |
| Africa's Talking | `africastalking` | `AFRICAS_TALKING_USERNAME`, `AFRICAS_TALKING_API_KEY` |
| Twilio | `twilio` | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |

- **Status:** `SmsService` isn't used anywhere yet; there are no appointment reminders or one-time codes.

## Not needed in `.env`

- **HMO insurer APIs:** each clinic enters its own credentials in the app (through `/api/hmo-integrations`), and they're stored in the database. Supported auth types are API key, bearer token, basic auth and OAuth2. You'll get these credentials from each HMO when you partner with them.
- **Run yourself, no keys:** PostgreSQL, Socket.io, PDF generation (`jspdf`), rate limiting.

## Env vars the code actually reads

| Area | Variables |
|---|---|
| App | `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `FRONTEND_URL` |
| Database | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| Email | `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME` |
| Payments | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` |
| Storage | `FILE_STORAGE_PROVIDER`, `UPLOAD_DIR`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| SMS | `SMS_PROVIDER`, `TERMII_*`, `AFRICAS_TALKING_*`, `TWILIO_*` |
| Web | `NEXT_PUBLIC_API_URL` (the socket URL is taken from this too; `NEXT_PUBLIC_WS_URL` in `.env.example` is unused) |

## `.env.example` is out of date

- `JWT_EXPIRATION` should be `JWT_EXPIRES_IN`, and `JWT_REFRESH_EXPIRATION` should be `JWT_REFRESH_EXPIRES_IN`.
- **Never read by the code:** `JWT_REFRESH_SECRET`, `EMAIL_PROVIDER`, `MOCK_SERVICES`, `THROTTLE_TTL`/`THROTTLE_LIMIT` (the limits are hardcoded in `app.module.ts`), and the SendGrid, AWS SES/S3, Flutterwave, Stripe and GCS keys.
- **Read by the code but not listed:** `FRONTEND_URL` (it builds the password-reset link), `EMAIL_FROM_NAME`, `UPLOAD_DIR`.
- The comments about automatic mock services in development are wrong. The `Mock*Service` classes exist but aren't registered, so in development the real services run and just skip their work when keys are missing.

---

# Part 3 — Incomplete & Broken Screen Flows

**Method:**
- Checked every `href`, `router.push`, `router.replace` and `redirect` in `apps/web` against the 114 `page.tsx` routes.
- For each page, counted real saves (React Query mutations and direct `api.post/put/delete` calls) against success toasts.
- Looked for buttons with no handler.
- Traced the hand-offs between roles in the main patient journey.

Links are mostly fine; the main problem is **actions that look like they work but save nothing**.

## 3.1 Patient portal — broken, and a likely security hole ⚠️

- **No way in.** The login page sends the "patient" role to `/patient/dashboard` (`app/login/page.tsx:39`), but `UserRole` has no patient role. The real patient login hook (`usePatientLogin` in `hooks/usePatientPortal.ts:30`, which calls `/patient-portal/login`) is never used on any screen.
- **The portal's token doesn't fit its guard.**
  - Patient tokens are `{ sub, email, type: 'patient' }` (`patient-portal.service.ts:192`), signed with the same `JWT_SECRET` as staff tokens.
  - The portal routes use the staff `JwtAuthGuard` (`patient-portal.controller.ts:46+`). Its `JwtStrategy` looks the user up by `payload.user_id`, which patient tokens don't have, so the lookup runs with `undefined`. TypeORM 0.3 drops `undefined` conditions, so this most likely **returns the first user in the table: the seeded admin**.
  - `req.user.sub` is also `undefined`, so `makePayment` looks up `{ id, patientId: undefined }` and will **find any patient's invoice by its ID** (`patient-portal.service.ts:161`).
  - This hasn't been run to confirm it, but the code path is direct. **This is the top priority.**
- **Payments aren't real.** `patient/billing` records the payment as `isSuccessful: true` straight away, with no Paystack step.

## 3.2 Logins and sign-up

| Flow | Problem |
|---|---|
| **Sign up** (`app/register`) | The clinic dropdown has hardcoded IDs (`clinic-1`, `clinic-2`, `clinic-3`), not real UUIDs, so registration fails. There's no "create my clinic" step, and `GET /clinics` is admin-only, so the dropdown can't load real clinics. |
| **Log out** | None of the role layouts call `useAuth().logout()`. Eight of them (`cashier`, `clinic`, `doctor`, `nurse`, `optician`, `pharmacy`, `reception`, and the patient `Sidebar`) just clear old `vemtap:session` localStorage keys. The refresh cookie stays valid, so **reloading the page logs the user straight back in**. `admin/layout.tsx` has no logout at all. |
| **Role access** | No layout checks the user's role, and there's no `middleware.ts`. `RoleGuard` exists but isn't used anywhere. Any logged-in user can open `/admin/*` and every other role area. |
| **2FA and accept-invite** | Both redirect to `/dashboard` (`app/2fa/page.tsx:58`, `app/accept-invite/page.tsx:60`), which doesn't exist, and neither has a backend (see Part 1 D). |
| **RoleGuard** | Redirects to `/unauthorized` (`components/auth/role-guard.tsx:31`), which doesn't exist. There are also no `not-found.tsx` or `error.tsx` pages. |

## 3.3 Clinical journey (check-in → queue → nurse → doctor → pharmacy → payment)

| Step | Status |
|---|---|
| Reception patient registration | ✅ `reception/patients` saves. ❌ The **Quick Register** and **Walk-in** modals on `reception/dashboard` (L591, L659) only show a toast; no patient or queue entry is created. |
| Check-in | ✅ `reception/check-in` creates a queue entry. ❌ The check-in modal on `reception/patients` (L129–140) and the patient self check-in on `patient/dashboard` (L72) are fake. |
| Queue → nurse | ✅ The nurse can complete queue entries (`nurse/patients`). ❌ The edit/update action calls the missing `PUT /queue/:id` (Part 1 A8). |
| Nurse work | ✅ Vitals and treatment notes save. ❌ `nurse/eye-tests`, `nurse/followups` and `nurse/monitoring` are **read-only**: there's no way to record an eye test or a follow-up. |
| Doctor | ✅ `doctor/queue` → `doctor/workspace/[id]` → saves the record and prescription. ❌ It **never completes the queue entry**, so the patient stays in the queue forever. It also **creates no invoice**. ❌ `doctor/queue` has no "call next" or "start". |
| Pharmacy | ✅ Dispensing, restocking and purchase orders save. `pharmacy/prescriptions` is view-only. |
| Payment | ✅ Cashier shifts and transactions, and the reception invoice + payment, save. ❌ Consultations, dispensing and optical orders don't create invoices automatically, so reception has to rebuild the bill by hand. ❌ `cashier/reconciliation` is read-only, with no submit or close-out step. |
| Optical | ✅ Production stages and order status save. ❌ `optician/sales` and `optician/inventory` have **no way to create a sale or add stock**. ❌ The patient's "Submit Enquiry" in `patient/optical/catalogue` only shows a toast. |

## 3.4 Fake actions (they show success but save nothing)

| Area | Page(s) | What happens |
|---|---|---|
| Scanning / OCR | `reception/dashboard` (L675), `reception/documents` | A timer moves from "scanning" to "done". "Upload" (L72) only adds a row on the screen, and "Confirm & Save" (L67) only shows a toast. |
| PDF export | `doctor/records/[id]` (L80) | Shows "PDF exported successfully!" and creates no file |
| Reports | `doctor/reports` | Generate, export and download are all fake |
| Role settings | `doctor`, `nurse`, `reception`, `pharmacy`, `optician`, `admin` settings pages | Show "updated successfully" and save nothing. Only `clinic/settings` saves. |
| Role support | `doctor`, `nurse`, `reception`, `pharmacy`, `optician` support pages | Tickets show "sent" and the live chat replies with a canned bot message, even though `/support-tickets` exists. `clinic/support` uses `alert()`. |
| Marketing popups | `components/popups/onboarding-modal.tsx`, `modal-manager.tsx` | Submit with a timer, `alert()` or `console.log` |

## 3.5 Buttons that do nothing

| Page | Dead buttons | Backend ready? |
|---|---|---|
| `clinic/hmo` | **Add Partner**, **New Agreement**, **New Authorization** (L336, L376, L421) | ✅ `POST /hmo`, `/hmo/agreements`, `/hmo/authorizations` |
| `clinic/branches` | **New Branch** has `onClick: () => {}` (L125) | ✅ `/branches` (the frontend has no create hook) |
| `admin/config/drugs`, `frames`, `lenses` | **Add New**, **Edit**, **Export** (10–11 dead buttons per page) | ✅ `/drugs`, `/products`, `/optical` |
| `admin/clinics`, `admin/clinics/[id]` | Entirely mock, 6–7 dead buttons | ✅ `/clinics` |
| `admin/config/hmo`, `templates`, `workflows` | Entirely mock, 9–12 dead buttons | Partial (see Part 1 D/E) |

---

## Recommended order

1. **Security first:** give patient tokens their own Passport strategy and guard, make `JwtStrategy` reject tokens without `user_id`, and build a patient login screen (3.1).
2. **Fix broken calls:** add the HMO plan and remittance routes and the queue update route (1A), and reorder the shadowed routes (1B).
3. **Fix logins:** wire every layout's logout to `useAuth().logout()`, add role checks to layouts (or `middleware.ts`), fix the sign-up clinic step, and add the `/unauthorized`, `not-found` and `error` pages (3.2).
4. **Get a Resend key** and set `FRONTEND_URL` so password reset works end to end.
5. **Complete the clinical journey:** have the doctor workspace complete the queue entry and create an invoice; replace the fake Quick Register, Walk-in and check-in modals with the real ones; add eye test, follow-up, optical sale and stock forms (3.3).
6. **Fix realtime:** inject the gateways into the queue and notification services, and fix the socket token and JWT payload (1C).
7. **Replace fake actions:** connect support pages to `/support-tickets` and settings pages to `/settings`, and make real PDF exports with `jspdf` (3.4).
8. **Connect the dead buttons** on the HMO, branches and admin config pages (3.5).
9. **Correct `.env.example`** to match the variables the code reads.
10. **Connect Paystack** (billing, cashier, patient portal, webhook), **Cloudinary** (`file-upload`, documents) and **Termii** (reminders, one-time codes), then add their keys.
11. **Build the missing features** in 1D, starting with a `SUPER_ADMIN` role before any cross-clinic admin endpoints.
