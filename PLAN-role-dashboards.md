# Plan: Role-Specific Dashboard Endpoints + Frontend Integration

## Context

The clinic dashboard (Phase 3.6) is done. The other 6 role dashboards (admin, doctor, nurse, pharmacy, optician, patient) still use mock data. The backend has ~210 endpoints but **no role-specific dashboard endpoints** — only a generic `GET /dashboard` that returns clinic-wide aggregates.

**Key finding:** Most dashboard data can be fetched from **existing endpoints** by filtering. The backend already has appointments (filterable by `staffId`), queue, drugs (with `low-stock` endpoint), prescriptions, optical orders, observation-notes, records, etc. We only need a handful of new aggregation endpoints.

**Entity linking pattern:** All entities use `staffId` (not `doctorId`) linking to the generic `Staff` entity. The logged-in user's `userId` maps to a `Staff` record.

---

## Strategy: Reuse Existing + Create Minimal New

| Data Need | Source |
|-----------|--------|
| Doctor's today appointments | `GET /appointments?staffId=X&date=today` (exists) |
| Doctor's queue | `GET /queue?station=consultation` (exists) |
| Doctor's recent records | `GET /records?staffId=X` (exists) |
| Doctor's prescriptions | `GET /prescriptions?prescribedById=X` (exists) |
| Nurse's assigned patients | **NEW:** `GET /observation-notes?staffId=X&date=today` (exists, but needs stats) |
| Nurse's vitals queue | **NEW:** observation notes with category=vitals |
| Pharmacy pending Rx | `GET /prescriptions?isActive=true` (exists) |
| Pharmacy low stock | `GET /drugs/low-stock` (exists) |
| Pharmacy expiring | `GET /drugs` + filter client-side (exists) |
| Optician lens orders | `GET /optical/lens-orders?status=X` (exists) |
| Optician production | `GET /optical/production?stage=X` (exists) |
| Optician sales | `GET /optical/sales` (exists) |
| Patient appointments | `GET /patient-portal/appointments` (exists) |
| Patient billing | `GET /patient-portal/billing` (exists) |
| Admin stats | **NEW:** `GET /admin/stats` |

---

## Execution Plan — 8 Steps

### Step 1: Doctor Dashboard — Service + Hooks (Frontend Only)
**No new backend endpoints needed.** Reuse existing endpoints.

Create:
- `apps/web/services/doctor-dashboard.service.ts` — wraps existing appointment, queue, records, prescriptions services filtered by logged-in doctor
- `apps/web/hooks/useDoctorDashboard.ts` — React Query hooks

Data mapping:
- Stat cards: compute from `GET /appointments?staffId=X&date=today` (count = patients seen)
- Consultation queue: `GET /queue` (filter by station)
- Today's schedule: `GET /appointments?staffId=X&date=today`
- Recent consultations: `GET /records?staffId=X&limit=5`
- Pending follow-ups: `GET /prescriptions?prescribedById=X&isActive=true`

**Test:** Build passes, hooks return data shapes matching page expectations.

---

### Step 2: Doctor Dashboard — Refactor Page
Refactor `app/doctor/dashboard/page.tsx`:
- Remove mock imports from `doctor/_mock/doctor-data.ts`
- Wire stat cards to appointment count
- Wire queue table to queue API
- Wire schedule list to appointments API
- Wire recent consultations to records API
- Wire follow-ups to prescriptions API

**Test:** `pnpm run build` + `npx tsc --noEmit` pass. Page renders with loading states.

---

### Step 3: Nurse Dashboard — Service + Hooks + Refactor
Backend needs: observation-notes already has `staffId` and `category` fields.

Create:
- `apps/web/services/nurse-dashboard.service.ts`
- `apps/web/hooks/useNurseDashboard.ts`

Data mapping:
- Stat cards: compute from observation-notes filtered by staffId + date
- Assigned patients: observation-notes with category=general/treatment
- Pending vitals: observation-notes with category=vitals
- Active alerts: (new observation-note category or use existing)
- Follow-ups: observation-notes with category=follow_up
- Recent observations: observation-notes filtered by staffId, limit=5

Refactor `app/nurse/dashboard/page.tsx`:
- Remove `useNurseStore` mock store
- Wire to API hooks

**Test:** Build + TS pass.

---

### Step 4: Pharmacy Dashboard — Service + Hooks + Refactor
Backend needs: drugs (low-stock endpoint exists), prescriptions (exists).

Create:
- `apps/web/services/pharmacy-dashboard.service.ts`
- `apps/web/hooks/usePharmacyDashboard.ts`

Data mapping:
- Active Rx count: `GET /prescriptions?isActive=true` (count)
- Low stock: `GET /drugs/low-stock` (exists)
- Expiring soon: `GET /drugs` + filter `expiryDate` within 3 months
- Pending prescriptions: `GET /prescriptions?isActive=true&limit=5`
- Drug items count: `GET /drugs` (count from paginated response)

