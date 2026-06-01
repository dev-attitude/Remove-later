/** Student assistance service areas — shown on the service detail page */

export const STUDENT_ASSISTANCE_AREAS = [
  {
    id: "writing",
    title: "Assignment & academic writing",
    description:
      "Essays, reports, case studies, and module assignments—structured to your rubric, faculty guidelines, and deadline.",
    items: [
      "Undergraduate & postgraduate assignments",
      "Editing, proofreading & formatting",
      "Paraphrasing with academic tone",
      "Cover letters & application documents",
    ],
  },
  {
    id: "research",
    title: "Research projects",
    description:
      "From topic selection through proposal, chapters, and final submission—we support the full research journey.",
    items: [
      "Research proposals & ethics applications",
      "Chapter 1–5 structure & drafting",
      "Literature review & gap identification",
      "Supervisor feedback revisions",
    ],
  },
  {
    id: "data-collection",
    title: "Data collection",
    description:
      "Design instruments and collect reliable data for surveys, interviews, and mixed-methods studies.",
    items: [
      "Survey & questionnaire design",
      "Interview & focus group guides",
      "Online forms (Google Forms, etc.)",
      "Fieldwork planning & data entry support",
    ],
  },
  {
    id: "data-analysis",
    title: "Data analysis",
    description:
      "Turn raw data into clear findings—with tables, charts, and narrative suitable for your results chapter.",
    items: [
      "Descriptive & inferential statistics",
      "SPSS, Excel & related tools",
      "Qualitative coding & themes",
      "Results interpretation & reporting",
    ],
  },
] as const;
