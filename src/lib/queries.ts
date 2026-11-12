import { queryOptions } from "@tanstack/react-query";
import {
  getGeneralFaqs,
  getPortfolio,
  getPortfolioItem,
  getService,
  getServices,
  getSiteContent,
  getTestimonials,
} from "./content.functions";

const STALE = 60_000;

export const siteContentQuery = () =>
  queryOptions({ queryKey: ["site-content"], queryFn: () => getSiteContent(), staleTime: STALE });
export const servicesQuery = () =>
  queryOptions({ queryKey: ["services"], queryFn: () => getServices(), staleTime: STALE });
export const serviceQuery = (slug: string) =>
  queryOptions({ queryKey: ["service", slug], queryFn: () => getService({ data: { slug } }), staleTime: STALE });
export const portfolioQuery = () =>
  queryOptions({ queryKey: ["portfolio"], queryFn: () => getPortfolio(), staleTime: STALE });
export const portfolioItemQuery = (slug: string) =>
  queryOptions({
    queryKey: ["portfolio", slug],
    queryFn: () => getPortfolioItem({ data: { slug } }),
    staleTime: STALE,
  });
export const testimonialsQuery = () =>
  queryOptions({ queryKey: ["testimonials"], queryFn: () => getTestimonials(), staleTime: STALE });
export const generalFaqsQuery = () =>
  queryOptions({ queryKey: ["faqs", "general"], queryFn: () => getGeneralFaqs(), staleTime: STALE });
