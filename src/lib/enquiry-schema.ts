import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[0-9+()\-\s]*$/, "Phone can only contain digits, spaces and + ( ) -")
    .optional()
    .transform((v) => (v ? v : undefined)),
  company: optionalText(160),
  service_interest: optionalText(120),
  budget_range: optionalText(60),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(4000, "Please keep it under 4000 characters"),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
