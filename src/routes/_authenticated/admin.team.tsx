import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/components/admin/team-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/team")({ head: () => adminHead("Team and roles"), component: TeamPage });
