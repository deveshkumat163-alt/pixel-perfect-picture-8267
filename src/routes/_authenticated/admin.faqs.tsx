import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { ResourcePage, YesNo, str, useOptions, type FieldDef } from "@/components/admin/crud";
import { useAdmin } from "@/components/admin/use-admin";
import { adminHead } from "@/lib/admin/head";

export const Route = createFileRoute("/_authenticated/admin/faqs")({ head: () => adminHead("FAQs"), component: FaqsAdmin });

function FaqsAdmin() {
  const { canManageContent } = useAdmin();
  const services = useOptions("services", "title").data ?? [];
  const name = (id: unknown) => services.find((s) => s.value === id)?.label ?? "General";
  const fields: FieldDef[] = [
    { name: "question", label: "Question", type: "text", required: true, wide: true },
    { name: "answer", label: "Answer", type: "textarea", required: true, rows: 5 },
    { name: "service_id", label: "Show on service page", type: "select", options: services },
    { name: "sort_order", label: "Sort order", type: "number" },
    { name: "is_published", label: "Published on website", type: "switch" },
  ];
  return (
    <ResourcePage
      table="faqs" title="FAQs" singular="FAQ" icon={HelpCircle}
      description="Leave “Show on service page” empty for general questions."
      fields={fields}
      defaults={{ question: "", answer: "", service_id: null, sort_order: 0, is_published: true }}
      orderBy={{ column: "sort_order", ascending: true }}
      searchKeys={["question", "answer"]}
      filter={{ label: "Services", key: "service_id", options: services }}
      columns={[
        { label: "Question", render: (r) => <span className="font-medium">{str(r["question"])}</span> },
        { label: "Where", render: (r) => name(r["service_id"]) },
        { label: "Status", render: (r) => <YesNo on={r["is_published"]} /> },
      ]}
      canEdit={canManageContent} canDelete={canManageContent}
    />
  );
}
