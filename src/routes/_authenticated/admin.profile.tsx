import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/admin/content-pages";
import { adminHead } from "@/lib/admin/head";
export const Route = createFileRoute("/_authenticated/admin/profile")({ head: () => adminHead("My profile"), component: ProfilePage });
