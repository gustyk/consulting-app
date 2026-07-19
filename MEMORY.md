# MEMORY.md

## 2026-07-18 — Phase 0.2: Supabase Setup + Dependencies

**Files changed**:
- `.env.example` (force-added, all required vars documented)
- `package.json` (added prisma, @prisma/client, @supabase/supabase-js, @supabase/ssr, zod, react-hook-form, @hookform/resolvers, inngest, exceljs)
- `src/lib/supabase/*`, `src/lib/prisma/*` (client utilities)
- `prisma/schema.prisma` (base schema: roles, permissions, role_permissions, user_roles, profiles, activity_logs)

**Completed**:
- Pushed to GitHub: https://github.com/gustyk/consulting-app.git (branch `main`)
- Installed core deps: Prisma + client, Supabase JS + SSR, Zod, RHF + resolver, Inngest, exceljs
- `prisma/schema.prisma` created with base RBAC + activity_log tables (UUID PKs, soft delete, timestamps)
- Supabase client utilities: browser (anon), server (anon+cookie), admin (service role)
- Prisma client singleton

**Pending (manual — user)**:
- Create Supabase project in console, fill `.env.local` from `.env.example`
- Create storage buckets: clients, proposals, projects, trainings (private)
- Run `npx prisma migrate dev` after `.env.local` is filled

**Tests / checks run**:
- `npm run build` ✓ (all routes compile: /login, /crm, /clients, /proposals, /projects, /finance, /partners, /trainings, /documents, /api/cron/backup, /auth/callback)
- `npm run typecheck` ✓
- `npx prisma generate` ✓

**Completed this pass (0.4–0.8)**:
- Auth: `src/lib/auth/session.ts` (getServerSession), `src/proxy.ts` (Next 16 proxy convention, replaces deprecated middleware)
- RBAC: `src/lib/auth/permissions.ts` (PERMISSIONS map, ROLE_PERMISSIONS, hasPermission), `src/lib/auth/guards.ts` (requirePermission/requireRole/requireUser)
- Activity: `src/lib/activity/log.ts` (logActivity utility)
- Utils: `src/lib/utils/number.ts` (proposal/invoice/project/cert number generators), `src/lib/utils/validation.ts` (shared Zod schemas)
- Inngest: `src/lib/inngest/client.ts`
- Shadcn UI: button, card, table, input, select, dropdown-menu, tabs, badge, sonner, sheet, dialog, label, textarea, popover, calendar, command, combobox
- Base layout: `(dashboard)/layout.tsx` (sidebar nav), `(dashboard)/page.tsx` (home), `login/page.tsx` + `modules/auth/components/login-form.tsx`
- Seed: `prisma/seed.ts` (roles/permissions/role_permissions), `db:seed` script
- Backup: `src/lib/backup/run.ts` + `/api/cron/backup` route + `vercel.json` cron config
- Font: replaced Google Geist with system font stack (build has no network for font fetch)

**Blockers**: NONE — DB connected, migrated, seeded, buckets created.

**Completed this pass (DB connection)**:
- User filled `.env.local` with real Supabase credentials
- `.env` synced with DATABASE_URL (pooler :6543) + DATABASE_DIRECT_URL (db.<ref>.supabase.co:5432)
- Prisma 7 migration applied: `prisma/migrations/0_init/migration.sql` (6 tables: roles, permissions, role_permissions, user_roles, profiles, activity_logs)
- KEY LEARNING: `migrate dev` hangs on pooler; use direct `db.<ref>.supabase.co:5432` for migrations. `migrate deploy` works non-interactively.
- Seed ran: 4 roles, 41 permissions, 73 role_permissions
- Storage buckets created (private): clients, proposals, projects, trainings, backups
- prisma.config.ts now has `datasource.url` for migrate; runtime uses pg adapter

**Next**: Phase 1.1 User & Access Management (profiles sync, user CRUD, role assignment)

