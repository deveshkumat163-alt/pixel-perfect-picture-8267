import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Github, Instagram, Linkedin, Mail, MapPin, Twitter, Dribbble } from "lucide-react";
import { siteContentQuery, servicesQuery } from "@/lib/queries";
import { Logo } from "./logo";

const SOCIAL_ICONS = {
  instagram: Instagram,
  linkedin: Linkedin,
  x: Twitter,
  github: Github,
  behance: Dribbble,
} as const;

export function SiteFooter() {
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const socials = Object.entries(site.socials ?? {}).filter(([, url]) => !!url) as [
    keyof typeof SOCIAL_ICONS,
    string,
  ][];

  return (
    <footer className="relative mt-10 border-t border-border">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-brand opacity-60"
        aria-hidden
      />
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-muted-foreground">{site.footer?.blurb}</p>
          <p className="mt-6 font-display text-lg font-medium text-gradient">{site.company?.tagline}</p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                if (!Icon) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={key}
                    className="glass grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Services</p>
          <ul className="space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Studio</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/work" search={{ category: undefined }} className="text-muted-foreground hover:text-foreground">Work</Link></li>
            <li><Link to="/process" className="text-muted-foreground hover:text-foreground">Process</Link></li>
            <li><Link to="/contact" search={{ service: undefined }} className="text-muted-foreground hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {site.company?.email && (
              <li>
                <a href={`mailto:${site.company.email}`} className="flex items-start gap-2 break-all hover:text-foreground">
                  <Mail className="mt-0.5 size-4 shrink-0" /> {site.company.email}
                </a>
              </li>
            )}
            {site.company?.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {site.company.address}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {site.company?.name ?? "Dev Creative Works"}. All rights reserved.</p>
          <p className="font-mono tracking-wider">Websites · AI · Design · Brand</p>
        </div>
      </div>
    </footer>
  );
}
