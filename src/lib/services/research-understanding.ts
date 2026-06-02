import { generateAcademicText } from "@/lib/services/ai";
import { RESEARCH_LEVELS } from "@/lib/research-levels";

export const UNDERSTANDING_ACTIONS = [
  { id: "study-guide", label: "Academic study guide" },
  { id: "key-concepts", label: "Key concepts & definitions" },
  { id: "methodology", label: "Methodology explained" },
  { id: "statistics", label: "Statistics simplified" },
  { id: "critical-review", label: "Critical review (strengths & gaps)" },
  { id: "exam-prep", label: "Exam preparation notes" },
  { id: "quiz", label: "Practice quiz with answers" },
  { id: "flashcards", label: "Flashcards" },
  { id: "first-year", label: "Explain like first-year student" },
  { id: "thesis-link", label: "Link to my research / thesis" },
] as const;

export type UnderstandingActionId = (typeof UNDERSTANDING_ACTIONS)[number]["id"];

export type UnderstandingTopic = {
  module: string;
  title: string;
  items: string[];
};

export const UNDERSTANDING_RESEARCH_TOPICS: UnderstandingTopic[] = [
  {
    module: "MODULE 1: INTRODUCTION TO RESEARCH",
    title: "Introduction to Research",
    items: [
      "What is Research?",
      "Purpose of Research",
      "Characteristics of Research",
      "Importance of Research",
      "Types of Research",
      "Basic Research",
      "Applied Research",
      "Quantitative Research",
      "Qualitative Research",
      "Mixed Methods Research",
      "Action Research",
      "Experimental Research",
      "Descriptive Research",
      "Exploratory Research",
      "Correlational Research",
    ],
  },
  {
    module: "MODULE 2: IDENTIFYING A RESEARCH PROBLEM",
    title: "Identifying a Research Problem",
    items: [
      "Understanding Research Problems",
      "Sources of Research Problems",
      "Selecting a Research Topic",
      "Narrowing a Research Topic",
      "Research Gap Identification",
      "Problem Statement Development",
    ],
  },
  {
    module: "MODULE 3: RESEARCH TITLE DEVELOPMENT",
    title: "Research Title Development",
    items: [
      "Characteristics of a Good Research Title",
      "Formulating Research Titles",
      "Common Mistakes in Research Titles",
    ],
  },
  {
    module: "MODULE 4: RESEARCH OBJECTIVES AND QUESTIONS",
    title: "Research Objectives and Questions",
    items: [
      "Research Aim",
      "General Objectives",
      "Specific Objectives",
      "Research Questions",
      "Research Hypotheses",
      "Null Hypothesis",
      "Alternative Hypothesis",
    ],
  },
  {
    module: "MODULE 5: LITERATURE REVIEW",
    title: "Literature Review",
    items: [
      "What is a Literature Review?",
      "Importance of Literature Review",
      "Searching Academic Sources",
      "Reading Academic Articles",
      "Evaluating Sources",
      "Synthesizing Literature",
      "Identifying Research Gaps",
      "Writing Literature Reviews",
    ],
  },
  {
    module: "MODULE 6: THEORETICAL FRAMEWORK",
    title: "Theoretical Framework",
    items: [
      "Understanding Theory",
      "Role of Theory in Research",
      "Selecting Appropriate Theories",
      "Applying Theory in Research",
    ],
  },
  {
    module: "MODULE 7: CONCEPTUAL FRAMEWORK",
    title: "Conceptual Framework",
    items: [
      "Conceptual Framework Development",
      "Independent Variables",
      "Dependent Variables",
      "Moderating Variables",
      "Mediating Variables",
      "Diagram Construction",
    ],
  },
  {
    module: "MODULE 8: RESEARCH PARADIGMS",
    title: "Research Paradigms",
    items: ["Positivism", "Interpretivism", "Pragmatism", "Constructivism", "Critical Theory"],
  },
  {
    module: "MODULE 9: RESEARCH METHODOLOGY",
    title: "Research Methodology",
    items: [
      "What is Research Methodology?",
      "Research Approaches",
      "Quantitative Approach",
      "Qualitative Approach",
      "Mixed Methods Approach",
      "Research Designs",
      "Cross-Sectional Design",
      "Case Study Design",
      "Experimental Design",
      "Cohort Design",
      "Descriptive Design",
      "Exploratory Design",
    ],
  },
  {
    module: "MODULE 10: POPULATION AND SAMPLING",
    title: "Population and Sampling",
    items: [
      "Target Population",
      "Accessible Population",
      "Sampling Concepts",
      "Sample Size Determination",
      "Probability Sampling",
      "Simple Random Sampling",
      "Stratified Sampling",
      "Cluster Sampling",
      "Systematic Sampling",
      "Non-Probability Sampling",
      "Purposive Sampling",
      "Convenience Sampling",
      "Snowball Sampling",
      "Quota Sampling",
    ],
  },
  {
    module: "MODULE 11: DATA COLLECTION METHODS",
    title: "Data Collection Methods",
    items: [
      "Questionnaires",
      "Interviews",
      "Focus Group Discussions",
      "Observation",
      "Document Review",
      "Surveys",
      "Experiments",
    ],
  },
  {
    module: "MODULE 12: RESEARCH INSTRUMENTS",
    title: "Research Instruments",
    items: [
      "Questionnaire Design",
      "Interview Guide Development",
      "Observation Checklists",
      "Measurement Scales",
      "Nominal Scale",
      "Ordinal Scale",
      "Interval Scale",
      "Ratio Scale",
    ],
  },
  {
    module: "MODULE 13: VALIDITY AND RELIABILITY",
    title: "Validity and Reliability",
    items: [
      "Validity",
      "Content Validity",
      "Construct Validity",
      "Face Validity",
      "Criterion Validity",
      "Reliability",
      "Test-Retest Reliability",
      "Internal Consistency",
      "Cronbach's Alpha",
    ],
  },
  {
    module: "MODULE 14: DATA MANAGEMENT",
    title: "Data Management",
    items: ["Data Coding", "Data Entry", "Data Cleaning", "Data Storage", "Data Security"],
  },
  {
    module: "MODULE 15: QUANTITATIVE DATA ANALYSIS",
    title: "Quantitative Data Analysis",
    items: [
      "Descriptive Statistics",
      "Frequencies",
      "Percentages",
      "Mean",
      "Median",
      "Mode",
      "Standard Deviation",
      "Inferential Statistics",
      "T-Test",
      "Chi-Square Test",
      "Correlation Analysis",
      "Regression Analysis",
      "ANOVA",
      "Logistic Regression",
      "Statistical Software",
      "SPSS",
      "JASP",
      "Jamovi",
      "R",
      "Stata",
    ],
  },
  {
    module: "MODULE 16: QUALITATIVE DATA ANALYSIS",
    title: "Qualitative Data Analysis",
    items: [
      "Thematic Analysis",
      "Content Analysis",
      "Narrative Analysis",
      "Grounded Theory Analysis",
      "Coding Qualitative Data",
      "Theme Development",
      "Use of NVivo",
      "Use of ATLAS.ti",
    ],
  },
  {
    module: "MODULE 17: RESEARCH ETHICS",
    title: "Research Ethics",
    items: [
      "Research Ethics Principles",
      "Informed Consent",
      "Confidentiality",
      "Anonymity",
      "Beneficence",
      "Non-Maleficence",
      "Voluntary Participation",
      "Ethical Approval",
      "Research Misconduct",
      "Fabrication",
      "Falsification",
      "Plagiarism",
    ],
  },
  {
    module: "MODULE 18: ACADEMIC WRITING",
    title: "Academic Writing",
    items: [
      "Academic Writing Skills",
      "Scientific Writing",
      "Research Proposal Writing",
      "Thesis Writing",
      "Dissertation Writing",
      "Journal Article Writing",
      "Conference Paper Writing",
    ],
  },
  {
    module: "MODULE 19: REFERENCING AND CITATION",
    title: "Referencing and Citation",
    items: [
      "Why Referencing Matters",
      "APA 7th Edition",
      "Harvard Referencing",
      "Vancouver Referencing",
      "MLA Referencing",
      "Chicago Referencing",
      "In-Text Citations",
      "Reference Lists",
      "Reference Management Software",
      "Zotero",
      "Mendeley",
      "EndNote",
    ],
  },
  {
    module: "MODULE 20: PLAGIARISM AND ACADEMIC INTEGRITY",
    title: "Plagiarism and Academic Integrity",
    items: [
      "Understanding Plagiarism",
      "Types of Plagiarism",
      "Self-Plagiarism",
      "Paraphrasing Techniques",
      "Similarity Reports",
      "Academic Integrity",
    ],
  },
  {
    module: "MODULE 21: RESEARCH PROPOSAL WRITING",
    title: "Research Proposal Writing",
    items: [
      "Proposal Structure",
      "Introduction Chapter",
      "Literature Review Chapter",
      "Methodology Chapter",
      "References",
      "Appendices",
    ],
  },
  {
    module: "MODULE 22: THESIS AND DISSERTATION WRITING",
    title: "Thesis and Dissertation Writing",
    items: [
      "Chapter 1: Introduction",
      "Chapter 2: Literature Review",
      "Chapter 3: Methodology",
      "Chapter 4: Results",
      "Chapter 5: Discussion, Conclusions and Recommendations",
    ],
  },
  {
    module: "MODULE 23: RESEARCH PUBLICATION",
    title: "Research Publication",
    items: [
      "Journal Selection",
      "Manuscript Preparation",
      "Peer Review Process",
      "Open Access Publishing",
      "Predatory Journals",
      "Publication Ethics",
    ],
  },
  {
    module: "MODULE 24: RESEARCH PROJECT MANAGEMENT",
    title: "Research Project Management",
    items: [
      "Research Planning",
      "Time Management",
      "Budgeting",
      "Risk Management",
      "Research Monitoring and Evaluation",
    ],
  },
  {
    module: "MODULE 25: ADVANCED RESEARCH SKILLS",
    title: "Advanced Research Skills",
    items: [
      "Systematic Reviews",
      "Scoping Reviews",
      "Meta-Analysis",
      "Bibliometric Analysis",
      "Evidence-Based Practice",
      "Artificial Intelligence in Research",
      "Research Grant Writing",
      "Research Commercialization",
    ],
  },
];

