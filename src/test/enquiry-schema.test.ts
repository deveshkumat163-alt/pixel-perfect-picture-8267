import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/enquiry-schema";

const valid = { name: "Asha", email: "asha@example.com", message: "We need a new website for our studio." };

describe("enquiry form rules", () => {
  it("accepts name, email and a project description", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });
  it("rejects a project description shorter than 10 characters", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "Hi there" }).success).toBe(false);
  });
  it("rejects an invalid email", () => {
    expect(enquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it("rejects submissions that fill the hidden spam trap", () => {
    expect(enquirySchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
  });
});
