import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  CreditCard,
  FileCheck,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  QrCode,
  ScanFace,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { CampusModuleId, CampusRole } from "./types";

export type CampusNavItem = {
  id: CampusModuleId;
  label: string;
  href: (tenant: string) => string;
  icon: LucideIcon;
  roles: CampusRole[] | "all";
  badge?: string;
};

export const CAMPUS_NAV: CampusNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: (t) => `/campus/${t}`,
    icon: LayoutDashboard,
    roles: "all",
  },
  {
    id: "executive",
    label: "Executive Centre",
    href: (t) => `/campus/${t}/executive`,
    icon: BarChart3,
    roles: ["vc", "admin", "finance"],
    badge: "VC",
  },
  {
    id: "success",
    label: "Student Success AI",
    href: (t) => `/campus/${t}/success`,
    icon: GraduationCap,
    roles: ["vc", "admin", "registrar", "lecturer"],
    badge: "AI",
  },
  {
    id: "advisor",
    label: "AI Academic Advisor",
    href: (t) => `/campus/${t}/advisor`,
    icon: Bot,
    roles: ["student", "lecturer", "registrar"],
    badge: "AI",
  },
  {
    id: "crm",
    label: "Institutional CRM",
    href: (t) => `/campus/${t}/crm`,
    icon: Users,
    roles: ["vc", "admin", "registrar"],
  },
  {
    id: "finance",
    label: "Finance ERP",
    href: (t) => `/campus/${t}/finance`,
    icon: Building2,
    roles: ["vc", "admin", "finance"],
  },
  {
    id: "wallet",
    label: "Student Wallet",
    href: (t) => `/campus/${t}/wallet`,
    icon: Wallet,
    roles: ["student", "finance", "admin"],
  },
  {
    id: "digital-id",
    label: "Digital Campus ID",
    href: (t) => `/campus/${t}/digital-id`,
    icon: QrCode,
    roles: ["student", "lecturer", "it"],
  },
  {
    id: "attendance",
    label: "AI Attendance",
    href: (t) => `/campus/${t}/attendance`,
    icon: ScanFace,
    roles: ["lecturer", "admin", "registrar"],
  },
  {
    id: "exams",
    label: "Examination Centre",
    href: (t) => `/campus/${t}/exams`,
    icon: FileCheck,
    roles: ["lecturer", "registrar", "admin"],
  },
  {
    id: "lms",
    label: "Learning (LMS)",
    href: (t) => `/campus/${t}/lms`,
    icon: BookOpen,
    roles: ["student", "lecturer"],
  },
  {
    id: "research",
    label: "Research Hub",
    href: (t) => `/campus/${t}/research`,
    icon: Award,
    roles: ["vc", "admin", "lecturer"],
  },
  {
    id: "accreditation",
    label: "Accreditation & QA",
    href: (t) => `/campus/${t}/accreditation`,
    icon: ShieldCheck,
    roles: ["vc", "admin", "registrar"],
  },
  {
    id: "alumni",
    label: "Alumni & Fundraising",
    href: (t) => `/campus/${t}/alumni`,
    icon: HeartHandshake,
    roles: ["vc", "admin"],
  },
  {
    id: "employers",
    label: "Employers & Graduates",
    href: (t) => `/campus/${t}/employers`,
    icon: Briefcase,
    roles: ["vc", "admin", "student"],
  },
  {
    id: "verify",
    label: "Transcript Verify",
    href: (t) => `/campus/${t}/verify`,
    icon: CreditCard,
    roles: "all",
  },
  {
    id: "chatbot",
    label: "Campus AI Chat",
    href: (t) => `/campus/${t}/chatbot`,
    icon: Bot,
    roles: "all",
  },
];

export function campusNavForRole(role: CampusRole): CampusNavItem[] {
  return CAMPUS_NAV.filter(
    (item) => item.roles === "all" || item.roles.includes(role)
  );
}

export function campusPath(tenant: string, module?: CampusModuleId): string {
  if (!module || module === "overview") return `/campus/${tenant}`;
  return `/campus/${tenant}/${module}`;
}
