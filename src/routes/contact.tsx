import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reveal } from "@/components/site/reveal";
import { PageHero } from "@/components/site/section";
import { submitEnquiry } from "@/lib/content.functions";
import { enquirySchema } from "@/lib/enquiry-schema";
import { servicesQuery, siteContentQuery } from "@/lib/queries";

type ContactSearch = { service?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    service: typeof search.service === "string" && search.service.length <= 120 ? search.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact — Start a Project | Dev Creative Works" },
      {
        name: "description",
        content: "Tell us about your website, AI, design or branding project. We reply within one business day.",
      },
      { property: "og:title", content: "Start a Project | Dev Creative Works" },
      { property: "og:description", content: "Get in touch for a free consultation on your next digital project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

type FieldErrors = Partial<Record<string, string>>;

function digits(v: string) {
  return v.replace(/[^0-9]/g, "");
}

function ContactPage() {
  const { service: preselected } = Route.useSearch();
  const { data: site } = useSuspenseQuery(siteContentQuery());
  const { data: services } = useSuspenseQuery(servicesQuery());
  const send = useServerFn(submitEnquiry);

  const serviceOptions = [...services.map((s) => s.title), "Other / Not sure"];
  const [service, setService] = useState<string | undefined>(
    preselected && serviceOptions.includes(preselected) ? preselected : undefined,
  );
  const [budget, setBudget] = useState<string | undefined>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const c = site.company;
  const whatsapp = c.whatsapp ? digits(c.whatsapp) : "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      company: String(fd.get("company") ?? ""),
      service_interest: service ?? "",
      budget_range: budget ?? "",
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await send({ data: payload });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDone(true);
      form.reset();
      toast.success("Thanks! Your enquiry is on its way.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's build something <span className="text-gradient">remarkable.</span>
          </>
        }
        description="Share a few details and we'll get back within one business day with ideas and next steps."
      />

      <section className="pb-24">
        <div className="container-page grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="gradient-border rounded-[2rem] bg-card p-6 shadow-card md:p-10">
            {done ? (
              <div className="flex min-h-[28rem] flex-col items-center justify-center text-center">
                <span className="grid size-16 place-items-center rounded-full bg-gradient-brand shadow-glow">
                  <CheckCircle2 className="size-8 text-primary-foreground" />
                </span>
                <h2 className="mt-6 text-3xl font-semibold">Message received</h2>
                <p className="mt-3 max-w-md text-muted-foreground">
                  Thanks for reaching out. Our team will review your project and reply to you by email shortly.
                </p>
                <Button variant="glass" size="lg" className="mt-8 rounded-full" onClick={() => setDone(false)}>
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" error={errors.name} required autoComplete="name" />
                <Field label="Email" name="email" type="email" error={errors.email} required autoComplete="email" />
                <Field label="Phone" name="phone" type="tel" error={errors.phone} autoComplete="tel" />
                <Field label="Company" name="company" error={errors.company} autoComplete="organization" />

                <div className="space-y-2">
                  <Label>Service interested in</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="h-12 rounded-xl bg-background/50">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget range</Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger className="h-12 rounded-xl bg-background/50">
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                    <SelectContent>
                      {(site.enquiry_options?.budgets ?? []).map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="message">
                    Project description <span className="text-primary-glow">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    maxLength={4000}
                    placeholder="What are you building, who is it for, and when do you need it?"
                    aria-invalid={!!errors.message}
                    className="rounded-xl bg-background/50"
                  />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                {/* Honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">We'll only use your details to respond to this enquiry.</p>
                  <Button type="submit" variant="hero" size="xl" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                    {submitting ? "Sending…" : "Send enquiry"}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.08} className="glass rounded-[2rem] p-7">
              <p className="eyebrow mb-5">Reach us directly</p>
              <ul className="space-y-4">
                {c.email && (
                  <ContactRow icon={Mail} label="Email" href={`mailto:${c.email}`} value={c.email} />
                )}
                {c.phone && <ContactRow icon={Phone} label="Phone" href={`tel:${digits(c.phone)}`} value={c.phone} />}
                {c.address && <ContactRow icon={MapPin} label="Location" value={c.address} />}
                {c.hours && <ContactRow icon={Clock} label="Hours" value={c.hours} />}
              </ul>
            </Reveal>
            {whatsapp && (
              <Reveal delay={0.12}>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Dev Creative Works, I'd like to discuss a project.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-4 rounded-[2rem] bg-gradient-brand p-6 text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="size-8" />
                  <span>
                    <span className="block font-display text-lg font-semibold">Chat on WhatsApp</span>
                    <span className="text-sm opacity-85">Quick questions? Message us directly.</span>
                  </span>
                </a>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  error,
  required,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-primary-glow">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className="h-12 rounded-xl bg-background/50"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft">
        <Icon className="size-4 text-primary-glow" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block break-words">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-3 transition-colors hover:text-primary-glow">
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-3">{inner}</div>
      )}
    </li>
  );
}
