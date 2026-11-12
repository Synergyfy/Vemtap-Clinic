# AGENTS.md — Vemtap Health Clinic

## Layout & stack

- pnpm 10 + Turborepo monorepo. Workspace packages are named `api` (`apps/api`, NestJS 11) and `web` (`apps/web`, **Next.js 15.5** App Router). `README.md` is create-next-app boilerplate and some docs say Next 16 — `apps/web/package.json` is the truth.
- `pnpm-workspace.yaml` includes `packages/*`, but no `packages/` directory exists yet.
- PostgreSQL via TypeORM. 64 entity files in `apps/api/src/entities/`; every entity has `clinicId` except `Clinic` itself.
- Web is a client-side app (no API routes). Data flow per feature: `services/*.service.ts` → `hooks/use*.ts` (TanStack Query) → page under `apps/web/app/{admin|clinic|doctor|nurse|optician|pharmacy|reception|cashier|patient}/...`. Add features in all three layers; role names → routes live in `apps/web/lib/dashboard-routes.ts`.

## Commands

Run from the repo root unless noted.

- Install once: `pnpm install` (Node ≥20, pnpm ≥10).
- `pnpm dev` starts **web only** (:3000): Turbo runs the `dev` task, and `apps/api` defines no `dev` script, so the API is silently skipped. Start it separately with `pnpm --filter api start:dev` (:3001, watch mode).
- API typecheck == build: `cd apps/api && npx nest build` (also the required pre-commit check).
- Web **silently ignores TS and ESLint errors during build** (`next.config.ts`). Always run `cd apps/web && npx tsc --noEmit` to catch type errors; `pnpm build` alone will not.
- `pnpm lint` → `turbo lint`, and turbo's `lint` task `dependsOn: ["^build"]` (deps build first). API lint auto-fixes (`--fix`); web lint does not.
- Format everything: `pnpm format` (Prettier config at repo root).
- API tests (Jest, `*.spec.ts` under `src`, `rootDir: src`): `pnpm --filter api test`; one file: `cd apps/api && npx jest src/patients/patients.service.spec.ts`.
- `pnpm --filter api test:e2e` is broken — `apps/api/test/` does not exist.
- Web has no test script. `apps/web/lib/dashboard-routes.test.ts` uses `node:test` but has no runner wired up. Playwright specs are in `apps/web/e2e`: `cd apps/web && npx playwright test` (config starts the web dev server itself; API must be running for most specs).

## Environment & database

- The API loads `apps/api/.env` via a **relative** `envFilePath: '.env'`, so its cwd must be `apps/api` (turbo handles this). `node dist/main` from the repo root will not load env.
- To boot, set `JWT_SECRET` plus either `DATABASE_URL` or all of `DB_HOST`/`DB_USERNAME`/`DB_PASSWORD`/`DB_DATABASE`. Joi in `apps/api/src/app.config.ts` validates at startup — add every new variable there **and** to `apps/api/.env.example`.
- Web env is `NEXT_PUBLIC_*` with fallback `http://localhost:3001/api`; see `apps/web/.env.example`.
- `NODE_ENV=development` enables TypeORM `synchronize`, SQL logging, and dev seeding. Only 3 migrations exist for 64 entities, so generate a migration for any schema change that must reach production.
- DB CLI runs against `apps/api/src/data-source.ts` (dotenv reads `apps/api/.env`): `pnpm --filter api db:migrate`, `db:push` (= `schema:sync`). `db:generate` requires a path argument the script omits: `pnpm --filter api db:generate src/migrations/AddThing`.
- **`pnpm --filter api db:studio` runs `schema:drop` then `schema:sync` — it wipes the database.** Never point it at shared data.
- Dev seed (`common/dev-seed.service.ts`) runs automatically in development and creates `admin@vemtap.com`, `doctor@vemtap.com`, `nurse@vemtap.com`, etc., all with password `password123`.
- Uploads go to `./uploads` relative to the API cwd (override with `UPLOAD_DIR`) — normally `apps/api/uploads/`, gitignored. Cloudinary is used when `FILE_STORAGE_PROVIDER=cloudinary`.

## API conventions that matter

