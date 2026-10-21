/**
 * Shared greeting validation + normalisation helpers.
 *
 * Used by the browser (pre-flight checks, friendly copy) and by the API
 * routes (authoritative server-side checks). No server secrets live here.
 */

export const MAX_PHOTOS = 6;
export const MAX_NAME_LENGTH = 80;
export const MAX_OCCASION_LENGTH = 60;

/** Fallback safety limit — the server may raise/lower it via env. */
export const DEFAULT_MESSAGE_LIMIT = 5000;

/** Raw file cap before the browser resizes an image. */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export const DEFAULT_OCCASION = "bijoya-dashami";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
] as const;

export const MESSAGE_REQUIRED_ERROR =
  "Please write your Bijoya message before saving.";

export function nameRequiredError(): string {
  return "Please enter your name before saving.";
}

export function messageTooLongError(limit: number): string {
  return `Your message is too long (${limit} character safety limit). Please shorten it and try again.`;
}

export function invalidPhotoTypeError(file: File): string {
  return `“${file.name}” is not a supported image. Please use JPG, PNG or WebP.`;
}

export function photoTooLargeError(file: File): string {
  const mb = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));
  return `“${file.name}” is larger than ${mb} MB. Please choose a smaller photo.`;
}

/**
 * Trims stray whitespace while keeping intentional paragraph breaks.
 * Preserves Bengali Unicode, emoji and mixed Bangla-English text.
 */
export function normalizeMessage(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Trims + collapses inner runs of whitespace (names are single-line). */
export function normalizeName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DATA_URL_PATTERN =
  /^data:image\/(jpeg|jpg|png|webp|gif|avif|heic|heif);base64,[A-Za-z0-9+/]+={0,2}$/;

export function isImageDataUrl(value: string): boolean {
  return value.length <= 20 * 1024 * 1024 && DATA_URL_PATTERN.test(value);
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Server validates the Cloudinary host against its own credentials so a
 * client cannot attach arbitrary third-party URLs to a greeting.
 */
export function isCloudinaryHostUrl(value: string, cloudName?: string): boolean {
  if (!cloudName) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host !== "res.cloudinary.com") return false;
    return url.pathname.split("/")[1] === cloudName;
  } catch {
    return false;
  }
}

export type PhotoEntry =
  | { kind: "upload"; dataUrl: string }
  | { kind: "hosted"; url: string }
  | { kind: "invalid"; reason: "type" | "url" };

export function classifyPhoto(raw: unknown): PhotoEntry {
  if (typeof raw !== "string") return { kind: "invalid", reason: "url" };
  if (raw.startsWith("data:image/")) {
    return isImageDataUrl(raw)
      ? { kind: "upload", dataUrl: raw }
      : { kind: "invalid", reason: "type" };
  }
  if (raw.startsWith("https://")) return { kind: "hosted", url: raw };
  return { kind: "invalid", reason: "url" };
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface GreetingPayloadInput {
  sender: unknown;
  message: unknown;
  photos: unknown;
  occasion?: unknown;
  id?: unknown;
  ownerKey?: unknown;
}

export function validateGreetingPayload(
  payload: GreetingPayloadInput,
  messageLimit: number,
): ValidationResult<{
  sender: string;
  message: string;
  photos: unknown[];
  occasion: string;
  id: string | null;
  ownerKey: string | null;
}> {
  const rawMessage =
    typeof payload.message === "string" ? normalizeMessage(payload.message) : "";
  if (!rawMessage) return { ok: false, error: MESSAGE_REQUIRED_ERROR };
  if (rawMessage.length > messageLimit) {
    return { ok: false, error: messageTooLongError(messageLimit) };
  }

  const rawSender =
    typeof payload.sender === "string" ? normalizeName(payload.sender) : "";

  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  if (photos.length > MAX_PHOTOS) {
    return {
      ok: false,
      error: `You can attach up to ${MAX_PHOTOS} photos.`,
    };
  }

  const occasion =
    typeof payload.occasion === "string" &&
    payload.occasion.trim().length > 0 &&
    payload.occasion.trim().length <= MAX_OCCASION_LENGTH
      ? payload.occasion.trim()
      : DEFAULT_OCCASION;

  const id =
    typeof payload.id === "string" && /^[a-f0-9]{24}$/i.test(payload.id)
      ? payload.id
      : null;

  const ownerKey =
    typeof payload.ownerKey === "string" &&
    /^[a-f0-9-]{16,64}$/i.test(payload.ownerKey)
      ? payload.ownerKey
      : null;

  return {
    ok: true,
    value: {
      sender: rawSender,
      message: rawMessage,
      photos,
      occasion,
      id,
      ownerKey,
    },
  };
}
