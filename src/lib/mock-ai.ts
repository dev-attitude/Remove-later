/** Demo fallbacks — used when GM_APP_MODE=demo or services are not configured */

export function generateMockResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("hypothesis")) {
    return `H₁: There is a significant positive relationship between [independent variable] and [dependent variable] among the study population.\n\nH₀: There is no significant relationship between [independent variable] and [dependent variable].\n\nOperational definitions should align with your methodology (quantitative survey or experimental design).`;
  }

  if (p.includes("literature") || p.includes("review")) {
    return `## Thematic synthesis\n\n**Theme 1 — Theoretical foundations:** Prior studies (e.g., Smith, 2021; Okafor, 2023) establish that…\n\n**Theme 2 — Methodological trends:** Mixed-methods designs increased 34% in the last decade.\n\n**Research gap:** Limited work exists on [your context] in developing economies.\n\n*Suggested databases: Semantic Scholar, CrossRef, PubMed.*`;
  }

  if (p.includes("methodology")) {
    return `**Design:** Explanatory sequential mixed methods.\n\n**Population:** N≈350 purposive sample.\n\n**Instruments:** Validated Likert-scale questionnaire (α=0.87), semi-structured interviews.\n\n**Analysis:** SPSS for descriptives & regression; thematic analysis for qualitative phase.\n\n**Ethics:** Informed consent, anonymization, institutional IRB approval.`;
  }

  if (p.includes("statistic") || p.includes("test")) {
    return `Based on your variables (one categorical DV, one continuous IV):\n\n→ **Independent samples t-test** if comparing two group means.\n→ **One-way ANOVA** if comparing 3+ groups.\n→ **Chi-square** if both variables are categorical.\n\nCheck normality (Shapiro-Wilk) and homogeneity of variance before parametric tests.`;
  }

  if (p.includes("first-year") || p.includes("simplify")) {
    return `Think of this paper like a recipe: the **introduction** says what dish you're making and why it matters. The **methods** list ingredients and steps. **Results** show what came out of the oven. **Discussion** explains whether it tasted as expected and what you'd change next time.`;
  }

  if (p.includes("abstract")) {
    return `**Background:** [One sentence context]\n**Objective:** To examine…\n**Methods:** Cross-sectional survey (n=280)…\n**Results:** Significant association (β=0.42, p<.01)…\n**Conclusion:** Findings support… Implications for policy and practice are discussed.`;
  }

  return `## Generated content\n\nBased on your input: "${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}"\n\nThis section follows academic structure: clear topic sentence, evidence from peer-reviewed sources (integrate DOI-backed citations), critical analysis, and a transition to the next subsection.\n\n**Next steps:** Refine with "Improve academic tone" or attach PDFs for RAG-grounded paragraphs.`;
}

/** @deprecated Use generateText from @/lib/client/api */
export async function simulateAI(
  prompt: string,
  options?: { delayMs?: number }
): Promise<string> {
  const delay = options?.delayMs ?? 1200 + Math.random() * 800;
  await new Promise((r) => setTimeout(r, delay));
  return generateMockResponse(prompt);
}

export function mockPlagiarismScore(): {
  similarity: number;
  matches: { text: string; source: string; percent: number }[];
} {
  return {
    similarity: 12,
    matches: [
      {
        text: "Research methodology encompasses the systematic approach",
        source: "journal.example.org/article/8842",
        percent: 8,
      },
      {
        text: "validity and reliability of instruments",
        source: "thesis.university.edu/2022/445",
        percent: 4,
      },
    ],
  };
}

export function mockAIDetection(text: string): {
  overallAI: number;
  sentences: { text: string; aiProbability: number }[];
  integrityScore: number;
} {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10)
    .slice(0, 8)
    .map((s, i) => ({
      text: s.trim(),
      aiProbability: Math.min(95, 15 + i * 12 + (s.length % 20)),
    }));

  const overallAI =
    sentences.length > 0
      ? Math.round(
          sentences.reduce((a, b) => a + b.aiProbability, 0) / sentences.length
        )
      : 42;

  return {
    overallAI,
    sentences,
    integrityScore: Math.max(0, 100 - overallAI),
  };
}

export function mockLiteratureSearch(query: string) {
  return [
    {
      title: `Advances in ${query}: A systematic review`,
      authors: "Chen, L. et al.",
      year: 2024,
      source: "Semantic Scholar (demo)",
      citations: 89,
      gap: "Limited Global South samples",
    },
    {
      title: `${query} and policy implications`,
      authors: "Mbeki, T.; Njoroge, P.",
      year: 2023,
      source: "CrossRef / PubMed (demo)",
      citations: 156,
      gap: "Longitudinal data needed",
    },
    {
      title: `Conceptual framework for ${query}`,
      authors: "Williams, R.",
      year: 2022,
      source: "Google Scholar (demo)",
      citations: 234,
      gap: "Theoretical integration weak",
    },
  ];
}

export function mockStatsSummary() {
  return {
    n: 280,
    missing: 12,
    suggestedTest: "Multiple linear regression",
    descriptives: { mean: 3.72, sd: 0.84, skew: -0.21 },
    interpretation:
      "R²=0.41 indicates moderate explanatory power. Predictor X significantly predicts Y (β=0.38, p<.001).",
  };
}
