import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function ProjectsPage() {
  await requirePermission(PERMISSIONS.projects.view);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="text-sm text-muted-foreground">Module scaffold — coming in Phase 1.</p>
    </div>
  );
}
