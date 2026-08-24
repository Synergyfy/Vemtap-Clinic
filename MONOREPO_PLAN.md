# Vemtap Health — 4-Day Build Plan (NestJS + TypeORM)

## Overview

Convert the existing single Next.js app into a Turborepo monorepo with `apps/api` and `apps/web` in 4 days.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES2020) |
| Language | TypeScript 5.x |
| Framework | NestJS 10.x |
| ORM | TypeORM 0.3.x |
| Database | PostgreSQL (via pg driver) |
| Auth | Passport + JWT (@nestjs/passport, @nestjs/jwt, passport-jwt) |
| Validation | class-validator + class-transformer |
| API Docs | Swagger (@nestjs/swagger 11.x) |
| Email | Nodemailer |
| Security | Helmet, @nestjs/throttler (rate limiting), HttpOnly cookies |
| Health | @nestjs/terminus |
| Testing | Jest + Supertest |
| Dev Server | ts-node-dev |
| Config | @nestjs/config + dotenv + Joi |
| Frontend | Next.js 16 (existing) |
| Monorepo | Turborepo |

---

## Day 1 — Monorepo + Database + Auth (Core Foundation)

### Morning (4 hrs)

| # | Task | Details |
|---|------|---------|
| 1 | Initialize Turborepo | Root `package.json` with workspaces, `turbo.json`, `.gitignore` |
| 2 | Create `apps/api` | NestJS scaffold via `@nestjs/cli`, configure TypeScript, ts-node-dev |
| 3 | Create `apps/web` | Move existing Next.js code into `apps/web/`, update path aliases |
| 4 | Create `packages/types` | Shared TypeScript types/interfaces for all entities |
| 5 | Install NestJS deps | `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/swagger`, `@nestjs/health`, `@nestjs/throttler`, `helmet`, `class-validator`, `class-transformer` |

### Afternoon (4 hrs)

| # | Task | Details |
|---|------|---------|
| 6 | Set up TypeORM | Install TypeORM + pg driver, configure `TypeOrmModule.forRoot()` in `app.module.ts` |
| 7 | Create entities | All TypeORM entities with decorators (see entity list below) |
| 8 | Auth module | `AuthModule` with Passport + JWT strategy, `JwtStrategy`, `LocalStrategy` |
| 9 | Auth endpoints | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| 10 | Auth guards | `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator |
| 11 | Database migration | Run sync, create seed script with sample users |

### TypeORM Entities (Day 1)
```typescript
// Core
User, Role, Clinic, Branch, Patient, Staff,

// Clinical
Appointment, QueueEntry, QueueStation, QueueRoom,
MedicalRecord, EyeTest, Vitals, Consultation,

// Pharmacy
Drug, Prescription, PrescriptionItem, DispensingRecord, Supplier, PurchaseOrder,

// Optical
LensOrder, OpticalInventory, OpticalProduction,

// Billing
Product, Invoice, InvoiceItem, Payment,

// HMO
HMO, HMOAgreement, HMOClaim, HMORemittance, HMOAppeal,

