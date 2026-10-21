/**
 * Server-only configuration limits. Keep `process.env` reads for non-public
 * variables inside this module so nothing leaks into the client bundle.
 */
import { DEFAULT_MESSAGE_LIMIT } from "@/lib/greeting-validation";

function positiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Abuse-prevention cap for a single greeting message (thousands of chars). */
export function getMessageLengthLimit(): number {
  return positiveInt(process.env.GREETING_MESSAGE_MAX_LENGTH, DEFAULT_MESSAGE_LIMIT);
}

/** Request body cap — enough for six resized photos, never unbounded. */
export function getMaxRequestBodyBytes(): number {
  const megabytes = Number.parseInt(
    process.env.GREETING_MAX_REQUEST_MB ?? "16",
    10,
  );
  const safeMb = Number.isFinite(megabytes) && megabytes > 0 ? megabytes : 16;
  return safeMb * 1024 * 1024;
}
