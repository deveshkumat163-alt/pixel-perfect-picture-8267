import { createFileRoute } from "@tanstack/react-router";
import { PaymentsPage } from "@/components/admin/finance-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/payments")({ head: () => adminHead("Payments"), component: PaymentsPage });
