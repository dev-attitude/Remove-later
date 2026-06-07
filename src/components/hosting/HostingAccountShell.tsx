"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Server, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SKYRAPAY_HOSTING } from "@/lib/brand";
import {
  HOSTING_ACCOUNT_NAV,
  HOSTING_PROFILE_NAV,
} from "@/lib/hosting-account-nav";
import { useHostingDemoAccount } from "@/lib/use-hosting-demo-account";
import { cn } from "@/lib/utils";

export function HostingAccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { displayName } = useHostingDemoAccount();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <Link href="/hosting" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-royal text-white">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{SKYRAPAY_HOSTING.name}</p>
            <p className="text-[10px] text-slate-500">{SKYRAPAY_HOSTING.domain}/hosting</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {HOSTING_ACCOUNT_NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-brand-100 text-navy"
                      : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-3">
        <p className="mb-2 truncate px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {displayName}
        </p>
        <Link
          href={HOSTING_PROFILE_NAV.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
            pathname.startsWith(HOSTING_PROFILE_NAV.href)
              ? "bg-brand-100 text-navy"
              : "text-slate-600 hover:bg-slate-50 hover:text-navy"
          )}
        >
          <HOSTING_PROFILE_NAV.icon className="h-4 w-4 shrink-0" />
          {HOSTING_PROFILE_NAV.label}
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="truncate text-sm font-semibold text-navy">My account</p>
          {menuOpen && (
            <button
              type="button"
              className="ml-auto rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
