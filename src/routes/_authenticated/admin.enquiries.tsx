import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Building2, CalendarClock, ChevronLeft, ChevronRight, Inbox, Loader2, Mail, Phone, Search, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/admin/admin-shell";
import { ConfirmDelete, EmptyState, ErrorState, Panel } from "@/components/admin/fields";
import { useAdmin } from "@/components/admin/use-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadStatus } from "@/lib/admin/roles";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: EnquiriesPage,
});

type Enquiry = Tables<"enquiries">;
const PAGE_SIZE = 15;

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary-glow border-primary/30",
  contacted: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  discussion: "bg-violet/15 text-violet border-violet/30",
  proposal_sent: "bg-warning/15 text-warning border-warning/30",
  negotiation: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  converted: "bg-success/15 text-success border-success/30",
  lost: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal", STATUS_STYLE[status])}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

function EnquiriesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");
  const [service, setService] = useState("all");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const services = useMemo(() => [...new Set((data ?? []).map((e) => e.service_interest).filter(Boolean))] as string[], [data]);
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        (status === "all" || e.status === status) &&
        (service === "all" || e.service_interest === service) &&
        (!term || [e.name, e.email, e.company, e.message, e.phone].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [data, q, status, service]);
  useEffect(() => setPage(0), [q, status, service]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const selected = data?.find((e) => e.id === openId) ?? null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Enquiries" description="Every lead from the website contact form." />

      <Panel className="mb-5 flex flex-col gap-3 p-4 md:flex-row md:items-center md:p-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company or message" className="h-10 rounded-xl pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | LeadStatus)}>
          <SelectTrigger className="h-10 w-full rounded-xl md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={service} onValueChange={setService}>
          <SelectTrigger className="h-10 w-full rounded-xl md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </Panel>

      {error ? (
        <ErrorState message="We couldn't load enquiries." onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={data?.length ? "No enquiries match your filters" : "No enquiries yet"}
          description={data?.length ? "Try clearing the search or filters." : "New messages from the contact form will appear here instantly."}
        />
      ) : (
        <Panel className="overflow-hidden p-0 md:p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Lead</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead className="hidden lg:table-cell">Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Follow-up</TableHead>
                <TableHead className="pr-5 text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setOpenId(e.id)}>
                  <TableCell className="pl-5">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.company || e.email}</p>
                  </TableCell>
                  <TableCell className="hidden text-sm md:table-cell">{e.service_interest || "—"}</TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">{e.budget_range || "—"}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell className="hidden text-sm sm:table-cell">{e.follow_up_date ? format(new Date(e.follow_up_date + "T00:00:00"), "d MMM") : "—"}</TableCell>
                  <TableCell className="pr-5 text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-muted-foreground">
            <span>
              {filtered.length} enquir{filtered.length === 1 ? "y" : "ies"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft /></Button>
              <span>{page + 1} / {pages}</span>
              <Button variant="ghost" size="icon" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight /></Button>
            </div>
          </div>
        </Panel>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && <EnquiryDetail key={selected.id} enquiry={selected} onClose={() => setOpenId(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EnquiryDetail({ enquiry: e, onClose }: { enquiry: Enquiry; onClose: () => void }) {
  const qc = useQueryClient();
  const { canDeleteEnquiries } = useAdmin();
  const [status, setStatus] = useState<LeadStatus>(e.status);
  const [followUp, setFollowUp] = useState(e.follow_up_date ?? "");
  const [notes, setNotes] = useState(e.internal_notes ?? "");
  const dirty = status !== e.status || followUp !== (e.follow_up_date ?? "") || notes !== (e.internal_notes ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("enquiries")
        .update({ status, follow_up_date: followUp || null, internal_notes: notes.trim() ? notes.slice(0, 5000) : null })
        .eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry updated");
      qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enquiries").delete().eq("id", e.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Enquiry deleted");
      qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      onClose();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete"),
  });

  return (
    <>
      <SheetHeader className="px-0">
        <SheetTitle className="font-display text-2xl">{e.name}</SheetTitle>
        <SheetDescription>Received {format(new Date(e.created_at), "d MMM yyyy, HH:mm")}</SheetDescription>
      </SheetHeader>
      <div className="space-y-6 py-4">
        <div className="grid gap-2 text-sm">
          <a href={`mailto:${e.email}`} className="flex items-center gap-2 hover:text-primary-glow"><Mail className="size-4" /> {e.email}</a>
          {e.phone && <a href={`tel:${e.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-2 hover:text-primary-glow"><Phone className="size-4" /> {e.phone}</a>}
          {e.company && <p className="flex items-center gap-2"><Building2 className="size-4" /> {e.company}</p>}
          {e.budget_range && <p className="flex items-center gap-2"><Wallet className="size-4" /> {e.budget_range}</p>}
          {e.service_interest && <p className="flex items-center gap-2"><CalendarClock className="size-4" /> {e.service_interest}</p>}
        </div>
        <div className="rounded-2xl bg-surface p-4 text-sm leading-relaxed whitespace-pre-wrap">{e.message}</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Lead status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{LEAD_STATUS_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="follow">Follow-up date</Label>
            <Input id="follow" type="date" value={followUp} onChange={(ev) => setFollowUp(ev.target.value)} className="h-10 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Internal notes</Label>
          <Textarea id="notes" rows={5} value={notes} maxLength={5000} onChange={(ev) => setNotes(ev.target.value)} placeholder="Only visible to the team" className="rounded-xl" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="hero" size="sm" className="h-9 px-4" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
            {save.isPending && <Loader2 className="animate-spin" />} Save changes
          </Button>
          <Button asChild variant="outline" size="sm" className="h-9 rounded-full">
            <a href={`mailto:${e.email}?subject=${encodeURIComponent("Re: your enquiry to Dev Creative Works")}`}>
              <Mail /> Reply by email
            </a>
          </Button>
          {canDeleteEnquiries && (
            <div className="ml-auto">
              <ConfirmDelete title="Delete this enquiry?" description="The lead and its notes will be permanently removed." onConfirm={() => remove.mutate()} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
