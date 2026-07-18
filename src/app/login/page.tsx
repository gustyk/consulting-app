import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { LoginForm } from "@/modules/auth/components/login-form";

export default async function LoginPage() {
  const { user } = await getServerSession();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Ibeza ERP</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Sign in to your account
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
