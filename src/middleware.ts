import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COUNTRY_COOKIE } from "@/lib/hosting-currency";

/** Lightweight middleware — avoids importing auth/Prisma (Edge 1MB limit on Vercel) */

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/download",
  "/research",
  "/services",
  "/shop",
  "/quote",
  "/about",
  "/contact",
  "/hosting",
  "/manage",
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

  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    req.cookies.get(COUNTRY_COOKIE)?.value;

  function withCountryCookie(response: NextResponse) {
    if (country && country.length === 2 && country !== "XX") {
      response.cookies.set(COUNTRY_COOKIE, country.toUpperCase(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
    return response;
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/services/") ||
    pathname.startsWith("/_next")
  ) {
    return withCountryCookie(NextResponse.next());
  }

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProduction || isPublic) return withCountryCookie(NextResponse.next());

  if (
    !hasSessionCookie(req) &&
    /^\/(institution|student|analysis|developer)(\/|$)/.test(pathname)
  ) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return withCountryCookie(NextResponse.redirect(login));
  }

  return withCountryCookie(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
