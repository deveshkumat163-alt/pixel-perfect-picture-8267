import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  project_manager: "Project Manager",
  designer: "Designer",
  developer: "Developer",
};
export const ALL_ROLES = Object.keys(ROLE_LABELS) as AppRole[];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  discussion: "Discussion",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  converted: "Converted",
  lost: "Lost",
};
export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

export function isStaff(roles: AppRole[]) {
  return roles.length > 0;
}
/** Website CMS (services, portfolio, testimonials, FAQs, site content, media). */
export function canManageContent(roles: AppRole[]) {
  return roles.includes("super_admin") || roles.includes("admin");
}
/** Deleting leads mirrors the database rule: admins only. */
export function canDeleteEnquiries(roles: AppRole[]) {
  return canManageContent(roles);
}
/** Assigning and removing team roles. */
export function canManageTeam(roles: AppRole[]) {
  return roles.includes("super_admin");
}
