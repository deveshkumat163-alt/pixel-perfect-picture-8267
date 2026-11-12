import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { portfolioItemQuery } from "@/lib/queries";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(portfolioItemQuery(params.slug));
    if (!data) throw notFound();
    return { name: data.item.name, summary: data.item.summary, category: data.item.category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ${loaderData.category} Case Study | Dev Creative Works` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.name} | Dev Creative Works` },
          { property: "og:description", content: loaderData.summary },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Project unavailable | Dev Creative Works" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: ProjectNotFound,
  component: CaseStudy,
});

function ProjectNotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-semibold">Project not found</h1>
      <p className="mt-3 text-muted-foreground">It may have been moved or unpublished.</p>
      <Button asChild variant="hero" className="mt-6 rounded-full">
        <Link to="/work">Back to work</Link>
      </Button>
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

function CaseStudy() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(portfolioItemQuery(slug));
  const { item: p, more } = data;
  const meta = [
    { label: "Client", value: p.client_name || "—" },
    { label: "Category", value: p.category },
    { label: "Completed", value: formatDate(p.completed_on) },
    { label: "Status", value: p.status },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-12 md:pt-44">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-page relative">
          <Link to="/work" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> All work
          </Link>
          <Reveal className="mt-8">
            <p className="eyebrow">{p.category}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-balance md:text-7xl">{p.name}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">{p.summary}</p>
          </Reveal>
          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
            {meta.map((m) => (
              <div key={m.label} className="bg-surface p-5">
                <dt className="eyebrow">{m.label}</dt>
                <dd className="mt-2 font-medium">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {p.cover_image && (
        <section className="py-8">
          <div className="container-page">
            <Reveal className="gradient-border overflow-hidden rounded-[2rem] shadow-card">
              <img src={p.cover_image} alt={`${p.name} project showcase`} width={1600} height={1008} className="w-full object-cover" />
            </Reveal>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-4">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <span key={t} className="glass rounded-full px-3.5 py-1.5 font-mono text-xs">{t}</span>
              ))}
            </div>
            {p.project_url && (
              <Button asChild variant="hero" size="lg" className="mt-8 rounded-full">
                <a href={p.project_url} target="_blank" rel="noreferrer">
                  Visit live site <ArrowUpRight />
                </a>
              </Button>
            )}
          </div>
          <div className="space-y-14">
            <Reveal>
              <h2 className="text-2xl font-semibold md:text-3xl">About the project</h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{p.description}</p>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              <Reveal className="gradient-border rounded-3xl bg-card p-7 shadow-card">
                <p className="eyebrow">The challenge</p>
                <p className="mt-4 leading-relaxed">{p.challenge}</p>
              </Reveal>
              <Reveal delay={0.08} className="gradient-border rounded-3xl bg-card p-7 shadow-card">
                <p className="eyebrow">Our solution</p>
                <p className="mt-4 leading-relaxed">{p.solution}</p>
              </Reveal>
            </div>
            {p.features.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-semibold md:text-3xl">Key features</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm">
                      <Check className="size-4 shrink-0 text-primary-glow" /> {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {p.screenshots.filter((s) => s !== p.cover_image).length > 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                {p.screenshots
                  .filter((s) => s !== p.cover_image)
                  .map((src, i) => (
                    <img key={src} src={src} alt={`${p.name} screenshot ${i + 1}`} loading="lazy" className="rounded-2xl border border-border" />
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="py-16">
          <div className="container-page">
            <SectionHeading eyebrow="More work" title="Keep exploring" />
            <div className="grid gap-5 md:grid-cols-2">
              {more.map((m) => (
                <ProjectCard key={m.id} item={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand title="Want results like these?" />
    </>
  );
}
