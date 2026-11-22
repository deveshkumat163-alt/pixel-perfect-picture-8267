import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { ResourcePage, YesNo, str, type FieldDef } from "@/components/admin/crud";
import { useAdmin } from "@/components/admin/use-admin";
import { PORTFOLIO_CATEGORIES } from "@/lib/content-types";

export const Route = createFileRoute("/_authenticated/admin/services")({ component: ServicesAdmin });

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "slug", from: "title" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "icon", label: "Icon name", type: "text", hint: "A Lucide icon name, e.g. Code2, Sparkles, Palette" },
  { name: "summary", label: "Summary", type: "textarea", rows: 3 },
  { name: "overview", label: "Overview", type: "textarea", rows: 5 },
  { name: "offerings", label: "What's included", type: "tags" },
  { name: "features", label: "Features", type: "list", fields: [{ name: "title", label: "Title" }, { name: "description", label: "Description", multiline: true }] },
  { name: "benefits", label: "Benefits", type: "tags" },
  { name: "technologies", label: "Technologies", type: "tags" },
  { name: "portfolio_category", label: "Related portfolio category", type: "select", options: PORTFOLIO_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "seo_title", label: "SEO title", type: "text" },
  { name: "seo_description", label: "SEO description", type: "textarea", rows: 2 },
  { name: "is_published", label: "Published on website", type: "switch" },
];

function ServicesAdmin() {
  const { canManageContent } = useAdmin();
  return (
    <ResourcePage
      table="services" title="Services" singular="Service" icon={Layers}
      description="The services shown on your website and their detail pages."
      fields={fields}
      defaults={{ title: "", slug: "", tagline: "", icon: "Sparkles", summary: "", overview: "", offerings: [], features: [], benefits: [], technologies: [], portfolio_category: null, sort_order: 0, seo_title: "", seo_description: "", is_published: true }}
      orderBy={{ column: "sort_order", ascending: true }}
      searchKeys={["title", "tagline"]}
      columns={[
        { label: "Title", render: (r) => <span className="font-medium">{str(r["title"])}</span> },
        { label: "Address", render: (r) => <span className="font-mono text-xs text-muted-foreground">/services/{str(r["slug"])}</span> },
        { label: "Order", render: (r) => str(r["sort_order"]) },
        { label: "Status", render: (r) => <YesNo on={r["is_published"]} /> },
      ]}
      canEdit={canManageContent} canDelete={canManageContent}
    />
  );
}
