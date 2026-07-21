import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { proposalService } from "@/modules/proposals/service";
import { ProposalStatusActions } from "@/modules/proposals/components/proposal-status-actions";
import type { ProposalItemInput } from "@/modules/proposals/types";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.proposals.view);
  const { id } = await params;
  const proposal = await proposalService.getById(id);
  if (!proposal) notFound();

  const items = (Array.isArray(proposal.items) ? proposal.items : []) as ProposalItemInput[];

  function formatCurrency(cents: number) {
    return `Rp${(cents / 100).toLocaleString("id-ID")}`;
  }

  return (
    <div className="space-y-6">
      <Link href="/proposals" className="text-sm text-muted-foreground hover:underline">
        ← Back to Proposals
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{proposal.number}</h1>
        <Badge variant={proposal.status === "rejected" ? "destructive" : "default"}>
          {proposal.status.replace("_", " ")}
        </Badge>
      </div>

      <ProposalStatusActions proposal={proposal as never} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2">Service</th>
                        <th className="pb-2">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Disc %</th>
                        <th className="pb-2 text-right">Tax %</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => {
                        const lineSub = it.qty * it.unitPrice;
                        const disc = Math.round(lineSub * (it.discountPct / 100));
                        const taxable = lineSub - disc;
                        const lineTax = Math.round(taxable * (it.taxPct / 100));
                        return (
                          <tr key={i} className="border-b">
                            <td className="py-2">{it.service}</td>
                            <td className="py-2">{it.qty}</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                            <td className="py-2 text-right">{it.discountPct}%</td>
                            <td className="py-2 text-right">{it.taxPct}%</td>
                            <td className="py-2 text-right font-mono">{formatCurrency(lineSub - disc + lineTax)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold">
                        <td colSpan={5} className="pt-3 text-right">Subtotal</td>
                        <td className="pt-3 text-right font-mono">{formatCurrency(proposal.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="text-right">Discount</td>
                        <td className="text-right font-mono">{formatCurrency(proposal.discount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="text-right">Tax (PPN)</td>
                        <td className="text-right font-mono">{formatCurrency(proposal.tax)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td colSpan={5} className="text-right text-lg">Total</td>
                        <td className="text-right font-mono text-lg">{formatCurrency(proposal.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Status Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Created:</span> {proposal.createdAt?.toLocaleString() ?? "—"}</p>
                  {proposal.approvedAt && <p><span className="text-muted-foreground">Approved:</span> {proposal.approvedAt.toLocaleString()} {proposal.approver ? `by ${proposal.approver.fullName}` : ""}</p>}
                  {proposal.sentAt && <p><span className="text-muted-foreground">Sent:</span> {proposal.sentAt.toLocaleString()}</p>}
                  {proposal.acceptedAt && <p><span className="text-muted-foreground">Accepted:</span> {proposal.acceptedAt.toLocaleString()}</p>}
                  {proposal.rejectedAt && <p><span className="text-muted-foreground">Rejected:</span> {proposal.rejectedAt.toLocaleString()}</p>}
                  {proposal.validUntil && <p><span className="text-muted-foreground">Valid until:</span> {proposal.validUntil.toLocaleDateString()}</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{proposal.client.name}</p>
              <p className="text-muted-foreground">{proposal.client.npwp ?? "—"}</p>
              <p className="text-muted-foreground">{proposal.client.address ?? "—"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}