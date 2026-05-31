export const RESEARCH_LEVELS = [
  {
    id: "bachelors",
    label: "Bachelor's",
    short: "Demonstrate methodology, writing, and basic analysis",
    complexity: "Basic",
    originality: "Usually not required — applies existing knowledge",
    literatureReview: "Limited",
    gapIdentification: "Limited",
    examples: [
      "Factors affecting academic performance among nursing students",
      "Knowledge and attitudes towards HIV prevention",
    ],
    topicGuidance: `BACHELOR'S LEVEL expectations:
- Topics must be narrow, feasible with small samples, and completable within one academic year
- Focus on describing, comparing, or assessing (factors, knowledge, attitudes, prevalence)
- Avoid claims of new theory, novel frameworks, or publication-grade originality
- Use basic to moderate methodology only; supervisor guidance assumed high
- Research questions should be descriptive or simple relational (not multi-layered theoretical models)
- Literature review scope: limited — cite key studies, do not require exhaustive synthesis`,
  },
  {
    id: "postgraduate-diploma",
    label: "Postgraduate Diploma",
    short: "Applied, professional practice and program evaluation",
    complexity: "Intermediate",
    originality: "Limited — usually no new theories",
    literatureReview: "Moderate",
    gapIdentification: "Moderate",
    examples: [
      "Evaluation of electronic patient record implementation in a hospital",
      "Assessment of staff compliance with infection control measures",
    ],
    topicGuidance: `POSTGRADUATE DIPLOMA expectations:
- Topics should solve workplace problems, evaluate programs, support policy, or improve professional practice
- More critical than Bachelor's but still applied rather than theory-building
- Moderate analysis; evaluative and implementation-focused titles are appropriate
- Do not require novel knowledge creation or journal publication potential
- Emphasize practical recommendations for institutions or practitioners`,
  },
  {
    id: "masters",
    label: "Master's",
    short: "Independent research with gaps, strong methods, and critical discussion",
    complexity: "Advanced",
    originality: "Expected — contribute new insights",
    literatureReview: "Extensive",
    gapIdentification: "Strong",
    examples: [
      "Factors influencing mental health outcomes among psychiatric nurses in Namibia",
      "Predictors of treatment adherence among HIV patients",
    ],
    topicGuidance: `MASTER'S LEVEL expectations:
- Topics must support extensive literature review and clear research gap identification
- Require strong, justified methodology and advanced data analysis appropriate to the method
- Research questions should enable critical evaluation of prior studies and justification of design choices
- Findings should offer new insights to the field (not merely replicate Bachelor's descriptive work)
- Critical discussion and methodological rigour are essential; independence moderate`,
  },
  {
    id: "phd",
    label: "PhD (Doctorate)",
    short: "Original contribution and new knowledge for the discipline",
    complexity: "Very advanced",
    originality: "Required — novel knowledge creation",
    literatureReview: "Comprehensive",
    gapIdentification: "Essential",
    examples: [
      "Development of a new theoretical model for psychiatric nursing interventions in resource-limited settings",
      "Creation and validation of a new framework for mental health service delivery in Namibia",
    ],
    topicGuidance: `PhD LEVEL expectations:
- Topics MUST promise a clear, defensible original contribution to the discipline (new knowledge)
- Require comprehensive literature review, advanced theoretical framework, and sophisticated methodology
- At least one topic should be ambitious enough for potential journal publication
- Examiners will ask: "What new knowledge has this research added?" — topics must answer that
- Avoid descriptive or replication-only studies; favour model development, framework creation, validation studies, or novel theoretical integration
- Student is more independent; topics should be substantial multi-year programmes`,
  },
] as const;

export type ResearchLevelId = (typeof RESEARCH_LEVELS)[number]["id"];

export function getResearchLevel(id: string) {
  return RESEARCH_LEVELS.find((l) => l.id === id);
}

export function isResearchLevelId(id: string): id is ResearchLevelId {
  return RESEARCH_LEVELS.some((l) => l.id === id);
}

export function getResearchLevelPromptBlock(levelId: ResearchLevelId): string {
  const level = getResearchLevel(levelId);
  if (!level) return "";
  return level.topicGuidance;
}
