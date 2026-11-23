import { createFileRoute } from "@tanstack/react-router";
import { SiteContentPage } from "@/components/admin/content-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/content")({ head: () => adminHead("Website content"), component: SiteContentPage });
