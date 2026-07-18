# Implementation Plan: Mini ERP for ISO Consulting

## Overview
- **Target**: Production-ready MVP on Vercel + Supabase Free Tier
- **Approach**: Modular monolith, MVP-first, deployable each phase
- **Documentation**: Update `MEMORY.md` after each milestone

---

## Phase 0: Foundation (Week 1-2)

### 0.1 Project Setup
- [ ] Initialize Next.js 14+ with App Router, TypeScript, Tailwind
- [ ] Configure ESLint, Prettier, Husky (pre-commit)
- [ ] Set up GitHub repo + branch protection (main)
- [ ] Configure Vercel project (link to GitHub)
- [ ] Add GitHub Actions workflow: lint → typecheck → test → build

### 0.2 Supabase Setup
- [ ] Create Supabase project (Free Tier)
- [ ] Enable: Database, Auth, Storage, Realtime
- [ ] Configure connection pooler (PgBouncer/Supavisor)
- [ ] Create storage buckets: `clients`, `proposals`, `projects`, `trainings`
- [ ] Set bucket policies (private, signed URLs only)

### 0.3 Database & ORM
- [ ] Install Prisma + configure against Supabase pooler
- [ ] Create base Prisma schema:
  - `roles`, `permissions`, `role_permissions`, `user_roles`
  - `profiles` (extends Supabase Auth users)
  - `activity_logs`
- [ ] Run initial migration
- [ ] Seed base roles: Founder, Officer, Partner, Finance
- [ ] Seed permissions + role_permissions matrix

### 0.4 Auth & Middleware
- [ ] Install `@supabase/ssr` + `@supabase/supabase-js`
- [ ] Create Supabase server/client utilities
- [ ] Implement Next.js middleware for session refresh
- [ ] Create `getServerSession()` helper
- [ ] Build auth pages: login, callback, error

### 0.5 RBAC & Guards
- [ ] Create `hasPermission(role, permission)` utility
- [ ] Build `requirePermission()` and `requireRole()` guards
- [ ] Implement RLS policies on all base tables
- [ ] Test: Founder sees all, Partner sees only own

### 0.6 Activity Logging
- [ ] Create `activity_logs` table (Prisma migration)
- [ ] Build `logActivity()` server utility
- [ ] Add Postgres trigger for critical tables (proposals, invoices, payments)

### 0.7 Shared Infrastructure
- [ ] Number generators: `generateProposalNumber()`, `generateInvoiceNumber()`, `generateProjectCode()`, `generateCertificateNumber()`
- [ ] Zod base schemas + common types
- [ ] Shadcn UI installation + theme configuration
- [ ] Base layout: sidebar, header, breadcrumb
- [ ] Install Inngest + configure Vercel integration

### 0.8 Backup & Cron
- [ ] Create Vercel Cron job for daily `pg_dump` (Supabase CLI)
- [ ] Upload backup to private Supabase Storage bucket
- [ ] Document retention policy (30 days)

### Deliverables
- [ ] Founder can log in and access dashboard
- [ ] Role/permission checks work (server + RLS)
- [ ] Activity logging records model changes
- [ ] Backup job runs locally and on schedule
- [ ] Push to `main` triggers CI/CD → Vercel deploy

---

## Phase 1: MVP Operational Core (Week 3-8)

### 1.1 User & Access Management
- [ ] `profiles` table + sync with Supabase Auth (trigger on user creation)
- [ ] User CRUD (admin only): list, create, edit, deactivate
- [ ] Role assignment UI (Founder only)
- [ ] Server guards on all user actions
- [ ] Partner data isolation via RLS + query scoping

### 1.2 CRM / Leads
- [ ] Lead model: `id, code, name, email, phone, company, source, status, service_interest, assigned_to, notes, created_at, updated_at, deleted_at`
- [ ] Pipeline statuses: `new` → `contacted` → `meeting_scheduled` → `proposal_sent` → `negotiation` → `won`/`lost`
- [ ] Lead list (DataTable): search, filter by status/source/assigned, pagination, export CSV
- [ ] Create/Edit in Sheet (RHF + Zod)
- [ ] Lead → Client conversion action
- [ ] Dashboard widgets: pipeline counts, conversion rate, aging

### 1.3 Clients
- [ ] Client model: `id, code, name, npwp, address, pic[] (jsonb), legal_docs[], status, created_at, updated_at, deleted_at`
- [ ] Multiple PIC support (name, role, email, phone)
- [ ] NPWP + legal document upload (Supabase Storage signed URLs)
- [ ] Service history: link to proposals, projects, invoices (tabs in detail)
- [ ] Client list + detail views

