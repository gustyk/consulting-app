import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProposalList } from "@/modules/proposals/components/proposal-list";
import { ProposalForm } from "@/modules/proposals/components/proposal-form";
import { proposalService } from "@/modules/proposals/service";
import { clientService } from "@/modules/clients/service";

export default async function ProposalsPage() {
  await requirePermission(PERMISSIONS.proposals.view);
  const [proposals, counts, clients] = await Promise.all([
    proposalService.list(),
    proposalService.pipelineCounts(),
    clientService.list({ status: "active" }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Proposals</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
        {[
          "draft",
          "waiting_approval",
          "approved",
          "sent",
          "accepted",
          "rejected",
          "expired",
        ].map((s) => (
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
            <CardTitle>Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalList proposals={proposals as never} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalForm clients={clients as never} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}