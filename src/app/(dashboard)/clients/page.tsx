import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientList } from "@/modules/clients/components/client-list";
import { ClientForm } from "@/modules/clients/components/client-form";
import { clientService } from "@/modules/clients/service";

export default async function ClientsPage() {
  await requirePermission(PERMISSIONS.clients.view);
  const clients = await clientService.list();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clients</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientList clients={clients as never} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
