import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Compass, Eye, Target, UserRound } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHeading } from "@/components/site/section";
import { portfolioQuery, servicesQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Dev Creative Works" },
      {
        name: "description",
        content:
          "Dev Creative Works is a digital creative and technology agency empowering businesses with technology, creativity, and digital innovation.",
      },
      { property: "og:title", content: "About Dev Creative Works" },
      {
        property: "og:description",
        content: "Our story, mission, vision and the values behind every project we build.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery()),
  component: AboutPage,
});

function AboutPage() {
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const { data: portfolio } = useSuspenseQuery(portfolioQuery());
  const a = site.about;

  // Live figures derived from published content, plus any admin-entered achievements.
  const stats = [
    { value: String(portfolio.length), label: "Case studies published" },
    { value: String(services.length), label: "Service disciplines" },
    { value: String(services.reduce((n, s) => n + s.offerings.length, 0)), label: "Specialist offerings" },
    { value: String(site.technologies.length), label: "Core technologies" },
    ...(site.achievements ?? []),
  ];

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            We build. We innovate. <span className="text-gradient">We create.</span>
          </>
        }
        description={a.who_we_are}
      />

      <section className="py-12">
        <div className="container-page">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
            {stats.slice(0, 8).map((s) => (
              <div key={s.label} className="bg-surface p-6 md:p-8">
                <dd className="font-display text-4xl font-semibold text-gradient md:text-5xl">{s.value}</dd>
                <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="Our story" title="How it started" className="mb-0 md:mb-0" />
          <Reveal>
            <p className="text-xl leading-relaxed text-pretty md:text-2xl">{a.story}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {[
            { icon: Target, label: "Our mission", text: a.mission },
            { icon: Eye, label: "Our vision", text: a.vision },
            { icon: Compass, label: "Our approach", text: a.approach },
          ].map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08}>
              <div className="gradient-border h-full rounded-3xl bg-card p-8 shadow-card">
                <span className="grid size-12 place-items-center rounded-2xl bg-gradient-brand">
                  <b.icon className="size-6 text-primary-foreground" />
                </span>
                <p className="eyebrow mt-8">{b.label}</p>
                <p className="mt-3 text-lg leading-relaxed">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="surface-light py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="Core values" title="What we stand for" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {site.core_values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-border bg-card p-7 shadow-card">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-muted-foreground">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <Reveal className="gradient-border grid items-center gap-10 overflow-hidden rounded-[2rem] bg-card p-8 shadow-card md:grid-cols-[auto_1fr] md:p-12">
            <div className="relative mx-auto size-44 overflow-hidden rounded-[1.75rem] bg-gradient-brand md:size-56">
              {site.founder.photo_url ? (
                <img src={site.founder.photo_url} alt={site.founder.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <UserRound className="size-20 text-primary-foreground/80" aria-hidden />
                </div>
              )}
            </div>
            <div>
              <p className="eyebrow">Leadership</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{site.founder.name}</h2>
              <p className="mt-1 text-primary-glow">{site.founder.role}</p>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{site.founder.bio}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
