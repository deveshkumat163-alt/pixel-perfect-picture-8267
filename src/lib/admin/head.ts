export function adminHead(title: string) {
  const description = `${title} management for Dev Creative Works.`;
  return { meta: [
    { title: `${title} — Dev Creative Works Admin` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | Dev Creative Works` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] };
}