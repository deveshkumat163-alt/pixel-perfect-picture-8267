import type { LeadStatus } from "./roles";

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
