"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Briefcase,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Server,
  TrendingDown,
  TrendingUp,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

const NAV: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  section?: string;
}> = [
  { href: "/manage", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/manage/inquiries",
    label: "Orders & inquiries",
    icon: Inbox,
    section: "Sales & support",
  },
  { href: "/manage/errors", label: "Technical errors", icon: AlertTriangle },
  { href: "/manage/hosting", label: "Hosting services", icon: Server, section: "Hosting" },
  { href: "/manage/clients", label: "Clients", icon: Users, section: "Business" },
  { href: "/manage/quotations", label: "Quotations", icon: FileText },
  { href: "/manage/services", label: "Services & progress", icon: Briefcase },
  { href: "/manage/income", label: "Income", icon: TrendingUp },
  { href: "/manage/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/manage/app-users", label: "App users", icon: UserCircle2, section: "Research App" },
  { href: "/manage/usage", label: "Usage analytics", icon: Activity },
  { href: "/manage/books", label: "Books & resources", icon: BookOpen },
  { href: "/campus/admin", label: "Campus platform", icon: GraduationCap, section: "SmartCampus" },
];

type ManageSidebarProps = {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

export function ManageSidebar({ variant = "desktop", onClose }: ManageSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200 bg-white",
        variant === "mobile" && "h-screen w-72 max-w-[85vw]"
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div>
          <p className="font-display text-sm font-bold text-slate-900">Business Manager</p>
          <p className="text-xs text-slate-500">{BRAND.companyName}</p>
        </div>
        {variant === "mobile" && onClose && (
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon, exact, section }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <div key={href}>
              {section && (
                <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 first:mt-0">
                  {section}
                </p>
              )}
              <Link
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Public website
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
