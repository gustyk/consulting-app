import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import type { User } from "@supabase/supabase-js";

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
};

export async function getServerSession(): Promise<{ user: SessionUser | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null };

  // Role is authoritative from the profiles table, not auth app_metadata
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true, fullName: true },
  });

  const role = profile?.role ?? "officer";

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      role,
      fullName: profile?.fullName ?? user.user_metadata?.full_name ?? null,
    },
  };
}
