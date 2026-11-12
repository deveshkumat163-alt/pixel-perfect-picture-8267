import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 md:mb-16",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-px w-6 bg-gradient-brand" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-semibold text-balance md:text-5xl">{title}</h2>
        {description && (
          <p className="mt-5 text-base text-pretty text-muted-foreground md:text-lg">{description}</p>
        )}
      </div>
      {action}
    </Reveal>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-[120px]"
        aria-hidden
      />
      <div className="container-page relative">
        <Reveal>
          <p className="eyebrow mb-5 flex items-center gap-2">
            <span className="h-px w-6 bg-gradient-brand" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold text-balance md:text-7xl">{title}</h1>
          {description && (
            <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground md:text-xl">{description}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
