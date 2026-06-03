"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PortalSidebar } from "./PortalSidebar";
import { getPortal } from "@/lib/portals";
import type { PortalId } from "@/lib/portals";
import { cn } from "@/lib/utils";

export function PortalShell({
  portalId,
  children,
}: {
  portalId: PortalId;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const portal = getPortal(portalId)!;

  useEffect(() => {
    setMenuOpen(false);
  }, [portalId]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-50">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <PortalSidebar
        portalId={portalId}
        onNavigate={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full w-[min(100vw-3rem,18rem)] max-w-[85vw] transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <p className="min-w-0 flex-1 truncate font-display text-sm font-bold text-slate-900">
            {portal.name}
          </p>
          {menuOpen && (
            <button
              type="button"
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
