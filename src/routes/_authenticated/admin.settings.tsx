import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/admin/content-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/settings")({ head: () => adminHead("Settings"), component: SettingsPage });