### 1.4 Proposals
- [ ] Proposal model: `id, number (IBEZA/PROP/YYYY/MM/XXXX), client_id, status, items[], subtotal, discount, tax, total, valid_until, approved_by, approved_at, sent_at, accepted_at, rejected_at, created_at, updated_at, deleted_at`
- [ ] Proposal items: service, description, qty, unit_price, discount%, tax%
- [ ] Status workflow with guards:
  - `draft` → `waiting_approval` (if threshold/discount/tax triggers)
  - `waiting_approval` → `approved` (Founder only)
  - `approved` → `sent` (Officer)
  - `sent` → `accepted`/`rejected`/`expired`
- [ ] Approval rules:
  - Value > Rp50jt → Founder approval
  - Discount > 10% → Founder approval
  - Tax adjustment → Founder approval
- [ ] PDF generation (`@react-pdf/renderer`) with company branding
- [ ] Activity log on all status changes
- [ ] Proposal list with filters, dashboard widgets

### 1.5 Projects
- [ ] Project model: `id, code (PRJ/YYYY/MM/XXXX), proposal_id, client_id, status, value, operational_cost, start_date, end_date, created_at, updated_at, deleted_at`
- [ ] Milestones: `id, project_id, name, description, due_date, status, completed_at`
- [ ] Deliverables: `id, project_id, milestone_id, name, file_url, status, due_date`
- [ ] Partner assignments: `id, project_id, partner_id (user_id), revenue_percentage, role`
- [ ] Status workflow: `preparation` → `gap_assessment` → `documentation` → `implementation` → `internal_audit` → `certification_audit` → `closed`/`cancelled`
- [ ] Document upload (Supabase Storage, project bucket)
- [ ] Deadline tracking + overdue visibility
- [ ] Project list + detail (Tabs: milestones, deliverables, partners, documents)

### 1.6 Invoices & Payments
- [ ] Invoice model: `id, number (IBEZA/INV/YYYY/MM/XXXX), project_id, client_id, status, subtotal, discount, tax (PPN 11%), total, dpp, due_date, sent_at, approved_by, approved_at, created_at, updated_at, deleted_at`
- [ ] Invoice payments: `id, invoice_id, amount, date, method, reference, notes, created_at`
- [ ] Status workflow: `draft` → `sent` → `partial_paid` → `paid` / `overdue` / `cancelled`
- [ ] Validation: payment total ≤ invoice total (server-side)
- [ ] PPN 11% + DPP calculation fields
- [ ] Activity log on payment create/update, invoice approval
- [ ] Invoice PDF generation
- [ ] Overdue invoice detection + dashboard visibility

### 1.7 MVP Dashboards
**Founder:**
- Monthly revenue chart
- Outstanding invoices (count + value)
- Active projects count
- Lead conversion funnel
- Upcoming deadlines (milestones, invoices)

**Officer:**
- Pending proposals (awaiting approval)
- Pending invoices (awaiting approval)
- Training schedule (placeholder)
- Due tasks (milestones, deliverables)

**Partner:**
- Assigned projects
- Upcoming schedule (milestones/deliverables)
- Revenue earned (placeholder)
- Pending deliverables

### 1.8 MVP Testing
- [ ] Unit tests: auth, RBAC, partner isolation, proposal approval logic, invoice payment validation, activity logging, PDF auth
- [ ] E2E tests (Playwright): lead→proposal→project→invoice→payment flow, Founder approval, Officer daily input, Partner restricted view
- [ ] Manual acceptance: all 4 flows + responsive check

### Deliverables
- [ ] Officer can input lead, client, proposal, project, invoice, payment
- [ ] Founder can approve proposal and invoice
- [ ] Partner sees ONLY assigned projects + own revenue
- [ ] Overdue invoices visible in dashboard/filters
- [ ] Proposal & invoice PDFs generate correctly
- [ ] All critical actions guarded + logged

---

## Phase 2: Business Expansion (Week 9-14)

### 2.1 Partner Management
- [ ] Partner profile: skills[], tax_status, revenue_scheme, bank_details
- [ ] Skill tagging + filter
- [ ] Multiple partner assignment per project (with percentages)

### 2.2 Partner Revenue Sharing
- [ ] Revenue share model: `id, project_id, partner_id, percentage, operational_cost_deduction, calculated_share, status, approved_by, approved_at, paid_at`
- [ ] Formula: `net = project_value - operational_cost; share = net * percentage`
- [ ] Calculation triggered on project closure or invoice payment
- [ ] Founder approval required
- [ ] Payment history tracking
- [ ] Exportable partner report (XLSX via exceljs)
- [ ] Strict RLS: partner sees only own shares

### 2.3 Training Management
- [ ] Training model: `id, code, title, type (public/inhouse), client_id, schedule[], venue, capacity, price, status`
- [ ] Participants: `id, training_id, name, email, company, attended, certificate_issued`
- [ ] Attendance tracking
- [ ] Payment tracking (link to invoice if needed)
- [ ] Public schedule page + in-house client portal

