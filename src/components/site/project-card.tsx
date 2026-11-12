import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { PortfolioItem } from "@/lib/content-types";
import { cn } from "@/lib/utils";

export function ProjectCard({ item, className, large }: { item: PortfolioItem; className?: string; large?: boolean }) {
  return (
    <Link
      to="/work/$slug"
      params={{ slug: item.slug }}
      className={cn(
        "group gradient-border relative block overflow-hidden rounded-3xl bg-card shadow-card transition-transform duration-500 hover:-translate-y-1",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", large ? "aspect-[16/10]" : "aspect-[16/11]")}>
        {item.cover_image ? (
          <img
            src={item.cover_image}
            alt={`${item.name} — ${item.category} project`}
            loading="lazy"
            width={1600}
            height={1008}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-brand-soft" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" aria-hidden />
        <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 font-mono text-[0.68rem] tracking-wider uppercase">
          {item.category}
        </span>
        <span className="glass absolute top-4 right-4 grid size-10 place-items-center rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="relative p-6 pt-2">
        <h3 className={cn("font-semibold", large ? "text-2xl md:text-3xl" : "text-xl")}>{item.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
      </div>
    </Link>
  );
}
