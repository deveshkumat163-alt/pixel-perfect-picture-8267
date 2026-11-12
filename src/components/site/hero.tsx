import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Code2, Palette, PenTool, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteContent } from "@/lib/content-types";

const ease = [0.22, 1, 0.36, 1] as const;

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="bg-grid absolute inset-0" />
      <div className="animate-aurora absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full bg-primary opacity-30 blur-[140px]" />
      <div className="animate-aurora absolute top-10 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet opacity-25 blur-[140px] [animation-delay:-6s]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

function FloatingStack() {
  const chips = [
    { icon: Code2, label: "Web", className: "top-[6%] left-[4%]", delay: 0 },
    { icon: Bot, label: "AI", className: "top-[18%] right-[2%]", delay: 1.2 },
    { icon: PenTool, label: "UI/UX", className: "bottom-[16%] left-[0%]", delay: 2.1 },
    { icon: Palette, label: "Brand", className: "bottom-[4%] right-[10%]", delay: 0.6 },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      {/* orbit rings */}
      <div className="absolute inset-[8%] rounded-full border border-border" aria-hidden />
      <div className="absolute inset-[22%] rounded-full border border-dashed border-border" aria-hidden />

      {/* core card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease }}
        className="glass gradient-border absolute inset-[24%] flex flex-col justify-between rounded-[2rem] p-5 shadow-card md:p-6"
      >
        <div className="flex items-center justify-between">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-warning/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </span>
          <span className="font-mono text-[0.65rem] text-muted-foreground">build.ts</span>
        </div>
        <div className="space-y-1.5 font-mono text-[0.7rem] leading-relaxed md:text-xs">
          <p><span className="text-violet">const</span> idea <span className="text-muted-foreground">=</span> <span className="text-primary-glow">"yours"</span>;</p>
          <p><span className="text-violet">await</span> design(idea);</p>
          <p><span className="text-violet">await</span> build(&#123; fast: <span className="text-primary-glow">true</span> &#125;);</p>
          <p className="text-success">✓ launched</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-gradient-brand-soft px-3 py-2 text-xs">
          <Zap className="size-3.5 text-primary-glow" />
          <span className="text-muted-foreground">Performance</span>
          <span className="ml-auto font-mono font-medium">98</span>
        </div>
      </motion.div>

      {chips.map(({ icon: Icon, label, className, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 + delay * 0.2, ease }}
          className={`absolute ${className}`}
        >
          <div
            className="glass animate-float flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-card"
            style={{ animationDelay: `${-delay}s` }}
          >
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-brand">
              <Icon className="size-4 text-primary-foreground" />
            </span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        </motion.div>
      ))}

      <div className="animate-float-slow absolute top-[46%] right-[-2%]" aria-hidden>
        <Sparkles className="size-5 text-primary-glow" />
      </div>
    </div>
  );
}

export function Hero({ hero }: { hero: SiteContent["home_hero"] }) {
  const words = hero.headline.split(" ");
  return (
    <section className="relative overflow-hidden pt-32 pb-8 md:pt-40 md:pb-12">
      <HeroBackground />
      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass mb-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground"
          >
            <span className="animate-pulse-ring size-2 rounded-full bg-success" aria-hidden />
            {hero.eyebrow}
          </motion.p>
          <h1 className="text-[2.75rem] leading-[1.02] font-semibold text-balance sm:text-6xl lg:text-[5.25rem]">
            {words.map((w, i) => (
              <motion.span
                key={`${w}-${i}`}
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease }}
                className={`mr-[0.22em] inline-block ${/Powerful|Digital/i.test(w) ? "text-gradient" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-7 max-w-xl text-lg text-pretty text-muted-foreground md:text-xl"
          >
            {hero.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">
                {hero.primary_cta} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/work">{hero.secondary_cta}</Link>
            </Button>
          </motion.div>
        </div>
        <div className="relative">
          <FloatingStack />
        </div>
      </div>
    </section>
  );
}
