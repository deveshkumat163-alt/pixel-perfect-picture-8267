import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, BriefcaseBusiness, Inbox, MessageSquareQuote, Percent, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { ErrorState, Panel } from "@/components/admin/fields";
import { useAdmin } from "@/components/admin/use-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from "@/lib/admin/roles";
import { conversionRate, enquiriesByMonth } from "@/lib/admin/stats";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)", "var(--destructive)"];

const ACTION_LABELS: Record<string, string> = {
  insert: "created",
  update: "updated",
  delete: "deleted",
  created: "received",
};

function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [enq, portfolio, services, testimonials, activity] = await Promise.all([
        supabase.from("enquiries").select("status, created_at, service_interest").order("created_at", { ascending: false }).limit(1000),
        supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("services").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("activity_logs").select("id, actor_id, action, entity_type, details, created_at").order("created_at", { ascending: false }).limit(12),
      ]);
      const err = enq.error || portfolio.error || services.error || testimonials.error || activity.error;
      if (err) throw err;
      const actorIds = [...new Set((activity.data ?? []).map((a) => a.actor_id).filter(Boolean))] as string[];
      const names: Record<string, string> = {};
      if (actorIds.length) {
        const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", actorIds);
        for (const p of data ?? []) names[p.id] = p.full_name || p.email || "Team member";
      }
      return {
        enquiries: enq.data ?? [],
        portfolio: portfolio.count ?? 0,
        services: services.count ?? 0,
        testimonials: testimonials.count ?? 0,
        activity: (activity.data ?? []).map((a) => ({ ...a, actor: a.actor_id ? names[a.actor_id] ?? "Team member" : "Website visitor" })),
      };
    },
  });
}

function Stat({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string | number; hint?: string }) {
  return (
    <Panel className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-gradient-brand opacity-15 blur-2xl" aria-hidden />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand-soft">
          <Icon className="size-4 text-primary-glow" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Panel>
  );
}

function describeActivity(a: { action: string; entity_type: string; details: unknown }) {
  const [, op = ""] = a.action.split(".");
  const d = (a.details ?? {}) as Record<string, string>;
  const entity = a.entity_type.replace(/_/g, " ").replace(/s$/, "").replace("portfolio item", "project");
  const status = d["status"] ? ` → ${LEAD_STATUS_LABELS[d["status"] as LeadStatus] ?? d["status"]}` : "";
  const label = d["label"] || d["name"] || "";
  return `${ACTION_LABELS[op] ?? op} ${entity}${label ? ` “${label}”` : ""}${status}`;
}

function Dashboard() {
  const { profile } = useAdmin();
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="Live overview of leads and website content."
        action={
          <Button asChild variant="hero" size="sm" className="h-9 px-4">
            <Link to="/admin/enquiries">
              Open enquiries <ArrowRight />
            </Link>
          </Button>
        }
      />
      {error ? (
        <ErrorState message="We couldn't load the dashboard." onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <DashboardBody data={data} />
      )}
    </div>
  );
}

function DashboardBody({ data }: { data: NonNullable<ReturnType<typeof useDashboard>["data"]> }) {
  const rows = data.enquiries;
  const now = new Date();
  const monthly = enquiriesByMonth(rows, now);
  const thisMonth = monthly.at(-1)?.count ?? 0;
  const newCount = rows.filter((r) => r.status === "new").length;
  const statusData = LEAD_STATUSES.map((s) => ({ name: LEAD_STATUS_LABELS[s], value: rows.filter((r) => r.status === s).length })).filter((s) => s.value > 0);
  const serviceMap = new Map<string, number>();
  for (const r of rows) serviceMap.set(r.service_interest || "Not specified", (serviceMap.get(r.service_interest || "Not specified") ?? 0) + 1);
  const serviceData = [...serviceMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Inbox} label="New enquiries" value={newCount} hint="Waiting for first contact" />
        <Stat icon={TrendingUp} label="Enquiries this month" value={thisMonth} hint={`${rows.length} all time`} />
        <Stat icon={Percent} label="Conversion rate" value={`${conversionRate(rows)}%`} hint="Converted ÷ all enquiries" />
        <Stat icon={BriefcaseBusiness} label="Published projects" value={data.portfolio} hint={`${data.services} services · ${data.testimonials} testimonials`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <p className="font-medium">Enquiries per month</p>
          <p className="text-xs text-muted-foreground">Last 6 months · converted shown in violet</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="count" name="Enquiries" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <p className="font-medium">Lead pipeline</p>
          <p className="text-xs text-muted-foreground">Enquiries by status</p>
          {statusData.length === 0 ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {statusData.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {s.name}
                    <span className="ml-auto font-mono text-muted-foreground">{s.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel>
          <p className="font-medium">Demand by service</p>
          {serviceData.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {serviceData.map((s) => (
                <li key={s.name}>
                  <div className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="font-mono text-muted-foreground">{s.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(s.value / rows.length) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel className="xl:col-span-2">
          <p className="font-medium">Recent activity</p>
          {data.activity.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Activity appears here as enquiries arrive and the team edits content.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gradient-brand-soft">
                    {a.entity_type === "enquiries" || a.entity_type === "enquiry" ? (
                      <Inbox className="size-4 text-primary-glow" />
                    ) : a.entity_type === "testimonials" ? (
                      <MessageSquareQuote className="size-4 text-primary-glow" />
                    ) : (
                      <Sparkles className="size-4 text-primary-glow" />
                    )}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p>
                      <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{describeActivity(a)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="bg-gradient-brand-soft">
        <p className="font-medium">Coming in the next phase</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Clients, projects, invoices, payments and tasks — with revenue and project figures added to this dashboard once those records exist.
        </p>
      </Panel>
    </div>
  );
}
