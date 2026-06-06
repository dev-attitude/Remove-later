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
  Layers,
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
    id: "research-library",
    title: "Research Knowledge Library",
    short: "7-level curriculum, sources & AI roadmap",
    href: "/research-library",
    icon: Layers,
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
    short: "25 research modules with in-app guides & papers",
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
    short: "Upload supervisor docs, track edits & get fixes",
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

/** Full thesis chapters — generates complete chapter drafts */
export const WRITING_CHAPTERS = [
  {
    id: "chapter-1",
    label: "Chapter 1 — Introduction (full chapter)",
  },
  {
    id: "chapter-2",
    label: "Chapter 2 — Literature review (full chapter)",
  },
  {
    id: "chapter-3",
    label: "Chapter 3 — Methodology (full chapter)",
  },
  {
    id: "chapter-4",
    label: "Chapter 4 — Results / findings (full chapter)",
  },
  {
    id: "chapter-5",
    label: "Chapter 5 — Discussion (full chapter)",
  },
  {
    id: "chapter-6",
    label: "Chapter 6 — Conclusion & recommendations (full chapter)",
  },
] as const;

export type WritingChapterId = (typeof WRITING_CHAPTERS)[number]["id"];

export function isWritingChapter(target: string): target is WritingChapterId {
  return WRITING_CHAPTERS.some((c) => c.id === target);
}

export function getWritingTargetLabel(target: string): string {
  const chapter = WRITING_CHAPTERS.find((c) => c.id === target);
  if (chapter) return chapter.label;
  return target;
}

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
