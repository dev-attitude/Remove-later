/** Maps Research Suite modules ↔ integrations & AI capabilities */

export type ResearchToolDef = {
  moduleId: string;
  title: string;
  short: string;
  /** Integration registry IDs (see src/lib/integrations/registry.ts) */
  integrationIds: string[];
  /** Human-readable capability labels shown in UI */
  capabilities: string[];
};

/** Primary student research & assignment tools (user-requested) */
export const RESEARCH_SUITE_PRIMARY_TOOLS: ResearchToolDef[] = [
  {
    moduleId: "research-topics",
    title: "Research Topic Generator",
    short: "3 tailored topics + similar papers from your context",
    integrationIds: ["openai", "openalex", "semantic-scholar", "crossref"],
    capabilities: ["Topic generation", "Literature gap hints", "Method alignment"],
  },
  {
    moduleId: "research-library",
    title: "Research Knowledge Library",
    short: "7-level curriculum, sources & AI learning roadmap",
    integrationIds: ["openalex", "core", "semantic-scholar", "zotero"],
    capabilities: ["Curriculum builder", "Open resources", "Module study paths"],
  },
  {
    moduleId: "writing",
    title: "AI Research Writing",
    short: "Full chapters, sections, rewrite & humanize",
    integrationIds: ["openai", "grok", "openalex", "semantic-scholar", "crossref"],
    capabilities: [
      "AI Humanizer",
      "Literature review generator",
      "Methodology advisor",
      "Citation-aware writing",
    ],
  },
  {
    moduleId: "understanding",
    title: "Research Understanding",
    short: "25-module curriculum with papers & database links",
    integrationIds: ["openai", "core", "semantic-scholar"],
    capabilities: ["Document Q&A", "Simplify text", "Key concept extraction"],
  },
  {
    moduleId: "literature",
    title: "Literature Review",
    short: "Multi-database search, themes & gaps",
    integrationIds: ["openalex", "semantic-scholar", "pubmed", "arxiv", "core", "crossref"],
    capabilities: ["Literature review generator", "Thematic synthesis", "Gap analysis"],
  },
  {
    moduleId: "ai-detection",
    title: "AI Detection",
    short: "Sentence-level AI scores + humanize flagged text",
    integrationIds: ["openai", "grok", "gemini", "gptzero"],
    capabilities: ["AI Humanizer", "Integrity score", "Multi-engine scan"],
  },
  {
    moduleId: "plagiarism",
    title: "Plagiarism Checker",
    short: "Similarity reports & source matching",
    integrationIds: ["openai", "semantic-scholar", "turnitin"],
    capabilities: ["Similarity scan", "Citation mismatch", "Turnitin-ready workflow"],
  },
  {
    moduleId: "citations",
    title: "Citation & Referencing",
    short: "DOI lookup, styles & reference verification",
    integrationIds: ["crossref", "openalex", "zotero"],
    capabilities: ["Reference checker", "APA / Harvard / MLA", "Zotero export guidance"],
  },
  {
    moduleId: "proposals",
    title: "Proposal Generator",
    short: "Full research proposals by discipline",
    integrationIds: ["openai", "openalex", "crossref"],
    capabilities: ["Research proposal generator", "Budget & timeline sections"],
  },
  {
    moduleId: "tutor",
    title: "AI Research Tutor",
    short: "Stats help, chapters, viva prep & methodology Q&A",
    integrationIds: ["openai", "grok"],
    capabilities: ["Research supervisor chatbot", "Methodology advisor", "Statistical guidance"],
  },
];

/** Extended tools linked to the same platform stack */
export const RESEARCH_SUITE_EXTENDED_TOOLS: ResearchToolDef[] = [
  {
    moduleId: "data-analysis",
    title: "Data Analysis",
    short: "Quant & qual stats, charts, findings chapter",
    integrationIds: ["openai", "spss", "jasp"],
    capabilities: ["Statistical analysis assistant", "SPSS / JASP export guidance"],
  },
  {
    moduleId: "journal",
    title: "AI Journal Assistant",
    short: "Journal matching & reviewer response drafts",
    integrationIds: ["openai", "openalex", "crossref"],
    capabilities: ["Journal recommendation engine", "Cover letter drafts"],
  },
  {
    moduleId: "collaboration",
    title: "Supervisor & Collaboration",
    short: "Chat, versions, approvals with your supervisor",
    integrationIds: ["openai"],
    capabilities: ["Research supervisor chatbot", "Feedback threads"],
  },
  {
    moduleId: "presentations",
    title: "Presentation Generator",
    short: "Slides, posters & defense abstracts",
    integrationIds: ["openai"],
    capabilities: ["Slide outlines", "Poster text"],
  },
  {
    moduleId: "surveys",
    title: "Survey & Data Collection",
    short: "Questionnaires & bias checks",
    integrationIds: ["openai"],
    capabilities: ["Instrument design", "Pilot testing tips"],
  },
  {
    moduleId: "transcription",
    title: "Audio & Transcription",
    short: "Interview transcription & themes",
    integrationIds: ["openai"],
    capabilities: ["Speech-to-text", "Qualitative coding hints"],
  },
];

/** Backend systems & APIs powering the suite */
export const RESEARCH_SUITE_SYSTEMS = [
  {
    id: "openai",
    label: "OpenAI API",
    detail: "Writing, analysis, tutoring, proposals (gpt-4o-mini default)",
  },
  {
    id: "grok",
    label: "Grok-2-latest (xAI)",
    detail: "Alternative LLM for writing, detection & Q&A",
  },
  {
    id: "openalex",
    label: "OpenAlex API",
    detail: "Research paper database — 250M+ works",
  },
  {
    id: "crossref",
    label: "Crossref API",
    detail: "DOI & citation verification",
  },
  {
    id: "core",
    label: "CORE API",
    detail: "Open-access papers worldwide",
  },
  {
    id: "semantic-scholar",
    label: "Semantic Scholar",
    detail: "Citations & related research",
  },
  {
    id: "zotero",
    label: "Zotero",
    detail: "Reference management workflow",
  },
  {
    id: "turnitin",
    label: "Turnitin",
    detail: "Institutional plagiarism checking (integrate via your account)",
  },
  {
    id: "spss",
    label: "SPSS / JASP",
    detail: "Export-ready tables & analysis guidance",
  },
  {
    id: "gptzero",
    label: "GPTZero",
    detail: "Dedicated AI detection API",
  },
] as const;

export function getToolByModuleId(moduleId: string): ResearchToolDef | undefined {
  return (
    RESEARCH_SUITE_PRIMARY_TOOLS.find((t) => t.moduleId === moduleId) ||
    RESEARCH_SUITE_EXTENDED_TOOLS.find((t) => t.moduleId === moduleId)
  );
}

export function getAllResearchTools(): ResearchToolDef[] {
  return [...RESEARCH_SUITE_PRIMARY_TOOLS, ...RESEARCH_SUITE_EXTENDED_TOOLS];
}
