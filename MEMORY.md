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
- `npm run build` ✓
- `npm run typecheck` ✓ (after Prisma 7 config fix)
- `npx prisma generate` ✓ (Prisma 7 + pg adapter)

**Blockers**:
- Cannot run `prisma migrate dev` until user fills `.env.local` DATABASE_URL + DATABASE_DIRECT_URL and creates Supabase project.

**Notes**:
- Prisma 7 changed: datasource `url`/`directUrl` removed from schema.prisma → moved to `prisma.config.ts` + `PrismaClient({ adapter })` in `src/lib/prisma/client.ts`.
- Use `@prisma/adapter-pg` + `pg` for Supabase pooler connection.
- `.env` (gitignored) holds DB vars for Prisma CLI; `.env.local` (gitignored) for Next.js runtime. Both need same DATABASE_URL.

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
