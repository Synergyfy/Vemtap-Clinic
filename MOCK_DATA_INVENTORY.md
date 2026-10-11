# Mock Data Inventory — Vemtap Clinic Frontend

**Date:** 2026-10-11
**Branch:** `logic` @ `112558b`
**Scope:** Every hardcoded data source in `apps/web` that renders as if it were live

---

## Summary

| Category | Files | Verdict |
|---|---|---|
| **A. Page fully renders mock data** | **16** | Must migrate |
| **B. Page has API + mock hybrid** | **6** | Partially migrated, mock shown to user |
| **C. Mock used as simulated action** | **3** | Misleading — fakes server work |
| **D. UI config constants (NOT mock)** | ~15 | ✅ No action — filter/label data |
| **E. Intentional marketing mockups** | 7 | ✅ No action |

**Net: 25 files need work.** Backend APIs exist for ~19 of them.

---

## Category A — Fully Mock Pages (16 files)

No `@/hooks` or `@/services` import. Renders hardcoded arrays as live data.

### A1. Admin section (9 files)

| File | Mock symbol | Sample data | Backend ready? |
|---|---|---|---|
| `app/admin/dashboard/page.tsx` | `recentClinics` | `"Optimal Optical", "Chioma Okoro", plan: "Starter"` | ⚠️ Partial — `dashboard` exists, no clinic list |
| `app/admin/clinics/page.tsx` | `clinics` (L16) | Full fake clinic records | ❌ **No `clinics` module** |
| `app/admin/clinics/[id]/page.tsx` | inline (L31, comment: *"Mock data for a single clinic"*) | Fake clinic detail | ❌ **No `clinics` module** |
| `app/admin/finance/page.tsx` | `transactions` (L17) | `TXN-8492, "$1,240.00", "Paystack", "Success"` | ✅ `expenses` + `analytics` + `debtors` |
| `app/admin/analytics/page.tsx` | inline (L61, comment: *"Mock Chart Area"*) | Fake charts | ✅ `analytics` (5 endpoints) |
| `app/admin/support/page.tsx` | `tickets` (L18) | `CMP-2002, "Overcharging for frames", "Critical"` | ⚠️ `feedback` only, no ticketing |
| `app/admin/config/drugs/page.tsx` | `drugItems` (L14) | `DRG-001 Ciprofloxacin, stock: 1240, "$15.00"` | ✅ `drugs` (9 endpoints) |
| `app/admin/config/frames/page.tsx` | `frameItems` (L14) | Fake frame catalogue | ✅ `products`/`optical` |
| `app/admin/config/lenses/page.tsx` | `lensItems` (L14) | Fake lens catalogue | ✅ `products`/`optical` |

### A2. Admin config — remaining (3 files)

| File | Mock symbol | Backend ready? |
|---|---|---|
| `app/admin/config/workflows/page.tsx` | `workflowItems` (L14) | ⚠️ Partial — `settings` category |
| `app/admin/config/templates/page.tsx` | `templateItems` (L14) | ⚠️ Partial — `settings` bulk |
| `app/admin/config/page.tsx` | `configModules` (L15) | ⚠️ Partial — module nav, could be static |

### A3. Admin/other settings (1 file)

| File | Mock symbol | Backend ready? |
|---|---|---|
| `app/admin/settings/page.tsx` | `integrations` (L17) | ⚠️ Partial — `settings` module |

### A4. Reception + clinic (2 files)

| File | Mock symbols | Backend ready? |
|---|---|---|
| `app/reception/dashboard/page.tsx` | `stats` (L17), `todayAppointments` (L24), `queueItems` (L31), `hmoPendingList` (L37) — **639 lines, 4 mock arrays** | ✅ `dashboard`, `queue`, `appointments`, `hmo` |
| `app/clinic/pharmacy/page.tsx` | `// --- MOCK DATA ---` (L64) | ✅ `drugs`, `suppliers` |

### A5. Support pages — 4 of 6 (4 files)

| File | Mock symbols | Backend ready? |
|---|---|---|
| `app/nurse/support/page.tsx` | 2 arrays | ⚠️ `feedback` only |
| `app/optician/support/page.tsx` | 2 arrays | ⚠️ `feedback` only |
| `app/pharmacy/support/page.tsx` | 2 arrays | ⚠️ `feedback` only |
| `app/clinic/support/page.tsx` | 3 arrays | ⚠️ `feedback` only |

---

## Category B — Hybrid: API Wired BUT Mock Also Rendered (6 files)

**Highest-risk category** — user sees real API data *and* fake data mixed, or the mock shadows the real fetch.

| File | Mock symbol | Risk |
|---|---|---|
| `app/clinic/optical/page.tsx` | `initialFrames` (L46), `initialLensPricing` (L63), `initialProductionItems` (L72), `initialSalesData` (L78) | **4 mock arrays** fed into `useState` (L108–111) — never overwritten by API |
| `app/clinic/hmo-advanced/appeals/page.tsx` | `LOCAL_APPEALS_KEY = "vemtap-hmo-appeals"` | Persists to `localStorage` (L54, L61). **`GET /hmo/appeals` exists and works — page ignores it** |
| `app/reception/documents/page.tsx` | `runMockScan()` (L55) | See Category C |
| `app/nurse/treatment/page.tsx` | `mockToBackend` (L22) | **Not mock data** — misnamed field-mapping map (`General→general`). Naming only |
| `app/patient/profile/page.tsx` | — | `localStorage` at L36 is **logout cleanup** (`removeItem("patient-portal-storage")`), not fake persistence. ✅ No issue |

---

## Category C — Simulated Server Actions (3 files)

These **fake the appearance of backend work**. Most misleading of all.

### C1. `app/reception/documents/page.tsx` — Fakes document OCR

