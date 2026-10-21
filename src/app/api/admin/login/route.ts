import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  adminEmail,
  createSessionToken,
  isAdminAuthConfigured,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/admin-auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const throttle = rateLimit(clientKey(request, "admin-login"), 10, 5 * 60 * 1000);
  if (!throttle.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(throttle.retryAfterSeconds) } },
    );
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured on this server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body as { email?: unknown; password?: unknown };
  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Enter your email and password." },
      { status: 400 },
    );
  }

  if (!(await verifyCredentials(email, password))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin session could not be created." },
      { status: 503 },
    );
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());

  return NextResponse.json({ ok: true, email: adminEmail() });
}