export function getUnderstandingTopicOptions(): Array<{ module: string; label: string }> {
  const options: Array<{ module: string; label: string }> = [];
  for (const m of UNDERSTANDING_RESEARCH_TOPICS) {
    for (const item of m.items) options.push({ module: m.module, label: item });
  }
  return options;
}

export type UnderstandingInput = {
  mode: "topic" | "document";
  action: UnderstandingActionId;
  researchLevel: string;
  field?: string;
  topic?: string;
  documentText?: string;
  fileName?: string;
};

const MAX_DOC_CHARS = 14_000;

function levelGuidance(researchLevel: string): string {
  const level = RESEARCH_LEVELS.find((l) => l.id === researchLevel);
  return level?.writingGuidance ?? RESEARCH_LEVELS[0].writingGuidance;
}

function levelLabel(researchLevel: string): string {
  return RESEARCH_LEVELS.find((l) => l.id === researchLevel)?.label ?? "Bachelor's";
}

function actionInstructions(action: UnderstandingActionId, mode: "topic" | "document"): string {
  const doc = mode === "document";
  const map: Record<UnderstandingActionId, string> = {
    "study-guide": doc
      ? "Produce a structured academic report on the uploaded article: title (inferred), authors if visible, purpose, methods, findings, implications, and 5 takeaway points for a student."
      : "Create a comprehensive academic study guide on this topic: core ideas, how scholars approach it, essential terminology, and what a student should master for coursework or exams.",
    "key-concepts": doc
      ? "List and define the most important concepts, theories, and variables in this article. Explain how they relate to each other."
      : "Define the key concepts, theories, and debates in this field. Use academically accurate but student-friendly language.",
    methodology: doc
      ? "Explain the research design, sampling, data collection, and analysis used in this article. Note limitations and what type of evidence it provides."
      : "Describe typical research methodologies used to study this topic (designs, samples, instruments). Suggest what a student at this level could realistically use.",
    statistics: doc
      ? "Explain any statistical or quantitative results in plain language. Define tests, effect sizes, or tables mentioned and what they mean for conclusions."
      : "Explain common statistical approaches used in this area and how to interpret typical results (without fabricating data from a specific paper).",
    "critical-review": doc
      ? "Write a critical academic review: strengths, weaknesses, gaps, bias risks, and how this article fits the wider literature."
      : "Discuss major debates, limitations in current knowledge, and open questions students should be aware of when researching this topic.",
    "exam-prep": doc
      ? "Create exam-focused revision notes from this article: likely questions, model answer outlines, and memory hooks."
      : "Create exam-focused revision material: likely questions, bullet-point answers, and priority topics to revise.",
    quiz: doc
      ? "Generate 10 exam-style questions with detailed model answers based only on the uploaded article."
      : "Generate 10 exam-style questions with model answers to test understanding of this topic at the specified level.",
    flashcards: doc
      ? "Create 15 flashcards (term → definition/explanation) drawn from the article content."
      : "Create 15 flashcards (term → definition) for essential vocabulary and ideas in this topic.",
    "first-year": doc
      ? "Explain the article's main message in simple language suitable for a first-year university student. Avoid jargon or define it clearly."
      : "Explain this topic in simple language suitable for a first-year student. Use examples and short paragraphs.",
    "thesis-link": doc
      ? "Explain how a student could use this article in a thesis or dissertation: where it fits (lit review, methods, discussion), citation angles, and cautions."
      : "Suggest how a student at this level could turn this topic into a feasible research project: narrow questions, methods, and ethical considerations.",
  };
  return map[action];
}

