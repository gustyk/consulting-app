import { createClient } from "@/lib/supabase/server";
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

  const role = (user.app_metadata?.role as string) ?? "officer";

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      role,
      fullName: user.user_metadata?.full_name ?? null,
    },
  };
}
