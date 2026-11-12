import { createFileRoute } from "@tanstack/react-router";

// Serves files from the private "media" bucket for public pages (read-only, anon policy).
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..") || path.length > 300) {
          return new Response("Not found", { status: 404 });
        }
        const { createPublicDb } = await import("@/lib/public-db.server");
        const db = createPublicDb();
        const { data, error } = await db.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=3600, s-maxage=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
