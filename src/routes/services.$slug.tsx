import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { DynamicIcon } from "@/components/site/icon";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { serviceQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!data) throw notFound();
    return { title: data.service.seo_title ?? data.service.title, description: data.service.seo_description ?? data.service.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Service unavailable | Dev Creative Works" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: ServiceNotFound,
  component: ServiceDetail,
});

function ServiceNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-semibold">Service not found</h1>
      <p className="mt-3 text-muted-foreground">This service may have moved.</p>
      <Button asChild variant="hero" className="mt-6 rounded-full">
        <Link to="/services">View all services</Link>
      </Button>
    </div>
  );
}

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(serviceQuery(slug));
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { service: s, faqs, related } = data;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="animate-aurora pointer-events-none absolute -top-40 right-0 h-[30rem] w-[40rem] rounded-full bg-gradient-brand opacity-25 blur-[120px]"
          aria-hidden
        />
        <div className="container-page relative">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All services
          </Link>
          <Reveal className="mt-8 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="grid size-16 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
                <DynamicIcon name={s.icon} className="size-8 text-primary-foreground" />
              </span>
              <h1 className="mt-8 text-4xl font-semibold text-balance md:text-7xl">{s.title}</h1>
              <p className="mt-4 text-xl text-primary-glow md:text-2xl">{s.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact" search={{ service: s.title }}>
                  Enquire about this <ArrowRight />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Overview + offerings */}
      <section className="py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="eyebrow mb-4">Overview</p>
            <p className="text-xl leading-relaxed text-pretty md:text-2xl">{s.overview}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">What's included</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {s.offerings.map((o) => (
                <li key={o} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm">
                  <Check className="size-4 shrink-0 text-primary-glow" /> {o}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Key features" title="How we deliver" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {s.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="gradient-border h-full rounded-3xl bg-card p-7 shadow-card">
                  <span className="font-mono text-xs text-primary-glow">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + tech (light) */}
      <section className="surface-light py-20 md:py-24">
        <div className="container-page grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">Benefits</p>
            <h2 className="text-3xl font-semibold md:text-4xl">What it means for your business</h2>
            <ul className="mt-8 space-y-4">
              {s.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gradient-brand">
                    <Check className="size-3.5 text-primary-foreground" />
                  </span>
                  <span className="text-lg">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-4">Technologies</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Tools we use</h2>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {s.technologies.map((t) => (
                <span key={t} className="rounded-full border border-border bg-card px-4 py-2 font-mono text-sm shadow-card">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our process"
            title="From brief to launch"
            action={
              <Button asChild variant="glass" size="lg" className="rounded-full">
                <Link to="/process">Full process <ArrowRight /></Link>
              </Button>
            }
          />
          <ol className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {site.process.map((p, i) => (
              <li key={p.title} className="glass min-w-[15rem] rounded-3xl p-6">
                <span className="font-mono text-xs text-primary-glow">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Related work" title={`${s.title} projects`} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading eyebrow="FAQs" title="Questions, answered" className="mb-0 md:mb-0" />
            <FaqList items={faqs} />
          </div>
        </section>
      )}

      <CtaBand title={`Let's talk about your ${s.title.toLowerCase()} project.`} service={s.title} />
    </>
  );
}
