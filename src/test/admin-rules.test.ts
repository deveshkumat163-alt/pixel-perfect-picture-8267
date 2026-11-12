import { describe, expect, it } from "vitest";
import { canDeleteEnquiries, canManageContent, canManageTeam, isStaff } from "@/lib/admin/roles";
import { validateUpload } from "@/lib/admin/upload";
import { safeRedirect } from "@/lib/safe-redirect";
import { slugify } from "@/lib/admin/slug";

describe("admin permissions", () => {
  it("only Super Admins manage team roles", () => {
    expect(canManageTeam(["super_admin"])).toBe(true);
    expect(canManageTeam(["admin"])).toBe(false);
  });
  it("Admins and Super Admins edit website content; other roles cannot", () => {
    expect(canManageContent(["admin"])).toBe(true);
    expect(canManageContent(["super_admin"])).toBe(true);
    expect(canManageContent(["project_manager", "designer", "developer"])).toBe(false);
  });
  it("only admins can delete enquiries", () => {
    expect(canDeleteEnquiries(["developer"])).toBe(false);
    expect(canDeleteEnquiries(["admin"])).toBe(true);
  });
  it("an account with no role is not staff", () => {
    expect(isStaff([])).toBe(false);
    expect(isStaff(["designer"])).toBe(true);
  });
});

describe("uploads", () => {
  it("rejects files over 10 MB", () => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "a.png", { type: "image/png" });
    expect(validateUpload(big)).not.toBeNull();
  });
  it("rejects non-media files", () => {
    expect(validateUpload(new File(["x"], "a.exe", { type: "application/x-msdownload" }))).not.toBeNull();
  });
  it("accepts a normal image", () => {
    expect(validateUpload(new File(["x"], "a.jpg", { type: "image/jpeg" }))).toBeNull();
  });
});

describe("helpers", () => {
  it("never redirects off-site after sign-in", () => {
    expect(safeRedirect("https://evil.com")).toBe("/admin");
    expect(safeRedirect("//evil.com")).toBe("/admin");
    expect(safeRedirect("/admin/enquiries")).toBe("/admin/enquiries");
  });
  it("makes clean slugs", () => {
    expect(slugify("Kōhi Coffee Roasters!")).toBe("kohi-coffee-roasters");
  });
});

import { conversionRate, enquiriesByMonth } from "@/lib/admin/stats";

describe("dashboard figures", () => {
  it("conversion rate is converted leads over all leads", () => {
    const rows = [
      { status: "converted" as const, created_at: "2026-11-01T00:00:00Z", service_interest: null },
      { status: "new" as const, created_at: "2026-11-02T00:00:00Z", service_interest: null },
      { status: "lost" as const, created_at: "2026-11-03T00:00:00Z", service_interest: null },
      { status: "contacted" as const, created_at: "2026-11-04T00:00:00Z", service_interest: null },
    ];
    expect(conversionRate(rows)).toBe(25);
    expect(conversionRate([])).toBe(0);
  });
  it("groups enquiries into the last 6 months", () => {
    const rows = [
      { status: "new" as const, created_at: "2026-11-05T00:00:00Z", service_interest: null },
      { status: "new" as const, created_at: "2026-06-05T00:00:00Z", service_interest: null },
      { status: "new" as const, created_at: "2026-01-05T00:00:00Z", service_interest: null },
    ];
    const months = enquiriesByMonth(rows, new Date("2026-11-12T00:00:00Z"));
    expect(months).toHaveLength(6);
    expect(months.at(-1)?.count).toBe(1);
    expect(months[0]?.count).toBe(1);
    expect(months.reduce((n, m) => n + m.count, 0)).toBe(2);
  });
});
