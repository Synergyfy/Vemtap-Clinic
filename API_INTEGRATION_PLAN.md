# API Integration Plan — Vemtap Health Web Frontend

## Current State
- **Frontend**: Fully client-side prototype with 8 Zustand stores, all hardcoded mock data
- **Backend**: 32 NestJS modules, ~210 REST endpoints, JWT + RBAC auth, multi-tenancy
- **Zero backend connectivity**: No HTTP client, no API config, no service layer

---

## Auth System Overview (Updated)

**Backend uses dual-token architecture with HTTP-only cookies:**

| Token | Type | Expiry | Storage | Transport |
|-------|------|--------|---------|-----------|
| Access Token | JWT | 1h | Memory (React state) | `Authorization: Bearer <token>` header |
| Refresh Token | Opaque (48-byte base64url) | 7d | **HTTP-only cookie** (`vemtap_refresh_token`) | Auto-sent to `/api/auth/refresh` |

**Key security features:**
- Refresh token stored as SHA-256 hash in DB, never in plaintext
- Token rotation on each refresh (old revoked, new issued)
- Theft detection: reuse of rotated token → revokes ALL user sessions
- Password change/reset/account deactivation → revokes all sessions
- No user enumeration (dummy bcrypt on missing user)

**Frontend implications:**
- **No localStorage for refresh token** — cookie is HTTP-only
- **Access token in memory** — lost on page refresh, re-fetched via `/api/auth/refresh`
- **All requests need `credentials: 'include'`** — to send/receive cookies
- **No manual refresh logic** — interceptor calls `/api/auth/refresh` on 401, cookie auto-sent

---

## Phase 1: Foundation Layer (Do First)

