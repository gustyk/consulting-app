# AGENT Quick Reference

## Stack
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **UI**: React + Shadcn UI + Tailwind CSS
- **DB**: Supabase Postgres (Free Tier)
- **ORM**: Prisma (or Supabase JS client for auth/storage/realtime)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Background Jobs**: Vercel Cron + Inngest (or Supabase Edge Functions)
- **PDF**: `@react-pdf/renderer` or `pdf-lib`
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions + Vercel Git Integration

---

## Module Structure (Copy Template)

```
src/modules/<domain>/
├── types.ts          # Zod schemas + TypeScript types
├── service.ts        # Business logic (pure functions)
├── actions.ts        # Server Actions (thin wrappers)
├── guards.ts         # Permission guards
├── repository.ts     # Data access (only if needed)
├── components/
│   ├── list.tsx      # DataTable view
│   ├── form.tsx      # Create/Edit form (Sheet/Dialog)
│   └── detail.tsx    # Detail view (Card/Tabs)
└── index.ts          # Public exports
```

---

## Standard Server Action Template

```typescript
// actions.ts
import { requirePermission } from '@/lib/auth/guards';
import { logActivity } from '@/lib/activity';
import { z } from 'zod';

const createSchema = z.object({ /* zod schema */ });
type CreateInput = z.infer<typeof createSchema>;

export async function createResource(input: CreateInput) {
  const { user } = await requirePermission('resources.create');
  const data = createSchema.parse(input);
  const result = await resourceService.create(data, user.id);
  await logActivity({ action: 'resource.create', targetId: result.id, userId: user.id });
  return result;
}

export async function updateResource(id: string, input: Partial<CreateInput>) {
  const { user } = await requirePermission('resources.update');
  const data = createSchema.partial().parse(input);
  const result = await resourceService.update(id, data, user.id);
  await logActivity({ action: 'resource.update', targetId: id, userId: user.id });
  return result;
}

export async function deleteResource(id: string) {
  const { user } = await requirePermission('resources.delete');
  await resourceService.softDelete(id, user.id);
  await logActivity({ action: 'resource.delete', targetId: id, userId: user.id });
}
```

---

## Standard Service Template

```typescript
// service.ts
import { prisma } from '@/lib/prisma';

export const resourceService = {
  async create(data: CreateInput, userId: string) {
    const number = await generateNumber('RES');
    return prisma.resource.create({
      data: { ...data, number, createdById: userId },
    });
  },

  async update(id: string, data: Partial<CreateInput>, userId: string) {
    return prisma.resource.update({
      where: { id },
      data: { ...data, updatedById: userId },
    });
  },

  async softDelete(id: string, userId: string) {
    return prisma.resource.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
    });
  },

  async findMany(params: ListParams) {
    const where = buildWhere(params);
    const [data, total] = await Promise.all([
      prisma.resource.findMany({ where, ...pagination(params) }),
      prisma.resource.count({ where }),
    ]);
    return { data, total };
  },
};
```

---

## Standard Guard Template

```typescript
// guards.ts
import { getServerSession } from '@/lib/auth/server';
import { hasPermission } from '@/lib/auth/permissions';

export async function requirePermission(permission: string) {
  const session = await getServerSession();
  if (!session?.user) throw new Error('Unauthorized');
  if (!hasPermission(session.user.role, permission)) {
    throw new Error('Forbidden');
  }
  return { user: session.user };
}

export async function requireRole(...roles: Role[]) {
  const session = await getServerSession();
  if (!session?.user || !roles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }
  return { user: session.user };
}
```

---

## Database Standards

| Rule | Convention |
|------|------------|
| Primary Keys | UUID (`uuid` + `gen_random_uuid()`) |
| Foreign Keys | `{table_singular}_id` (e.g., `client_id`) |
| Timestamps | `created_at`, `updated_at` (always) |
| Soft Delete | `deleted_at` (nullable timestamp) |
| Naming | Tables: plural snake_case; Columns: snake_case |
| Indexes | `status`, FKs, invoice/proposal/project numbers |
| RLS | Enabled on ALL tables + policies |

---

## Standard UI Patterns

| View | Component |
|------|-----------|
| List | `DataTable` (TanStack Table) + Toolbar (search, filter, create) |
| Create/Edit | `Form` (React Hook Form + Zod) in `Sheet` or `Dialog` |
| Detail | `Card` + `Tabs` for sub-resources |
| Actions | Toolbar buttons → Server Actions → `revalidatePath` |

```tsx
// Standard list component pattern
export function ResourceList() {
  const { data, isLoading } = useQuery({ queryKey: ['resources'], queryFn: fetchResources });
  return (
    <DataTable
      data={data}
      columns={columns}
      onCreate={() => setOpenCreate(true)}
      onEdit={(row) => setEditing(row)}
      onDelete={handleDelete}
    />
  );
}
```

---

## Authorization Rules

| Role | Access |
|------|--------|
| Founder | Full access |
| Officer | Own + assigned clients/projects |
| Partner | **Only** own projects + revenue |
| Finance | Finance module only |

**Rules:**
- RLS policies on ALL tables (defense in depth)
- Server-side guards on EVERY Server Action/API route
- Never trust client-side filters for authorization

---

## Activity Logging

```typescript
// Call from EVERY mutating Server Action
await logActivity({
  action: 'proposal.approve',
  targetType: 'proposal',
  targetId: proposal.id,
  userId: user.id,
  previousValue: { status: 'waiting_approval' }, // optional
});
```

Required for: login, approvals, payments, deletions, reassignments.

---

## Key Commands

```bash
npm run dev          # Dev server
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test         # Vitest
npm run test:e2e     # Playwright
npx prisma migrate dev  # DB migrations
npx prisma studio       # DB UI
```

---

## Anti-Patterns to Avoid

- ❌ Unnecessary repository abstractions
- ❌ Service explosion (one service per module max)
- ❌ Abstract factories / over-abstraction
- ❌ Premature event sourcing / CQRS
- ❌ Client-side state for server-owned data (use Server Components)
- ❌ Heavy client bundles when RSC works
- ❌ Trusting client-side validation only

---

## Definition of Done (per feature)

- [ ] Business workflow works end-to-end
- [ ] RLS + server-side guards enforced
- [ ] Zod validation on EVERY mutation
- [ ] Activity log entries written
- [ ] UI usable + responsive (mobile/tablet/desktop)
- [ ] Edge cases handled (empty states, errors, loading)
- [ ] No N+1 queries
- [ ] Manual + automated tests pass