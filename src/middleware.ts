import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Lightweight middleware — avoids importing auth/Prisma (Edge 1MB limit on Vercel) */

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/download",
  "/research",
  "/services",
  "/shop",
  "/about",
  "/contact",
  "/api/health",
  "/api/auth",
  "/api/literature",
  "/api/contact",
];

function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProduction = process.env.GM_APP_MODE === "production";

  if (
    pathname === "/" ||
    pathname.startsWith("/services/") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProduction || isPublic) return NextResponse.next();

  if (
    !hasSessionCookie(req) &&
    /^\/(institution|student|analysis|developer)(\/|$)/.test(pathname)
  ) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
