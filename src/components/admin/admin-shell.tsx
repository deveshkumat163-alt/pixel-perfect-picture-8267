import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  ChevronsLeft,
  ExternalLink,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoMark } from "@/components/site/logo";
import { ROLE_LABELS } from "@/lib/admin/roles";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "./notifications-bell";
import { useAdmin } from "./use-admin";

type AdminPath = "/admin" | "/admin/enquiries";
type NavItem = { to: AdminPath; label: string; icon: LucideIcon; exact?: boolean; contentOnly?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
    ],
  },
];

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { canManageContent } = useAdmin();
  return (
    <nav className="flex flex-col gap-6" aria-label="Admin">
      {NAV.map((group) => {
        const items = group.items.filter((i) => !i.contentOnly || canManageContent);
        if (!items.length) return null;
        return (
          <div key={group.label}>
            {!collapsed && <p className="eyebrow mb-2 px-3 text-[0.62rem]">{group.label}</p>}
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    activeOptions={{ exact: !!item.exact }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center px-0",
                    )}
                    activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-card" }}
                  >
                    <item.icon className="size-[1.1rem] shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { profile, user, roles } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const name = profile?.full_name || user.email || "Team member";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 transition-[width] duration-300 lg:flex",
          collapsed ? "w-[4.75rem]" : "w-64",
        )}
      >
        <div className={cn("mb-8 flex items-center gap-2.5 px-1", collapsed && "justify-center px-0")}>
          <LogoMark className="size-8 shrink-0" />
          {!collapsed && (
            <span className="leading-none">
              <span className="block font-display text-sm font-semibold">Dev Creative Works</span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">Admin</span>
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={collapsed} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn("mt-4 justify-start gap-2 text-muted-foreground", collapsed && "justify-center")}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </Button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
          <SheetHeader className="mb-6 p-0">
            <SheetTitle className="flex items-center gap-2.5 font-display">
              <LogoMark className="size-8" /> Admin
            </SheetTitle>
          </SheetHeader>
          <NavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 text-muted-foreground sm:inline-flex">
            <a href="/" target="_blank" rel="noreferrer">
              View site <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <NotificationsBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 hover:bg-accent" aria-label="Account menu">
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    name.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="hidden text-left text-sm leading-tight md:block">
                  <span className="block max-w-40 truncate font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{roles.map((r) => ROLE_LABELS[r]).join(", ")}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
