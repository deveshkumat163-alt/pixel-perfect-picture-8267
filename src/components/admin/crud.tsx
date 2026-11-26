import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Search, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-shell";
import { ConfirmDelete, EmptyState, ErrorState, FieldBlock, GalleryField, ImageField, ListEditor, Panel, TagInput, TextField, type ListField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { slugify } from "@/lib/admin/slug";
import { cn } from "@/lib/utils";
import { fetchAllPages } from "@/lib/admin/data";

export type Row = Record<string, unknown> & { id: string };
export type Option = { value: string; label: string };

export type FieldDef =
  | { name: string; label: string; type: "text" | "textarea" | "number" | "date" | "url" | "email"; required?: boolean; wide?: boolean; hint?: string; rows?: number }
  | { name: string; label: string; type: "select"; options: Option[]; required?: boolean; wide?: boolean; nullable?: boolean }
  | { name: string; label: string; type: "tags" | "switch"; wide?: boolean; hint?: string }
  | { name: string; label: string; type: "image" | "gallery"; folder: string; wide?: boolean }
  | { name: string; label: string; type: "list"; fields: ListField[]; wide?: boolean }
  | { name: string; label: string; type: "slug"; from: string; wide?: boolean };

// Dynamic table names can't be typed per call; RLS still enforces every rule.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as unknown as { from: (t: string) => any };

export function str(v: unknown) {
  return v == null ? "" : String(v);
}

export function FormFields({ fields, value, onChange }: { fields: FieldDef[]; value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((f) => {
        const wide = f.wide || ["textarea", "tags", "gallery", "list", "image"].includes(f.type);
        const cls = wide ? "md:col-span-2" : "";
        switch (f.type) {
          case "text":
          case "url":
          case "email":
          case "textarea":
            return (
              <TextField key={f.name} className={cls} label={f.label + (f.required ? " *" : "")} value={str(value[f.name])} onChange={(v) => set(f.name, v)} multiline={f.type === "textarea"} rows={f.rows ?? 4} {...(f.hint ? { hint: f.hint } : {})} />
            );
          case "number":
          case "date":
            return (
              <FieldBlock key={f.name} className={cls} label={f.label + (f.required ? " *" : "")}>
                <Input type={f.type} value={str(value[f.name])} onChange={(e) => set(f.name, e.target.value)} className="h-10 rounded-xl" />
              </FieldBlock>
            );
          case "slug":
            return (
              <FieldBlock key={f.name} className={cls} label={f.label + " *"} hint="Used in the page address. Lowercase letters, numbers and dashes.">
                <div className="flex gap-2">
                  <Input value={str(value[f.name])} onChange={(e) => set(f.name, slugify(e.target.value))} className="h-10 rounded-xl" />
                  <Button type="button" variant="outline" size="sm" className="h-10" onClick={() => set(f.name, slugify(str(value[f.from])))}>Generate</Button>
                </div>
              </FieldBlock>
            );
          case "select":
            return (
              <FieldBlock key={f.name} className={cls} label={f.label + (f.required ? " *" : "")}>
                <select value={str(value[f.name])} onChange={(e) => set(f.name, e.target.value || null)} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
                  {(f.nullable ?? !f.required) && <option value="">— None —</option>}
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FieldBlock>
            );
          case "switch":
            return (
              <label key={f.name} className={cn("flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm", cls)}>
                {f.label}
                <Switch checked={!!value[f.name]} onCheckedChange={(c) => set(f.name, c)} />
              </label>
            );
          case "tags":
            return <div key={f.name} className={cls}><TagInput label={f.label} value={(value[f.name] as string[]) ?? []} onChange={(v) => set(f.name, v)} {...(f.hint ? { hint: f.hint } : {})} /></div>;
          case "image":
            return <div key={f.name} className={cls}><ImageField label={f.label} folder={f.folder} value={(value[f.name] as string | null) ?? null} onChange={(v) => set(f.name, v)} /></div>;
          case "gallery":
            return <div key={f.name} className={cls}><GalleryField label={f.label} folder={f.folder} value={(value[f.name] as string[]) ?? []} onChange={(v) => set(f.name, v)} /></div>;
          case "list":
            return <div key={f.name} className={cls}><ListEditor label={f.label} fields={f.fields} value={(value[f.name] as Record<string, string>[]) ?? []} onChange={(v) => set(f.name, v)} /></div>;
        }
      })}
    </div>
  );
}

/** Turns form strings back into database values (numbers, nulls). */
export function normalize(fields: FieldDef[], v: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    let x = v[f.name];
    if (f.type === "number") x = x === "" || x == null ? null : Number(x);
    else if (f.type === "date" || f.type === "select" || f.type === "url" || f.type === "email") x = x === "" || x == null ? null : x;
    else if (f.type === "text" || f.type === "textarea" || f.type === "slug") x = str(x).trim();
    out[f.name] = x;
  }
  return out;
}

export function missingRequired(fields: FieldDef[], v: Record<string, unknown>) {
  return fields.find((f) => ("required" in f && f.required) || f.type === "slug" ? str(v[f.name]).trim() === "" : false);
}

export type Column = { label: string; render: (r: Row) => ReactNode; className?: string };

