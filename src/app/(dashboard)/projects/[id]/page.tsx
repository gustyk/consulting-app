import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectService } from "@/modules/projects/service";
import { ProjectStatusBadge } from "@/modules/projects/components/project-status-badge";
import { format } from "date-fns";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.projects.view);
  const { id } = await params;
  const project = await projectService.getById(id);
  if (!project) notFound();

  function fmt(d: Date | string | null | undefined) {
    if (!d) return "—";
    return format(new Date(d), "dd MMM yyyy");
  }

  function fmtCurrency(c: number) {
    return `Rp${(c / 100).toLocaleString("id-ID")}`;
  }

  const overdue = (project.milestones ?? []).filter(
    (m) => m.dueDate && new Date(m.dueDate) < new Date() && m.status !== "completed"
  );

  return (
    <div className="space-y-6">
      <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
        ← Back to Projects
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{project.code}</h1>
        <ProjectStatusBadge status={project.status} />
      </div>

      {overdue.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          ⚠ {overdue.length} milestone{overdue.length > 1 ? "s" : ""} overdue
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones ({project.milestones.length})</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables ({project.deliverables.length})</TabsTrigger>
          <TabsTrigger value="partners">Partners ({project.partners.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Client:</span> {project.client.name} ({project.client.code})</p>
              <p><span className="text-muted-foreground">NPWP:</span> {project.client.npwp ?? "—"}</p>
              {project.proposal && <p><span className="text-muted-foreground">Proposal:</span> {project.proposal.number} — {fmtCurrency(project.proposal.total)}</p>}
              <p><span className="text-muted-foreground">Value:</span> {fmtCurrency(project.value)}</p>
              {project.operationalCost != null && <p><span className="text-muted-foreground">Operational Cost:</span> {fmtCurrency(project.operationalCost)}</p>}
              <p><span className="text-muted-foreground">Period:</span> {fmt(project.startDate)} – {fmt(project.endDate)}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No milestones.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Due</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.milestones.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="py-2">{m.name}</td>
                        <td className="py-2">{fmt(m.dueDate)}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              m.status === "completed"
                                ? "default"
                                : m.status === "in_progress"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {m.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliverables">
          <Card>
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              {project.deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deliverables.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Milestone</th>
                      <th className="pb-2">Due</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.deliverables.map((d) => (
                      <tr key={d.id} className="border-b">
                        <td className="py-2">
                          {d.name}
                          {d.fileUrl && (
                            <a href={d.fileUrl} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:underline text-xs">
                              file
                            </a>
                          )}
                        </td>
                        <td className="py-2">{d.milestone?.name ?? "—"}</td>
                        <td className="py-2">{fmt(d.dueDate)}</td>
                        <td className="py-2">
                          <Badge variant={d.status === "approved" ? "default" : "secondary"}>
                            {d.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle>Partner Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {project.partners.length === 0 ? (
                <p className="text-sm text-muted-foreground">No partners assigned.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2">Partner</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2 text-right">Revenue %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.partners.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2">{p.partner.fullName}</td>
                        <td className="py-2">{p.role ?? "—"}</td>
                        <td className="py-2 text-right">
                          {p.revenuePercentage != null ? `${p.revenuePercentage}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
