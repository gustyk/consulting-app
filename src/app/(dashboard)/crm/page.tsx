import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadList } from "@/modules/crm/components/lead-list";
import { LeadForm } from "@/modules/crm/components/lead-form";
import { leadService } from "@/modules/crm/service";
import { LEAD_STATUSES } from "@/modules/crm/types";

export default async function CrmPage() {
  await requirePermission(PERMISSIONS.leads.view);
  const [leads, counts] = await Promise.all([
    leadService.list(),
    leadService.pipelineCounts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">CRM / Leads</h1>

      {/* Pipeline widgets */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {LEAD_STATUSES.map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                {s.replace("_", " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {counts[s] ?? 0}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadList leads={leads as never} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
