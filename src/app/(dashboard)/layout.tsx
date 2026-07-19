import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";

const NAV = [
  { href: "/users", label: "Users" },
  { href: "/crm", label: "CRM" },
  { href: "/clients", label: "Clients" },
  { href: "/proposals", label: "Proposals" },
  { href: "/projects", label: "Projects" },
  { href: "/finance", label: "Finance" },
  { href: "/partners", label: "Partners" },
  { href: "/trainings", label: "Trainings" },
  { href: "/documents", label: "Documents" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-muted/30 p-4">
        <div className="mb-6 text-lg font-semibold">Ibeza ERP</div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 text-xs text-muted-foreground">
          {user.fullName ?? user.email}
          <br />
          <span className="uppercase">{user.role}</span>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
