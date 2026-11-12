import {
  Bot,
  BrainCircuit,
  Code2,
  Gauge,
  Handshake,
  Palette,
  PenTool,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Bot,
  BrainCircuit,
  Code2,
  Gauge,
  Handshake,
  Palette,
  PenTool,
  Sparkles,
};

export function DynamicIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon className={className} aria-hidden />;
}
