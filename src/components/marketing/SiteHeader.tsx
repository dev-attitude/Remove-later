"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, FlaskConical } from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { COMPANY, NAV_LINKS } from "@/lib/site-content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="marketing-chrome sticky top-0 z-50 border-b border-white/10 shadow-lg shadow-royal/25">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-8 md:py-3">
        <Link href="/" className="flex shrink-0 items-center rounded-lg bg-white px-2 py-1">
          <BrandLogo className="h-14 w-auto md:h-16" priority onDark />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-sky/40 bg-white/10 px-3 py-2 text-sm font-medium text-sky-100 transition hover:bg-white/15 hover:text-white"
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/shop"
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-sky px-4 py-2 text-sm font-semibold text-navy transition hover:bg-white"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-black/10 px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-3 text-sm font-medium text-slate-100 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="mt-2 flex items-center gap-2 rounded-md border border-sky/30 bg-white/10 px-3 py-3 text-sm font-medium text-sky-100"
            onClick={() => setOpen(false)}
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/shop"
            className="mt-3 block rounded-md bg-sky px-4 py-3 text-center text-sm font-semibold text-navy hover:bg-white"
            onClick={() => setOpen(false)}
          >
            Get a quote
          </Link>
        </nav>
      )}
    </header>
  );
}
