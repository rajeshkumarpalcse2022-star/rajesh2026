const OWNER_KEY_STORAGE = "bijoya:owner-key";
const LAST_GREETING_ID_STORAGE = "bijoya:greeting-id";
const OWNER_KEY_PATTERN = /^[a-f0-9-]{16,64}$/i;
const GREETING_ID_PATTERN = /^[a-f0-9]{24}$/i;

let memoryOwnerKey: string | null = null;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable (private mode) — the in-memory key still works.
  }
}

function generateKey(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // Fall through to the non-secure-context generator.
  }
  const chunks: string[] = [];
  for (let index = 0; index < 8; index += 1) {
    chunks.push(Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, "0"));
  }
  return `${chunks[0]}-${chunks[1]}-${chunks[2]}-${chunks[3]}-${chunks.slice(4).join("")}`;
}

/**
 * Stable per-browser write key. It lets a visitor update their own greeting
 * without ever exposing a way to overwrite someone else's record.
 */
export function ensureOwnerKey(): string {
  const stored = safeGet(OWNER_KEY_STORAGE);
  if (stored && OWNER_KEY_PATTERN.test(stored)) {
    memoryOwnerKey = stored;
    return stored;
  }
  if (!memoryOwnerKey) {
    memoryOwnerKey = generateKey();
    safeSet(OWNER_KEY_STORAGE, memoryOwnerKey);
  }
  return memoryOwnerKey;
}

export function readLastGreetingId(): string | null {
  const stored = safeGet(LAST_GREETING_ID_STORAGE);
  return stored && GREETING_ID_PATTERN.test(stored) ? stored : null;
}

export function writeLastGreetingId(id: string): void {
  if (!GREETING_ID_PATTERN.test(id)) return;
  safeSet(LAST_GREETING_ID_STORAGE, id);
}
