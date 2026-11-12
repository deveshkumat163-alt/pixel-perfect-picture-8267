import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/content-types";
import { Reveal } from "./reveal";

export function TestimonialGrid({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.id} delay={i * 0.08}>
          <figure className="gradient-border flex h-full flex-col rounded-3xl bg-card p-7 shadow-card">
            <Quote className="size-7 text-primary" aria-hidden />
            <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-pretty">“{t.quote}”</blockquote>
            <div className="mt-6 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, s) => (
                <Star key={s} className="size-4 fill-warning text-warning" aria-hidden />
              ))}
            </div>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-primary-foreground">
                {t.company.slice(0, 1)}
              </span>
              <span className="text-sm">
                <span className="block font-medium">{t.author_name}</span>
                <span className="text-muted-foreground">
                  {t.author_role}
                  {t.company && `, ${t.company}`}
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
