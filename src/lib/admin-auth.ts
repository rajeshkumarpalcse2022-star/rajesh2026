/**
 * Server-side admin authentication.
 *
 * - Credentials come from environment variables only and are never shipped
 *   to the browser.
 * - The session is a signed, HTTP-only cookie (HMAC-SHA256) created with the
 *   Web Crypto API so the exact same verification also runs inside `proxy`.
 */

export const ADMIN_SESSION_COOKIE = "bijoya_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function getSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit) return explicit;
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return `bijoya-session:${password}`;
  return null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(signature);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

/** Constant-time credential check against server-side env values. */
export async function verifyCredentials(
  email: unknown,
  password: unknown,
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;

  const candidateEmail = String(email ?? "").trim().toLowerCase();
  const candidatePassword = String(password ?? "");

  const [expectedEmailHash, candidateEmailHash, expectedPasswordHash, candidatePasswordHash] =
    await Promise.all([
      sha256Hex(expectedEmail),
      sha256Hex(candidateEmail),
      sha256Hex(expectedPassword),
      sha256Hex(candidatePassword),
    ]);

  return (
    constantTimeEqual(expectedEmailHash, candidateEmailHash) &&
    constantTimeEqual(expectedPasswordHash, candidatePasswordHash)
  );
}

export function adminEmail(): string | null {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? null;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${expiresAt}`;
  const signature = await hmacHex(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expiryRaw, signature] = parts;
  if (version !== "v1") return false;

  const expiresAt = Number(expiryRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await hmacHex(secret, `v1.${expiresAt}`);
  return constantTimeEqual(expected, signature);
}

export function sessionCookieOptions(): {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Reads the session cookie from a raw `Cookie` header (used by proxy). */
export function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    const name = pair.slice(0, separator).trim();
    if (name !== ADMIN_SESSION_COOKIE) continue;
    return decodeURIComponent(pair.slice(separator + 1).trim());
  }
  return null;
}
