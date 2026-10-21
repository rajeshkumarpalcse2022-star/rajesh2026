/**
 * Client-safe helpers for building optimized Cloudinary delivery URLs.
 * Falls back to the original URL whenever the shape is unexpected.
 */

export function cloudinaryThumbUrl(url: string, width = 640): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() !== "res.cloudinary.com") return url;

    const parts = parsed.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return url;

    const nextSegment = parts[uploadIndex + 1] ?? "";
    if (nextSegment.includes(",")) return url;

    parts.splice(uploadIndex + 1, 0, `w_${width},c_fill,g_auto,q_auto,f_auto`);
    parsed.pathname = parts.join("/");
    return parsed.toString();
  } catch {
    return url;
  }
}
