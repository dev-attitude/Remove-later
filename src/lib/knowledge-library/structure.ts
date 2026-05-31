import type { DisciplineId } from "./disciplines";

export type LibraryTopic = {
  id: string;
  title: string;
  description?: string;
  /** GM module path segment, e.g. "writing" */
  moduleLink?: string;
  searchQuery?: string;
};

export type LibrarySection = {
  id: string;
  title: string;
  topics: LibraryTopic[];
};

export type LibraryLevel = {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  sections: LibrarySection[];
};

export const KNOWLEDGE_LIBRARY: LibraryLevel[] = [
  {
    id: "foundations",
    level: 1,
    title: "Research Foundations",
    subtitle: "Every user starts here",
    sections: [
      {
        id: "foundations-core",
        title: "Core topics",
        topics: [
          { id: "what-is-research", title: "What is research?", searchQuery: "introduction to research" },
          { id: "types", title: "Types of research", searchQuery: "types of research quantitative qualitative" },
          { id: "process", title: "Research process", searchQuery: "research process steps" },
          { id: "ethics", title: "Research ethics", searchQuery: "research ethics informed consent" },
          { id: "paradigms", title: "Research paradigms", searchQuery: "positivism constructivism research paradigms" },
          { id: "academic-writing", title: "Academic writing", moduleLink: "writing", searchQuery: "academic writing thesis" },
          { id: "referencing", title: "Referencing", moduleLink: "citations", searchQuery: "APA referencing academic" },
        ],
      },
    ],
  },
  {
    id: "methodology",
    level: 2,
    title: "Research Methodology",
    subtitle: "Core curriculum — quantitative, qualitative, and mixed methods",
    sections: [
      {
        id: "quantitative",
        title: "Quantitative research",
        topics: [
          { id: "surveys", title: "Surveys", moduleLink: "surveys", searchQuery: "survey research methodology" },
          { id: "experimental", title: "Experimental research", searchQuery: "experimental research design" },
          { id: "correlational", title: "Correlational studies", searchQuery: "correlational research" },
          { id: "statistical-analysis", title: "Statistical analysis", moduleLink: "data-analysis", searchQuery: "statistical analysis research" },
        ],
      },
      {
        id: "qualitative",
        title: "Qualitative research",
        topics: [
          { id: "interviews", title: "Interviews", moduleLink: "transcription", searchQuery: "semi-structured interviews qualitative" },
          { id: "focus-groups", title: "Focus groups", searchQuery: "focus group methodology" },
          { id: "ethnography", title: "Ethnography", searchQuery: "ethnographic research" },
          { id: "grounded-theory", title: "Grounded theory", searchQuery: "grounded theory methodology" },
          { id: "phenomenology", title: "Phenomenology", searchQuery: "phenomenological research" },
          { id: "case-studies", title: "Case studies", searchQuery: "case study research design" },
        ],
      },
      {
        id: "mixed-methods",
        title: "Mixed methods",
        topics: [
          { id: "sequential", title: "Sequential designs", searchQuery: "sequential mixed methods" },
          { id: "concurrent", title: "Concurrent designs", searchQuery: "concurrent mixed methods" },
          { id: "integration", title: "Data integration", searchQuery: "mixed methods data integration" },
        ],
      },
    ],
  },
  {
    id: "discipline-specific",
    level: 3,
    title: "Discipline-Specific Research",
    subtitle: "Tailored methods and literature by field",
    sections: [
      {
        id: "health",
        title: "Health sciences",
        topics: [
          { id: "nursing", title: "Nursing research", searchQuery: "nursing research methodology" },
          { id: "medicine", title: "Medicine", searchQuery: "clinical research methods" },
          { id: "public-health", title: "Public health", searchQuery: "public health research" },
          { id: "pharmacy", title: "Pharmacy", searchQuery: "pharmacy research" },
        ],
      },
      {
        id: "business",
        title: "Business",
        topics: [
          { id: "marketing-research", title: "Marketing research", searchQuery: "marketing research methods" },
          { id: "finance-research", title: "Finance research", searchQuery: "finance empirical research" },
          { id: "hr-research", title: "Human resources research", searchQuery: "HR organizational research" },
          { id: "entrepreneurship", title: "Entrepreneurship", searchQuery: "entrepreneurship research" },
        ],
      },
      {
        id: "education",
        title: "Education",
        topics: [
          { id: "educational-research", title: "Educational research", searchQuery: "educational research methods" },
          { id: "curriculum", title: "Curriculum studies", searchQuery: "curriculum research" },
          { id: "classroom", title: "Classroom research", searchQuery: "classroom action research" },
        ],
      },
      {
        id: "it",
        title: "Information technology",
        topics: [
          { id: "se-research", title: "Software engineering research", searchQuery: "software engineering empirical research" },
          { id: "ai-research", title: "AI research", searchQuery: "artificial intelligence research methodology" },
          { id: "cyber", title: "Cybersecurity research", searchQuery: "cybersecurity research" },
          { id: "is-research", title: "Information systems research", searchQuery: "information systems research" },
        ],
      },
      {
        id: "law-ag-eng-social",
        title: "Law, agriculture, engineering & social sciences",
        topics: [
          { id: "legal-methods", title: "Legal research methods", searchQuery: "legal research methodology" },
          { id: "case-analysis", title: "Case analysis", searchQuery: "legal case analysis" },
          { id: "policy-analysis", title: "Policy analysis", searchQuery: "policy analysis research" },
          { id: "agriculture", title: "Agricultural research", searchQuery: "agricultural research methods" },
          { id: "food-security", title: "Food security studies", searchQuery: "food security research" },
          { id: "environmental", title: "Environmental research", searchQuery: "environmental research methodology" },
          { id: "experimental-design", title: "Experimental design (engineering)", searchQuery: "engineering experimental design" },
          { id: "simulation", title: "Simulation studies", searchQuery: "simulation research engineering" },
          { id: "sociology", title: "Sociology", searchQuery: "sociological research methods" },
          { id: "psychology", title: "Psychology", searchQuery: "psychology research methods" },
          { id: "political-science", title: "Political science", searchQuery: "political science research" },
          { id: "economics", title: "Economics", searchQuery: "econometrics research methods" },
        ],
      },
    ],
  },
  {
    id: "statistics-academy",
    level: 4,
    title: "Statistics Academy",
    subtitle: "AI Statistics Tutor — concepts, tests, and interpretation",
    sections: [
      {
        id: "stats-core",
        title: "Statistical topics",
        topics: [
          { id: "descriptive", title: "Descriptive statistics", moduleLink: "data-analysis", searchQuery: "descriptive statistics" },
          { id: "inferential", title: "Inferential statistics", moduleLink: "tutor", searchQuery: "inferential statistics" },
          { id: "correlation", title: "Correlation", searchQuery: "correlation analysis" },
          { id: "regression", title: "Regression", searchQuery: "multiple regression analysis" },
          { id: "anova", title: "ANOVA", searchQuery: "ANOVA analysis" },
          { id: "chi-square", title: "Chi-Square", searchQuery: "chi square test" },
          { id: "logistic", title: "Logistic regression", searchQuery: "logistic regression" },
          { id: "multivariate", title: "Multivariate analysis", searchQuery: "multivariate analysis" },
          { id: "sem", title: "Structural equation modeling", searchQuery: "structural equation modeling SEM" },
        ],
      },
      {
        id: "stats-ai",
        title: "AI features",
        topics: [
          { id: "explain", title: "Explain concepts", moduleLink: "tutor" },
          { id: "solve", title: "Solve examples", moduleLink: "tutor" },
          { id: "analyze-data", title: "Analyze uploaded data", moduleLink: "data-analysis" },
          { id: "interpret", title: "Interpret outputs", moduleLink: "data-analysis" },
          { id: "findings", title: "Generate findings", moduleLink: "writing" },
        ],
      },
    ],
  },
  {
    id: "software-academy",
    level: 5,
    title: "Research Software Academy",
    subtitle: "Statistical, qualitative, and reference tools",
    sections: [
      {
        id: "stat-software",
        title: "Statistical tools",
        topics: [
          { id: "spss", title: "IBM SPSS Statistics", searchQuery: "SPSS tutorial" },
          { id: "r", title: "R Project", searchQuery: "R statistics tutorial" },
          { id: "jasp", title: "JASP", searchQuery: "JASP statistics" },
          { id: "jamovi", title: "Jamovi", searchQuery: "Jamovi statistics" },
        ],
      },
      {
        id: "qual-software",
        title: "Qualitative tools",
        topics: [
          { id: "nvivo", title: "NVivo", searchQuery: "NVivo qualitative analysis" },
          { id: "atlas", title: "ATLAS.ti", searchQuery: "ATLAS.ti coding" },
        ],
      },
      {
        id: "ref-software",
        title: "Reference managers",
        topics: [
          { id: "zotero", title: "Zotero", moduleLink: "citations", searchQuery: "Zotero referencing" },
          { id: "mendeley", title: "Mendeley", searchQuery: "Mendeley reference manager" },
        ],
      },
    ],
  },
  {
    id: "writing-academy",
    level: 6,
    title: "Academic Writing Academy",
    subtitle: "Proposals, theses, journals, and grants",
    sections: [
      {
        id: "proposal-writing",
        title: "Proposal writing",
        topics: [
          { id: "problem-statement", title: "Problem statement", moduleLink: "writing" },
          { id: "objectives", title: "Objectives", moduleLink: "writing" },
          { id: "questions", title: "Research questions", moduleLink: "writing" },
          { id: "methodology-proposal", title: "Methodology", moduleLink: "proposals" },
        ],
      },
      {
        id: "thesis-writing",
        title: "Thesis writing",
        topics: [
          { id: "ch1", title: "Chapter 1 — Introduction", moduleLink: "writing" },
          { id: "ch2", title: "Chapter 2 — Literature review", moduleLink: "literature" },
          { id: "ch3", title: "Chapter 3 — Methodology", moduleLink: "writing" },
          { id: "ch4", title: "Chapter 4 — Results", moduleLink: "writing" },
          { id: "ch5", title: "Chapter 5 — Discussion", moduleLink: "writing" },
        ],
      },
      {
        id: "journal-writing",
        title: "Journal writing",
        topics: [
          { id: "abstract", title: "Abstract", moduleLink: "journal" },
          { id: "intro", title: "Introduction", moduleLink: "journal" },
          { id: "methods", title: "Methods", moduleLink: "journal" },
          { id: "results", title: "Results", moduleLink: "journal" },
          { id: "discussion", title: "Discussion", moduleLink: "journal" },
        ],
      },
      {
        id: "grants",
        title: "Grant proposal writing",
        topics: [
          { id: "funding", title: "Funding applications", moduleLink: "proposals", searchQuery: "research grant proposal" },
          { id: "ngo", title: "NGO proposals", searchQuery: "NGO project proposal research" },
          { id: "research-grants", title: "Research grants", searchQuery: "academic research grant writing" },
        ],
      },
    ],
  },
  {
    id: "phd-academy",
    level: 7,
    title: "PhD & Advanced Research Academy",
    subtitle: "Theory, reviews, meta-analysis, and publication",
    sections: [
      {
        id: "phd-core",
        title: "Advanced topics",
        topics: [
          { id: "theory-building", title: "Theory building", searchQuery: "theory building research" },
          { id: "conceptual-framework", title: "Conceptual frameworks", searchQuery: "conceptual framework thesis" },
          { id: "theoretical-framework", title: "Theoretical frameworks", searchQuery: "theoretical framework research" },
          { id: "contribution", title: "Research contribution", searchQuery: "original contribution PhD research" },
          { id: "systematic-review", title: "Systematic reviews", moduleLink: "literature", searchQuery: "systematic literature review" },
          { id: "scoping-review", title: "Scoping reviews", searchQuery: "scoping review methodology" },
          { id: "meta-analysis", title: "Meta-analysis", searchQuery: "meta-analysis research" },
          { id: "publication", title: "Publication strategies", moduleLink: "journal", searchQuery: "academic publication strategy" },
        ],
      },
    ],
  },
];

export function getLibraryLevel(id: string) {
  return KNOWLEDGE_LIBRARY.find((l) => l.id === id);
}

export function getDisciplineTopics(disciplineId: DisciplineId): LibraryTopic[] {
  const map: Partial<Record<DisciplineId, string>> = {
    nursing: "nursing",
    medicine: "medicine",
    education: "educational-research",
    "curriculum-studies": "curriculum",
    psychology: "psychology",
    economics: "economics",
  };
  const topicId = map[disciplineId];
  if (!topicId) return [];
  for (const level of KNOWLEDGE_LIBRARY) {
    for (const section of level.sections) {
      const t = section.topics.find((x) => x.id === topicId);
      if (t) return [t];
    }
  }
  return [];
}
