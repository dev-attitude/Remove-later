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
  ListTodo,
  LogOut,
  Receipt,
  Server,
  TrendingDown,
  TrendingUp,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/marketing/BrandLogo";

const NAV: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  section?: string;
}> = [
  { href: "/manage", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/manage/todos", label: "To-do & planning", icon: ListTodo },
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
  { href: "/manage/invoices", label: "Invoices", icon: Receipt },
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
        "flex h-full w-[17.5rem] flex-col bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#0c1222] text-slate-300",
        variant === "mobile" && "h-screen w-72 max-w-[85vw]"
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <Link href="/manage" onClick={onClose} className="flex min-w-0 items-center gap-3">
          <BrandLogo
            className="h-9 w-auto"
            width={120}
            height={40}
            priority
          />
        </Link>
        {variant === "mobile" && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400/90">
          Business Manager
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Operations & client workspace</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, exact, section }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <div key={href}>
              {section && (
                <p className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 first:mt-0">
                  {section}
                </p>
              )}
              <Link
                href={href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition",
                    active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span className="truncate">{label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Public website
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
