"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, FlaskConical } from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { COMPANY, NAV_LINKS } from "@/lib/site-content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-8 md:py-3">
        <Link href="/" className="flex shrink-0 items-center bg-white">
          <BrandLogo className="h-14 w-auto md:h-16" priority />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 transition hover:bg-brand-100"
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/shop"
            className="ml-2 inline-flex items-center gap-1 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-slate-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-3 text-sm font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="mt-2 flex items-center gap-2 rounded-md bg-brand-50 px-3 py-3 text-sm font-medium text-brand-800"
            onClick={() => setOpen(false)}
          >
            <FlaskConical className="h-4 w-4" />
            Skyrapay Research
          </Link>
          <Link
            href="/shop"
            className="mt-3 block rounded-md bg-brand-700 px-4 py-3 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Get a quote
          </Link>
        </nav>
      )}
    </header>
  );
}
