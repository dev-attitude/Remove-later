import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/download",
  "/api/health",
  "/api/auth",
  "/api/literature",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProduction = process.env.GM_APP_MODE === "production";

  if (pathname === "/") return NextResponse.next();

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProduction || isPublic) return NextResponse.next();

  if (
    !req.auth &&
    /^\/(institution|student|analysis|developer)(\/|$)/.test(pathname)
  ) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