**Notes**:
- Prisma 7: datasource url/directUrl removed from schema.prisma → prisma.config.ts + PrismaClient({adapter}) in src/lib/prisma/client.ts
- Next 16: middleware → proxy (src/proxy.ts)
- `.env` / `.env.local` gitignored; only `.env.example` committed
- Placeholder module pages guard with requirePermission(PERMISSIONS.<x>.view)

**Next recommended step**:
- User: fill `.env.local`, create buckets, run migration
- Then Phase 0.4: Supabase Auth + middleware + getServerSession()
- Then Phase 0.5: RBAC guards + RLS policies
- Then Phase 0.6: activity_logs trigger + logActivity()
- Then Phase 0.7: number generators, Zod base, Shadcn UI, base layout, Inngest config
- Then Phase 0.8: Vercel Cron backup job

---

## 2026-07-18 — Phase 0.1: Project Setup

**Files changed**:
- `package.json` (renamed to consulting-app, added `typecheck` script)
- `src/app/*` (Next.js scaffold)
- `src/modules/*`, `src/components/ui`, `src/lib/{supabase,prisma,auth}`, `src/server/actions` (empty dirs)
- Docs: `AGENT.md`, `AGENT_QUICKREF.md`, `IMPLEMENTATION_PLAN.md`

**Completed**:
- Scaffolded Next.js 16.2.10 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4, ESLint, import alias `@/*`
- Initial production build passes (`npm run build`)
- Git initialized (branch `main`), initial commit `df3d490`
- Created modular directory structure per AGENT.md §3

**Tests / checks run**:
- `npm run build` ✓ (compiled, TS typecheck, static gen)
- `npm run lint` — pending (no custom rules yet)
- `npm run typecheck` — added script, not yet run standalone

**Next recommended step**:
- Phase 0.2: Create Supabase project (manual), configure connection pooler, storage buckets
- Install Prisma + Supabase JS client, configure `.env.local`
- Begin Phase 0.3: base Prisma schema (roles, permissions, profiles, activity_logs)

---

## 2026-07-18 — Phase 1.1: User & Access Management

**Files**:
- `src/modules/users/types.ts` (Zod schemas: create/update/assignRole, ROLES)
- `src/modules/users/service.ts` (userService: list/getById/create/update/deactivate/assignRole — uses Supabase admin + Prisma)
- `src/modules/users/actions.ts` (Server Actions: createUser/updateUser/deactivateUser/assignUserRole — guarded + logged)
- `src/modules/users/components/user-form.tsx` (RHF + Zod create form)
- `src/modules/users/components/user-list.tsx` (DataTable + role select + deactivate)
- `src/app/(dashboard)/users/page.tsx` (server component, guard + list + form)
- `prisma/schema.prisma` (added Profile.userRoles relation + UserRole.profile relation)
- DB trigger: `handle_new_user()` on `auth.users` → auto-creates `profiles` row

**Completed**:
- User CRUD (create via Supabase Auth admin, list, role assign, deactivate)
- Role assignment (Founder only via requireRole("founder"))
- Server guards on all user actions (requirePermission)
- Activity logging on create/update/deactivate/role_assign
- Profile auto-sync via DB trigger (no manual sync needed)
- Sidebar nav updated with Users

**Tests/checks**: `npm run typecheck` ✓, `npm run build` ✓ (/users route compiles)

**Blockers**: None. Manual verification (login as Founder, create user) pending real auth session.

**Next**: Phase 1.2 CRM/Leads module

---

## 2026-07-19 — Founder Seed + Trigger Fix

