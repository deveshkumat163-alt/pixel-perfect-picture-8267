import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Faq } from "@/lib/content-types";

export function FaqList({ items }: { items: Faq[] }) {
  if (!items.length) return null;
  return (
    <Accordion type="single" collapsible className="divide-y divide-border rounded-3xl border border-border bg-card px-6">
      {items.map((f) => (
        <AccordionItem key={f.id} value={f.id} className="border-0">
          <AccordionTrigger className="py-5 text-left font-display text-lg font-medium hover:no-underline">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-muted-foreground">{f.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