### Step 1.1 — Environment Config
Create `apps/web/.env.local` and `.env.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Step 1.2 — Install Dependencies
```bash
cd apps/web
pnpm add @tanstack/react-query axios
pnpm add -D @tanstack/react-query-devtools
```

**Why these:**
- `axios` — interceptors for auth token injection, 401 handling, error handling
- `@tanstack/react-query` — server state cache, background refetch, optimistic updates, loading/error states

### Step 1.3 — Create API Client (`lib/api.ts`)
Axios instance with:
- Base URL from `NEXT_PUBLIC_API_URL`
- **`withCredentials: true`** — critical for cookie auth
- Request interceptor: attach `Authorization: Bearer <accessToken>` from memory (React state)
- Response interceptor: on 401, call `POST /api/auth/refresh` (cookie auto-sent); retry original request with new access token; on failure, redirect to `/login`
- Timeout: 30s
- Default headers: `Content-Type: application/json`

### Step 1.4 — Create Auth State (`lib/auth-state.ts`)
**In-memory only (no localStorage):**
- `accessToken: string | null` — JWT in memory
- `user: AuthUser | null` — `{ userId, email, roles[], clinicId }`
- `isAuthenticated: boolean`
- `setAuth(accessToken, user)` / `clearAuth()` — update state
- `getAccessToken()` — for interceptor

### Step 1.5 — Create React Query Provider (`components/providers/query-provider.tsx`)
Wrap app in `QueryClientProvider` with default options:
- `staleTime: 30s`
- `retry: 1`
- `refetchOnWindowFocus: false` for non-critical queries

### Step 1.6 — Create Auth Context (`lib/auth-context.tsx`)
- `AuthProvider` — manages `{ user, isAuthenticated, login(), logout(), register(), checkAuth() }`
- On mount: call `POST /api/auth/refresh` (via axios with `credentials: include`) to restore session; on success, hydrate `accessToken` + `user` in memory
- `login(email, password)` → `POST /api/auth/login` → returns `{ accessToken, user }`; sets access token in memory; cookie auto-set by backend
- `register(...)` → `POST /api/auth/register`
- `logout()` → `POST /api/auth/logout` (cookie auto-sent) → clear in-memory state
- `checkAuth()` → calls `/api/auth/profile` to validate access token

### Step 1.7 — Create Role Guard (`components/auth/role-guard.tsx`)
- `<RoleGuard roles={['admin', 'doctor']}>` — wraps pages, redirects unauthorized users
- Uses `useAuth().user.roles`

### Step 1.8 — Update Root Layout
- Add `<QueryProvider>` and `<AuthProvider>` to `app/layout.tsx`

---

## Phase 2: Auth Module Integration

### Step 2.1 — Login Page (`app/login/page.tsx`)
- Replace mock auth with `POST /api/auth/login`
- On success: store `accessToken` + `user` in memory via `AuthContext`
- Redirect to role-based dashboard after login

### Step 2.2 — Register Page (`app/register/page.tsx`)
- Connect to `POST /api/auth/register`
- After registration, redirect to login

### Step 2.3 — Profile Page
- `GET /api/auth/profile` for current user data
- Logout: `POST /api/auth/logout` (with `credentials: include`), clear in-memory state, redirect to `/login`

### Step 2.4 — Password Change / Reset
- `PUT /api/auth/password` — change password (revokes all sessions, user must re-login)
- `POST /api/auth/reset-password` — reset via email token

### Step 2.5 — Session Restoration (Critical)
- On app load: `AuthProvider` calls `POST /api/auth/refresh` automatically
- Backend reads refresh token from cookie, issues new access token + rotates refresh token
- Frontend stores new access token in memory, updates user
- If refresh fails (401/403): clear state, redirect to `/login`

---

## Phase 3: Core Clinical Modules (One at a Time)

**Strategy**: Pick the simplest module first to validate the pattern, then repeat.

### Step 3.1 — Patients Module
**API Endpoints:** `POST/GET/PUT/DELETE /api/patients`
**Pages affected:** `reception/patients/`, `clinic/patients/`, `patient/`

1. Create `services/patients.service.ts` — CRUD functions using axios
2. Create hooks `hooks/usePatients.ts` — `useQuery`/`useMutation` wrappers
3. Refactor `app/reception/patients/page.tsx` — replace mock data with API calls
4. Refactor `app/clinic/patients/page.tsx`
5. Refactor `app/patient/` pages (patient portal)

### Step 3.2 — Appointments Module
**API Endpoints:** `POST/GET/PUT/DELETE /api/appointments` + `/calendar`, `/today`, `/available-slots`, `/stats`
**Pages affected:** `reception/appointments/`, `clinic/appointments/`, `patient/appointments/`

1. Create `services/appointments.service.ts`
2. Create `hooks/useAppointments.ts`
3. Refactor appointment pages across reception, clinic, patient portals
4. Connect calendar view to `/api/appointments/calendar`

### Step 3.3 — Staff Module
**API Endpoints:** `POST/GET/PUT/DELETE /api/staff`
**Pages affected:** `clinic/staff/`, `admin/`

1. Create `services/staff.service.ts`
2. Create `hooks/useStaff.ts`
3. Refactor staff listing and management pages

### Step 3.4 — Queue Module
**API Endpoints:** `POST/GET/PUT /api/queue` + `/next`, `/stats`, `/announcements`, `/reset`
**Pages affected:** `reception/queue/`, `clinic/queue/`, `queue-display/`

1. Create `services/queue.service.ts`
2. Create `hooks/useQueue.ts`
3. Refactor queue pages
4. **Later (Phase 6):** Connect WebSocket gateways for realtime updates

### Step 3.5 — Branches Module
**API Endpoints:** `POST/GET/PUT/DELETE /api/branches`
**Pages affected:** `clinic/branches/`, `admin/clinics/`

1. Create `services/branches.service.ts`
2. Create `hooks/useBranches.ts`
3. Refactor branch management pages

### Step 3.6 — Dashboard Module
**API Endpoints:** `GET /api/dashboard`, `/revenue`, `/appointments`, `/hmo`
**Pages affected:** All `*/dashboard/` pages

1. Create `services/dashboard.service.ts`
2. Create `hooks/useDashboard.ts`
3. Refactor dashboard pages for each role (admin, clinic, doctor, nurse, reception)

---

## Phase 4: Domain-Specific Modules

### Step 4.1 — Pharmacy (Drugs + Prescriptions)
**API Endpoints:** `/api/drugs`, `/api/prescriptions` (15 endpoints total)
**Pages affected:** `pharmacy/`, `clinic/pharmacy/`

1. Create `services/pharmacy.service.ts` — drugs CRUD, dispensing, deduct, restock
2. Create `services/prescriptions.service.ts`
3. Create `hooks/useDrugs.ts`, `hooks/usePrescriptions.ts`
4. Refactor pharmacy pages, replace `pharmacy-store.ts` mock data
5. Connect dispensing workflow to API

### Step 4.2 — Optical
**API Endpoints:** `/api/optical` (14 endpoints — items, lens orders, production, sales)
**Pages affected:** `optician/`, `clinic/optical/`

1. Create `services/optical.service.ts`
2. Create `hooks/useOptical.ts`
3. Refactor optician pages, replace `optician-store.ts` mock data
4. Connect lens order → production → sale workflow

### Step 4.3 — HMO Module
**API Endpoints:** `/api/hmo` (38 endpoints — plans, agreements, claims, authorizations, batches, documents, appeals, remittances, aging, totals)
**Pages affected:** `clinic/hmo/`, `clinic/hmo-advanced/`, `admin/config/hmo/`

1. Create `services/hmo.service.ts` — largest service file
2. Create `hooks/useHmo.ts`
3. Refactor HMO pages across clinic and admin portals
4. Replace `hmoAdvancedStore.ts` mock data
5. Connect claim lifecycle: submit → batch → remittance → aging

### Step 4.4 — Billing
**API Endpoints:** `/api/billing` (7 endpoints — invoices, payments, revenue)
**Pages affected:** `reception/billing/`, `patient/billing/`

1. Create `services/billing.service.ts`
2. Create `hooks/useBilling.ts`
3. Refactor billing pages

### Step 4.5 — Cashier / POS
**API Endpoints:** `/api/cashier` (16 endpoints — shifts, transactions, products)
**Pages affected:** `cashier/`

1. Create `services/cashier.service.ts`
2. Create `hooks/useCashier.ts`
3. Refactor cashier pages, replace `posStore.ts` mock data
4. Connect shift open/close workflow

### Step 4.6 — Medical Records
**API Endpoints:** `/api/records`, `/api/observation-notes` (10 endpoints)
**Pages affected:** `doctor/records/`, `nurse/`

1. Create `services/records.service.ts`
2. Create `hooks/useMedicalRecords.ts`
3. Refactor doctor and nurse pages

---

## Phase 5: Supporting Modules

### Step 5.1 — Notifications
**API Endpoints:** `/api/notifications` (5 endpoints)
- Create `services/notifications.service.ts`
- Create `hooks/useNotifications.ts` — polling every 30s for unread count
- Add notification bell to navbar

### Step 5.2 — Staff Tasks
**API Endpoints:** `/api/staff-tasks` (5 endpoints)
- Create `services/tasks.service.ts`
- Refactor task-related pages

### Step 5.3 — Debtors & Receivables
**API Endpoints:** `/api/debtors` (15 endpoints)
- Create `services/debtors.service.ts`
- Refactor finance/debtor pages

### Step 5.4 — Returns & Refunds
**API Endpoints:** `/api/returns` (14 endpoints)
- Create `services/returns.service.ts`
- Refactor return request pages

### Step 5.5 — Inventory Transfers
**API Endpoints:** `/api/inventory-transfers` (10 endpoints)
- Create `services/transfers.service.ts`
- Refactor transfer pages

### Step 5.6 — Currency
**API Endpoints:** `/api/currency` (8 endpoints)
- Replace `currencyStore.ts` mock with API calls
- Create `hooks/useCurrency.ts`

### Step 5.7 — Products
**API Endpoints:** `/api/products` (6 endpoints)
- Create `services/products.service.ts`
- Refactor product listing pages

### Step 5.8 — Suppliers & Purchase Orders
**API Endpoints:** `/api/suppliers` (9 endpoints)
- Create `services/suppliers.service.ts`
- Refactor supplier pages

### Step 5.9 — Surgery
**API Endpoints:** `/api/surgery` (17 endpoints)
- Create `services/surgery.service.ts`
- Create surgery-related pages if not yet built

### Step 5.10 — Clinical Reporting
**API Endpoints:** `/api/clinical-reporting` (11 endpoints)
- Create `services/reports.service.ts`
- Refactor report pages

### Step 5.11 — File Upload & Patient Documents
**API Endpoints:** `/api/file-upload`, `/api/patient-documents` (9 endpoints)
- Create `services/documents.service.ts`
- Connect file upload UI to API

### Step 5.12 — Audit Logs
**API Endpoints:** `/api/audit-logs` (2 endpoints)
- Create `services/audit.service.ts`
- Refactor admin security/audit pages

### Step 5.13 — Feedback
**API Endpoints:** `/api/feedback` (4 endpoints)
- Create `services/feedback.service.ts`
- Refactor feedback/support pages

---

## Phase 6: Realtime & Advanced

### Step 6.1 — WebSocket Queue Updates
- Install `socket.io-client`
- Create `lib/socket.ts` — connect to `/queue` namespace with `auth: { token: accessToken }`
- `useQueueSocket()` hook — listen for entry updates, call-next, announcements
- Update `queue-display/` pages for realtime TV board

### Step 6.2 — WebSocket Notifications
- Connect to `/notifications` namespace
- Push notifications to UI in real-time
- Update notification bell with live count

### Step 6.3 — HMO External Integrations
- **API Endpoints:** `/api/hmo-integrations` (13 endpoints)
- Create `services/hmo-integrations.service.ts`
- Connect eligibility checks, claim submissions, remittance parsing

### Step 6.4 — Patient Portal Auth
- Separate auth flow: `POST /api/patient-portal/login` / `/register`
- Create `hooks/usePatientAuth.ts`
- Refactor `patient/` pages to use patient-specific API

---

## Phase 7: Polish & Optimization

### Step 7.1 — Remove All Mock Stores
Delete files:
- `store/patientStore.ts`
- `store/posStore.ts`
- `store/currencyStore.ts`
- `store/queueStore.ts`
- `store/hmoAdvancedStore.ts`
- `app/pharmacy/_mock/pharmacy-store.ts`
- `app/pharmacy/_mock/pharmacy-data.ts`
- `app/optician/_mock/optician-store.ts`
- `app/optician/_mock/optician-data.ts`
- `app/nurse/_mock/nurse-store.ts`
- `app/nurse/_mock/nurse-data.ts`
- `app/doctor/_mock/doctor-data.ts`
- `app/clinic/_mock/clinic-data.ts`

### Step 7.2 — Error Handling & Loading States
- Global error boundary component
- Consistent loading skeletons for each page type
- Toast notifications for mutations (success/error)
- 401/403/404/500 error pages

### Step 7.3 — Optimistic Updates
- Queue operations (call next, complete, cancel)
- Patient creation/editing
- Appointment booking
- POS transactions

### Step 7.4 — Pagination & Search
- Server-side pagination for all list endpoints
- Debounced search inputs
- URL-based pagination state (query params)

---

## Service File Pattern

Every service follows this structure:
```typescript
// services/patients.service.ts
import { api } from '@/lib/api';
import type { Patient, CreatePatientDto, UpdatePatientDto, PatientQueryDto } from '@vemtap/types';

