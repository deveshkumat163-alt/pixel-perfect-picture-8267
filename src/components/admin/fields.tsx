import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { uploadMedia } from "@/lib/admin/upload";
import { cn } from "@/lib/utils";

export function FieldBlock({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  placeholder,
  hint,
  className,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
  className?: string;
  maxLength?: number;
}) {
  return (
    <FieldBlock label={label} {...(hint ? { hint } : {})} {...(className ? { className } : {})}>
      {multiline ? (
        <Textarea
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          {...(placeholder ? { placeholder } : {})}
          {...(maxLength ? { maxLength } : {})}
          className="rounded-xl"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...(placeholder ? { placeholder } : {})}
          {...(maxLength ? { maxLength } : {})}
          className="h-10 rounded-xl"
        />
      )}
    </FieldBlock>
  );
}

export function TagInput({ label, value, onChange, placeholder = "Type and press Enter", hint }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setDraft("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }
  return (
    <FieldBlock label={label} {...(hint ? { hint } : {})}>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-transparent p-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-accent px-2 py-1 text-xs">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="min-w-24 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </FieldBlock>
  );
}

export type ListField = { name: string; label: string; multiline?: boolean; options?: string[] };

export function ListEditor({
  label,
  fields,
  value,
  onChange,
  addLabel = "Add item",
}: {
  label: string;
  fields: ListField[];
  value: Record<string, string>[];
  onChange: (v: Record<string, string>[]) => void;
  addLabel?: string;
}) {
  function update(i: number, name: string, v: string) {
    onChange(value.map((item, idx) => (idx === i ? { ...item, [name]: v } : item)));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {value.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
      {value.map((item, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">↓</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove item">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map((f) =>
              f.options ? (
                <FieldBlock key={f.name} label={f.label}>
                  <select
                    value={item[f.name] ?? ""}
                    onChange={(e) => update(i, f.name, e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </FieldBlock>
              ) : (
                <TextField
                  key={f.name}
                  label={f.label}
                  value={item[f.name] ?? ""}
                  onChange={(v) => update(i, f.name, v)}
                  multiline={!!f.multiline}
                  rows={2}
                  {...(f.multiline ? { className: "md:col-span-2" } : {})}
                />
              ),
            )}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => onChange([...value, Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? ""]))])}
      >
        <Plus /> {addLabel}
      </Button>
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  folder: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadMedia(file, folder));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }
  return (
    <FieldBlock label={label} hint="JPG, PNG or WebP up to 10 MB">
      <div className="flex items-center gap-4">
        <div className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-6 text-muted-foreground" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => ref.current?.click()}>
            {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
    </FieldBlock>
  );
}

export function GalleryField({ label, value, onChange, folder }: { label: string; value: string[]; onChange: (v: string[]) => void; folder: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        added.push(await uploadMedia(f, folder));
      } catch (e) {
        toast.error(`${f.name}: ${e instanceof Error ? e.message : "Upload failed"}`);
      }
    }
    if (added.length) onChange([...value, ...added]);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }
  return (
    <FieldBlock label={label}>
      <div className="flex flex-wrap gap-3">
        {value.map((src) => (
          <div key={src} className="group relative h-20 w-28 overflow-hidden rounded-xl border border-border">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== src))}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="grid h-20 w-28 place-items-center rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
        </button>
        <input ref={ref} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>
    </FieldBlock>
  );
}

export function ConfirmDelete({
  title = "Delete this item?",
  description = "This can't be undone.",
  onConfirm,
  trigger,
}: {
  title?: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  trigger?: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void onConfirm()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <p className="font-display text-lg font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-6 py-10 text-center">
      <p className="font-medium">Something went wrong</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-border bg-card p-5 shadow-card md:p-6", className)}>{children}</div>;
}