// System
Notification, PatientDocument
```

### NestJS Module Structure (Day 1)
```
src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap with Swagger, Helmet, CORS, Throttler
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts     # /auth/* endpoints
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── config/
│   └── configuration.ts       # Joi validation for env vars
├── health/
│   └── health.module.ts       # @nestjs/terminus health checks
└── entities/                  # All TypeORM entities
```

### End of Day Checklist
- [ ] `turbo dev` runs both apps
- [ ] NestJS app starts with Swagger UI at `/api/docs`
- [ ] TypeORM connected to PostgreSQL, entities synced
- [ ] Auth endpoints work (register, login, refresh, logout, me)
- [ ] JWT tokens generated and verified via Passport
- [ ] Roles guard blocks unauthorized access
- [ ] Health check endpoint responds at `/api/health`
- [ ] Seed script creates sample users

---

## Day 2 — Core Entity CRUD + Validation

### Morning (4 hrs)

| # | Task | Module | Details |
|---|------|--------|---------|
| 1 | Patients CRUD | `PatientsModule` | `GET /patients` (list+search+pagination), `GET /patients/:id`, `POST /patients`, `PUT /patients/:id`, `DELETE /patients/:id` |
| 2 | Staff CRUD | `StaffModule` | `GET /staff`, `GET /staff/:id`, `POST /staff`, `PUT /staff/:id`, `DELETE /staff/:id` |
| 3 | Branches CRUD | `BranchesModule` | `GET /branches`, `POST /branches`, `PUT /branches/:id`, `DELETE /branches/:id` |
| 4 | DTOs + Validation | All modules | Create DTOs with `class-validator` decorators (`@IsString`, `@IsEmail`, `@IsOptional`, etc.) |

### Afternoon (4 hrs)

| # | Task | Module | Details |
|---|------|--------|---------|
| 5 | Appointments CRUD | `AppointmentsModule` | `GET /appointments` (filter by date/status/doctor), `POST /appointments`, `PUT /appointments/:id`, `DELETE /appointments/:id` |
| 6 | Queue CRUD | `QueueModule` | `GET /queue`, `POST /queue`, `PUT /queue/:id`, `DELETE /queue/:id` |
| 7 | Medical Records | `RecordsModule` | `GET /patients/:id/records`, `POST /patients/:id/records`, `PUT /records/:id` |
| 8 | Eye Tests + Vitals | `RecordsModule` | `GET/POST /patients/:id/eye-tests`, `GET/POST /patients/:id/vitals` |
| 9 | Global filters | — | `AllExceptionsFilter` for consistent error responses |

### NestJS Module Structure (Day 2)
```
src/
├── patients/
│   ├── patients.module.ts
│   ├── patients.controller.ts
│   ├── patients.service.ts
│   └── dto/
│       ├── create-patient.dto.ts
│       └── update-patient.dto.ts
├── staff/
│   ├── staff.module.ts
│   ├── staff.controller.ts
│   ├── staff.service.ts
│   └── dto/
├── branches/
│   ├── branches.module.ts
│   ├── branches.controller.ts
│   ├── branches.service.ts
│   └── dto/
├── appointments/
│   ├── appointments.module.ts
│   ├── appointments.controller.ts
│   ├── appointments.service.ts
│   └── dto/
├── queue/
│   ├── queue.module.ts
│   ├── queue.controller.ts
│   ├── queue.service.ts
│   └── dto/
└── records/
    ├── records.module.ts
    ├── records.controller.ts
    ├── records.service.ts
    └── dto/
```

### End of Day Checklist
- [ ] Patient CRUD works with search and pagination
- [ ] Staff CRUD works with role filtering
- [ ] Branches CRUD works
- [ ] Appointments with status workflow (scheduled → confirmed → in-progress → completed)
- [ ] Queue management works (add, assign station, complete)
- [ ] Medical records, eye tests, vitals linked to patients
- [ ] class-validator returns proper 400 errors
- [ ] Swagger docs auto-generated for all endpoints
- [ ] Seed script populates all tables

---

## Day 3 — Domain Modules (Pharmacy + Optical + Billing + HMO)

### Morning (4 hrs)

| # | Task | Module | Details |
|---|------|--------|---------|
| 1 | Drugs CRUD | `DrugsModule` | `GET /drugs` (search, filter by category), `POST /drugs`, `PUT /drugs/:id`, `DELETE /drugs/:id` |
| 2 | Prescriptions | `PrescriptionsModule` | `GET /prescriptions`, `POST /prescriptions` (with items), `GET /prescriptions/:id` |
| 3 | Dispensing | `PrescriptionsModule` | `PUT /prescriptions/:id/dispense` (update drug stock) |
| 4 | Suppliers + POs | `SuppliersModule` | `GET/POST /suppliers`, `GET/POST /purchase-orders`, `PUT /purchase-orders/:id/receive` |
| 5 | Lens Orders | `OpticalModule` | `GET /lens-orders`, `POST /lens-orders`, `PUT /lens-orders/:id` (status: ordered → in-production → ready → dispensed) |
| 6 | Optical Inventory | `OpticalModule` | `GET /optical-inventory`, `POST /optical-inventory`, `PUT /optical-inventory/:id` |

### Afternoon (4 hrs)

| # | Task | Module | Details |
|---|------|--------|---------|
| 7 | Products (POS) | `ProductsModule` | `GET /products`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` |
| 8 | Invoices | `BillingModule` | `GET /invoices`, `POST /invoices` (with items), `GET /invoices/:id` |
| 9 | Payments | `BillingModule` | `POST /invoices/:id/pay` (full and partial payments) |
| 10 | HMOs | `HmoModule` | `GET /hmos`, `POST /hmos`, `PUT /hmos/:id` |
| 11 | HMO Agreements | `HmoModule` | `GET /hmos/:id/agreements`, `POST /hmos/:id/agreements` |
| 12 | HMO Claims | `HmoModule` | `GET /hmo-claims`, `POST /hmo-claims`, `PUT /hmo-claims/:id` (status: draft → submitted → under-review → approved/rejected) |
| 13 | HMO Remittances | `HmoModule` | `GET /hmo-remittances`, `POST /hmo-remittances` |

