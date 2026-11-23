import { createFileRoute } from "@tanstack/react-router";
import { MediaPage } from "@/components/admin/content-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/media")({ head: () => adminHead("Media library"), component: MediaPage });
