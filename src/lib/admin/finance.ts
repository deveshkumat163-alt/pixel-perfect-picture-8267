export type LineItem = { quantity: number | string; unit_price: number | string };
export type PaymentLite = { amount: number | string; status: string };
export type InvoiceLite = { status: "draft" | "sent" | "void"; due_date: string | null };

export type InvoiceDisplayStatus = "draft" | "void" | "unpaid" | "partially_paid" | "paid" | "overdue";

export const INVOICE_DISPLAY_LABELS: Record<InvoiceDisplayStatus, string> = {
  draft: "Draft",
  void: "Void",
  unpaid: "Unpaid",
  partially_paid: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Same formula as the database's invoice_total(): discount is taken off before tax. */
export function invoiceTotals(items: LineItem[], discount: number | string, taxRate: number | string) {
  const subtotal = round2(items.reduce((s, i) => s + num(i.quantity) * num(i.unit_price), 0));
  const disc = round2(Math.min(num(discount), subtotal));
  const taxable = round2(Math.max(subtotal - disc, 0));
  const tax = round2((taxable * num(taxRate)) / 100);
  return { subtotal, discount: disc, taxable, tax, total: round2(taxable + tax) };
}

/** Only confirmed payments count as money received. Pending, failed and refunded never do. */
export function paidAmount(payments: PaymentLite[]) {
  return round2(payments.filter((p) => p.status === "confirmed").reduce((s, p) => s + num(p.amount), 0));
}

export function balanceDue(total: number, payments: PaymentLite[]) {
  return round2(Math.max(total - paidAmount(payments), 0));
}

/** An invoice is "paid" only when confirmed payments cover its total — sending it is never enough. */
export function invoiceDisplayStatus(
  invoice: InvoiceLite,
  total: number,
  payments: PaymentLite[],
  today: string = new Date().toISOString().slice(0, 10),
): InvoiceDisplayStatus {
  if (invoice.status === "void") return "void";
  if (invoice.status === "draft") return "draft";
  const paid = paidAmount(payments);
  if (total > 0 && paid >= total) return "paid";
  if (invoice.due_date && invoice.due_date < today) return "overdue";
  if (paid > 0) return "partially_paid";
  return "unpaid";
}

export function formatMoney(amount: number | string, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(num(amount));
  } catch {
    return `${currency} ${num(amount).toFixed(2)}`;
  }
}

export type FinanceSettings = {
  currency: string;
  tax_rate: number;
  tax_label: string;
  payment_terms_days: number;
  terms: string;
  bank_details: string;
  business_name: string;
  business_address: string;
  tax_id: string;
};

export const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  currency: "INR",
  tax_rate: 18,
  tax_label: "GST",
  payment_terms_days: 15,
  terms: "",
  bank_details: "",
  business_name: "Dev Creative Works",
  business_address: "",
  tax_id: "",
};
