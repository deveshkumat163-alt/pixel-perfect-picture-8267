import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/admin/roles";

export type TeamMember = { id: string; full_name: string; email: string | null; title: string; avatar_url: string | null; roles: AppRole[] };

/** Everyone with at least one team role — used for assignee / manager pickers. */
export function useTeam() {
  return useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, title, avatar_url").order("full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profiles.error) throw profiles.error;
      if (roles.error) throw roles.error;
      const byUser: Record<string, AppRole[]> = {};
      for (const r of roles.data ?? []) (byUser[r.user_id] ??= []).push(r.role);
      return (profiles.data ?? []).map((p) => ({ ...p, roles: byUser[p.id] ?? [] })) as TeamMember[];
    },
    staleTime: 60_000,
  });
}

export function memberName(m: Pick<TeamMember, "full_name" | "email"> | undefined | null) {
  return m ? m.full_name || m.email || "Team member" : "Unassigned";
}
