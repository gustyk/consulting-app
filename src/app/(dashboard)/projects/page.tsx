import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectList } from "@/modules/projects/components/project-list";
import { projectService } from "@/modules/projects/service";

export default async function ProjectsPage() {
  await requirePermission(PERMISSIONS.projects.view);
  const [projects, counts] = await Promise.all([
    projectService.list(),
    projectService.pipelineCounts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          "preparation",
          "gap_assessment",
          "documentation",
          "implementation",
          "internal_audit",
          "certification_audit",
          "closed",
          "cancelled",
        ].map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                {s.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {counts[s] ?? 0}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectList projects={projects as never} />
        </CardContent>
      </Card>
    </div>
  );
}
