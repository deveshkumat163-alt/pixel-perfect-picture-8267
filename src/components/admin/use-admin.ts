import { getRouteApi } from "@tanstack/react-router";
import { canDeleteEnquiries, canManageContent, canManageFinance, canManageProjects, canManageTeam } from "@/lib/admin/roles";

const adminRoute = getRouteApi("/_authenticated/admin");

export function useAdmin() {
  const ctx = adminRoute.useRouteContext();
  return {
    user: ctx.user,
    profile: ctx.profile,
    roles: ctx.roles,
    canManageContent: canManageContent(ctx.roles),
    canManageTeam: canManageTeam(ctx.roles),
    canDeleteEnquiries: canDeleteEnquiries(ctx.roles),
    canManageProjects: canManageProjects(ctx.roles),
    canManageFinance: canManageFinance(ctx.roles),
  };
}