**Files**:
- `prisma/seed-founder.ts` (creates first Founder user: founder@ibeza.app / Founder@12345)
- `package.json`: added `db:seed:founder` script
- DB trigger `handle_new_user()` updated to set `updated_at = NOW()` (Prisma @updatedAt doesn't fire on raw trigger inserts → was violating NOT NULL)

**Credentials created**:
- Email: `founder@ibeza.app`
- Password: `Founder@12345`
- Role: `founder`

**Verified**: profile + userRoles linkage correct in DB.

**Learnings**:
- Supabase admin API `AuthRetryableFetchError` 500 was actually a DB trigger NOT NULL violation on `profiles.updated_at`, not a network issue.
- Always set `updated_at` in DB triggers (Prisma @updatedAt only applies via Prisma client, not raw SQL/triggers).

**Next**: Run `npm run dev` for user verification, then Phase 1.2 CRM/Leads.

---

## 2026-07-19 — Bug Fix: AuthError Forbidden on /users

**Root causes (2 bugs)**:
1. `getServerSession()` read `role` from Supabase Auth `app_metadata` (empty) → fell back to "officer" → no permission. FIX: query `profiles.role` via Prisma (authoritative source).
2. After fix #1, runtime Prisma used pooler `DATABASE_URL` (postgres@...pooler:6543) → `ENOIDENTIFIER` (Supavisor needs project-ref in username). FIX: `DATABASE_URL` now uses `postgres.yqmpvuzmlgdthfzrvegl@...pooler:6543`.

**Verified**: `GET /users 200` with founder login. Role correctly resolves from profiles table.

**Pushed**: pending commit

---

## 2026-07-19 — Phase 1.2 CRM/Leads

**Files**:
- `prisma/schema.prisma` (added `Lead` model + `Profile.leadsAssigned`/`leadsCreated`)
- `prisma/migrations/20260719084951_add_leads/migration.sql` (applied)
- `src/lib/utils/number.ts` (added `generateLeadCode()`)
- `src/modules/crm/types.ts`, `service.ts`, `actions.ts`, `components/lead-form.tsx`, `components/lead-list.tsx`
- `src/app/(dashboard)/crm/page.tsx` (pipeline widgets + leads table + create form)

**Completed**: Lead CRUD, pipeline status dropdown, soft-delete, activity logging, guarded server actions.
**Bug fix**: dev server had stale generated client (started before `prisma generate`) → `prisma.lead` undefined. Fix: regenerate + restart server.
**Select warning fix**: made Base UI `Select` components consistently uncontrolled via stable `useState` initializers (avoid controlled/uncontrolled switch).
**Verified**: `GET /crm 200`; standalone `prisma.lead.findMany`/`groupBy` OK.
**Pushed**: `5462997`, `9b41424`, `5ebc6e8`

---

## 2026-07-19 — Phase 1.3 Clients

**Files**:
- `prisma/schema.prisma` (added `Client` model: code, name, npwp, address, pic[Json], legalDocs[Json], status, createdById + `Profile.clientsCreated`)
- `prisma/migrations/20260719101946_add_clients/migration.sql` (applied via direct DB)
- `src/lib/utils/number.ts` (added `generateClientCode()` → `CL-YYYY-XXXX`)
- `src/modules/clients/types.ts` (Zod: create/update, picSchema, legalDocSchema, CLIENT_STATUSES)
- `src/modules/clients/service.ts`, `actions.ts` (guarded + logged: create/update/delete)
- `src/modules/clients/components/client-form.tsx` (RHF + Zod, dynamic PIC rows)
- `src/modules/clients/components/client-list.tsx` (table + view/delete)
- `src/app/(dashboard)/clients/page.tsx` (list + create)
- `src/app/(dashboard)/clients/[id]/page.tsx` (detail with Tabs: info, PIC, legal docs, service history placeholder + edit form)

**Completed**: Client CRUD, multiple PIC (jsonb), legal docs metadata (jsonb, URL-based — full Storage upload deferred to Phase 2.5 Documents), soft delete, activity logging, detail view with tabs.
**Notes**: `clients.*` permissions already in PERMISSIONS map + seeded (officer/finance have view; officer has full CRUD). Legal doc upload uses URL entry for now (no storage upload helper exists yet).
**Verified**: `npm run typecheck` ✓, `npm run build` ✓ (`/clients`, `/clients/[id]` compile), standalone `prisma.client.findMany` OK, dev server restarted with regenerated client.
**Pushed**: `9ed5105`

**Next**: Phase 1.4 Proposals (model with items[], status workflow, approval rules, PDF gen)
