import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Copy, FileImage, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "./admin-shell";
import { ErrorState, ImageField, ConfirmDelete } from "./fields";
import { useAdmin } from "./use-admin";
import { DEFAULT_FINANCE_SETTINGS } from "@/lib/admin/finance";
import { uploadMedia } from "@/lib/admin/upload";

const label = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
function blankLike(v: Json): Json {
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x ?? null)]));
  return typeof v === "number" ? 0 : typeof v === "boolean" ? false : "";
}
function ValueEditor({ name, value, change }: { name: string; value: Json; change: (value: Json) => void }) {
  if (Array.isArray(value)) return <div className="space-y-3"><h3 className="font-medium">{label(name)}</h3>{value.map((v, i) => <div key={i} className="flex gap-3 border-l border-border pl-4"><div className="min-w-0 flex-1"><ValueEditor name={`${name} ${i + 1}`} value={v} change={n => change(value.map((x, j) => j === i ? n : x))} /></div><Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => change(value.filter((_, j) => j !== i))}><Trash2 /></Button></div>)}<Button variant="outline" size="sm" onClick={() => change([...value, blankLike(value[0] ?? (name === "achievements" ? { value: "", label: "" } : ""))])}><Plus /> Add item</Button></div>;
  if (value && typeof value === "object") return <div className="grid gap-4 sm:grid-cols-2">{Object.entries(value).map(([k, v]) => <div key={k} className={typeof v === "object" || String(v ?? "").length > 100 ? "sm:col-span-2" : ""}><ValueEditor name={k} value={v ?? null} change={n => change({ ...value, [k]: n })} /></div>)}</div>;
  if (name === "photo_url" || name === "avatar_url") return <ImageField label={label(name)} folder="site" value={String(value ?? "") || null} onChange={change} />;
  return <label className="block space-y-2 text-sm"><span>{label(name)}</span>{typeof value === "boolean" ? <Switch checked={value} onCheckedChange={change} /> : typeof value === "number" ? <Input type="number" value={value} onChange={e => change(Number(e.target.value))} /> : <Textarea rows={String(value ?? "").length > 100 ? 4 : 2} value={String(value ?? "")} onChange={e => change(e.target.value)} />}</label>;
}
function ContentForm({ table, recordKey, initial }: { table: "website_content" | "app_settings"; recordKey: string; initial: Json }) {
  const [value, setValue] = useState(initial);
  const qc = useQueryClient();
  const { canManageContent } = useAdmin();
  const save = useMutation({ mutationFn: async () => {
    const { error } = await supabase.from(table).upsert({ key: recordKey, value }).select("key").single();
    if (error) throw error;
  }, onSuccess: () => { toast.success("Changes saved"); qc.invalidateQueries({ queryKey: ["admin", table] }); qc.invalidateQueries({ queryKey: ["site"] }); }, onError: e => toast.error(e.message) });
  return <section className="border-b border-border py-6"><h2 className="mb-5 font-display text-xl">{label(recordKey)}</h2><fieldset disabled={!canManageContent || save.isPending}><ValueEditor name={recordKey} value={value} change={setValue} /></fieldset>{canManageContent && <Button className="mt-5" size="sm" onClick={() => save.mutate()} disabled={save.isPending}><Save /> Save {label(recordKey)}</Button>}</section>;
}
export function SiteContentPage() {
  const [selected, setSelected] = useState("company");
  const query = useQuery({ queryKey: ["admin", "website_content"], queryFn: async () => { const r = await supabase.from("website_content").select("*").order("key"); if (r.error) throw r.error; return r.data; } });
  const record = query.data?.find(r => r.key === selected) ?? query.data?.[0];
  return <div className="mx-auto max-w-5xl"><PageHeader title="Website content" description="Company details, page copy, social links and SEO." />{query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : <><div className="mb-4 flex flex-wrap gap-2">{query.data?.map(r => <Button key={r.key} size="sm" variant={record?.key === r.key ? "secondary" : "ghost"} onClick={() => setSelected(r.key)}>{label(r.key)}</Button>)}</div>{record && <ContentForm key={record.key} table="website_content" recordKey={record.key} initial={record.value} />}</>}</div>;
}
export function SettingsPage() {
  const query = useQuery({ queryKey: ["admin", "app_settings"], queryFn: async () => { const r = await supabase.from("app_settings").select("value").eq("key", "finance").maybeSingle(); if (r.error) throw r.error; return { ...DEFAULT_FINANCE_SETTINGS, ...(r.data?.value as Record<string, Json> ?? {}) } as Json; } });
  return <div className="mx-auto max-w-4xl"><PageHeader title="Settings" description="Business details and default invoice terms." />{query.error ? <ErrorState message={query.error.message} /> : query.data && <ContentForm table="app_settings" recordKey="finance" initial={query.data} />}</div>;
}
export function ProfilePage() {
  const { profile, user } = useAdmin();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [title, setTitle] = useState(profile?.title ?? "");
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? null);
  const router = useRouter();
  const save = useMutation({ mutationFn: async () => { const r = await supabase.from("profiles").update({ full_name: name.trim(), title: title.trim(), avatar_url: avatar }).eq("id", user.id).select("id").single(); if (r.error) throw r.error; }, onSuccess: () => { toast.success("Profile updated"); router.invalidate(); }, onError: e => toast.error(e.message) });
  return <div className="max-w-xl"><PageHeader title="My profile" description={user.email ?? ""} /><div className="space-y-5"><ImageField label="Photo" value={avatar} onChange={setAvatar} folder="avatars" /><label className="block space-y-2 text-sm">Full name<Input value={name} onChange={e => setName(e.target.value)} /></label><label className="block space-y-2 text-sm">Job title<Input value={title} onChange={e => setTitle(e.target.value)} /></label><Button onClick={() => save.mutate()} disabled={save.isPending}><Save /> Save profile</Button></div></div>;
}
export function MediaPage() {
  const qc = useQueryClient();
  const { canManageContent } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["admin", "media"], queryFn: async () => {
    async function list(folder: string): Promise<{ path: string; name: string }[]> {
      const result: { path: string; name: string }[] = [];
      for (let offset = 0; ; offset += 100) {
        const r = await supabase.storage.from("media").list(folder, { limit: 100, offset });
        if (r.error) throw r.error;
        for (const f of r.data) { const path = folder ? `${folder}/${f.name}` : f.name; if (f.id) result.push({ path, name: f.name }); else result.push(...await list(path)); }
        if (r.data.length < 100) break;
      }
      return result;
    }
    return list("");
  } });
  async function upload(files: FileList | null) { if (!files) return; setBusy(true); try { for (const file of Array.from(files)) await uploadMedia(file, "library"); toast.success("Media uploaded"); qc.invalidateQueries({ queryKey: ["admin", "media"] }); } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); } finally { setBusy(false); } }
  async function remove(path: string) { const r = await supabase.storage.from("media").remove([path]); if (r.error) toast.error(r.error.message); else { toast.success("Media deleted"); qc.invalidateQueries({ queryKey: ["admin", "media"] }); } }
  return <div><PageHeader title="Media library" description="Images and videos uploaded by your team." />{canManageContent && <label className="mb-5 block text-sm">Upload files<Input type="file" multiple disabled={busy} accept="image/*,video/mp4,video/webm" onChange={e => upload(e.target.files)} /></label>}<Input aria-label="Search media" placeholder="Search media" value={search} onChange={e => setSearch(e.target.value)} className="mb-5" />{query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{query.data?.filter(f => f.path.toLowerCase().includes(search.toLowerCase())).map(f => { const url = `/api/public/media/${f.path}`; return <article key={f.path} className="overflow-hidden rounded-lg border border-border bg-card"><div className="aspect-video bg-muted">{/\.(mp4|webm)$/i.test(f.name) ? <video src={url} controls className="h-full w-full object-contain" /> : <img src={url} alt={f.name} className="h-full w-full object-contain" />}</div><div className="flex items-center gap-2 p-3"><p className="min-w-0 flex-1 truncate text-xs" title={f.path}>{f.name}</p><Button variant="ghost" size="icon" aria-label="Copy media link" onClick={async () => { try { await navigator.clipboard.writeText(new URL(url, window.location.origin).href); toast.success("Link copied"); } catch { toast.error("Could not copy link"); } }}><Copy /></Button>{canManageContent && <ConfirmDelete title="Delete media?" description="Pages using this file will no longer display it." onConfirm={() => remove(f.path)} />}</div></article>; })}</div>}{query.data?.length === 0 && <div className="py-16 text-center text-muted-foreground"><FileImage className="mx-auto mb-3" />No uploaded media yet.</div>}</div>;
}