```tsx
const runMockScan = () => {
  setScanState("scanning");
  setTimeout(() => {                                    // 1.4s fake delay
    setScanState("complete");
    setAttachments(current => [{
      name: `${documentType.replaceAll(" ","_")}_scan.jpg`,
      status: "OCR complete",                          // ← claims OCR ran
      size: "1.8 MB",
      ...current,
    }]);
    showToast(`${documentType} scanned & OCR extracted`);
  }, 1400);
};
```

Also `handleSaveData()` → toast *"Extracted data saved to patient record"* — **saves nothing**. `handleUpload()` → appends a fake 0.9 MB row.

**No OCR service exists. No object storage exists.** ✅ `patient-documents` + `file-upload` endpoints exist but are never called.

### C2. `app/doctor/workspace/_components/ImagingGallery.tsx` — Fakes scan images

```tsx
// Mock data for scan images        ← L11, explicit comment
const mockScans = [ ... ];          // L12
```

### C3. `components/popups/onboarding-modal.tsx` — Fakes API call

```tsx
// Mock API call                    ← L43, explicit comment
```

---

## Category D — UI Config Constants ✅ NO ACTION

These matched the array heuristic but are **legitimate static config** (filter options, enum lists, tab labels). Not mock data.

| File | Constant | Purpose |
|---|---|---|
| `app/reception/queue/page.tsx` | `stationFilters` (L33) | Station filter tabs |
| `app/reception/appointments/page.tsx` | `purposeOptions` (L26) | Visit-purpose dropdown |
| `app/patient/optical/catalogue/page.tsx` | `categories` (L11) | `["All","Frames","Lenses"]` |
| `app/optician/production/page.tsx` | `stageOrder` (L25) | Production stage enum |
| `app/clinic/branches/page.tsx` | `branchTabs` (L41) | Tab labels |
| `app/clinic/hmo-advanced/claims/page.tsx` | `claimStatuses` (L28) | Status enum |
| `app/patient/appointments/page.tsx` | `APPOINTMENT_TYPES`, `BRANCHES`, `TIME_SLOTS` | Form options |
| `app/optician/settings/page.tsx` | `settingsSections` (L12) | Settings nav |
| `app/doctor/settings/availability/page.tsx` | `days` (L15) | Day names |
| `app/clinic/page.tsx` + 5 role `layout.tsx` | nav arrays | Sidebar links |

> `patient/appointments` `BRANCHES` and `TIME_SLOTS` *should* come from the `branches` + `appointments/available-slots` APIs, but they're form scaffolding rather than displayed records — lower priority.

---

## Category E — Intentional Marketing Mockups ✅ NO ACTION

Decorative UI mockups on the landing page. Clearly intentional.

| File | Note |
|---|---|
| `components/sections/hero.tsx` (L64) | *"Dashboard Mockup"* |
| `components/sections/hmo-management.tsx` (L17) | *"Analytics Dashboard Mockup"* |
| `components/sections/optical-workflow.tsx` (L67) | *"Optical Dashboard Mockup"* |
| `components/sections/patient-check-in.tsx` (L53) | *"Phone Mockup"* |
| `components/sections/ocr-automation.tsx` (L13) | *"OCR Animation Mockup"* |
| `components/sections/trust.tsx` | Static trust badges |
| `app/faq`, `app/pricing`, `app/blog`, `app/industries`, `app/about` | Static content |

---

## Corrected Findings

Two items from the previous gap analysis need revision:

| Previous claim | Correction |
|---|---|
| "`patient/profile` — profile edits via localStorage" | ❌ **Wrong.** L36 is logout cleanup only. Page is properly integrated |
| "`hooks/useSocket.ts`, `lib/currency.ts` — localStorage" | ⚠️ **Overstated.** These cache runtime state (socket session, FX rates), not user records. Low priority |

---

## Priority Order

### Tier 1 — Misleading (fake server behaviour)
1. `reception/documents` — fake OCR + fake upload + fake save toast
2. `doctor/workspace/ImagingGallery` — fake scans
3. `components/popups/onboarding-modal` — fake API call

### Tier 2 — Backend ready, wiring only (highest ROI)
4. `reception/dashboard` — 4 mock arrays, all 4 APIs exist
5. `admin/finance` → `expenses` + `analytics` + `debtors`
6. `admin/analytics` → `analytics`
7. `admin/config/drugs` → `drugs`
8. `clinic/hmo-advanced/appeals` → drop localStorage, use `GET /hmo/appeals`
9. `clinic/optical` — replace 4 `initial*` arrays with `optical`/`products` API
10. `clinic/pharmacy` → `drugs` + `suppliers`

### Tier 3 — Partial backend
11. 6 support pages → `feedback` API (no ticketing workflow yet)
12. 3 admin/config pages → `settings` bulk/category
13. `admin/settings` → `settings`

### Tier 4 — Blocked on new backend
14. `admin/clinics`, `admin/clinics/[id]` — needs `clinies` module
15. `admin/dashboard` clinic list — needs clinics module

### Tier 5 — Low priority
16. `patient/appointments` BRANCHES + TIME_SLOTS → live APIs

---

## Files Confirmed Clean

No mock data, fully API-integrated (55 pages): cashier (all 4), reception appointments/check-in/billing/documents/patients/tasks, doctor (appointments/dashboard/patients/queue/records/workspace), nurse (dashboard/eye-tests/followups/monitoring/patients/treatment), optician (dashboard/inventory/orders/production/sales), pharmacy (dashboard/dispensing/inventory/prescriptions/suppliers), clinic (15 pages), patient portal (8 pages), admin/security.

**Backend:** all 33 modules return real TypeORM queries. Only 2 empty returns, both legitimate — `queue.service.ts:48` (null when queue empty), `clinical-reporting.service.ts:136` (no data).