import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareQuote, Star } from "lucide-react";
import { ResourcePage, YesNo, str, type FieldDef } from "@/components/admin/crud";
import { useAdmin } from "@/components/admin/use-admin";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({ component: TestimonialsAdmin });

const fields: FieldDef[] = [
  { name: "author_name", label: "Name", type: "text", required: true },
  { name: "author_role", label: "Role", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "rating", label: "Rating", type: "select", required: true, options: ["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v} stars` })) },
  { name: "quote", label: "Quote", type: "textarea", required: true, rows: 5 },
  { name: "avatar_url", label: "Photo", type: "image", folder: "testimonials" },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "is_published", label: "Published on website", type: "switch" },
];

function TestimonialsAdmin() {
  const { canManageContent } = useAdmin();
  return (
    <ResourcePage
      table="testimonials" title="Testimonials" singular="Testimonial" icon={MessageSquareQuote}
      description="Client quotes shown across the website."
      fields={fields}
      defaults={{ author_name: "", author_role: "", company: "", rating: "5", quote: "", avatar_url: null, sort_order: 0, is_published: true }}
      orderBy={{ column: "sort_order", ascending: true }}
      searchKeys={["author_name", "company", "quote"]}
      columns={[
        { label: "Name", render: (r) => <span className="font-medium">{str(r["author_name"])}</span> },
        { label: "Company", render: (r) => str(r["company"]) },
        { label: "Rating", render: (r) => <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" />{str(r["rating"])}</span> },
        { label: "Status", render: (r) => <YesNo on={r["is_published"]} /> },
      ]}
      canEdit={canManageContent} canDelete={canManageContent}
    />
  );
}
