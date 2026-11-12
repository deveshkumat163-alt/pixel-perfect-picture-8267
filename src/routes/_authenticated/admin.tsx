import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/lib/admin/roles";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const userId = context.user.id;
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("id, full_name, title, email, avatar_url").eq("id", userId).maybeSingle(),
    ]);
    const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
    return { roles, profile: profileRes.data ?? null };
  },
  head: () => ({
    meta: [
      { title: "Admin — Dev Creative Works" },
      { name: "description", content: "Dev Creative Works management platform." },
      { property: "og:title", content: "Admin | Dev Creative Works" },
      { property: "og:description", content: "Internal management platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { roles, user } = Route.useRouteContext();
  if (roles.length === 0) return <NoAccess email={user.email ?? ""} />;
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

function NoAccess({ email }: { email: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="gradient-border max-w-md rounded-[2rem] bg-card p-9 text-center shadow-card">
        <ShieldAlert className="mx-auto size-10 text-warning" />
        <h1 className="mt-5 text-2xl font-semibold">Waiting for access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You're signed in as <span className="text-foreground">{email}</span>, but your account doesn't have a team role yet.
          Ask a Super Admin to assign you one from Team &amp; roles.
        </p>
        <Button
          variant="glass"
          className="mt-6"
          onClick={async () => {
            await qc.cancelQueries();
            qc.clear();
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
