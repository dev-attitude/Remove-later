import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  Gift,
  Globe,
  LayoutDashboard,
  Mail,
  Server,
  Shield,
  Sparkles,
  Timer,
  User,
  UserCircle,
} from "lucide-react";

export type HostingAccountNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const HOSTING_ACCOUNT_NAV: HostingAccountNavItem[] = [
  { href: "/hosting/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/hosting/dashboard/expiring", label: "Expiring / Expired", icon: Timer },
  { href: "/hosting/dashboard/domains", label: "Domain List", icon: Globe },
  { href: "/hosting/dashboard/hosting", label: "Hosting List", icon: Server },
  { href: "/hosting/dashboard/email", label: "Private Email", icon: Mail },
  { href: "/hosting/dashboard/ssl", label: "SSL Certificates", icon: Shield },
  { href: "/hosting/dashboard/growth-tools", label: "Growth Tools", icon: Sparkles },
  { href: "/hosting/dashboard/apps", label: "Apps", icon: AppWindow },
  { href: "/hosting/dashboard/offers", label: "My Offers", icon: Gift },
  { href: "/hosting/dashboard/jun", label: "JUN", icon: UserCircle },
];

export const HOSTING_PROFILE_NAV: HostingAccountNavItem = {
  href: "/hosting/dashboard/profile",
  label: "Profile",
  icon: User,
};

export const HOSTING_DEMO_USER_NAME = "Jun";
