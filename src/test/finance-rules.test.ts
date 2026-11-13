import { describe, expect, it } from "vitest";
import { balanceDue, invoiceDisplayStatus, invoiceTotals, paidAmount } from "@/lib/admin/finance";
import { canManageFinance, canManageProjects } from "@/lib/admin/roles";

describe("invoice totals", () => {
  it("takes the discount off before adding tax", () => {
    const t = invoiceTotals([{ quantity: 2, unit_price: 500 }, { quantity: 1, unit_price: "1000" }], 200, 18);
    expect(t.subtotal).toBe(2000);
    expect(t.taxable).toBe(1800);
    expect(t.tax).toBe(324);
    expect(t.total).toBe(2124);
  });
  it("never lets a discount push the total below zero", () => {
    expect(invoiceTotals([{ quantity: 1, unit_price: 100 }], 500, 18).total).toBe(0);
  });
});

describe("payments vs invoices", () => {
  const sent = { status: "sent" as const, due_date: "2026-12-01" };
  it("a sent invoice with no payments is unpaid, not paid", () => {
    expect(invoiceDisplayStatus(sent, 1000, [], "2026-11-13")).toBe("unpaid");
  });
  it("pending payments don't count as received money", () => {
    const pays = [{ amount: 1000, status: "pending" }];
    expect(paidAmount(pays)).toBe(0);
    expect(invoiceDisplayStatus(sent, 1000, pays, "2026-11-13")).toBe("unpaid");
  });
  it("is paid only when confirmed payments cover the total", () => {
    expect(invoiceDisplayStatus(sent, 1000, [{ amount: 400, status: "confirmed" }], "2026-11-13")).toBe("partially_paid");
    expect(invoiceDisplayStatus(sent, 1000, [{ amount: 400, status: "confirmed" }, { amount: 600, status: "confirmed" }], "2026-11-13")).toBe("paid");
  });
  it("is overdue after the due date while money is still owed", () => {
    expect(invoiceDisplayStatus(sent, 1000, [{ amount: 400, status: "confirmed" }], "2026-12-02")).toBe("overdue");
  });
  it("drafts and void invoices are never paid or overdue", () => {
    expect(invoiceDisplayStatus({ status: "draft", due_date: "2020-01-01" }, 1000, [{ amount: 1000, status: "confirmed" }])).toBe("draft");
    expect(invoiceDisplayStatus({ status: "void", due_date: null }, 1000, [])).toBe("void");
  });
  it("balance due ignores refunded and failed payments", () => {
    expect(balanceDue(1000, [{ amount: 300, status: "confirmed" }, { amount: 700, status: "refunded" }, { amount: 700, status: "failed" }])).toBe(700);
  });
});

describe("work and finance permissions", () => {
  it("Project Managers manage clients and projects; designers and developers don't", () => {
    expect(canManageProjects(["project_manager"])).toBe(true);
    expect(canManageProjects(["designer"])).toBe(false);
    expect(canManageProjects(["developer"])).toBe(false);
  });
  it("only Admins and Super Admins handle finance", () => {
    expect(canManageFinance(["admin"])).toBe(true);
    expect(canManageFinance(["super_admin"])).toBe(true);
    expect(canManageFinance(["project_manager"])).toBe(false);
  });
});
