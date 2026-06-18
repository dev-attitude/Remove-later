"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, FlaskConical } from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { COMPANY, NAV_LINKS } from "@/lib/site-content";

function useNavHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return hash;
}

function isNavLinkActive(pathname: string, hash: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href.includes("#")) {
    const [path, fragment] = href.split("#");
    return pathname === path && hash === `#${fragment}`;
  }

  if (href === "/shop") {
    return (pathname === "/shop" || pathname === "/quote") && hash !== "#our-apps";
  }

  if (href === "/services") {
    return pathname === "/services" || pathname.startsWith("/services/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClassName(active: boolean) {
  return active
    ? "rounded-md bg-charcoal/[0.06] px-3 py-2 text-sm font-normal text-charcoal"
    : "rounded-md px-3 py-2 text-sm font-normal text-charcoal/70 transition hover:bg-charcoal/[0.04] hover:text-charcoal";
}

function navLinkClassNameMobile(active: boolean) {
  return active
    ? "block rounded-md bg-charcoal/[0.06] px-3 py-3 text-sm font-normal text-charcoal"
    : "block rounded-md px-3 py-3 text-sm font-normal text-charcoal/70 hover:bg-charcoal/[0.04]";
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const hash = useNavHash();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-cream/85 backdrop-blur-md supports-[backdrop-filter]:bg-cream/70"
          : "border-b border-transparent bg-cream"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-line transition hover:ring-charcoal/20"
        >
          <BrandLogo className="h-9 w-auto md:h-10" priority onDark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = isNavLinkActive(pathname, hash, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClassName(active)}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={COMPANY.researchAppPath}
            className={`ml-1 inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-normal transition ${
              pathname.startsWith("/research") ||
              ["/student", "/institution", "/analysis", "/developer", "/login"].some(
                (p) => pathname === p || pathname.startsWith(`${p}/`)
              )
                ? "border-charcoal/40 bg-charcoal/[0.06] text-charcoal"
                : "border-charcoal/40 text-charcoal hover:bg-charcoal/[0.04]"
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/quote"
            className="marketing-btn-primary ml-2"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md border border-charcoal/20 p-2 text-charcoal transition hover:bg-charcoal/[0.04] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-cream px-4 py-4 lg:hidden" aria-label="Main mobile">
          {NAV_LINKS.map((link) => {
            const active = isNavLinkActive(pathname, hash, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClassNameMobile(active)}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={COMPANY.researchAppPath}
            className="mt-2 flex items-center gap-2 rounded-md border border-charcoal/40 px-3 py-3 text-sm font-normal text-charcoal"
            onClick={() => setOpen(false)}
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/quote"
            className="marketing-btn-primary mt-3 w-full justify-center"
            onClick={() => setOpen(false)}
          >
            Get a quote
          </Link>
        </nav>
      )}
    </header>
  );
}
