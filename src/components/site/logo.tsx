import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <defs>
        <linearGradient id="dcw-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--primary-glow)" />
          <stop offset="0.5" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#dcw-g)" />
      <path
        d="M13 11h7.5c5.2 0 9 3.8 9 9s-3.8 9-9 9H13V11Z"
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="20.5" cy="20" r="2.6" fill="var(--primary-foreground)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Dev Creative Works home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[8deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">Dev Creative</span>
        <span className="font-mono text-[0.62rem] tracking-[0.32em] text-muted-foreground uppercase">Works</span>
      </span>
    </Link>
  );
}
