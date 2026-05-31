export const RESEARCH_METHODS = [
  "Quantitative — Survey",
  "Quantitative — Experimental / Quasi-experimental",
  "Qualitative — Case study",
  "Qualitative — Phenomenology",
  "Qualitative — Ethnography",
  "Mixed methods — Sequential",
  "Mixed methods — Concurrent",
  "Action research",
  "Systematic literature review",
  "Grounded theory",
] as const;

export type ResearchMethod = (typeof RESEARCH_METHODS)[number];
