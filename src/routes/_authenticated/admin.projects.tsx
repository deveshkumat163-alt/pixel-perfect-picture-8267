import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPage } from "@/components/admin/work-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/projects")({ head: () => adminHead("Projects"), component: ProjectsPage });
