import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/section";
import { FaqList } from "@/components/site/faq-list";
import { SectionHeading } from "@/components/site/section";
import { generalFaqsQuery, siteContentQuery } from "@/lib/queries";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Our Process — From Discovery to Launch | Dev Creative Works" },
      {
        name: "description",
        content:
          "Our eight-stage process: discovery, requirements, strategy, UI/UX design, development, QA, deployment and ongoing support.",
      },
      { property: "og:title", content: "How We Work | Dev Creative Works" },
      { property: "og:description", content: "A transparent eight-step journey from idea to launch and beyond." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(generalFaqsQuery()),
  component: ProcessPage,
});

function ProcessPage() {
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { data: faqs } = useSuspenseQuery(generalFaqsQuery());

  return (
    <>
      <PageHero
        eyebrow="Our process"
        title={
          <>
            A clear path from <span className="text-gradient">idea to impact.</span>
          </>
        }
        description="No black boxes. You'll always know what's happening, what's next and when it's due."
      />

      <section className="pb-20">
        <div className="container-page">
          <ol className="relative mx-auto max-w-4xl">
            <div
              className="absolute top-0 bottom-0 left-6 w-px bg-gradient-to-b from-primary via-violet to-transparent md:left-1/2"
              aria-hidden
            />
            {site.process.map((step, i) => {
              const right = i % 2 === 1;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mb-10 grid grid-cols-[3rem_1fr] gap-5 md:mb-14 md:grid-cols-2 md:gap-14"
                >
                  <span className="absolute top-2 left-6 z-10 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-gradient-brand font-mono text-sm font-medium text-primary-foreground shadow-glow md:left-1/2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className={right ? "hidden md:block" : "col-start-2 md:col-start-1 md:text-right"}>
                    {!right && <StepCard title={step.title} description={step.description} />}
                  </div>
                  <div className={right ? "col-start-2" : "hidden md:block"}>
                    {right && <StepCard title={step.title} description={step.description} />}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading eyebrow="FAQs" title="Common questions" className="mb-0 md:mb-0" />
            <FaqList items={faqs} />
          </div>
        </section>
      )}

      <CtaBand title="Ready for step one?" description="Book a free discovery call — we'll map out your project together." />
    </>
  );
}

function StepCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="gradient-border rounded-3xl bg-card p-6 shadow-card md:p-7">
      <h3 className="text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
