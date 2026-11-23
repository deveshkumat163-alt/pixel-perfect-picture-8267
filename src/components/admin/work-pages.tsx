import { BriefcaseBusiness, CheckSquare, Users } from "lucide-react";
import { ResourcePage, str, useOptions, YesNo, type FieldDef } from "./crud";
import { useAdmin } from "./use-admin";
import { useTeam, memberName } from "./use-team";
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/admin/roles";
import { formatMoney } from "@/lib/admin/finance";

const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
export function ClientsPage() {
  const { canManageProjects, canManageContent } = useAdmin();
  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "company", label: "Company", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "tax_id", label: "Tax ID", type: "text" },
    { name: "website", label: "Website", type: "url" },
    { name: "notes", label: "Internal notes", type: "textarea" },
    { name: "is_active", label: "Active client", type: "switch" },
  ];
  return <ResourcePage table="clients" title="Clients" singular="Client" icon={Users} description="Client contacts and billing details." fields={fields} defaults={{ name: "", is_active: true }} searchKeys={["name", "company", "email"]} columns={[
    { label: "Name", render: r => <span className="font-medium">{str(r["name"])}</span> },
    { label: "Company", render: r => str(r["company"]) },
    { label: "Email", render: r => str(r["email"]) },
    { label: "Status", render: r => <YesNo on={r["is_active"]} yes="Active" no="Inactive" /> },
  ]} canEdit={canManageProjects} canDelete={canManageContent} />;
}
export function ProjectsPage() {
  const { canManageProjects, canManageContent } = useAdmin();
  const clients = useOptions("clients", "name");
  const team = useTeam();
  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "client_id", label: "Client", type: "select", options: clients.data ?? [] },
    { name: "status", label: "Status", type: "select", required: true, options: options(PROJECT_STATUS_LABELS) },
    { name: "service", label: "Service", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "due_date", label: "Due date", type: "date" },
    { name: "budget", label: "Budget", type: "number" },
    { name: "currency", label: "Currency", type: "text", required: true },
    { name: "progress", label: "Progress (%)", type: "number", required: true },
    { name: "manager_id", label: "Manager", type: "select", options: (team.data ?? []).filter(m => m.roles.length).map(m => ({ value: m.id, label: memberName(m) })) },
    { name: "internal_notes", label: "Internal notes", type: "textarea" },
  ];
  return <ResourcePage table="projects" title="Projects" singular="Project" icon={BriefcaseBusiness} description="Internal delivery, schedules and budgets." fields={fields} defaults={{ name: "", status: "new", description: "", currency: "INR", progress: 0 }} searchKeys={["name", "service"]} filter={{ label: "Statuses", key: "status", options: options(PROJECT_STATUS_LABELS) }} columns={[
    { label: "Project", render: r => <span className="font-medium">{str(r["name"])}</span> },
    { label: "Client", render: r => clients.data?.find(c => c.value === r["client_id"])?.label ?? "—" },
    { label: "Status", render: r => PROJECT_STATUS_LABELS[r["status"] as keyof typeof PROJECT_STATUS_LABELS] },
    { label: "Progress", render: r => `${str(r["progress"])}%` },
    { label: "Budget", render: r => r["budget"] == null ? "—" : formatMoney(str(r["budget"]), str(r["currency"])) },
    { label: "Due", render: r => str(r["due_date"]) || "—" },
  ]} canEdit={canManageProjects} canDelete={canManageContent} />;
}
export function TasksPage() {
  const { user, canManageProjects } = useAdmin();
  const projects = useOptions("projects", "name");
  const team = useTeam();
  const fields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "project_id", label: "Project", type: "select", options: projects.data ?? [] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "status", label: "Status", type: "select", required: true, options: options(TASK_STATUS_LABELS) },
    { name: "priority", label: "Priority", type: "select", required: true, options: options(TASK_PRIORITY_LABELS) },
    { name: "assignee_id", label: "Assignee", type: "select", options: (team.data ?? []).filter(m => m.roles.length).map(m => ({ value: m.id, label: memberName(m) })) },
    { name: "due_date", label: "Due date", type: "date" },
  ];
  return <ResourcePage table="tasks" title="Tasks" singular="Task" icon={CheckSquare} description="Assignments, priorities and deadlines." fields={fields} defaults={{ title: "", description: "", status: "todo", priority: "medium", assignee_id: user.id }} searchKeys={["title", "description"]} filter={{ label: "Statuses", key: "status", options: options(TASK_STATUS_LABELS) }} columns={[
    { label: "Task", render: r => <span className="font-medium">{str(r["title"])}</span> },
    { label: "Status", render: r => TASK_STATUS_LABELS[r["status"] as keyof typeof TASK_STATUS_LABELS] },
    { label: "Priority", render: r => TASK_PRIORITY_LABELS[r["priority"] as keyof typeof TASK_PRIORITY_LABELS] },
    { label: "Assignee", render: r => memberName(team.data?.find(m => m.id === r["assignee_id"])) },
    { label: "Due", render: r => str(r["due_date"]) || "—" },
  ]} canEdit canDelete rowCanEdit={r => canManageProjects || r["assignee_id"] === user.id || r["created_by"] === user.id} rowCanDelete={r => canManageProjects || r["created_by"] === user.id} />;
}
