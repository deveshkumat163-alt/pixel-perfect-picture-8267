import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { createPublicDb } from "./public-db.server";
import { enquirySchema } from "./enquiry-schema";
import type { Faq, PortfolioItem, Service, SiteContent, Testimonial } from "./content-types";

const SERVICE_COLS =
  "id, slug, title, tagline, summary, overview, icon, offerings, features, benefits, technologies, portfolio_category, seo_title, seo_description";
const PORTFOLIO_COLS =
  "id, slug, name, client_name, category, summary, description, challenge, solution, features, technologies, cover_image, screenshots, project_url, completed_on, status, is_featured";

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const db = createPublicDb();
  const { data, error } = await db.from("website_content").select("key, value");
  if (error) {
    console.error("getSiteContent", error);
    throw new Error("Could not load site content");
  }
  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map as unknown as SiteContent;
});

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const db = createPublicDb();
  const { data, error } = await db.from("services").select(SERVICE_COLS).order("sort_order");
  if (error) {
    console.error("getServices", error);
    throw new Error("Could not load services");
  }
  return (data ?? []) as unknown as Service[];
});

export const getService = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const db = createPublicDb();
    const { data: service, error } = await db
      .from("services")
      .select(SERVICE_COLS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) {
      console.error("getService", error);
      throw new Error("Could not load service");
    }
    if (!service) throw notFound();
    const s = service as unknown as Service;
    const [faqs, related] = await Promise.all([
      db.from("faqs").select("id, question, answer, service_id").eq("service_id", s.id).order("sort_order"),
      s.portfolio_category
        ? db
            .from("portfolio_items")
            .select(PORTFOLIO_COLS)
            .eq("category", s.portfolio_category)
            .order("sort_order")
            .limit(3)
        : Promise.resolve({ data: [], error: null }),
    ]);
    return {
      service: s,
      faqs: (faqs.data ?? []) as Faq[],
      related: (related.data ?? []) as unknown as PortfolioItem[],
    };
  });

export const getPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const db = createPublicDb();
  const { data, error } = await db.from("portfolio_items").select(PORTFOLIO_COLS).order("sort_order");
  if (error) {
    console.error("getPortfolio", error);
    throw new Error("Could not load portfolio");
  }
  return (data ?? []) as unknown as PortfolioItem[];
});

export const getPortfolioItem = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const db = createPublicDb();
    const { data: item, error } = await db
      .from("portfolio_items")
      .select(PORTFOLIO_COLS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) {
      console.error("getPortfolioItem", error);
      throw new Error("Could not load project");
    }
    if (!item) throw notFound();
    const p = item as unknown as PortfolioItem;
    const { data: more } = await db
      .from("portfolio_items")
      .select(PORTFOLIO_COLS)
      .neq("id", p.id)
      .order("sort_order")
      .limit(2);
    return { item: p, more: (more ?? []) as unknown as PortfolioItem[] };
  });

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const db = createPublicDb();
  const { data, error } = await db
    .from("testimonials")
    .select("id, author_name, author_role, company, quote, rating, avatar_url")
    .order("sort_order");
  if (error) {
    console.error("getTestimonials", error);
    throw new Error("Could not load testimonials");
  }
  return (data ?? []) as Testimonial[];
});

export const getGeneralFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const db = createPublicDb();
  const { data, error } = await db
    .from("faqs")
    .select("id, question, answer, service_id")
    .is("service_id", null)
    .order("sort_order");
  if (error) {
    console.error("getGeneralFaqs", error);
    throw new Error("Could not load FAQs");
  }
  return (data ?? []) as Faq[];
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    // Honeypot filled → silently accept without storing.
    if (data.website) return { ok: true as const };
    const db = createPublicDb();
    const { error } = await db.from("enquiries").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      company: data.company ?? null,
      service_interest: data.service_interest ?? null,
      budget_range: data.budget_range ?? null,
      message: data.message,
    });
    if (error) {
      console.error("submitEnquiry", error);
      return { ok: false as const, error: "We couldn't send your message. Please try again." };
    }
    return { ok: true as const };
  });
