import { describe, expect, it } from "vitest";
import { financeSummary } from "@/lib/admin/stats";
import { fetchAllPages } from "@/lib/admin/data";

describe("dashboard figures", () => {
  const invoice = { currency: "INR", status: "sent", discount: 0, tax_rate: 0, invoice_items: [{ quantity: 1, unit_price: 1000 }] };
  it("never reports unpaid invoices or pending payments as revenue", () => {
    expect(financeSummary([{ ...invoice, payments: [{ amount: 1000, status: "pending" }] }])).toEqual([{ currency: "INR", received: 0, outstanding: 1000 }]);
  });
  it("counts confirmed payments but not refunded money", () => {
    expect(financeSummary([{ ...invoice, payments: [{ amount: 400, status: "confirmed" }, { amount: 600, status: "refunded" }] }])).toEqual([{ currency: "INR", received: 400, outstanding: 600 }]);
  });
  it("does not add different currencies together", () => {
    expect(financeSummary([{ ...invoice, payments: [{ amount: 100, status: "confirmed" }] }, { ...invoice, currency: "USD", payments: [{ amount: 20, status: "confirmed" }] }])).toEqual([{ currency: "INR", received: 100, outstanding: 900 }, { currency: "USD", received: 20, outstanding: 980 }]);
  });
  it("reads past the first API page for complete totals", async () => {
    const data = Array.from({ length: 1201 }, (_, i) => i);
    expect((await fetchAllPages<number>((from, to) => Promise.resolve({ data: data.slice(from, to + 1), error: null }))).length).toBe(1201);
  });
});