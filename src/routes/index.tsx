import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { DynamicIcon } from "@/components/site/icon";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section";
import { TechMarquee } from "@/components/site/tech-marquee";
import { TestimonialGrid } from "@/components/site/testimonials";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { portfolioQuery, servicesQuery, siteContentQuery, testimonialsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dev Creative Works — Websites, AI & Creative Digital Agency" },
      {
        name: "description",
        content:
          "We help businesses grow through innovative websites, intelligent AI solutions, and creative digital experiences.",
      },
      { property: "og:title", content: "Dev Creative Works — Turning Ideas Into Powerful Digital Experiences" },
      {
        property: "og:description",
        content: "Websites, AI automation, UI/UX design and branding for ambitious businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(portfolioQuery()),
      context.queryClient.ensureQueryData(testimonialsQuery()),
    ]),
  component: HomePage,
});

function HomePage() {
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: portfolio } = useSuspenseQuery(portfolioQuery());
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery());
  const featured = portfolio.filter((p) => p.is_featured).slice(0, 4);

  return (
    <>
      <Hero hero={site.home_hero} />

      {/* Services */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title={
              <>
                Four disciplines. <span className="text-gradient">One team.</span>
              </>
            }
            description="From the first pixel to the last line of code — and the AI that runs behind it."
            action={
              <Button asChild variant="glass" size="lg" className="rounded-full">
                <Link to="/services">
                  All services <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.06}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="group gradient-border relative flex h-full flex-col overflow-hidden rounded-3xl bg-card p-7 shadow-card transition-transform duration-500 hover:-translate-y-1 md:p-9"
                >
                  <div
                    className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
                    aria-hidden
                  />
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-brand-soft">
                      <DynamicIcon name={s.icon} className="size-6 text-primary-glow" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold md:text-3xl">{s.title}</h3>
                  <p className="mt-3 text-muted-foreground">{s.summary}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.offerings.slice(0, 4).map((o) => (
                      <li key={o} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                        {o}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary-glow">
                    Explore {s.title} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-page">
            <SectionHeading
              eyebrow="Selected work"
              title="Projects we're proud of"
              description="A few recent builds across web, AI and design."
              action={
                <Button asChild variant="glass" size="lg" className="rounded-full">
                  <Link to="/work">
                    View all work <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <div className="grid gap-5 md:grid-cols-12">
              {featured.map((item, i) => (
                <Reveal
                  key={item.id}
                  delay={i * 0.06}
                  className={cn(i === 0 || i === 3 ? "md:col-span-7" : "md:col-span-5")}
                >
                  <ProjectCard item={item} large={i === 0 || i === 3} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading
            eyebrow="Why Dev Creative Works"
            title="Premium craft, without the agency overhead."
            description="We combine senior-level design and engineering with a direct, transparent way of working."
            className="mb-0 md:mb-0 lg:sticky lg:top-32 lg:self-start"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {site.why_us.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.06}>
                <div className="glass h-full rounded-3xl p-7">
                  <DynamicIcon name={w.icon} className="size-7 text-primary-glow" />
                  <h3 className="mt-6 text-xl font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process (light) */}
      <section className="surface-light py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our process"
            title="A clear path from idea to launch."
            description="Eight focused stages, with your review at every milestone."
            action={
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/process">
                  See the full process <ArrowRight />
                </Link>
              </Button>
            }
          />
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {site.process.map((step, i) => (
              <li key={step.title} className="bg-card p-6 md:p-7">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20 md:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Our stack" title="Technologies we work with" align="center" />
        </div>
        <TechMarquee items={site.technologies} />
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-page">
            <SectionHeading eyebrow="Kind words" title="What clients say" />
            <TestimonialGrid items={testimonials} />
          </div>
        </section>
      )}

      {/* Promise strip */}
      <section className="pb-4">
        <div className="container-page">
          <Reveal className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {["Free consultation", "Fixed-price milestones", "Post-launch support", "You own everything"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <Check className="size-4 text-success" /> {t}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
