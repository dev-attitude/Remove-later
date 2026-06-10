"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { SMARTCAMPUS } from "@/lib/campus/brand";
import { campusNavForRole } from "@/lib/campus/nav";
import type { CampusRole, CampusTenantView } from "@/lib/campus/types";
import { institutionTypeLabel } from "@/lib/campus/data";
import { CampusSignOut } from "./CampusSignOut";

type Props = {
  tenant: CampusTenantView;
  role?: CampusRole;
  children: React.ReactNode;
};

export function CampusShell({ tenant, role = "vc", children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = campusNavForRole(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="border-b border-slate-200 bg-white"
        style={{ borderTopColor: tenant.primaryColor, borderTopWidth: 4 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={`/campus/${tenant.slug}`} className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{tenant.name}</p>
              <p className="truncate text-xs text-slate-500">{SMARTCAMPUS.productName}</p>
            </Link>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <TenantSwitcher current={tenant.slug} />
            <Link
              href="/campus"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Product home
            </Link>
            <CampusSignOut />
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside
          className={clsx(
            "w-64 shrink-0 md:block",
            mobileOpen ? "block" : "hidden"
          )}
        >
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {institutionTypeLabel(tenant.institutionType)}
              </p>
              <p className="mt-1 text-sm text-slate-700">{tenant.tagline}</p>
              <p className="mt-2 text-xs text-slate-500">
                Role: <span className="font-medium capitalize">{role}</span>
              </p>
            </div>
            <nav className="rounded-xl border border-slate-200 bg-white p-2">
              {nav.map((item) => {
                const href = item.href(tenant.slug);
                const isHub = item.id === "overview" || item.id === "student-home";
                const active = isHub
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={clsx(
                          "rounded px-1.5 py-0.5 text-[10px] font-bold",
                          active ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function TenantSwitcher({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const tenants = [
    { slug: "horizon-university", name: "Horizon University" },
    { slug: "acacia-college", name: "Acacia College" },
    { slug: "unity-nursing", name: "Unity Nursing Institute" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Switch institution
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {tenants.map((t) => (
            <Link
              key={t.slug}
              href={`/campus/${t.slug}`}
              className={clsx(
                "block px-3 py-2 text-sm hover:bg-slate-50",
                t.slug === current ? "font-semibold text-blue-700" : "text-slate-700"
              )}
              onClick={() => setOpen(false)}
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
