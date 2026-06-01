"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getModulesForPortal,
  getPortal,
  portalPath,
  type PortalId,
} from "@/lib/portals";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  Download,
  ArrowLeft,
  LogIn,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function PortalSidebar({ portalId }: { portalId: PortalId }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const portal = getPortal(portalId)!;
  const modules = getModulesForPortal(portalId);
  const Icon = portal.icon;

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <Link href="/research" className="mb-3 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3 w-3" /> All portals
        </Link>
        <Link href={portalPath(portalId)} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-slate-900">
              Skyrapay Research
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-brand-600">
              {portal.id === "student" ? "Student" : portal.id}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <Link
          href={portalPath(portalId)}
          className={cn(
            "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
            pathname === portalPath(portalId)
              ? "bg-brand-50 font-medium text-brand-700"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <Link
          href={portalPath(portalId, "subscription")}
          className={cn(
            "mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
            pathname === portalPath(portalId, "subscription")
              ? "bg-brand-50 font-medium text-brand-700"
              : "text-slate-600 hover:bg-slate-50"
          )}
        >
          <CreditCard className="h-4 w-4" />
          Subscription
        </Link>

        <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Tools
        </p>
        {modules.map((m) => {
          const ModIcon = m.icon;
          const active = pathname === m.href;
          return (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                "mb-0.5 flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <ModIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-2 leading-snug">{m.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3 space-y-1">
        {session?.user ? (
          <>
            <p className="truncate px-2 text-xs text-slate-600">{session.user.email}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
        )}
        <Link
          href="/download"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download apps
        </Link>
      </div>
    </aside>
  );
}