function buildTopicPrompt(input: UnderstandingInput): string {
  const topic = input.topic?.trim() || "Research methods fundamentals (overview)";
  const field = input.field?.trim() ? `Field/discipline: ${input.field.trim()}\n` : "";
  return `${field}Research level: ${levelLabel(input.researchLevel)}
Topic or subject: ${topic}

${levelGuidance(input.researchLevel)}

Task: ${actionInstructions(input.action, "topic")}

Format with clear markdown headings (##). Be practical for students — accurate, structured, and usable for assignments or exams. Do not invent specific paper titles or DOIs.`;
}

function buildDocumentPrompt(input: UnderstandingInput): string {
  const text = (input.documentText || "").trim().slice(0, MAX_DOC_CHARS);
  const name = input.fileName?.trim() || "Uploaded article";
  const field = input.field?.trim() ? `Student field: ${input.field.trim()}\n` : "";
  const topicHint = input.topic?.trim()
    ? `Student research focus: ${input.topic.trim()}\n`
    : "";

  return `${field}${topicHint}Research level: ${levelLabel(input.researchLevel)}
Document: ${name}

${levelGuidance(input.researchLevel)}

Task: ${actionInstructions(input.action, "document")}

Base your analysis ONLY on the document text below. If something is missing, say so instead of inventing content.

--- DOCUMENT TEXT ---
${text}
--- END ---

Format as a clear academic report with markdown headings (##). Include a short "Report summary" at the top (3–5 bullets).`;
}

export async function runResearchUnderstanding(input: UnderstandingInput) {
  if (input.mode === "document") {
    if (!input.documentText?.trim()) {
      throw new Error("No document text to analyze. Upload a file or paste the article text.");
    }
    if (input.documentText.trim().length < 80) {
      throw new Error("Document text is too short. Add more content or upload a fuller article.");
    }
  }

  const prompt =
    input.mode === "document" ? buildDocumentPrompt(input) : buildTopicPrompt(input);

  const maxTokens =
    input.action === "quiz" || input.action === "flashcards" ? 2500 : 2200;

  const result = await generateAcademicText(prompt, { maxTokens });

  return {
    content: result.content,
    mode: result.mode,
    modeLabel: input.mode === "document" ? "Article analysis" : "Topic study",
    actionLabel:
      UNDERSTANDING_ACTIONS.find((a) => a.id === input.action)?.label ?? input.action,
    sourceLabel:
      input.mode === "document"
        ? input.fileName || "Pasted text"
        : input.topic?.trim() || "Topic",
  };
}
