import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function PartnersPage() {
  await requirePermission(PERMISSIONS.partners.view);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Partners</h1>
      <p className="text-sm text-muted-foreground">Module scaffold — coming in Phase 1.</p>
    </div>
  );
}
