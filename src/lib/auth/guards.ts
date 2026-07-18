import { getServerSession, type SessionUser } from "@/lib/auth/session";
import { hasPermission, type PermissionKey } from "@/lib/auth/permissions";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requirePermission(
  permission: PermissionKey,
): Promise<{ user: SessionUser }> {
  const { user } = await getServerSession();
  if (!user) throw new AuthError("Unauthorized");
  if (!hasPermission(user.role, permission)) {
    throw new AuthError("Forbidden");
  }
  return { user };
}

export async function requireRole(
  ...roles: string[]
): Promise<{ user: SessionUser }> {
  const { user } = await getServerSession();
  if (!user) throw new AuthError("Unauthorized");
  if (!roles.includes(user.role)) throw new AuthError("Forbidden");
  return { user };
}

export async function requireUser(): Promise<{ user: SessionUser }> {
  const { user } = await getServerSession();
  if (!user) throw new AuthError("Unauthorized");
  return { user };
}
