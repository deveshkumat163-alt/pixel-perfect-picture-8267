import { createFileRoute } from "@tanstack/react-router";
import { ClientsPage } from "@/components/admin/work-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/clients")({ head: () => adminHead("Clients"), component: ClientsPage });
