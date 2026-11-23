import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/components/admin/team-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/activity")({ head: () => adminHead("Activity log"), component: ActivityPage });
