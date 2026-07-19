import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientService } from "@/modules/clients/service";
import type { Pic, LegalDoc } from "@/modules/clients/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS.clients.view);
  const { id } = await params;
  const client = await clientService.getById(id);
  if (!client) notFound();

  const pics = (Array.isArray(client.pic) ? client.pic : []) as Pic[];
  const docs = (Array.isArray(client.legalDocs) ? client.legalDocs : []) as LegalDoc[];

  return (
    <div className="space-y-6">
      <Link href="/clients" className="text-sm text-muted-foreground hover:underline">
        ← Back to Clients
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <Badge variant={client.status === "active" ? "default" : "secondary"}>
          {client.status}
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">
          {client.code}
        </span>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="pic">PIC ({pics.length})</TabsTrigger>
          <TabsTrigger value="docs">Legal Docs ({docs.length})</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">NPWP:</span>{" "}
                {client.npwp ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Address:</span>{" "}
                {client.address ?? "—"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pic">
          <Card>
            <CardHeader>
              <CardTitle>Persons in Charge</CardTitle>
            </CardHeader>
            <CardContent>
              {pics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No PIC recorded.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {pics.map((p, i) => (
                    <li key={i} className="border-b pb-2">
                      <span className="font-medium">{p.name}</span>
                      {p.role ? ` — ${p.role}` : ""}
                      <div className="text-muted-foreground">
                        {p.email ?? "—"} {p.phone ? `· ${p.phone}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {docs.map((d, i) => (
                    <li key={i} className="border-b pb-2">
                      <span className="font-medium">{d.name}</span>
                      {d.type ? ` (${d.type})` : ""}
                      {d.url ? (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          open
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Proposals, projects, and invoices linked to this client will
                appear here (coming in later phases).
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm
            clientId={client.id}
            defaultValues={{
              name: client.name,
              npwp: client.npwp ?? undefined,
              address: client.address ?? undefined,
              status: client.status as "active" | "inactive",
              pic: pics,
              legalDocs: docs,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
