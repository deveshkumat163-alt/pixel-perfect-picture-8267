import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone = "blue" | "sky" | "violet" | "amber" | "orange" | "green" | "muted" | "red";

const TONE: Record<Tone, string> = {
  blue: "bg-primary/15 text-primary-glow border-primary/30",
  sky: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  violet: "bg-violet/15 text-violet border-violet/30",
  amber: "bg-warning/15 text-warning border-warning/30",
  orange: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  green: "bg-success/15 text-success border-success/30",
  muted: "bg-muted text-muted-foreground border-border",
  red: "bg-destructive/15 text-destructive border-destructive/30",
};

export function ToneBadge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-normal whitespace-nowrap", TONE[tone], className)}>
      {children}
    </Badge>
  );
}

export const PROJECT_STATUS_TONE = {
  new: "blue",
  planning: "sky",
  in_progress: "violet",
  review: "amber",
  completed: "green",
  on_hold: "muted",
} as const satisfies Record<string, Tone>;

export const TASK_STATUS_TONE = { todo: "muted", in_progress: "violet", review: "amber", done: "green" } as const satisfies Record<string, Tone>;
export const TASK_PRIORITY_TONE = { low: "muted", medium: "sky", high: "orange", urgent: "red" } as const satisfies Record<string, Tone>;
export const INVOICE_STATUS_TONE = {
  draft: "muted",
  void: "muted",
  unpaid: "blue",
  partially_paid: "amber",
  paid: "green",
  overdue: "red",
} as const satisfies Record<string, Tone>;
export const PAYMENT_STATUS_TONE = { pending: "amber", confirmed: "green", failed: "red", refunded: "muted" } as const satisfies Record<string, Tone>;