### NestJS Module Structure (Day 3)
```
src/
├── drugs/
│   ├── drugs.module.ts
│   ├── drugs.controller.ts
│   ├── drugs.service.ts
│   └── dto/
├── prescriptions/
│   ├── prescriptions.module.ts
│   ├── prescriptions.controller.ts
│   ├── prescriptions.service.ts
│   └── dto/
├── suppliers/
│   ├── suppliers.module.ts
│   ├── suppliers.controller.ts
│   ├── suppliers.service.ts
│   └── dto/
├── optical/
│   ├── optical.module.ts
│   ├── optical.controller.ts
│   ├── optical.service.ts
│   └── dto/
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── dto/
├── billing/
│   ├── billing.module.ts
│   ├── billing.controller.ts
│   ├── billing.service.ts
│   └── dto/
└── hmo/
    ├── hmo.module.ts
    ├── hmo.controller.ts
    ├── hmo.service.ts
    └── dto/
```

### End of Day Checklist
- [ ] Drug inventory with search works
- [ ] Prescriptions created with line items
- [ ] Dispensing updates stock levels
- [ ] Supplier and PO management works
- [ ] Lens order lifecycle works
- [ ] Optical inventory tracked
- [ ] POS product catalog works
- [ ] Invoices created with items and totals
- [ ] Payments recorded (full and partial)
- [ ] HMO claims with status workflow
- [ ] HMO agreements linked to HMOs
- [ ] Remittances tracked

---

## Day 4 — Frontend Integration + Polish

### Morning (4 hrs)

| # | Task | Details |
|---|------|---------|
| 1 | API client | Create `apps/web/src/lib/api.ts` with fetch/axios, auth interceptor, token refresh, HttpOnly cookie handling |
| 2 | Environment vars | Add `.env.local` with `NEXT_PUBLIC_API_URL`, update `next.config.ts` |
| 3 | Auth pages | Wire `/login`, `/register`, `/forgot-password` to API endpoints |
| 4 | Auth store | Update Zustand auth state to use JWT tokens from API |
| 5 | Patient store | Replace mock data in `patientStore.ts` with API calls |
| 6 | Queue store | Replace mock data in `queueStore.ts` with API calls |

### Afternoon (4 hrs)

| # | Task | Details |
|---|------|---------|
| 7 | POS store | Replace mock data in `posStore.ts` with API calls |
| 8 | Pharmacy store | Replace mock data in `pharmacy-store.ts` with API calls |
| 9 | Optician store | Replace mock data in `optician-store.ts` with API calls |
| 10 | Error handling | Toast notifications for API errors, loading spinners |
| 11 | CORS config | Configure CORS for production domain |
| 12 | Rate limiting | Verify `@nestjs/throttler` configured properly |
| 13 | API docs | Verify Swagger at `/api/docs` covers all endpoints |
| 14 | Final testing | Test all flows end-to-end, fix bugs |

### End of Day Checklist
- [ ] Login/register works against real API
- [ ] JWT tokens stored and refreshed (HttpOnly cookies)
- [ ] All frontend pages load real data from API
- [ ] Mock data files deleted
- [ ] Error toasts show on API failures
- [ ] Loading states work during fetch
- [ ] CORS configured
- [ ] Swagger docs complete
- [ ] All flows tested end-to-end

---

## Daily Time Estimate

| Day | Hours | Focus |
|-----|-------|-------|
| 1 | 8-10 | Foundation (Turborepo, NestJS, TypeORM, Auth) |
| 2 | 8-10 | Core CRUD (patients, staff, appointments, queue, records) |
| 3 | 8-10 | Domain (pharmacy, optical, billing, HMO) |
| 4 | 8-10 | Frontend integration + polish |
| **Total** | **32-40** | |

---

## Post-4-Day Follow-ups

| Feature | Priority | Est. Time |
|---------|----------|-----------|
| Email service (Nodemailer) | High | 1 day |
| Reporting/Analytics endpoints | High | 2-3 days |
| Notification system | Medium | 1-2 days |
| File uploads (patient docs) | Medium | 1 day |
| Multi-branch data isolation | Medium | 1-2 days |
| Unit tests (Jest + Supertest) | High | 3-4 days |
| CI/CD pipeline | Medium | 1 day |
| Docker + docker-compose | Low | 1 day |
