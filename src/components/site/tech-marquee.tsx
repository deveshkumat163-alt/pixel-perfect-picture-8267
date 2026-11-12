export function TechMarquee({ items }: { items: string[] }) {
  if (!items?.length) return null;
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="animate-marquee flex w-max gap-3">
        {loop.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="glass rounded-full px-5 py-2.5 font-mono text-sm whitespace-nowrap text-muted-foreground"
            aria-hidden={i >= items.length}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
