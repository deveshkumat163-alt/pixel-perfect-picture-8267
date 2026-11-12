import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function CtaBand({
  title = "Have an idea? Let's build it together.",
  description = "Tell us about your project and we'll get back within one business day with next steps.",
  service,
}: {
  title?: string;
  description?: string;
  service?: string;
}) {
  return (
    <section className="py-20 md:py-28">
      <div className="container-page">
        <Reveal className="gradient-border relative overflow-hidden rounded-[2rem] bg-surface px-6 py-16 text-center md:px-16 md:py-24">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div
            className="animate-aurora pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-brand opacity-30 blur-[100px]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold text-balance md:text-6xl">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-muted-foreground md:text-lg">{description}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact" search={{ service }}>
                  Start a Project <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/work" search={{ category: undefined }}>
                  See our work
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
