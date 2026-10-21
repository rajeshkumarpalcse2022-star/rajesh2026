import { NextResponse, type NextRequest } from "next/server";
import {
  readSessionCookie,
  verifySessionToken,
} from "@/lib/admin-auth";

/**
 * Server-side gate for the admin area. The dashboard data APIs verify the
 * session again on every request — this guard simply stops unauthenticated
 * visitors from reaching `/admin` at all.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await verifySessionToken(
    readSessionCookie(request.headers.get("cookie")),
  );

  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (authenticated) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
