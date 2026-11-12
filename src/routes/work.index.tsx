import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CtaBand } from "@/components/site/cta-band";
import { ProjectCard } from "@/components/site/project-card";
import { PageHero } from "@/components/site/section";
import { PORTFOLIO_CATEGORIES } from "@/lib/content-types";
import { portfolioQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type WorkSearch = { category?: string | undefined };

export const Route = createFileRoute("/work/")({
  validateSearch: (search: Record<string, unknown>): WorkSearch => {
    const raw = search["category"];
    const c = typeof raw === "string" ? raw : undefined;
    return { category: c && (PORTFOLIO_CATEGORIES as readonly string[]).includes(c) ? c : undefined };
  },
  head: () => ({
    meta: [
      { title: "Our Work — Portfolio & Case Studies | Dev Creative Works" },
      {
        name: "description",
        content: "Explore websites, AI solutions, UI/UX design and branding projects delivered by Dev Creative Works.",
      },
      { property: "og:title", content: "Portfolio | Dev Creative Works" },
      { property: "og:description", content: "Case studies across web development, AI, UI/UX and brand design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioQuery()),
  component: WorkPage,
});

function WorkPage() {
  const { category } = Route.useSearch();
  const { data: items } = useSuspenseQuery(portfolioQuery());
  const filtered = category ? items.filter((i) => i.category === category) : items;
  const filters = ["All", ...PORTFOLIO_CATEGORIES];

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Work that <span className="text-gradient">moves the needle.</span>
          </>
        }
        description="Case studies from websites, AI products, interfaces and brands we've crafted."
      />
      <section className="pb-12">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {filters.map((f) => {
              const active = (f === "All" && !category) || f === category;
              return (
                <Link
                  key={f}
                  to="/work"
                  search={{ category: f === "All" ? undefined : f }}
                  replace
                  resetScroll={false}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-all",
                    active ? "bg-gradient-brand text-primary-foreground shadow-glow" : "glass text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="glass rounded-3xl p-14 text-center">
              <p className="font-display text-xl">No projects in this category yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon — or start one with us.</p>
            </div>
          ) : (
            <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ProjectCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
