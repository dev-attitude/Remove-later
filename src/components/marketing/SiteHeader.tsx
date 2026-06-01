"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, FlaskConical } from "lucide-react";
import { COMPANY, NAV_LINKS } from "@/lib/site-content";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060b18]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt={COMPANY.name}
            width={48}
            height={48}
            className="h-11 w-11 rounded-lg object-contain"
            priority
          />
          <div className="hidden sm:block">
            <p className="text-sm font-bold tracking-wide text-white">{COMPANY.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              {COMPANY.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-brand-400/40 bg-brand-600/20 px-3 py-2 text-sm font-medium text-brand-200 transition hover:bg-brand-600/40"
          >
            <FlaskConical className="h-4 w-4" />
            Research Suite
          </Link>
          <Link
            href="/shop"
            className="ml-2 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:brightness-110"
          >
            Get a quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-white lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#060b18] px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-200"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={COMPANY.researchAppPath}
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-brand-300"
            onClick={() => setOpen(false)}
          >
            <FlaskConical className="h-4 w-4" />
            Research Suite
          </Link>
          <Link
            href="/shop"
            className="mt-3 block rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Get a quote
          </Link>
        </nav>
      )}
    </header>
  );
}
