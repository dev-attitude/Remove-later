import type { LucideIcon } from "lucide-react";
import {
  Building2,
  GraduationCap,
  BarChart3,
  Code2,
  ClipboardCheck,
} from "lucide-react";
import { MODULES, type ModuleDef } from "./modules";

export type PortalId = "institution" | "student" | "analysis" | "developer";

export type SubscriptionTier = {
  id: string;
  name: string;
  priceMonthly: number | "custom";
  currency: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type PortalConfig = {
  id: PortalId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  gradient: string;
  roles: string[];
  moduleIds: string[];
  subscriptions: SubscriptionTier[];
};

export const PORTALS: Record<PortalId, PortalConfig> = {
  institution: {
    id: "institution",
    name: "Institution Portal",
    tagline: "Supervisors & research markers",
    description:
      "For universities and departments. Supervise students, mark submissions, approve chapters, and manage research integrity at scale.",
    icon: Building2,
    accent: "from-indigo-600 to-violet-700",
    gradient: "bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-900",
    roles: [
      "Research Supervisor",
      "Research Marker",
      "Department Head",
      "Institution Admin",
    ],
    moduleIds: [
      "collaboration",
      "marking",
      "repository",
      "ai-detection",
      "plagiarism",
      "writing",
      "data-analysis",
      "journal",
      "how-it-works",
    ],
    subscriptions: [
      {
        id: "inst-supervisor",
        name: "Supervisor",
        priceMonthly: 49,
        currency: "USD",
        description: "Individual supervisor — up to 15 students",
        features: [
          "Student supervision dashboard",
          "Version review & approvals",
          "AI detection on submissions",
          "Plagiarism reports",
          "Live commenting",
        ],
      },
      {
        id: "inst-marker",
        name: "Research Marker",
        priceMonthly: 39,
        currency: "USD",
        description: "Grading & rubric tools for markers",
        features: [
          "Batch marking workspace",
          "Rubric-based scoring",
          "Integrity checks per paper",
          "Feedback templates",
          "Export grade sheets",
        ],
        highlighted: true,
      },
      {
        id: "inst-department",
        name: "Department",
        priceMonthly: 199,
        currency: "USD",
        description: "Up to 25 supervisors + 10 markers",
        features: [
          "Department dashboard",
          "Research repository",
          "Progress analytics",
          "Shared marking pools",
          "Priority support",
        ],
      },
      {
        id: "inst-enterprise",
        name: "University Enterprise",
        priceMonthly: "custom",
        currency: "USD",
        description: "Full institution rollout",
        features: [
          "Unlimited seats",
          "SSO & LMS integration",
          "Custom repository & DOI",
          "Dedicated success manager",
          "SLA & on-prem option",
        ],
      },
    ],
  },
  student: {
    id: "student",
    name: "Student & Assistant Portal",
    tagline: "Students & individual research assistants",
    description:
      "Write your thesis, check plagiarism, generate proposals, get tutor help, and collaborate with your supervisor.",
    icon: GraduationCap,
    accent: "from-brand-600 to-teal-600",
    gradient: "gradient-hero",
    roles: ["Student", "Individual Research Assistant", "Postgraduate Researcher"],
    moduleIds: [
      "writing",
      "understanding",
      "literature",
      "proposals",
      "citations",
      "plagiarism",
      "ai-detection",
      "tutor",
      "presentations",
      "collaboration",
      "how-it-works",
    ],
    subscriptions: [
      {
        id: "stu-free",
        name: "Student Free",
        priceMonthly: 0,
        currency: "USD",
        description: "Get started with essentials",
        features: [
          "5 AI writing generations / month",
          "2 document uploads",
          "Basic plagiarism scan",
          "Web access only",
        ],
      },
      {
        id: "stu-pro",
        name: "Student Pro",
        priceMonthly: 19,
        currency: "USD",
        description: "Full thesis writing toolkit",
        features: [
          "Unlimited AI writing",
          "Literature review assistant",
          "Citation generator (all styles)",
          "AI tutor & viva prep",
          "Web + mobile apps",
        ],
        highlighted: true,
      },
      {
        id: "stu-assistant",
        name: "Research Assistant",
        priceMonthly: 29,
        currency: "USD",
        description: "For hired RAs supporting multiple projects",
        features: [
          "Everything in Student Pro",
          "Multi-project workspaces",
          "Transcription (10 hrs/mo)",
          "Proposal templates",
          "Priority generation queue",
        ],
      },
      {
        id: "stu-annual",
        name: "Student Annual",
        priceMonthly: 15,
        currency: "USD",
        description: "Pro features billed yearly ($180/yr)",
        features: [
          "All Student Pro features",
          "2 months free vs monthly",
          "Thesis export pack",
          "Offline PDF reading (app)",
        ],
      },
    ],
  },
  analysis: {
    id: "analysis",
    name: "Research Analysis Portal",
    tagline: "Quantitative & qualitative analysis",
    description:
      "Dedicated workspace for data cleaning, statistics, thematic analysis, surveys, and AI-generated findings chapters.",
    icon: BarChart3,
    accent: "from-emerald-600 to-cyan-700",
    gradient: "bg-gradient-to-br from-emerald-950 via-emerald-800 to-cyan-900",
    roles: [
      "Data Analyst",
      "Qualitative Researcher",
      "Mixed-Methods Researcher",
      "Research Consultant",
    ],
    moduleIds: [
      "data-analysis",
      "surveys",
      "transcription",
      "literature",
      "understanding",
      "presentations",
      "writing",
      "how-it-works",
    ],
    subscriptions: [
      {
        id: "ana-lite",
        name: "Analyst Lite",
        priceMonthly: 35,
        currency: "USD",
        description: "Solo analyst — small datasets",
        features: [
          "CSV/Excel upload (5k rows)",
          "Descriptive stats & charts",
          "Basic thematic coding",
          "Findings interpretation AI",
        ],
      },
      {
        id: "ana-pro",
        name: "Analyst Pro",
        priceMonthly: 59,
        currency: "USD",
        description: "Advanced statistics & qual tools",
        features: [
          "SPSS import & regression suite",
          "Factor analysis & reliability",
          "Interview transcription (5 hrs)",
          "Survey builder + bias check",
          "Export to Word/LaTeX",
        ],
        highlighted: true,
      },
      {
        id: "ana-lab",
        name: "Research Lab Team",
        priceMonthly: 149,
        currency: "USD",
        description: "Up to 8 analysts on one project",
        features: [
          "Shared datasets & codebooks",
          "Team thematic analysis",
          "Unlimited chart exports",
          "API access for pipelines",
          "Web + desktop apps",
        ],
      },
      {
        id: "ana-consultant",
        name: "Consultant",
        priceMonthly: 89,
        currency: "USD",
        description: "Freelance consultants",
        features: [
          "Client project folders",
          "White-label reports",
          "All Pro statistics",
          "10 transcription hours",
        ],
      },
    ],
  },
  developer: {
    id: "developer",
    name: "Developer Console",
    tagline: "Platform owner & operations",
    description:
      "Your control center: manage all portals, subscriptions, revenue, API keys, deployments, and system health.",
    icon: Code2,
    accent: "from-slate-700 to-slate-900",
    gradient: "bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900",
    roles: ["Platform Developer", "Owner", "DevOps"],
    moduleIds: [
      "developer-console",
      "admin",
      "repository",
      "how-it-works",
    ],
    subscriptions: [
      {
        id: "dev-owner",
        name: "Platform Owner",
        priceMonthly: 0,
        currency: "USD",
        description: "Internal — full system access",
        features: [
          "All portals & modules",
          "Revenue & usage analytics",
          "User & institution management",
          "API keys & webhooks",
          "App release management",
        ],
        highlighted: true,
      },
    ],
  },
};

export const PORTAL_IDS = Object.keys(PORTALS) as PortalId[];

export function isPortalId(value: string): value is PortalId {
  return PORTAL_IDS.includes(value as PortalId);
}

export function getPortal(id: string): PortalConfig | undefined {
  return isPortalId(id) ? PORTALS[id] : undefined;
}

export function portalPath(portal: PortalId, path = ""): string {
  const base = `/${portal}`;
  if (!path) return base;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

export function portalHasModule(portal: PortalId, moduleId: string): boolean {
  return PORTALS[portal].moduleIds.includes(moduleId);
}

export function getModulesForPortal(portal: PortalId): ModuleDef[] {
  const ids = new Set(PORTALS[portal].moduleIds);
  const extra: ModuleDef[] = [];

  if (portal === "institution") {
    extra.push({
      id: "marking",
      title: "Research Marking",
      short: "Rubrics, batch grading, feedback",
      href: portalPath(portal, "marking"),
      icon: ClipboardCheck,
      category: "institution",
    });
  }

  if (portal === "developer") {
    extra.push({
      id: "developer-console",
      title: "Developer Console",
      short: "API, revenue, releases",
      href: portalPath(portal, "developer-console"),
      icon: Code2,
      category: "institution",
    });
  }

  const fromRegistry = MODULES.filter((m) => ids.has(m.id)).map((m) => ({
    ...m,
    href: portalPath(portal, m.id),
  }));

  const merged = [...extra, ...fromRegistry];
  const seen = new Set<string>();
  return merged.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export function formatPrice(tier: SubscriptionTier): string {
  if (tier.priceMonthly === "custom") return "Custom pricing";
  if (tier.priceMonthly === 0) return "Free";
  return `$${tier.priceMonthly}/${tier.currency === "USD" ? "mo" : "mo"}`;
}

export const DOWNLOAD_PLATFORMS = [
  {
    id: "web",
    name: "Web App",
    devices: "Any browser",
    description: "Use instantly — no install required",
    action: "Use now",
    href: "/",
    available: true,
  },
  {
    id: "android",
    name: "Android",
    devices: "Phones & tablets",
    description: "Google Play or direct APK",
    action: "Download APK",
    href: "/download#android",
    available: true,
  },
  {
    id: "ios",
    name: "iPhone & iPad",
    devices: "iOS 16+",
    description: "App Store (TestFlight beta available)",
    action: "App Store",
    href: "/download#ios",
    available: true,
  },
  {
    id: "macos",
    name: "MacBook",
    devices: "macOS 13+",
    description: "Native app + menu bar quick capture",
    action: "Download for Mac",
    href: "/download#macos",
    available: true,
  },
  {
    id: "windows",
    name: "Windows Laptop",
    devices: "Windows 10/11",
    description: "Desktop app with offline datasets",
    action: "Download for Windows",
    href: "/download#windows",
    available: true,
  },
] as const;
