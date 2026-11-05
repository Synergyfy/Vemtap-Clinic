# VEMTAP Redesign Plan — Flow & Visual Overhaul

> Derived from:
> - `Customisable Patient Registration Forms and Data Collection.md`
> - `Patient_Onboarding flow.md`
> - `Parent_Guardian flow.md`
> - `Platform Architecture.md`
>
> Status: **Draft for approval** — Phase 0 blocked on the incoming patient design code.

---

## 0. Locked decisions

| Decision | Value |
| --- | --- |
| Delivery mode | **Frontend-only first.** No new backend services in this plan. Mock/local state behind a typed adapter layer so API swap-in later is a per-feature change. |
| Starting point | **Design system freeze → patient portal** (design code incoming for patient users). |
| Plan artifact | This document. |
| Non-goal | Claiming persistence/OCR/identity-merging is operational. All simulated behaviour must be labelled as demo. |

**Product rules that constrain every screen (from the docs):**

1. One central VEMTAP patient identity + separate per-clinic relationships. Never a duplicate identity per clinic.
2. Standard VEMTAP identity fields are protected; clinics add *custom* fields, they never delete or redefine standard ones.
3. The same form configuration drives **reception registration, QR self-registration, OCR review, CSV column mapping and profile updates**.
4. OCR/imports produce a **staged record**, not an unquestioned permanent identity. Human review before creation/linking.
5. One guardian login → many child profiles → each child has an independent patient ID and record set.
6. A patient without a login can still be treated. Digital account = improvement, never a barrier.
7. Cross-clinic records are shared only with patient consent (or governed break-glass).

---

## 1. Current state assessment

### 1.1 What exists (keep, don't rebuild)

- **Patient portal** at `apps/web/app/patient/**` — 10 routes, most already wired to real endpoints via `hooks/usePatientPortal.ts` (appointments, records, billing, notifications, optical, profile).
- **Reception** — patient directory + 5-step registration modal + check-in wizard + queue (`app/reception/**`).
- **Clinic admin** — patient list (`app/clinic/patients`), settings area (`app/clinic/settings`).
- **Shared UI primitives** in `components/ui/` — `Button, Input, Badge, Card, Modal, Table, Select, Popover, Calendar, Skeleton, Tooltip, ErrorBoundary`.
- **Design tokens** in `app/globals.css` (Tailwind v4 `@theme`) — `brand-blue #0284c7`, `brand-navy #0f172a`, `brand-soft-blue`, Plus Jakarta Sans.

### 1.2 What is missing (the four docs, zero code today)

| Capability | Status |
| --- | --- |
| Form builder / custom fields / sections / conditional logic | **Nothing** — no entity, module, page or component anywhere |
| Form versioning (draft → publish → archive → versions) | Nothing |
| Patient Migration Centre (OCR, batch scan, CSV/Excel staging, duplicate review) | Nothing — OCR is `setTimeout` simulation in `reception/documents` |
| Duplicate detection / identity matching UI | Nothing |
| QR self-registration consumer (public `/check-in` route) | QR codes are **generated** in 2 places, **decoded nowhere**; no public route |
| Parent/guardian: Family & Dependants, Add Child, profile switching | Nothing |
| Patient profile → "Additional Information" (custom values) | Nothing |

### 1.3 Defects to fix while we are in there

- `app/clinic/patients/[id]/page.tsx` is a **0-byte file** but is linked from the list → broken route.
- `components/patient/TopNav.tsx` hardcodes **"Alex Carter / VC-2024-91"** in the profile dropdown; its logout routes to `/login` (staff) instead of `/patient/login`.
- Reception wizard collects ~35 fields, **drops ~18 of them** on submit (no storage target); success screen shows a hardcoded patient ID.
- Three separate, divergent "add patient" implementations (reception 5-step, reception quick/walk-in, clinic 5-field). No shared component.
- `reception/check-in` does client-side substring matching with a fake 500ms delay; ticket number falls back to `"V-024"`; **Print Ticket has no handler**.
- Patient dashboard `checkedIn` state is local-only fake.

### 1.4 Visual debt (the "look" problem, precisely)

Three unrelated visual languages are live at once:

| Surface | Accent | Label style | Inputs | Headings |
| --- | --- | --- | --- | --- |
| Reception | `sky-600` | `text-[9px]/[10px] font-black uppercase tracking-widest` | raw `<input> rounded-2xl` | `font-black` |
| Patient portal | `teal-600` | `text-xs font-bold uppercase tracking-wider` | `py-3.5 rounded-2xl focus:ring-teal-500` | `font-black` |
| Clinic admin | shadcn defaults + `sky-700` | `text-sm font-medium` | `rounded-2xl` | normal |

