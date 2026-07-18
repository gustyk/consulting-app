# AGENT.md

## Quick Start

**Read `AGENT_QUICKREF.md` first** — it has condensed patterns, templates, and commands.

This document contains the full architectural decisions and business rules.

---

## 1. Project Identity

**Modular Mini ERP for ISO consulting companies (e.g., Ibeza)**

**Domains:**
- ISO consulting projects
- Proposal & quotation management
- Client & CRM management
- Partner consultant management
- Training management
- Invoice & finance tracking
- Lightweight operational ERP

**Stack:** Next.js 14+ (App Router) + TypeScript + Shadcn UI + Tailwind + Supabase (Postgres, Auth, Storage) + Prisma + Vercel + Inngest

---

## 2. Core Principles

1. **Business-first**: Usability > operational simplicity > input speed > maintainability > reliability
2. **No overengineering**: No microservices, premature optimization, unnecessary abstractions, complex event-driven architecture, DDD overkill, CQRS unless needed
3. **Modular monolith**: Next.js App Router + service/repository separation + thin route handlers + typed data access
4. **MVP-first priority**: Functional workflow → Data integrity → Permissions → Operational efficiency → UI polish → Optimization

---

## 3. Architecture

### Module Structure
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── crm/ clients/ proposals/ projects/ partners/ finance/ trainings/ documents/
│   │   └── api/
├── modules/
│   ├── crm/ clients/ proposals/ projects/ partners/ finance/ trainings/ documents/
├── components/ui/           # Shadcn UI components
├── lib/
│   ├── supabase/ prisma/ auth/
└── server/actions/
```

Each `src/modules/<domain>` contains: types/Zod schemas, services, actions, guards, UI components, repositories (if needed).

---

## 4. Database Standards

- **PK**: UUID (`gen_random_uuid()`)
- **FK**: `{table_singular}_id` (snake_case)
- **Always**: `created_at`, `updated_at`, `deleted_at` (soft delete)
- **Index**: status, FKs, invoice/proposal/project numbers
- **RLS**: Enabled on ALL tables + policies mirroring app-level RBAC
- **Naming**: Tables plural snake_case; columns snake_case

---

## 5. Data Isolation (Multi-Tenant-Like)

Not true multi-tenant. Rules:
- Partners see ONLY their projects/revenue
- Officers restricted appropriately
- Founder sees all
- **Enforcement**: Supabase RLS (primary) + server-side guards (middleware/actions) + query scoping
- **Never** rely on frontend hiding

---

## 6. RBAC

**Tables**: `roles`, `permissions`, `role_permissions`, `user_roles` (links Supabase Auth users)

**Roles**: Founder, Officer, Partner, Finance

**Critical actions requiring approval + audit**:
- Approve proposal
- Approve invoice
- Delete payment
- Edit financial data

---

## 7. Activity Logging

Table: `activity_logs` (like `spatie/laravel-activitylog`)

**Log**: login, proposal/invoice approval, payment update, deletion, project reassignment

**Fields**: actor (user id/name), action, target (table + id), timestamp, previous_value (jsonb)

**Implementation**: Shared `logActivity()` utility called from every mutating Server Action + Postgres triggers for critical tables.

---

## 8. UI/UX Standards

**Priorities**: Minimize clicks, typing, cognitive load
- Important actions ≤ 3 clicks
- No deeply nested menus
- Wizard/stepper for long flows
- Searchable comboboxes (Shadcn `Combobox`)
- Sensible defaults
- Inline validation (React Hook Form + Zod)

**Components**:
- `DataTable` (TanStack Table) for lists
- `Form` (RHF + Zod) for create/edit
- `Sheet`/`Dialog` for quick create/edit
- `Card` for detail/summary
- `Tabs` for sub-resources

**Default**: React Server Components; Client Components only for interactivity.

---

## 9. Business Workflows

### Proposal States
`draft` → `waiting_approval` → `approved` → `sent` → `accepted`/`rejected`/`expired`

**Rules**: Threshold > X requires Founder approval; discount > 10% requires approval; tax adjustment requires approval

### Invoice States
`draft` → `sent` → `partial_paid` → `paid` / `overdue` / `cancelled`

**Rules**: Payment total ≤ invoice total; payments logged; overdue easily visible

### Project States
`preparation` → `gap_assessment` → `documentation` → `implementation` → `internal_audit` → `certification_audit` → `closed`/`cancelled`

**Features**: Milestones, deliverables, file uploads (Supabase Storage), partner assignments

---

## 10. Finance Scope (Lightweight)

**In scope**: Invoice tracking, cashflow visibility, AR aging, partner sharing
**Out of scope**: General ledger, journal engine, chart of accounts, double-entry (unless explicitly requested)

---

## 11. Partner Revenue Sharing

**Formula**:
```
net_project_value = project_value - operational_cost
partner_share = net_project_value * percentage
```

**Supports**: Percentage split, multiple partners, operational cost deductions
**Isolation**: RLS + server-side guards

---

## 12. Document Management

**Allowed**: PDF, DOCX, XLSX, PPTX, JPG, PNG
**Storage**: Supabase Storage (buckets: `clients`, `proposals`, `projects`, `trainings`)
**Security**: Signed URLs only; no public buckets; client + server validation (ext + MIME); server-side size limits; download audit trail in `activity_logs`

---

## 13. Security Standards

- CSRF: Next.js Server Actions built-in + `same-origin` checks for API routes
- Rate limiting: Vercel Edge Middleware + Upstash Redis (or Supabase built-in)
- Auth guards on EVERY Server Action/API route
- Supabase Auth for password hashing + sessions
- Zod validation on EVERY mutation (server-side)
- File upload validation (ext + MIME + size)
- **Never trust client-side validation**

---

## 14. Performance

**Optimize for**: Vercel serverless/edge, Supabase Free Tier limits, moderate traffic
**Avoid**: N+1 queries, excessive Supabase round-trips, massive dashboard queries per request
**Use**: Server Components, selective data fetching, proper indexes

---

## 15. Implementation Phases

### Phase 1 (MVP)
1. Scaffold Next.js + Supabase + packages
2. Supabase Auth + RBAC tables + `activity_logs`
3. Shared types/Zod, number generators, base guards
4. Leads → Clients/PICs → Proposals (approval workflow) → Projects/Milestones → Invoices/Payments → MVP Dashboards
5. Core tests: auth, RBAC, partner isolation, proposal approval, invoice payment limits, activity logging, PDF auth

### Phase 2
- Partner sharing
- Training & certificates
- Reporting

### Phase 3
- Email notifications (Resend)
- Tax exports (CSV e-Faktur, tax recap)
- Scheduled jobs (Vercel Cron + Inngest): overdue marking, backups, reminders
- Optional integrations: WhatsApp, payment gateway, Google Calendar, Coretax/e-Faktur, digital signature, Zoom

---

## 16. Testing Requirements

**Automated (minimum)**:
- Auth, RBAC, partner isolation, proposal approval thresholds, invoice payment limits, payment activity logs, overdue queries, PDF auth

**Manual Acceptance**:
- Lead → proposal → project → invoice → payment flow
- Founder approval flow
- Officer daily input
- Partner restricted dashboard
- Responsive layout (mobile/tablet/desktop)

---

## 17. Memory Rule

Maintain `MEMORY.md` at project root with:
- Date, files changed, completed work, tests/checks run, blockers, next step

---

## 18. Notifications

**Current**: Email only (Resend)
**Future-ready**: `NotificationService` abstraction for WhatsApp/Telegram/SMS

---

## 19. Anti-Patterns (Never Do)

- Unnecessary repository abstractions
- Service explosion
- Abstract factories everywhere
- Premature event sourcing
- Unnecessary client-side state for server data
- Overly dynamic metadata systems
- Generic low-quality CRUD generators

---

## 20. Definition of Done

- [ ] Business workflow works
- [ ] RLS + server guards correct
- [ ] Zod validation on every mutation
- [ ] Activity logging present
- [ ] UI usable + responsive
- [ ] Edge cases handled
- [ ] No major N+1 queries
- [ ] Tested (manual or automated)

---

## 21. Final Principle

> **Primary metric**: "Can operational staff run the consulting business faster, safer, and with less friction?"
>
> Every engineering decision must support this goal.