Refactor `app/pharmacy/dashboard/page.tsx`:
- Remove `usePharmacyStore` mock store
- Wire to API hooks

**Test:** Build + TS pass.

---

### Step 5: Optician Dashboard — Service + Hooks + Refactor
Backend needs: lens-orders, production, inventory, sales (all exist).

Create:
- `apps/web/services/optician-dashboard.service.ts`
- `apps/web/hooks/useOpticianDashboard.ts`

Data mapping:
- Pending lens orders: `GET /optical/lens-orders?status=pending,processing`
- Production queue: `GET /optical/production?stage!=ready_for_pickup,completed`
- Ready for pickup: `GET /optical/production?stage=ready_for_pickup`
- Inventory alerts: `GET /optical/inventory` + filter low stock
- Recent sales: `GET /optical/sales?limit=2&sort=createdAt`

Refactor `app/optician/dashboard/page.tsx`:
- Remove `useOpticianStore` mock store
- Wire to API hooks

**Test:** Build + TS pass.

---

### Step 6: Patient Dashboard — Service + Hooks + Refactor
Backend needs: patient-portal endpoints (appointments, billing exist).

Create:
- `apps/web/services/patient-dashboard.service.ts`
- `apps/web/hooks/usePatientDashboard.ts`

Data mapping:
- Upcoming appointment: `GET /patient-portal/appointments` (filter status=scheduled)
- Optical orders: `GET /optical/lens-orders` (filter by patient)
- Billing: `GET /patient-portal/billing`
- Notifications: `GET /notifications` (exists)

Refactor `app/patient/dashboard/page.tsx`:
- Remove `usePatientStore` mock store
- Wire to API hooks

**Test:** Build + TS pass.

---

### Step 7: Admin Dashboard — New Backend Endpoint + Frontend
The admin dashboard needs **platform-wide** aggregates (all clinics), which no existing endpoint provides.

**Backend:** Create `GET /admin/stats` endpoint in a new `admin` module:
- Total clinics count
- Active users count
- Monthly revenue (sum across all clinics)
- HMO usage percentage

**Frontend:**
- `apps/web/services/admin-dashboard.service.ts`
- `apps/web/hooks/useAdminDashboard.ts`
- Refactor `app/admin/dashboard/page.tsx`

**Test:** Build + TS pass. Backend endpoint returns correct aggregates.

---

### Step 8: Final Verification + Commit
- Run full `pnpm run build`
- Run `npx tsc --noEmit`
- Update `progress.md`
- Commit each step separately

---

## File Changes Summary

### New Backend Files
| File | Step |
|------|------|
| `apps/api/src/admin/admin.module.ts` | 7 |
| `apps/api/src/admin/admin.controller.ts` | 7 |
| `apps/api/src/admin/admin.service.ts` | 7 |
| `apps/api/src/admin/dto/admin-stats.dto.ts` | 7 |

### New Frontend Files
| File | Step |
|------|------|
| `apps/web/services/doctor-dashboard.service.ts` | 1 |
| `apps/web/hooks/useDoctorDashboard.ts` | 1 |
| `apps/web/services/nurse-dashboard.service.ts` | 3 |
| `apps/web/hooks/useNurseDashboard.ts` | 3 |
| `apps/web/services/pharmacy-dashboard.service.ts` | 4 |
| `apps/web/hooks/usePharmacyDashboard.ts` | 4 |
| `apps/web/services/optician-dashboard.service.ts` | 5 |
| `apps/web/hooks/useOpticianDashboard.ts` | 5 |
| `apps/web/services/patient-dashboard.service.ts` | 6 |
| `apps/web/hooks/usePatientDashboard.ts` | 6 |
| `apps/web/services/admin-dashboard.service.ts` | 7 |
| `apps/web/hooks/useAdminDashboard.ts` | 7 |

### Modified Frontend Files
| File | Step |
|------|------|
| `apps/web/app/doctor/dashboard/page.tsx` | 2 |
| `apps/web/app/nurse/dashboard/page.tsx` | 3 |
| `apps/web/app/pharmacy/dashboard/page.tsx` | 4 |
| `apps/web/app/optician/dashboard/page.tsx` | 5 |
| `apps/web/app/patient/dashboard/page.tsx` | 6 |
| `apps/web/app/admin/dashboard/page.tsx` | 7 |

### Modified Backend Files
| File | Step |
|------|------|
| `apps/api/src/app.module.ts` | 7 (register admin module) |

---

## Commit Strategy
Each step = one commit:
1. `feat(web): Doctor dashboard service + hooks`
2. `feat(web): Doctor dashboard page integration`
3. `feat(web): Nurse dashboard service + hooks + page integration`
4. `feat(web): Pharmacy dashboard service + hooks + page integration`
5. `feat(web): Optician dashboard service + hooks + page integration`
6. `feat(web): Patient dashboard service + hooks + page integration`
7. `feat(api): Admin stats endpoint + feat(web): Admin dashboard integration`
8. `docs: Update progress.md`
