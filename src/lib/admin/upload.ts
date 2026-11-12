import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm"];

export function validateUpload(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Only JPG, PNG, WebP, GIF, SVG, MP4 or WebM files are allowed";
  if (file.size > MAX_UPLOAD_BYTES) return "Files must be 10 MB or smaller";
  return null;
}

/** Uploads to the media bucket and returns the public URL path served by the app. */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const problem = validateUpload(file);
  if (problem) throw new Error(problem);
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const path = `${safeFolder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return `/api/public/media/${path}`;
}