export const patientsService = {
  list: (params?: PatientQueryDto) => api.get<Patient[]>('/patients', { params }),
  getById: (id: string) => api.get<Patient>(`/patients/${id}`),
  create: (data: CreatePatientDto) => api.post<Patient>('/patients', data),
  update: (id: string, data: UpdatePatientDto) => api.put<Patient>(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  stats: () => api.get('/patients/stats'),
  hmoPatients: (hmoName: string) => api.get(`/patients/hmo/${hmoName}`),
  hmoEligibility: (id: string, service: string) => api.get(`/patients/${id}/hmo-eligibility`, { params: { service } }),
};
```

Every hook follows this pattern:
```typescript
// hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '@/services/patients.service';

export function usePatients(params?: PatientQueryDto) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsService.list(params),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}
```

---

## Execution Order Summary

| Phase | Steps | Estimated Scope |
|-------|-------|----------------|
| **1. Foundation** | 8 steps | ~10 files to create |
| **2. Auth** | 5 steps | ~8 files to modify |
| **3. Core Clinical** | 6 modules | ~30 files (services + hooks + pages) |
| **4. Domain-Specific** | 6 modules | ~35 files |
| **5. Supporting** | 13 modules | ~40 files |
| **6. Realtime** | 4 steps | ~10 files |
| **7. Polish** | 4 steps | ~15 files modified/deleted |
| **Total** | | ~145 files |

---

## Priority Order (Recommended Start)

1. **Phase 1** — Foundation (must do first, includes cookie-aware axios)
2. **Phase 2** — Auth (everything depends on this, includes session restoration)
3. **Phase 3.1** — Patients (simplest, validates the pattern)
4. **Phase 3.6** — Dashboard (high visibility)
5. **Phase 4.1** — Pharmacy (complex, high value)
6. **Phase 4.5** — Cashier/POS (complex, high value)
7. Continue with remaining modules in any order