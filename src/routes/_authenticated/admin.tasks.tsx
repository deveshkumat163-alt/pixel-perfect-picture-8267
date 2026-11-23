import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/components/admin/work-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/tasks")({ head: () => adminHead("Tasks"), component: TasksPage });
