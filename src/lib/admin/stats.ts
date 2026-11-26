import type { LeadStatus } from "./roles";
import { balanceDue, invoiceTotals, paidAmount, type LineItem, type PaymentLite } from "./finance";

export type EnquiryLite = { status: LeadStatus; created_at: string; service_interest: string | null };

/** Last `months` calendar months (UTC), oldest first, with enquiry counts. */
export function enquiriesByMonth(rows: EnquiryLite[], now: Date, months = 6) {
  const buckets: { key: string; label: string; count: number; converted: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    buckets.push({
      key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
      label: d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" }),
      count: 0,
      converted: 0,
    });
  }
  for (const r of rows) {
    const d = new Date(r.created_at);
    const b = buckets.find((x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (b) {
      b.count++;
      if (r.status === "converted") b.converted++;
    }
  }
  return buckets;
}

/** Converted ÷ closed-or-converted leads is misleading early on; use converted ÷ all leads. */
export function conversionRate(rows: EnquiryLite[]) {
  if (!rows.length) return 0;
  return Math.round((rows.filter((r) => r.status === "converted").length / rows.length) * 100);
}

type FinanceInvoice = { currency: string; status: string; discount: number; tax_rate: number; invoice_items: LineItem[]; payments: PaymentLite[] };
/** Keep currencies separate and count only confirmed receipts as revenue. */
export function financeSummary(invoices: FinanceInvoice[]) {
  const currencies = new Map<string, { currency: string; received: number; outstanding: number }>();
  for (const invoice of invoices) {
    const bucket = currencies.get(invoice.currency) ?? { currency: invoice.currency, received: 0, outstanding: 0 };
    bucket.received += paidAmount(invoice.payments);
    if (invoice.status === "sent") bucket.outstanding += balanceDue(invoiceTotals(invoice.invoice_items, invoice.discount, invoice.tax_rate).total, invoice.payments);
    currencies.set(invoice.currency, bucket);
  }
  return [...currencies.values()].map(b => ({ ...b, received: Math.round(b.received * 100) / 100, outstanding: Math.round(b.outstanding * 100) / 100 }));
}
