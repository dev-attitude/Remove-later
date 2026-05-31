import type { LucideIcon } from "lucide-react";
import {
  PenTool,
  BookOpen,
  Library,
  BarChart3,
  Mic,
  Shield,
  FileSearch,
  Quote,
  FileText,
  Users,
  GraduationCap,
  ClipboardList,
  Presentation,
  Archive,
  Newspaper,
  Settings,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

export type ModuleDef = {
  id: string;
  title: string;
  short: string;
  href: string;
  icon: LucideIcon;
  category: "core" | "integrity" | "collab" | "institution";
};

/** Module registry — hrefs are resolved per-portal via getModulesForPortal() */
export const MODULES: ModuleDef[] = [
  {
    id: "research-topics",
    title: "Research Topic Generator",
    short: "3 topics + similar papers from your context",
    href: "/research-topics",
    icon: Lightbulb,
    category: "core",
  },
  {
    id: "writing",
    title: "AI Research Writing",
    short: "Generate chapters, rewrite, humanize",
    href: "/writing",
    icon: PenTool,
    category: "core",
  },
  {
    id: "understanding",
    title: "Research Understanding",
    short: "Upload PDFs, summarize, quiz",
    href: "/understanding",
    icon: BookOpen,
    category: "core",
  },
  {
    id: "literature",
    title: "Literature Review",
    short: "Search databases, gaps, themes",
    href: "/literature",
    icon: Library,
    category: "core",
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    short: "Quant & qual statistics",
    href: "/data-analysis",
    icon: BarChart3,
    category: "core",
  },
  {
    id: "transcription",
    title: "Audio & Transcription",
    short: "Speech-to-text, themes",
    href: "/transcription",
    icon: Mic,
    category: "core",
  },
  {
    id: "ai-detection",
    title: "AI Detection",
    short: "AI probability, integrity score",
    href: "/ai-detection",
    icon: Shield,
    category: "integrity",
  },
  {
    id: "plagiarism",
    title: "Plagiarism Checker",
    short: "Similarity reports, sources",
    href: "/plagiarism",
    icon: FileSearch,
    category: "integrity",
  },
  {
    id: "citations",
    title: "Citation & Referencing",
    short: "APA, Harvard, DOI lookup",
    href: "/citations",
    icon: Quote,
    category: "integrity",
  },
  {
    id: "proposals",
    title: "Proposal Generator",
    short: "Full proposals by discipline",
    href: "/proposals",
    icon: FileText,
    category: "core",
  },
  {
    id: "collaboration",
    title: "Supervisor & Collaboration",
    short: "Chat, versions, approvals",
    href: "/collaboration",
    icon: Users,
    category: "collab",
  },
  {
    id: "tutor",
    title: "AI Research Tutor",
    short: "Stats, chapters, viva prep",
    href: "/tutor",
    icon: GraduationCap,
    category: "core",
  },
  {
    id: "surveys",
    title: "Survey & Data Collection",
    short: "Questionnaires, bias detection",
    href: "/surveys",
    icon: ClipboardList,
    category: "core",
  },
  {
    id: "presentations",
    title: "Presentation Generator",
    short: "Slides, posters, abstracts",
    href: "/presentations",
    icon: Presentation,
    category: "core",
  },
  {
    id: "repository",
    title: "Research Repository",
    short: "Theses archive, DOI",
    href: "/repository",
    icon: Archive,
    category: "institution",
  },
  {
    id: "journal",
    title: "AI Journal Assistant",
    short: "Journal match, reviewer replies",
    href: "/journal",
    icon: Newspaper,
    category: "core",
  },
  {
    id: "admin",
    title: "Admin Panel",
    short: "Users, subscriptions, analytics",
    href: "/admin",
    icon: Settings,
    category: "institution",
  },
  {
    id: "how-it-works",
    title: "How It Works",
    short: "Architecture & workflows",
    href: "/how-it-works",
    icon: HelpCircle,
    category: "core",
  },
];

export const WRITING_SECTIONS = [
  "Problem statements",
  "Background of study",
  "Research objectives",
  "Research questions",
  "Hypothesis",
  "Literature review",
  "Methodology",
  "Findings",
  "Discussion",
  "Recommendations",
  "Abstract",
  "Conclusion",
] as const;

export const SMART_TOOLS = [
  "Rewrite academic content",
  "Humanize AI-generated text",
  "Improve grammar",
  "Improve academic tone",
  "Citation-aware writing",
  "Detect weak arguments",
  "Suggest references",
] as const;

export const CITATION_STYLES = [
  "APA 7",
  "Harvard",
  "MLA",
  "Chicago",
  "Vancouver",
] as const;

export const PROPOSAL_TEMPLATES = [
  "Nursing",
  "Education",
  "IT",
  "Business",
  "Psychology",
  "Public Health",
  "Engineering",
] as const;

export const USER_ROLES = [
  "Student",
  "Lecturer",
  "Supervisor",
  "Research Consultant",
  "Institution Admin",
  "University Admin",
] as const;
