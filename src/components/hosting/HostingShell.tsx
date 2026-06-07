"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud,
  Database,
  Globe,
  HardDrive,
  LayoutDashboard,
  Mail,
  Search,
  Server,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { SKYRAPAY_HOSTING } from "@/lib/brand";
import { useHostingCart } from "@/lib/hosting-cart-context";
import { cn } from "@/lib/utils";

const HUB_LINKS = [
  { href: "/hosting/domains", label: "Buy your own domain name", icon: Search },
  { href: "/hosting/plans", label: "View hosting plans", icon: Cloud },
  { href: "/hosting/cart", label: "Cart", icon: ShoppingCart, showBadge: true },
  { href: "/hosting/dashboard", label: "My account", icon: LayoutDashboard },
] as const;

const DASHBOARD_LINKS = [
  { href: "/hosting/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/hosting/dashboard/domains", label: "Domains", icon: Globe },
  { href: "/hosting/dashboard/email", label: "Email", icon: Mail },
  { href: "/hosting/dashboard/databases", label: "MySQL", icon: Database },
  { href: "/hosting/dashboard/ssl", label: "SSL", icon: Shield },
  { href: "/hosting/dashboard/backups", label: "Backups", icon: HardDrive },
] as const;

export function HostingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount } = useHostingCart();
  const isDashboard = pathname.startsWith("/hosting/dashboard");
  const links = isDashboard ? DASHBOARD_LINKS : HUB_LINKS;

  return (
    <div className="min-h-[60vh] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-royal text-white">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-navy">{SKYRAPAY_HOSTING.name}</p>
              <p className="text-xs text-slate-500">{SKYRAPAY_HOSTING.domain}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1">
            {links.map(({ href, label, icon: Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === href : pathname.startsWith(href);
              const showBadge = "showBadge" in rest && rest.showBadge;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-100 text-navy"
                      : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {showBadge && itemCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-royal px-1.5 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">{children}</div>
    </div>
  );
}
