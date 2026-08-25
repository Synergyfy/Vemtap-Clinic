# AGENTS.md — Vemtap Health Clinic

## Before Every Commit Checklist

### Security (MUST CHECK)
- [ ] No hardcoded secrets, passwords, API keys, or JWT tokens in source code
- [ ] All secrets read from environment variables via `ConfigService`
- [ ] `.env` files are gitignored (`.env*` pattern) and never committed
- [ ] No hardcoded database credentials — use `process.env.DB_PASSWORD` etc.
- [ ] JWT secret uses `config.get<string>('JWT_SECRET')!` not a literal string
- [ ] No `.env.example` with real values — only placeholders
- [ ] CORS origin is configurable, not hardcoded to `localhost`

### Code Quality
- [ ] All new modules have: DTOs with `class-validator`, Service, Controller, Module
- [ ] All controllers use `@UseGuards(JwtAuthGuard, RolesGuard)` on protected routes
- [ ] All admin-only endpoints have `@Roles(UserRole.ADMIN)`
- [ ] All entities have `clinicId` for multi-tenancy
- [ ] All `findOne()` throw `NotFoundException` when not found
- [ ] Build passes: `cd apps/api && npx nest build`

### Feature Alignment
- [ ] Check `vemtap_eye_clinic_complete_master_feature_list.md` for feature scope
- [ ] Check `vemtap_full_hmo_operations_engine_blueprint.md` for HMO requirements
- [ ] Check `MONOREPO_PLAN.md` for implementation plan
- [ ] New entities registered in `entities/index.ts` barrel export
- [ ] New modules registered in `app.module.ts`

## Architecture Notes

- **Monorepo:** Turborepo with `apps/api` (NestJS 11) and `apps/web` (Next.js 16)
- **Database:** PostgreSQL via TypeORM 0.3 — `synchronize: true` in development only
- **Auth:** JWT + Passport + RBAC via `@Roles()` decorator
- **Multi-tenancy:** Every entity has `clinicId` — all queries filter by clinic
- **Config:** `@nestjs/config` with Joi validation — all env vars validated on startup

## File Conventions

```
apps/api/src/
├── {module}/
│   ├── {module}.module.ts       # NestJS module
│   ├── {module}.controller.ts   # REST endpoints
│   ├── {module}.service.ts      # Business logic
│   └── dto/
│       └── index.ts             # All DTOs for the module
├── entities/
│   ├── {entity}.entity.ts       # TypeORM entity
│   └── index.ts                 # Barrel export
├── auth/
│   ├── guards/jwt-auth.guard.ts
│   ├── guards/roles.guard.ts
│   ├── decorators/roles.decorator.ts
│   ├── decorators/current-user.decorator.ts
│   ├── strategies/jwt.strategy.ts
│   └── dto/auth.dto.ts
├── config/
│   ├── app.config.ts            # ConfigModule with Joi
│   └── database.config.ts       # TypeORM config
└── main.ts                      # Bootstrap
```

## Git Workflow

- Branch: `logic` for development
- Commit messages: `feat(api): <description>` or `fix(api): <description>`
- Always build before committing: `cd apps/api && npx nest build`
- Never commit `node_modules/`, `dist/`, `.env`, or `.turbo/`
- **IMPORTANT:** After finishing code changes, ALWAYS ask the user before committing. Never auto-commit.
