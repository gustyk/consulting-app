import { requireUser } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardHome() {
  const { user } = await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Welcome, {user.fullName ?? user.email}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Role
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold uppercase">
            {user.role}
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">
        Modules: CRM, Clients, Proposals, Projects, Finance, Partners, Trainings,
        Documents.
      </p>
    </div>
  );
}
