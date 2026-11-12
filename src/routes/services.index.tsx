import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { DynamicIcon } from "@/components/site/icon";
import { Reveal } from "@/components/site/reveal";
import { PageHero } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Services — Websites, AI, UI/UX & Branding | Dev Creative Works" },
      {
        name: "description",
        content:
          "Website development, AI chatbots and automation, UI/UX design, and creative branding services from Dev Creative Works.",
      },
      { property: "og:title", content: "Services | Dev Creative Works" },
      {
        property: "og:description",
        content: "Websites, AI automation, UI/UX design and creative digital solutions under one roof.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery());
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Everything you need to <span className="text-gradient">grow online.</span>
          </>
        }
        description="Four specialist disciplines that work together — so your website, product, brand and automation all speak the same language."
      />
      <section className="pb-12">
        <div className="container-page space-y-6">
          {services.map((s, i) => (
            <Reveal key={s.id}>
              <article className="gradient-border grid gap-10 rounded-[2rem] bg-card p-7 shadow-card md:p-12 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl bg-gradient-brand">
                      <DynamicIcon name={s.icon} className="size-7 text-primary-foreground" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1} / 0{services.length}</span>
                  </div>
                  <h2 className="mt-8 text-3xl font-semibold md:text-4xl">{s.title}</h2>
                  <p className="mt-3 text-lg text-primary-glow">{s.tagline}</p>
                  <p className="mt-5 text-muted-foreground">{s.overview}</p>
                  <Button asChild variant="hero" size="lg" className="mt-8 rounded-full">
                    <Link to="/services/$slug" params={{ slug: s.slug }}>
                      Explore {s.title} <ArrowRight />
                    </Link>
                  </Button>
                </div>
                <ul className="grid content-start gap-3 sm:grid-cols-2">
                  {s.offerings.map((o) => (
                    <li key={o} className="glass flex items-center gap-3 rounded-2xl px-4 py-4 text-sm">
                      <Check className="size-4 shrink-0 text-primary-glow" /> {o}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
