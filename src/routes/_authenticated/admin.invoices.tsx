import { createFileRoute } from "@tanstack/react-router";
import { InvoicesPage } from "@/components/admin/finance-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/invoices")({ head: () => adminHead("Invoices"), component: InvoicesPage });