- Global prefix `api`; Swagger at `/api/docs`; port 3001 (`main.ts`).
- Global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` + implicit conversion: unknown body/query fields are **400 errors**. Use class-validator DTOs; all DTOs for a module live in `dto/index.ts`.
- Auth is bearer access token + httpOnly refresh cookie `vemtap_refresh_token` (`POST /api/auth/refresh`). There is **no global guard**: add `@UseGuards(JwtAuthGuard, RolesGuard)` per controller. Only `health` and `POST /api/demo-requests` (public booking form) are intentionally unauthenticated; `GET /api/demo-requests` is admin-only.
- `RolesGuard` lets `super_admin`, `clinic_admin`, and `admin` through every role-gated route regardless of `@Roles(...)`.
- `@CurrentUser()` returns a sanitized object (strips password/tokens/relations) with `sub`/`userId`, `roles`, `clinicId`, `branchId`, `type` (`user` | `patient`).
- Patient-portal tokens carry `type: 'patient'` and are validated against `patients.portalAccessEnabled`, not the `users` table (`auth/strategies/jwt.strategy.ts`). Patient sessions use their own pair: access token (`PATIENT_ACCESS_EXPIRES_IN`, default 1h) + httpOnly `vemtap_patient_refresh_token` cookie (7d), renewed by the public `POST /api/patient-portal/refresh`. They do **not** use the staff `/auth/refresh` cookie — `apps/web/lib/api.ts` branches on the request URL for this.
- Family/dependents: invitations persist in the `patient_family_invitations` table (they previously lived in memory and died on restart). `POST /api/patient-portal/family/invite` creates the dependent `patients` row immediately (`portalAccessEnabled: false`) so the guardian can switch to that profile right away, and sends **no** email unless `sendInvite: true` is passed. The activation email is triggered explicitly with `POST /api/patient-portal/family/:patientId/invite` (the "Send invite" button); it only lets the dependent set a password and enable their own login. `GET /api/patient-portal/family` returns the guardian, all dependents (active or not), and any legacy pending invites. Profile switching uses the `X-Patient-Id` header, validated by `resolvePatientId` (`common/patient-profile-access.ts`) against the family group; `apps/web/lib/api.ts` sends it from `localStorage.vemtap_active_profile`. Every patient-scoped read honours it — `profile`, `memberships`, `appointments`, `records`, `billing`, `optical/lens-orders` under `patient-portal`, plus `/notifications` (which resolves the same way for `patient` tokens). On the web side, all `usePatient*` query keys include the active profile id (`useSyncExternalStore` over `vemtap:active-patient-profile-changed`), so switching refetches rather than reusing the previous patient's cache.
- Notifications: one row per recipient (`userId` for staff, `patientId` for a family profile). `NotificationsService.create` stores + emits; `notifyUserIds` / `notifyClinicRoles(clinicId, roles)` / `notifyAssignedStaff(staffId)` / `notifySuperAdmins` fan out to every matching active user, so read state stays per person. Realtime is a socket.io namespace `/notifications`: staff join `user-<id>` (and their clinic room via `joinNotifications`, validated against the JWT), patients join `patient-<id>` and re-subscribe to the selected family profile with `joinPatientProfile` (family-group validated). The gateway verifies tokens with `JwtModule` + `JWT_SECRET`; it must stay registered in `NotificationsModule` or every socket disconnects. Alerts are best-effort — never let them fail the business action. `/notifications` endpoints are self-scoped (no `@Roles`, ownership checked), and the web client normalizes `isRead` → `read`.
- Multi-tenancy: services force `clinicId` from `@CurrentUser()` and must not trust `clinicId` in body/query. `patients` is the reference module.
- New entities: add to `entities/index.ts` barrel for conventional imports (TypeORM loads `entities/*.entity{.ts,.js}` by glob, so the barrel is not what registers them). New modules: register in `app.module.ts`.
- Web API client (`apps/web/lib/api.ts`) strips `null`/`undefined` and empty `*Id` strings from request bodies/params before sending. If a query "doesn't filter", check this sanitizer first.

## Security (non-negotiable)

- Secrets only via `ConfigService` / env; never literals, never in `.env.example` (placeholders only).
- Never commit `.env*` (examples excepted), `dist/`, `.next/`, `.turbo/`, `uploads/`.
- Keep `CORS_ORIGIN` configurable (comma-separated list), not hardcoded.
- New env-dependent integrations must fail clearly when their vars are absent — follow the pattern in `EMAIL_PROVIDER` / `FILE_STORAGE_PROVIDER` Joi rules.

## Git workflow (non-negotiable)

- **Ask the user before committing.** Never auto-commit, never push to origin, never merge on GitHub (pull and merge locally only).
- Commit messages: `feat(api): ...` / `fix(api): ...`.
- Documented dev branch is `logic`, but checkouts have used feature branches (e.g. `Jay`); confirm with `git branch --show-current`.

## Feature step order (one commit per step)

1. Entity (+ barrel export) → 2. DTOs → 3. Service → 4. Controller (guards, Swagger) → 5. Module + `app.module.ts` → 6. `npx nest build` + manual Swagger check.

Feature scope references: `vemtap_eye_clinic_complete_master_feature_list.md`, `vemtap_full_hmo_operations_engine_blueprint.md`, `MONOREPO_PLAN.md`.
