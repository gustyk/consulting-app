import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function DocumentsPage() {
  await requirePermission(PERMISSIONS.clients.view);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <p className="text-sm text-muted-foreground">Module scaffold — coming in Phase 1.</p>
    </div>
  );
}
