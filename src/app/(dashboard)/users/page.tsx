import { requirePermission } from "@/lib/auth/guards";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserList } from "@/modules/users/components/user-list";
import { UserForm } from "@/modules/users/components/user-form";
import { userService } from "@/modules/users/service";

export default async function UsersPage() {
  await requirePermission(PERMISSIONS.users.view);
  const users = await userService.list();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User & Access Management</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList users={users as unknown as Parameters<typeof UserList>[0]["users"]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New User</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
