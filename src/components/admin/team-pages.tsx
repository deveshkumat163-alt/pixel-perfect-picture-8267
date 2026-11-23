import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ROLES, ROLE_LABELS, type AppRole } from "@/lib/admin/roles";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./admin-shell";
import { ErrorState } from "./fields";
import { useAdmin } from "./use-admin";
import { useTeam, memberName } from "./use-team";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
export function TeamPage() {
  const team = useTeam();
  const { canManageTeam } = useAdmin();
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  async function toggle(userId: string, role: AppRole, checked: boolean) {
    setBusy(true);
    const r = checked ? await supabase.from("user_roles").insert({ user_id: userId, role }).select("id").single() : await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role).select("id").single();
    setBusy(false);
    if (r.error) toast.error(r.error.message); else { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "team"] }); router.invalidate(); }
  }
  return <div><PageHeader title="Team & roles" description="Team accounts and access permissions." /><Input aria-label="Search team" placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} className="mb-6" />{team.error ? <ErrorState message={team.error.message} onRetry={() => team.refetch()} /> : <div className="divide-y divide-border">{team.data?.filter(m => `${m.full_name} ${m.email}`.toLowerCase().includes(search.toLowerCase())).map(m => <section key={m.id} className="py-5"><h2 className="font-medium">{memberName(m)}</h2><p className="mb-4 text-sm text-muted-foreground">{m.email}{m.roles.length === 0 && " · Waiting for access"}</p><div className="flex flex-wrap gap-5">{ALL_ROLES.map(role => <label key={role} className="flex items-center gap-2 text-sm"><Checkbox checked={m.roles.includes(role)} disabled={!canManageTeam || busy} onCheckedChange={v => toggle(m.id, role, v === true)} />{ROLE_LABELS[role]}</label>)}</div></section>)}</div>}</div>;
}
export function ActivityPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const query = useQuery({ queryKey: ["admin", "activity", page], queryFn: async () => { const r = await supabase.from("activity_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * 50, page * 50 + 49); if (r.error) throw r.error; return r; } });
  const team = useTeam();
  return <div><PageHeader title="Activity log" description="Recorded changes across your workspace." /><Input aria-label="Search activity" placeholder="Filter this page" value={search} onChange={e => setSearch(e.target.value)} className="mb-5" />{query.error ? <ErrorState message={query.error.message} /> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Details</TableHead></TableRow></TableHeader><TableBody>{query.data?.data.filter(r => `${r.action} ${JSON.stringify(r.details)}`.toLowerCase().includes(search.toLowerCase())).map(r => <TableRow key={r.id}><TableCell className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell><TableCell>{r.actor_id ? memberName(team.data?.find(m => m.id === r.actor_id)) : "Website visitor"}</TableCell><TableCell>{r.action.replaceAll("_", " ")}</TableCell><TableCell className="max-w-md break-words">{Object.entries(r.details as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</TableCell></TableRow>)}</TableBody></Table></div>}<div className="mt-5 flex items-center gap-3"><Button variant="outline" size="sm" disabled={!page} onClick={() => setPage(p => p - 1)}>Previous</Button><span className="text-sm">Page {page + 1}</span><Button variant="outline" size="sm" disabled={(page + 1) * 50 >= (query.data?.count ?? 0)} onClick={() => setPage(p => p + 1)}>Next</Button></div></div>;
}
