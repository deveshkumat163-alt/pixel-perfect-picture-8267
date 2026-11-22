import { createFileRoute } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { ResourcePage, YesNo, str, type FieldDef } from "@/components/admin/crud";
import { useAdmin } from "@/components/admin/use-admin";
import { PORTFOLIO_CATEGORIES } from "@/lib/content-types";

export const Route = createFileRoute("/_authenticated/admin/portfolio")({ component: PortfolioAdmin });

const cats = PORTFOLIO_CATEGORIES.map((c) => ({ value: c, label: c }));
const fields: FieldDef[] = [
  { name: "name", label: "Project name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "slug", from: "name" },
  { name: "client_name", label: "Client", type: "text" },
  { name: "category", label: "Category", type: "select", options: cats, required: true },
  { name: "summary", label: "Short summary", type: "textarea", rows: 2 },
  { name: "description", label: "Description", type: "textarea", rows: 5 },
  { name: "challenge", label: "The challenge", type: "textarea" },
  { name: "solution", label: "Our solution", type: "textarea" },
  { name: "features", label: "Key features", type: "tags" },
  { name: "technologies", label: "Technologies", type: "tags" },
  { name: "cover_image", label: "Cover image", type: "image", folder: "portfolio" },
  { name: "screenshots", label: "Screenshots", type: "gallery", folder: "portfolio" },
  { name: "project_url", label: "Live link", type: "url" },
  { name: "completed_on", label: "Completed on", type: "date" },
  { name: "status", label: "Status label", type: "text" },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "is_featured", label: "Featured on home page", type: "switch" },
  { name: "is_published", label: "Published on website", type: "switch" },
];

function PortfolioAdmin() {
  const { canManageContent } = useAdmin();
  return (
    <ResourcePage
      table="portfolio_items" title="Portfolio" singular="Case study" icon={Images}
      description="Case studies shown on the Work pages."
      fields={fields}
      defaults={{ name: "", slug: "", client_name: "", category: PORTFOLIO_CATEGORIES[0], summary: "", description: "", challenge: "", solution: "", features: [], technologies: [], cover_image: null, screenshots: [], project_url: "", completed_on: "", status: "Completed", sort_order: 0, is_featured: false, is_published: true }}
      orderBy={{ column: "sort_order", ascending: true }}
      searchKeys={["name", "client_name"]}
      filter={{ label: "Categories", key: "category", options: cats }}
      columns={[
        { label: "Project", render: (r) => (
          <div className="flex items-center gap-3">
            {r["cover_image"] ? <img src={str(r["cover_image"])} alt="" className="h-9 w-14 rounded-md object-cover" /> : <div className="h-9 w-14 rounded-md bg-surface" />}
            <span className="font-medium">{str(r["name"])}</span>
          </div>
        ) },
        { label: "Client", render: (r) => str(r["client_name"]) },
        { label: "Category", render: (r) => str(r["category"]) },
        { label: "Featured", render: (r) => <YesNo on={r["is_featured"]} yes="Featured" no="—" /> },
        { label: "Status", render: (r) => <YesNo on={r["is_published"]} /> },
      ]}
      canEdit={canManageContent} canDelete={canManageContent}
    />
  );
}
