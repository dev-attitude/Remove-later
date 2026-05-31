/** Disciplines for Level 3 and curriculum generator */
export const RESEARCH_DISCIPLINES = [
  { id: "health-sciences", label: "Health Sciences (general)" },
  { id: "nursing", label: "Nursing" },
  { id: "medicine", label: "Medicine" },
  { id: "public-health", label: "Public Health" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "business", label: "Business (general)" },
  { id: "marketing", label: "Marketing" },
  { id: "finance", label: "Finance" },
  { id: "human-resources", label: "Human Resources" },
  { id: "entrepreneurship", label: "Entrepreneurship" },
  { id: "education", label: "Education (general)" },
  { id: "curriculum-studies", label: "Curriculum Studies" },
  { id: "classroom-research", label: "Classroom Research" },
  { id: "information-technology", label: "Information Technology" },
  { id: "software-engineering", label: "Software Engineering" },
  { id: "ai-research", label: "Artificial Intelligence" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "information-systems", label: "Information Systems" },
  { id: "law", label: "Law" },
  { id: "agriculture", label: "Agriculture" },
  { id: "environmental", label: "Environmental Science" },
  { id: "engineering", label: "Engineering" },
  { id: "sociology", label: "Sociology" },
  { id: "psychology", label: "Psychology" },
  { id: "political-science", label: "Political Science" },
  { id: "economics", label: "Economics" },
] as const;

export type DisciplineId = (typeof RESEARCH_DISCIPLINES)[number]["id"];

export function getDisciplineLabel(id: string): string {
  return RESEARCH_DISCIPLINES.find((d) => d.id === id)?.label ?? id;
}

export function isDisciplineId(id: string): id is DisciplineId {
  return RESEARCH_DISCIPLINES.some((d) => d.id === id);
}
