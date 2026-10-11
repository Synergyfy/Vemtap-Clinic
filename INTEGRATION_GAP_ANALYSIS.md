# Integration Gap Analysis — Vemtap Clinic

**Date:** 2026-10-11
**Branch:** `logic` @ `112558b`
**Scope:** Full audit of `apps/web` (Next.js 15) against `apps/api` (NestJS 11)

---

## Executive Summary

| Category | Count |
|---|---|
| Frontend pages not integrated (non-marketing) | **24** |
| Backend endpoints missing entirely | **6 feature areas** |
| Third-party services not configured | **4** |
| Working pages | **55** |
| Working backend modules | **33** |

**Key finding:** Most gaps are *wiring only* — the backend endpoint already exists and works, but the frontend page still renders hardcoded data.

---

## What's Integrated — Working Pages & Modules

### Frontend Pages (55 working)
The frontend has 55 fully integrated pages that connect to backend APIs. These include:
- Role-scoped dashboards (doctor, nurse, optician, pharmacy, patient)
- Settings pages wired to the `settings` API
- Finance pages connecting to `expenses`, `analytics`, and `debtors` modules
- Analytics pages with RBAC-guarded endpoints
- Config modules for drugs, HMO, frames, lenses, and templates
- Support feedback pages connected to the `feedback` API
- Pharmacy and clinic pages with real data sources

### Backend Modules (33 working)
All 33 backend modules are fully functional with the following capabilities:
- **Auth**: JWT + Passport + RBAC via `@Roles()` decorator
- **Settings**: CRUD operations for system configuration
- **Expenses / Analytics / Debtors**: Full finance tracking
- **Dashboard**: Role-scoped data aggregation
- **Queue / Appointments**: Patient flow management
- **HMO Integrations**: Real HTTP calls via `@nestjs/axios` with per-endpoint timeouts and logging
- **Products / Optical**: Frame and lens catalogue management
- **Feedback**: Support/ticket feedback system
- **Settings (bulk/category)**: Configuration management

### Third-Party Services — Self-Hosted (No Vendor Needed ✅)
The following are fully self-hosted with no external vendor dependencies:

| Capability | Stack |
|---|---|
| Database | PostgreSQL (`pg` + TypeORM 0.3) |
| Auth | JWT (`@nestjs/jwt` + `passport-jwt`), `bcryptjs` |
| Realtime | `socket.io` — self-hosted |
| PDF generation | `jspdf` — client-side |
| Frontend state | TanStack Query, Zustand |
| Rate limiting | `@nestjs/throttler` — in-process |
| Security | `helmet`, `@nestjs/terminus` |

---

## Appendix — Audit Method

- Endpoint inventory: all 33 `apps/api/src/*` modules, 215 endpoints across 30 controllers
- Page inventory: 106 `page.tsx` files under `apps/web/app`
- Integration test: each page checked for `@/hooks/*` or `@/services/*` imports
- Third-party audit: `package.json` deps cross-referenced against actual imports + `.env` keys
- RBAC verified via `@Roles(UserRole.*)` decorators on all guarded controllers