Plus:

- **`text-[9px]` micro-typography** is unreadable on mobile and inconsistent with the portal's `text-xs`.
- `font-black` (900) used for almost every heading — no hierarchy.
- The `brand-blue`/`brand-navy` tokens are used **only** by marketing pages; app screens ignore them.
- `globals.css` shrinks the **root font-size to 14px ≤767px and 13px ≤480px** with a `font-size: inherit` override block — this silently rescales *every* `rem` on every page and is why sizes feel inconsistent between breakpoints.
- `--font-mono: var(--font-geist-mono)` is referenced but never defined (dangling).
- `next.config.ts` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` — type/lint breakage goes unnoticed.

---

## 2. Phase 0 — Design system freeze (BLOCKED: awaiting your design code)

**Goal:** one typography scale, one spacing rhythm, one accent per surface, one set of form primitives — before any page is touched.

### 2.1 Deliverables

1. **Token pass in `app/globals.css`**
   - Keep `brand-blue` (primary action), `brand-navy` (headings/dark surfaces), `brand-soft-blue`.
   - Add explicit semantic roles: `--color-success/warning/danger/info` and surface roles (`--color-surface`, `--color-surface-muted`, `--color-border-subtle`).
   - Define a single **patient accent** token (currently ad-hoc `teal-600`) and a single **staff accent** (currently ad-hoc `sky-600`) so each surface has one declared accent, not an inline colour.
   - Fix or remove the dangling `--font-mono`.
2. **Typography scale** — one ramp used everywhere, e.g. `display / h1 / h2 / h3 / body / body-sm / label / caption`, mapped to named Tailwind utilities (`text-display`, `text-label`, …). Replace all `text-[9px]`, `text-[10px]`, `tracking-widest` one-offs.
   - Kill the `font-black` habit: reserve weight 800/900 for `display`+`h1` only; headings 700; labels 600.
3. **Remove the responsive root font-size hack** (`html{font-size:14px/13px}` + the `font-size: inherit` block). Replace with explicit responsive sizes on the elements that need to shrink. *This changes every page at once — do it in its own commit and eyeball 5 key screens per breakpoint.*
4. **Form primitives** (the backbone of the whole redesign):
   - `Field` (label + control + help text + error + required marker)
   - `TextInput / Textarea / Select / MultiSelect / RadioGroup / Checkbox / DatePicker / NumberInput / PhoneInput / EmailInput / FileDrop / ImageCapture`
   - `FormSection` (title, description, fields)
   - `FormRenderer` — takes a form schema and renders it (this is what reception, QR, OCR-review and profile-update all share)
   - `Stepper`, `FormActions`, `EmptyState`, `PageHeader`, `ConfirmDialog`, `ReviewRow`
5. **Conventions doc** — append a short "Frontend conventions" section to `AGENTS.md`: token names, typography ramp, when to use `components/ui`, how to add a page.

### 2.2 Acceptance

- Two screens built by different people look like the same product.
- `grep -r "text-\[9px\]"` returns nothing in `apps/web/app`.
- Root font-size hack gone; mobile and desktop both legible at 320px and 1440px.

### 2.3 Commit steps

1. `tokens: semantic colours + patient/staff accents + font-mono fix`
2. `style: typography ramp utilities + replace micro-type on 1 sample screen`
3. `style: remove responsive root font-size hack`
4. `feat(ui): Field + form control primitives + FormSection`
5. `feat(ui): FormRenderer + Stepper + EmptyState + PageHeader`
6. `docs: frontend conventions in AGENTS.md`

---

## 3. Workstream A — Patient portal redesign (starts immediately after Phase 0)

**Routes:** `app/patient/**` + `components/patient/**`.

### 3.1 Screen-by-screen

| Route | Change |
| --- | --- |
| `/patient/login` | Rebuild to the new design (shared `Field` primitives). Add phone+password / email+password / OTP option tabs per §9.2 of Platform Architecture. |
| `/patient/register` | **Rebuild.** Drop the "type a raw clinic UUID" UX. Fields: full name, phone, email (optional), DOB, password, OTP step. Auto-associate clinic when entered via `?clinic=` / QR. Show generated `VPT-000001`-style Patient ID on success. Add "Register myself" / "Register a child" choice (seeds Workstream D). |
| `/patient/dashboard` | Overview per spec: upcoming appointments, recent consultations, outstanding bills, current queue position when checked in, lens order status, notifications. Make check-in state real (or explicitly labelled demo). |
| `/patient/appointments` | Already API-backed; restyle to primitives + new type ramp. Replace hardcoded `TIME_SLOTS` with a mock adapter. |
| `/patient/records` | Restyle off the `gray-*` palette; use shared `Modal` instead of hand-rolled overlays; group: consultations, eye exams, prescriptions, documents, follow-ups. |
| `/patient/billing` | Invoices, receipts, outstanding, payment history, HMO info — restyle + shared primitives. |
| `/patient/optical` + `/catalogue` | Restyle; make the catalogue enquiry POST real or clearly demo-labelled. |
| `/patient/notifications` | Already uses shared `Card`/`Button` — align type ramp only. |
| `/patient/profile` | Restyle + add **Additional Information** section (renders custom-field values — placeholder until Phase 2 schema exists). |
| `components/patient/Sidebar / TopNav / BottomNav` | New nav model (below); fix hardcoded "Alex Carter"; fix logout target → `/patient/login`. |
| **NEW** `/patient/family` | Family & Dependants (Workstream D). |
| **NEW** `/patient/records-sharing` | Consent & record-sharing approvals (Platform Architecture §8.2). |

### 3.2 New portal nav model

`Overview · Appointments · My Health Records · Optical · Billing & HMO · Family · Notifications · Settings`

- **Active-profile chip always visible** in TopNav (own profile vs child being managed) — required by Parent/Guardian §4 to prevent entering data under the wrong child.
- BottomNav (mobile): Overview · Appointments · Records · Billing · More.

### 3.3 Acceptance

- No hardcoded names/IDs anywhere in `components/patient`.
- Every portal screen uses `components/ui` + Phase 0 primitives; no bespoke `<input>` styling.
- Profile switcher (own ↔ children) present and the active profile is unmistakable on every screen.

---

## 4. Workstream B — Customisable forms: builder + registration (spec §9 of the forms doc)

**New area:** `Clinic Settings → Patient Forms & Fields`.

### 4.1 Data model (frontend-only: typed + mocked)

```
FormDefinition {
  id, clinicId, branchScope: 'clinic' | branchId,
  type: 'new-patient' | 'visit-intake' | 'hmo' | 'payment-intake'
        | 'child-registration' | 'follow-up' | 'profile-update',
  status: 'draft' | 'published' | 'archived',
  version, publishedAt, updatedAt, updatedBy,
  sections: Section[]
}
Section { id, title, description, reusable?: boolean, fields: FieldDef[] }
FieldDef {
  id,                       // stable internal identifier — survives archiving
  key,                      // internal key (never changes)
  kind: 'short_text'|'long_text'|'number'|'date'|'phone'|'email'
        |'dropdown'|'single_select'|'multi_select'|'checkbox'
        |'file_upload'|'image_capture',
  origin: 'vemtap_standard' | 'clinic_custom',   // standard = undeletable
  label, helpText, placeholder, defaultValue,
  required, options[], validation{min,max,minLength,maxLength,pattern},
  visibility: roles[], channels: ('reception'|'qr'|'portal'|'ocr'|'import')[],
  editableAfterSubmit: boolean,
  order,
  conditional?: { sourceFieldKey, op: 'equals'|'not_equals'|'in'|'is_true', value }[]
}
```

**Storage:** `lib/forms/` — `types.ts`, `mock-clinic-forms.ts` (two clinics with genuinely different forms, e.g. *Flourish iClinic* vs *Soteria Eye Clinic*), `form-store.ts` (zustand + `persist` so edits survive reload).

### 4.2 Screens

| Screen | Route / entry | Notes |
| --- | --- | --- |
| Forms list | `/clinic/settings/patient-forms` | cards per form type: status chip, version, last edited by/at, actions (edit, duplicate, preview, publish, archive, versions) |
| Form builder | `/clinic/settings/patient-forms/[id]` | 3-pane: palette (field types) \| canvas (sections + fields, drag-reorder) \| inspector (field config + conditional rules). Standard fields shown locked but relabellable. |
| Reusable sections library | `/clinic/settings/patient-forms/sections` | create once, reuse across forms |
| Preview | in-builder toggle | desktop + mobile preview, "required" markers, conditional rules exercised live |
| Version history | `/clinic/settings/patient-forms/[id]/versions` | version list, who/when, restore, duplicate |
| Branch overrides | per-form "Branches" tab | clinic-wide default + branch additions |

### 4.3 The renderer is the point

`<FormRenderer schema={form} mode="reception|qr|portal|ocr-review|import-mapping" />` must be the **only** way forms are displayed. Workstream C screens consume it.

### 4.4 Acceptance (verbatim from the spec)

> Two clinics with different registration requirements. Each clinic configures its own fields, publishes its form, and uses that configuration in manual registration, QR registration, OCR review and bulk-import mapping — **without affecting the other clinic.**

---

## 5. Workstream C — Registration & onboarding channels

All channels read the published form from Workstream B.

### 5.1 Consolidate the three existing registration implementations

One shared component: `components/patient-registration/RegistrationWizard.tsx`
(Stepper: `Identity → Contact → Visit/HMO → Clinic custom fields → Review → Success`).

Replace:
- `reception/patients` 5-step modal (currently drops 18 fields — the custom section gives them a home),
- `reception/dashboard` quick/walk-in modals,
- `clinic/patients` 5-field modal.

Also fix: `app/clinic/patients/[id]/page.tsx` (empty file) — either build the detail page or remove the links.

### 5.2 QR / self-registration (public)

**New public route** (no staff chrome, no auth): `/c/[clinicSlug]/[branchSlug]/check-in`
and a short link `/check-in?c=<clinicId>&b=<branchId>`.

Flow (Platform Architecture §7.1):
`landing → new / returning / existing-VEMTAP → identity verify (OTP) → FormRenderer(form) → visit purpose → HMO/Private → HMO conditional fields → submit → queue reference + confirmation`

- QR payload: signed non-sensitive `{ type, clinicId, branchId, exp }` — **never patient data**.
- Existing `react-qr-code` producers in `reception/patients` and `reception/check-in` switch to this payload.
- Kiosk variant reuses the same flow (`reception/check-in` becomes a themed wrapper).

### 5.3 CSV/Excel column mapping (frontend simulation)

`/clinic/patients/import` → upload → preview (headers/rows/sample) → **map columns to standard + custom fields** → validate → bucket rows into `ready / missing / invalid / duplicates / needs review` → row-level edit/exclude → confirm → import report. Downloadable template. Uses `FormRenderer`'s field list as mapping targets.

### 5.4 OCR review (simulated extraction, honest labelling)

`/clinic/patients/scan` — original document beside extracted values, confidence chips, uncertain-character highlighting (`I/L/1`, `G/A`, `O/0`, `S/5`, `B/8`, `Z/2` — *not* an exhaustive list), field-level correction with the image visible, duplicate check before save, then staged record. **Banner: "Demo extraction — OCR not connected."**

### 5.5 Patient profile → Additional Information

`/clinic/patients/[id]` gets an **Additional Information** tab rendering the clinic's custom values read-only (role-gated), with edit where `editableAfterSubmit` and role permit.

---

## 6. Workstream D — Parent / Guardian (Parent_Guardian flow.md)

**Architecture to model (frontend):**

```
GuardianAccount (1 login: phone or email)
 ├─ PatientIdentity(own)            ← parent can also be a patient
 ├─ GuardianRelationship → PatientIdentity(child 1)   [relationship + authority recorded]
 ├─ GuardianRelationship → PatientIdentity(child 2)
 └─ ...
```

**Screens:**

| Screen | Route | Notes |
| --- | --- | --- |
| Add Child Profile | `/patient/family/new` | child name, DOB, gender, required demographics + **relationship to guardian**; generates child Patient ID |
| Family / Dependants | `/patient/family` | list of children, patient IDs, profile status, Add Child |
| Profile switcher | TopNav chip | own ↔ child; **active profile name + ID always visible** |
| Child patient dashboard | same portal routes, scoped by active profile | appointments, eye exams, prescriptions, records, optical orders |
| Reception child registration | inside `RegistrationWizard` | "Register a child" → search existing child → verify/link guardian, or create provisional child + link |
| Guardian consent & record sharing | `/patient/records-sharing` | requests, approvals, access history, authorised guardians, revoke |

**Rules to encode in UI:** never one shared record for siblings; never a second VEMTAP identity when visiting a new clinic (create *relationship*, not identity); relationship/authority is recorded explicitly, never assumed; no hardcoded age threshold — configurable placeholder.

---

## 7. Workstream E — Patient Migration Centre (Patient_Onboarding flow.md §9)

**Route:** `/clinic/patients/migration` (Clinic Admin) — *not* a disconnected dashboard; linked from Patients.

Layout:
- **Overview** — total processed, imported, pending review, failed
- Entry tiles — Scan Paper Record · Batch Scan · Upload Excel/CSV · Register Manually · QR self-registration
- **Import History** — batch ID, source, uploaded by, date, status, report; pause/resume/retry (retry never re-imports completed rows)
- **Review Queue** — grouped: ready / missing / invalid / duplicates / needs review
- **Duplicate Resolution** — side-by-side possible matches with `Link / Keep separate / Review later`; **never auto-merge**
- **Download Templates**

Batch scan: capture multiple cards → one document package per card → background processing simulation → each card becomes a review item → confirmed rows enter the import queue.

**Migration stages widget** (from the doc): new patients digital now · returning patients digitise on visit · historical via batches · unclear stay pending · reconcile against clinic totals.

---

## 8. Workstream F — Staff dashboards restyle

After the patient side is stable, port every staff surface to Phase 0 primitives and the new type ramp, killing the three-way visual split:

- `reception/**` (dashboard, patients, queue, appointments, check-in, documents, billing, tasks, support, settings)
- `clinic/**` (dashboard, patients, staff, branches, finance, reports, settings, hmo…)
- `doctor/**`, `nurse/**`, `pharmacy/**`, `optician/**`, `cashier/**`, `admin/**`

Rule: **no page ships with a bespoke `<input>` or bespoke label styling** — it uses `Field`.

Also: make `RoleGuard` (`components/auth/role-guard.tsx`, currently exported and never used) actually wrap the dashboard layouts, since layouts currently have no auth guard.

---

## 9. Sequencing & effort map

| # | Phase | Depends on | Status |
| --- | --- | --- | --- |
| 0 | Design system freeze + form primitives | **your patient design code** | blocked |
| A | Patient portal redesign | 0 | ready to start |
| B | Form builder (Clinic Settings → Patient Forms & Fields) | 0 | ready |
| C | Registration channels (shared wizard, QR public route, CSV mapping, OCR review) | 0 + B | — |
| D | Parent/Guardian (Family, Add Child, switching, consent) | 0 + A | — |
| E | Patient Migration Centre | B + C | — |
| F | Staff dashboards restyle | 0 | parallel-safe after A |

Suggested order of execution: **0 → A → B → C → D → E → F** (D can overlap B/C once A lands).

Per `AGENTS.md`, every phase is broken into small testable steps, **one commit each**, build/typecheck verified before the next step, and **no commit without asking you first**.

---

## 10. Frontend-only architecture (how mocks stay swappable)

```
apps/web/lib/
  forms/        types.ts · form-store.ts (zustand+persist) · mock-clinic-forms.ts
  registration/ types.ts · mock-patients.ts · registration-store.ts
  migration/    types.ts · mock-batches.ts · mock-ocr-extraction.ts
  family/       types.ts · mock-guardians.ts · family-store.ts
  adapters/     api.ts  ← single place where "mock" flips to "fetch"
```

- All screens import **types + hooks** from `lib/*`, never raw arrays.
- Every mock adapter is marked `// DEMO: no backend yet` and surfaces a demo badge in the UI where a user could mistake it for real data (OCR extraction, duplicate merge, import report).
- Swapping to the real API later = reimplementing one adapter file per feature; screens don't change.

---

## 11. Definition of done (whole redesign)

- [ ] One typography ramp, one spacing rhythm, one declared accent per surface; no `text-[9px]`, no root font-size hack.
- [ ] Patient portal matches the design code you send, screen for screen.
- [ ] One shared `FormRenderer` renders every registration form in every channel.
- [ ] Two demo clinics publish different forms; config flows to reception, QR, OCR review and CSV mapping without cross-contamination.
- [ ] Public QR check-in route works end-to-end (demo data) and never embeds patient data in the QR.
- [ ] Family/Dependants with profile switching and an always-visible active profile.
- [ ] Migration Centre with staged import buckets, review queue and duplicate resolution (no auto-merge).
- [ ] Patient profile shows Additional Information (custom values).
- [ ] `tsc --noEmit` clean; no new `ignoreBuildErrors`-hidden breakage.
- [ ] All demo/simulated behaviour visibly labelled.

---

## 12. Open questions for you

1. **Design code** — send the patient design files/code and I'll extract the exact tokens (type sizes, weights, spacing, radii, colours, component shapes) into Phase 0 before touching any page.
2. **Accent policy** — do you want one accent for the whole product (brand-blue), or keep a distinct accent for patient-facing vs staff-facing surfaces (my recommendation: distinct, but declared as tokens)?
3. **The root font-size hack** — safe to remove globally in Phase 0? It changes the apparent size of everything on mobile; I'd do it in one isolated commit for easy revert.
4. **Demo clinic pair** — for the two-clinic acceptance test, use *Flourish iClinic* (rich form) + *Soteria Eye Clinic* (minimal form)?
5. **Scope guard** — confirm no backend work in this pass, even where persistence would be trivial (e.g. form definitions). I'll keep everything behind the adapter layer.