### 2.4 Certificate Generator
- [ ] Certificate model: `id, number (IBEZA/TRN/YYYY/XXXX), participant_id, training_id, template_id, issued_at, qr_code_url, pdf_url`
- [ ] Template storage in Supabase Storage
- [ ] PDF generation with QR verification link
- [ ] Bulk generate for training batch

### 2.5 Documents (Centralized)
- [ ] Document model: `id, bucket, path, filename, mime_type, size, tags[], version, module, module_id, uploaded_by, created_at`
- [ ] Tagging + version metadata
- [ ] Access policy per module/owner (RLS + signed URLs)
- [ ] Download audit trail in activity_logs

### 2.6 Reports
- [ ] Cashflow monthly (in/out)
- [ ] Outstanding invoices (aging buckets)
- [ ] AR aging (30/60/90/120+ days)
- [ ] Revenue by service, client, partner
- [ ] Consultant workload (project hours/capacity)
- [ ] Training attendance
- [ ] All reports: date range filter, export CSV/XLSX

### Deliverables
- [ ] Partner sharing calculates correctly per formula
- [ ] Founder approves partner sharing
- [ ] Training certificates generate as PDF with QR
- [ ] Reports filterable by date range, exportable
- [ ] Partner isolation enforced at DB + app level

---

## Phase 3: Automation & Compliance (Week 15-18)

### 3.1 Email Notifications (Resend)
- [ ] `NotificationService` abstraction (email channel)
- [ ] Templates: proposal approved, invoice overdue, project deadline, training reminder, payment received
- [ ] Trigger via Inngest on relevant events
- [ ] Preferences per user (opt-in/out)

### 3.2 Tax Exports
- [ ] CSV e-Faktur format (Indonesia standard)
- [ ] Tax recap report (monthly PPN summary)
- [ ] Download from Finance → Reports

### 3.3 Scheduled Jobs (Vercel Cron + Inngest)
- [ ] Daily: mark overdue invoices
- [ ] Daily: backup export (pg_dump → Storage)
- [ ] Weekly: reminder dispatch (upcoming deadlines, overdue follow-ups)
- [ ] Monthly: partner sharing calculation + notification
- [ ] Job monitoring: Inngest dashboard + `job_logs` table for retry

### 3.4 Optional Integrations (Post-MVP)
- [ ] WhatsApp API (notifications)
- [ ] Payment gateway (Midtrans/Xendit)
- [ ] Google Calendar (training/project sync)
- [ ] Coretax / e-Faktur direct submit
- [ ] Digital signature (DocuSign/local)
- [ ] Zoom API (training sessions)

### Deliverables
- [ ] Background jobs don't block user requests
- [ ] Scheduled tasks documented + configured as Vercel Cron
- [ ] Failed jobs reviewable + retryable via Inngest

---

## Go-Live Checklist

### Pre-Launch
- [ ] Load test critical paths (Supabase Free Tier limits)
- [ ] Security audit: RLS policies, guards, file upload validation
- [ ] Data migration plan (if from legacy system)
- [ ] User acceptance testing with real operational staff
- [ ] Documentation: user guide, admin guide, API reference
- [ ] Rollback plan documented

### Launch
- [ ] DNS + custom domain on Vercel
- [ ] Supabase: upgrade to Pro if needed (or stay Free with monitoring)
- [ ] Enable Vercel Analytics + Speed Insights
- [ ] Configure error tracking (Sentry or Vercel logs)
- [ ] Set up uptime monitoring
- [ ] Team onboarding session

### Post-Launch (Week 1-2)
- [ ] Daily standups for issue triage
- [ ] Monitor: error rates, Supabase usage, Vercel function duration
- [ ] Collect user feedback → prioritize Phase 3 integrations
- [ ] Document known issues + workarounds

---

## Memory.md Template

```markdown
# MEMORY.md

## 2026-01-15
**Files**: package.json, prisma/schema.prisma, src/lib/auth/*
**Completed**: Project scaffold, Supabase setup, base schema, auth middleware
**Tests**: CI pipeline passes, manual login works
**Blockers**: None
**Next**: RBAC tables + seed script
```

Update after each meaningful change (not every commit).

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Supabase Free Tier limits | Monitor usage daily; design for connection pooling; cache aggressively |
| Vercel function timeout (10s/60s) | Offload PDF, email, exports to Inngest |
| RLS policy bugs | Test with multiple roles in CI; integration tests for isolation |
| Data loss | Daily pg_dump + point-in-time recovery (Supabase Pro) |
| Scope creep | Strict phase gates; "not in MVP" list enforced |

---

## Success Metrics

1. **Time-to-first-value**: Officer creates lead→proposal→invoice in < 10 min
2. **Error rate**: < 1% on critical mutations
3. **Adoption**: All 3 roles active within 2 weeks of launch
4. **Performance**: Dashboard loads < 2s (p95)
5. **Compliance**: Zero unauthorized data access in audit