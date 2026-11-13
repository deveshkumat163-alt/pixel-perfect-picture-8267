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

export type ProjectStatus = Database["public"]["Enums"]["project_status"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  new: "New",
  planning: "Planning",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  on_hold: "On Hold",
};
export const PROJECT_STATUSES = Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};
export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
export const TASK_PRIORITIES = Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending verification",
  confirmed: "Confirmed",
  failed: "Failed",
  refunded: "Refunded",
};
export const PAYMENT_STATUSES = Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank transfer",
  upi: "UPI",
  card: "Card",
  cash: "Cash",
  cheque: "Cheque",
  other: "Other",
};
export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS);

/** Clients and projects: create/edit. Mirrors can_manage_projects() in the database. */
export function canManageProjects(roles: AppRole[]) {
  return roles.includes("super_admin") || roles.includes("admin") || roles.includes("project_manager");
}
/** Invoices, payments, receipts and finance settings. Mirrors is_admin() in the database. */
export function canManageFinance(roles: AppRole[]) {
  return canManageContent(roles);
}