export function ResourcePage({
  table,
  title,
  description,
  icon,
  singular,
  fields,
  columns,
  defaults,
  orderBy = { column: "created_at", ascending: false },
  select = "*",
  searchKeys,
  canEdit,
  canCreate = canEdit,
  canDelete,
  filter,
  extraDetail,
  rowCanEdit,
  rowCanDelete,
  invalidate = [],
}: {
  table: string;
  title: string;
  description: string;
  icon: LucideIcon;
  singular: string;
  fields: FieldDef[];
  columns: Column[];
  defaults: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  select?: string;
  searchKeys: string[];
  canEdit: boolean;
  canCreate?: boolean;
  canDelete: boolean;
  filter?: { label: string; key: string; options: Option[] };
  extraDetail?: (r: Row) => ReactNode;
  rowCanEdit?: (r: Row) => boolean;
  rowCanDelete?: (r: Row) => boolean;
  invalidate?: string[][];
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      return fetchAllPages<Row>((from, to) => db.from(table).select(select).order(orderBy.column, { ascending: orderBy.ascending }).order("id").range(from, to));
    },
  });
  const [q, setQ] = useState("");
  const [fv, setFv] = useState("all");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const editable = canEdit && (!editing?.["id"] || !rowCanEdit || rowCanEdit(editing as Row));
  const deletable = canDelete && (!editing?.["id"] || !rowCanDelete || rowCanDelete(editing as Row));

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (query.data ?? []).filter(
      (r) => (!term || searchKeys.some((k) => str(r[k]).toLowerCase().includes(term))) && (!filter || fv === "all" || str(r[filter.key]) === fv),
    );
  }, [query.data, q, fv, filter, searchKeys]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    qc.invalidateQueries({ predicate: q => ["site-content", "services", "service", "portfolio", "testimonials", "faqs"].includes(String(q.queryKey[0])) });
    for (const k of invalidate) qc.invalidateQueries({ queryKey: k });
  };

  const save = useMutation({
    mutationFn: async (v: Record<string, unknown>) => {
      const miss = missingRequired(fields, v);
      if (miss) throw new Error(`${miss.label} is required`);
      const payload = normalize(fields, v);
      const res = v["id"] ? await db.from(table).update(payload).eq("id", v["id"]).select("id").single() : await db.from(table).insert(payload).select("id").single();
      if (res.error) throw res.error;
    },
    onSuccess: (_d, v) => {
      toast.success(v["id"] ? `${singular} updated` : `${singular} created`);
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id).select("id").single();
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${singular} deleted`);
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={canCreate ? <Button variant="hero" size="sm" className="h-10 px-5" onClick={() => setEditing({ ...defaults })}><Plus /> New {singular.toLowerCase()}</Button> : undefined}
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 rounded-xl pl-9" />
        </div>
        {filter && (
          <select value={fv} onChange={(e) => setFv(e.target.value)} className="h-10 rounded-xl border border-input bg-background px-3 text-sm md:w-52" aria-label={filter.label}>
            <option value="all">All {filter.label.toLowerCase()}</option>
            {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </div>
      <Panel className="p-0">
        {query.isLoading ? (
          <div className="space-y-2 p-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : query.error ? (
          <ErrorState message={query.error instanceof Error ? query.error.message : "Could not load"} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState icon={icon} title={query.data?.length ? "No matches" : `No ${title.toLowerCase()} yet`} {...(canCreate && !query.data?.length ? { action: <Button variant="outline" size="sm" onClick={() => setEditing({ ...defaults })}><Plus /> Add the first one</Button> } : {})} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => <TableHead key={c.label} className={c.className}>{c.label}</TableHead>)}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setEditing({ ...r })}>
                    {columns.map((c) => <TableCell key={c.label} className={c.className}>{c.render(r)}</TableCell>)}
                    <TableCell><Pencil className="size-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Panel>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {editing && (
            <>
              <SheetHeader className="px-0">
                <SheetTitle className="font-display text-2xl">{editing["id"] ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</SheetTitle>
                <SheetDescription>{editable ? "Record details" : "Read-only record"}</SheetDescription>
              </SheetHeader>
              <fieldset disabled={!editable || save.isPending} className="py-4">
                <FormFields fields={fields} value={editing} onChange={setEditing} />
              </fieldset>
              {editing["id"] && extraDetail ? <div className="pb-4">{extraDetail(editing as Row)}</div> : null}
              <div className="flex flex-wrap items-center gap-2 border-t border-border py-4">
                 {editable && (
                  <Button variant="hero" size="sm" className="h-10 px-5" disabled={save.isPending} onClick={() => save.mutate(editing)}>
                    {save.isPending && <Loader2 className="animate-spin" />} Save
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                {deletable && editing["id"] ? (
                  <div className="ml-auto">
                    <ConfirmDelete title={`Delete this ${singular.toLowerCase()}?`} description="This cannot be undone." onConfirm={() => remove.mutate(str(editing["id"]))} />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function useOptions(table: string, label: string, opts?: { order?: string }) {
  return useQuery({
    queryKey: ["admin", table, "options"],
    queryFn: async () => {
      const { data, error } = await db.from(table).select(`id, ${label}`).order(opts?.order ?? label);
      if (error) throw error;
      return ((data ?? []) as Row[]).map((r) => ({ value: r.id, label: str(r[label]) })) as Option[];
    },
    staleTime: 30_000,
  });
}

export function YesNo({ on, yes = "Published", no = "Hidden" }: { on: unknown; yes?: string; no?: string }) {
  return <span className={cn("text-xs", on ? "text-success" : "text-muted-foreground")}>{on ? yes : no}</span>;
}
