"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { ManageSidebar } from "./ManageSidebar";
import { BRAND } from "@/lib/brand";

function userInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return label.slice(0, 2).toUpperCase() || "SC";
}

export function ManageShell({
  children,
  userLabel,
}: {
  children: React.ReactNode;
  userLabel: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = useMemo(() => userInitials(userLabel), [userLabel]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="manage-shell-bg lg:flex">
      <div className="hidden lg:flex lg:shrink-0">
        <ManageSidebar variant="desktop" />
      </div>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 shadow-2xl lg:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-out`}
      >
        <ManageSidebar variant="mobile" onClose={() => setMenuOpen(false)} />
      </div>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-slate-900">Business Manager</p>
                <p className="truncate text-xs text-slate-500">{BRAND.companyLegal}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-slate-500">Signed in as</p>
                <p className="max-w-[200px] truncate text-sm font-semibold text-slate-900">
                  {userLabel}
                </p>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-sm ring-2 ring-white"
                aria-hidden
              >
                {initials}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
