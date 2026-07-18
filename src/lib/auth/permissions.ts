// Permission keys follow "<resource>.<action>"
export const PERMISSIONS = {
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
  },
  roles: {
    assign: "roles.assign",
  },
  leads: {
    view: "leads.view",
    create: "leads.create",
    update: "leads.update",
    delete: "leads.delete",
  },
  clients: {
    view: "clients.view",
    create: "clients.create",
    update: "clients.update",
    delete: "clients.delete",
  },
  proposals: {
    view: "proposals.view",
    create: "proposals.create",
    update: "proposals.update",
    approve: "proposals.approve",
    delete: "proposals.delete",
  },
  projects: {
    view: "projects.view",
    create: "projects.create",
    update: "projects.update",
    assign: "projects.assign",
    delete: "projects.delete",
  },
  invoices: {
    view: "invoices.view",
    create: "invoices.create",
    update: "invoices.update",
    approve: "invoices.approve",
    delete: "invoices.delete",
  },
  payments: {
    view: "payments.view",
    create: "payments.create",
    update: "payments.update",
    delete: "payments.delete",
  },
  partners: {
    view: "partners.view",
    create: "partners.create",
    update: "partners.update",
    revenueView: "partners.revenue_view",
  },
  trainings: {
    view: "trainings.view",
    create: "trainings.create",
    update: "trainings.update",
    delete: "trainings.delete",
  },
  reports: {
    view: "reports.view",
  },
} as const;

type PermissionValues<T> = T extends { [k: string]: infer V } ? V : never;
export type PermissionKey = PermissionValues<(typeof PERMISSIONS)[keyof typeof PERMISSIONS]>;

// Built-in role → permission map (Founder has all)
export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  founder: Object.values(PERMISSIONS).flatMap((group) =>
    Object.values(group),
  ) as PermissionKey[],
  officer: [
    PERMISSIONS.leads.view,
    PERMISSIONS.leads.create,
    PERMISSIONS.leads.update,
    PERMISSIONS.leads.delete,
    PERMISSIONS.clients.view,
    PERMISSIONS.clients.create,
    PERMISSIONS.clients.update,
    PERMISSIONS.clients.delete,
    PERMISSIONS.proposals.view,
    PERMISSIONS.proposals.create,
    PERMISSIONS.proposals.update,
    PERMISSIONS.invoices.view,
    PERMISSIONS.invoices.create,
    PERMISSIONS.invoices.update,
    PERMISSIONS.payments.view,
    PERMISSIONS.payments.create,
    PERMISSIONS.payments.update,
    PERMISSIONS.projects.view,
    PERMISSIONS.projects.create,
    PERMISSIONS.projects.update,
    PERMISSIONS.trainings.view,
    PERMISSIONS.trainings.create,
    PERMISSIONS.trainings.update,
  ] as PermissionKey[],
  partner: [
    PERMISSIONS.projects.view,
    PERMISSIONS.partners.revenueView,
  ] as PermissionKey[],
  finance: [
    PERMISSIONS.invoices.view,
    PERMISSIONS.invoices.approve,
    PERMISSIONS.payments.view,
    PERMISSIONS.payments.create,
    PERMISSIONS.payments.update,
    PERMISSIONS.reports.view,
    PERMISSIONS.clients.view,
  ] as PermissionKey[],
};

export function hasPermission(role: string, permission: PermissionKey): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}
