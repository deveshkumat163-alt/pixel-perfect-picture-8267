import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Printer, Trash2, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "./admin-shell";
import { ErrorState, EmptyState, ConfirmDelete } from "./fields";
import { FormFields, ResourcePage, useOptions, str, type FieldDef, type Row } from "./crud";
import { useAdmin } from "./use-admin";
import { invoiceTotals, paidAmount, balanceDue, invoiceDisplayStatus, INVOICE_DISPLAY_LABELS, formatMoney, DEFAULT_FINANCE_SETTINGS } from "@/lib/admin/finance";
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/admin/roles";

type Invoice = Tables<"invoices"> & { invoice_items: Tables<"invoice_items">[]; payments: Tables<"payments">[]; clients: Tables<"clients"> | null };
type Item = { description: string; quantity: string | number; unit_price: string | number };
function useInvoices() { return useQuery({ queryKey: ["admin", "invoices"], queryFn: async () => { const r = await supabase.from("invoices").select("*, invoice_items(*), payments(*), clients(*)").order("created_at", { ascending: false }); if (r.error) throw r.error; return r.data as Invoice[]; } }); }
function useFinanceSettings() { return useQuery({ queryKey: ["admin", "app_settings"], queryFn: async () => { const r = await supabase.from("app_settings").select("value").eq("key", "finance").maybeSingle(); if (r.error) throw r.error; return { ...DEFAULT_FINANCE_SETTINGS, ...r.data?.value as Partial<typeof DEFAULT_FINANCE_SETTINGS> }; } }); }
function PrintDocument({ invoice, payment }: { invoice: Invoice; payment?: Row }) {
  const settings = useFinanceSettings();
  const totals = invoiceTotals(invoice.invoice_items, invoice.discount, invoice.tax_rate);
  return <section className="print-document my-6 space-y-5 border-y border-border py-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-xl">{settings.data?.business_name ?? "Dev Creative Works"}</h2><p className="whitespace-pre-wrap text-sm">{settings.data?.business_address}</p><p className="text-sm">{settings.data?.tax_id}</p></div><div className="text-right"><h3 className="font-semibold">{payment ? "Payment receipt" : "Invoice"}</h3><p className="font-mono text-sm">{payment ? str(payment["receipt_number"]) : invoice.invoice_number}</p><p className="text-sm">{payment ? str(payment["paid_on"]) : invoice.issue_date}</p></div></div><div><h3 className="text-xs text-muted-foreground">BILL TO</h3><p className="font-medium">{invoice.clients?.company || invoice.clients?.name}</p><p className="whitespace-pre-wrap text-sm">{invoice.clients?.address}</p><p className="text-sm">{invoice.clients?.email}</p><p className="text-sm">{invoice.clients?.tax_id}</p></div>{payment ? <div className="space-y-2"><p>Invoice: {invoice.invoice_number}</p><p className="text-2xl font-semibold">{formatMoney(str(payment["amount"]), invoice.currency)}</p><p>{PAYMENT_METHOD_LABELS[str(payment["method"])]} · {str(payment["reference"])}</p><p className="text-sm">Confirmed on {str(payment["verified_at"]).slice(0, 10)}</p></div> : <><Table><TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Qty</TableHead><TableHead>Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{invoice.invoice_items.map(i => <TableRow key={i.id}><TableCell>{i.description}</TableCell><TableCell>{i.quantity}</TableCell><TableCell>{formatMoney(i.unit_price, invoice.currency)}</TableCell><TableCell className="text-right">{formatMoney(i.quantity * i.unit_price, invoice.currency)}</TableCell></TableRow>)}</TableBody></Table><div className="space-y-2 text-right text-sm"><p>Subtotal {formatMoney(totals.subtotal, invoice.currency)}</p><p>Discount {formatMoney(totals.discount, invoice.currency)}</p><p>{invoice.tax_label} ({invoice.tax_rate}%) {formatMoney(totals.tax, invoice.currency)}</p><p className="text-lg font-semibold">Total {formatMoney(totals.total, invoice.currency)}</p><p>Confirmed payments {formatMoney(paidAmount(invoice.payments), invoice.currency)}</p><p>Balance due {formatMoney(balanceDue(totals.total, invoice.payments), invoice.currency)}</p><p>Due date: {invoice.due_date ?? "—"}</p></div><p className="whitespace-pre-wrap text-sm">{invoice.notes}</p><p className="whitespace-pre-wrap text-sm">{invoice.terms}</p><p className="whitespace-pre-wrap text-sm">{settings.data?.bank_details}</p></>}<Button variant="outline" className="no-print" onClick={() => window.print()}><Printer /> Print / Save PDF</Button></section>;
}
export function InvoicesPage() {
  const { canManageFinance } = useAdmin();
  const query = useInvoices();
  const settings = useFinanceSettings();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const qc = useQueryClient();
  const clients = useOptions("clients", "name");
  const projects = useOptions("projects", "name");
  const fields: FieldDef[] = [
    { name: "client_id", label: "Client", type: "select", required: true, options: clients.data ?? [] },
    { name: "project_id", label: "Project", type: "select", options: projects.data ?? [] },
    { name: "status", label: "Invoice status", type: "select", required: true, options: ["draft", "sent", "void"].map(value => ({ value, label: value[0]?.toUpperCase() + value.slice(1) })) },
    { name: "issue_date", label: "Issue date", type: "date", required: true },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "currency", label: "Currency", type: "text", required: true },
    { name: "tax_rate", label: "Tax rate (%)", type: "number" },
    { name: "tax_label", label: "Tax label", type: "text" },
    { name: "discount", label: "Discount", type: "number" },
    { name: "notes", label: "Notes", type: "textarea" },
    { name: "terms", label: "Terms", type: "textarea" },
  ];
  const existing = query.data?.find(i => i.id === editing?.["id"]);
  const locked = !!existing?.payments.length;
  function open(invoice?: Invoice) {
    if (invoice) { setEditing({ ...invoice }); setItems(invoice.invoice_items.map(i => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price }))); }
    else { const defaults = settings.data ?? DEFAULT_FINANCE_SETTINGS; const due = new Date(); due.setDate(due.getDate() + defaults.payment_terms_days); setEditing({ client_id: "", status: "draft", issue_date: new Date().toISOString().slice(0, 10), due_date: due.toISOString().slice(0, 10), currency: defaults.currency, tax_rate: defaults.tax_rate, tax_label: defaults.tax_label, discount: 0, terms: defaults.terms, notes: "" }); setItems([{ description: "", quantity: 1, unit_price: 0 }]); }
  }
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "invoices"] }); qc.invalidateQueries({ queryKey: ["admin", "dashboard"] }); qc.invalidateQueries({ queryKey: ["admin", "payments"] }); };
  const save = useMutation({ mutationFn: async () => {
    if (!editing?.["client_id"] || !editing["issue_date"]) throw new Error("Client and issue date are required");
    if (!items.length || items.some(i => !i.description.trim() || Number(i.quantity) <= 0 || Number(i.unit_price) < 0 || !Number.isFinite(Number(i.quantity)) || !Number.isFinite(Number(i.unit_price)))) throw new Error("Each item needs a description, positive quantity and valid price");
    const r = await supabase.rpc("save_invoice", { _invoice: editing as Json, _items: items.map((i, sort_order) => ({ ...i, description: i.description.trim(), sort_order })) as Json });
    if (r.error) throw r.error;
  }, onSuccess: () => { toast.success("Invoice saved"); setEditing(null); refresh(); }, onError: e => toast.error(e.message) });
  async function remove(id: string) { const r = await supabase.from("invoices").delete().eq("id", id).select("id").single(); if (r.error) toast.error(r.error.message); else { setEditing(null); toast.success("Invoice deleted"); refresh(); } }
  if (!canManageFinance) return <ErrorState message="Finance is restricted to Admins." />;
  const total = invoiceTotals(items, str(editing?.["discount"]), str(editing?.["tax_rate"]));
  return <div><PageHeader title="Invoices" description="Billing, balances and printable invoices." action={<Button onClick={() => open()}><Plus /> New invoice</Button>} /><div className="mb-5 flex flex-wrap gap-3"><Input aria-label="Search invoices" placeholder="Search invoice or client" value={search} onChange={e => setSearch(e.target.value)} className="min-w-48 flex-1" /><select aria-label="Invoice status filter" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg border border-input bg-background px-3"><option value="all">All statuses</option>{Object.entries(INVOICE_DISPLAY_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>{query.error ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Client</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead>Balance</TableHead><TableHead>Due</TableHead></TableRow></TableHeader><TableBody>{query.data?.filter(i => `${i.invoice_number} ${i.clients?.name}`.toLowerCase().includes(search.toLowerCase())).filter(i => filter === "all" || invoiceDisplayStatus(i, invoiceTotals(i.invoice_items, i.discount, i.tax_rate).total, i.payments) === filter).map(i => { const t = invoiceTotals(i.invoice_items, i.discount, i.tax_rate).total; return <TableRow key={i.id} className="cursor-pointer" onClick={() => open(i)}><TableCell>{i.invoice_number}</TableCell><TableCell>{i.clients?.name}</TableCell><TableCell>{INVOICE_DISPLAY_LABELS[invoiceDisplayStatus(i, t, i.payments)]}</TableCell><TableCell>{formatMoney(t, i.currency)}</TableCell><TableCell>{formatMoney(balanceDue(t, i.payments), i.currency)}</TableCell><TableCell>{i.due_date ?? "—"}</TableCell></TableRow>; })}</TableBody></Table></div>}{query.data?.length === 0 && <EmptyState icon={Wallet} title="No invoices yet" />}<Sheet open={!!editing} onOpenChange={o => !o && setEditing(null)}><SheetContent className="w-full overflow-y-auto sm:max-w-3xl">{editing && <><SheetHeader><SheetTitle>{existing?.invoice_number ?? "New invoice"}</SheetTitle><SheetDescription>{locked ? "Billing details are locked because payments have been recorded." : "Invoice details and line items"}</SheetDescription></SheetHeader><fieldset disabled={locked || save.isPending} className="space-y-6 py-5"><FormFields fields={fields} value={editing} onChange={setEditing} /><h3 className="font-medium">Line items</h3>{items.map((item, idx) => <div key={idx} className="grid grid-cols-2 gap-3 border-b border-border pb-4 sm:grid-cols-[1fr_80px_110px_40px]">{(["description", "quantity", "unit_price"] as const).map(k => <label key={k} className={`space-y-1 text-xs ${k === "description" ? "col-span-2 sm:col-span-1" : ""}`}>{k === "unit_price" ? "Unit price" : k === "quantity" ? "Quantity" : "Description"}<Input type={k === "description" ? "text" : "number"} min={k === "quantity" ? "0.01" : "0"} step="0.01" value={item[k]} onChange={e => setItems(items.map((v,j) => j === idx ? { ...v, [k]: e.target.value } : v))} /></label>)}<Button variant="ghost" size="icon" aria-label="Remove line item" onClick={() => setItems(items.filter((_,j) => j !== idx))}><Trash2 /></Button></div>)}<Button variant="outline" size="sm" onClick={() => setItems([...items,{ description: "", quantity: 1, unit_price: 0 }])}><Plus /> Add line item</Button><p className="text-right text-xl font-semibold">Total {formatMoney(total.total, str(editing["currency"]))}</p></fieldset><div className="flex gap-3">{!locked && <Button onClick={() => save.mutate()} disabled={save.isPending}>Save invoice</Button>}<Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>{existing && !locked && <ConfirmDelete title="Delete invoice?" onConfirm={() => remove(existing.id)} />}</div>{existing && <PrintDocument invoice={existing} />}</>}</SheetContent></Sheet></div>;
}
export function PaymentsPage() {
  const { canManageFinance } = useAdmin();
  const invoices = useInvoices();
  const options = Object.entries(PAYMENT_STATUS_LABELS).map(([value,label]) => ({ value,label }));
  const fields: FieldDef[] = [
    { name: "invoice_id", label: "Invoice", type: "select", required: true, options: (invoices.data ?? []).map(i => ({ value: i.id, label: `${i.invoice_number} · ${i.clients?.name}` })) },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "paid_on", label: "Payment date", type: "date", required: true },
    { name: "method", label: "Method", type: "select", required: true, options: Object.entries(PAYMENT_METHOD_LABELS).map(([value,label]) => ({ value,label })) },
    { name: "reference", label: "Reference", type: "text" },
    { name: "status", label: "Verification status", type: "select", required: true, options },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
  if (!canManageFinance) return <ErrorState message="Finance is restricted to Admins." />;
  return <ResourcePage table="payments" title="Payments & receipts" singular="Payment" icon={Wallet} description="Record payments and confirm them to issue receipts." fields={fields} defaults={{ amount: "", paid_on: new Date().toISOString().slice(0,10), method: "bank_transfer", status: "pending" }} searchKeys={["receipt_number", "reference", "notes"]} filter={{ label: "Statuses", key: "status", options }} columns={[
    { label: "Invoice", render: r => invoices.data?.find(i => i.id === r["invoice_id"])?.invoice_number },
    { label: "Amount", render: r => formatMoney(str(r["amount"]), invoices.data?.find(i => i.id === r["invoice_id"])?.currency) },
    { label: "Status", render: r => PAYMENT_STATUS_LABELS[r["status"] as keyof typeof PAYMENT_STATUS_LABELS] },
    { label: "Date", render: r => str(r["paid_on"]) },
    { label: "Receipt", render: r => r["status"] === "confirmed" ? str(r["receipt_number"]) : "—" },
  ]} canEdit canDelete={false} invalidate={[["admin","invoices"]]} extraDetail={r => { const invoice = invoices.data?.find(i => i.id === r["invoice_id"]); return invoice && r["status"] === "confirmed" ? <PrintDocument invoice={invoice} payment={r} /> : <p className="text-sm text-muted-foreground">No receipt until this payment is confirmed.</p>; }} />;
}
