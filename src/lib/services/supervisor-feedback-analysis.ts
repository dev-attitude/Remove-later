import { generateAcademicText } from "@/lib/services/ai";
import {
  diffParagraphs,
  formatDiffForPrompt,
  summarizeDiff,
  type DiffChunk,
} from "@/lib/services/text-diff";

export type SupervisorChange = {
  id: string;
  category: string;
  location: string;
  supervisorChange: string;
  intent: string;
  severity: "high" | "medium" | "low";
};

export type SupervisorSolution = {
  changeId: string;
  recommendedAction: string;
  exampleRevision: string;
};

export type SupervisorFeedbackAnalysis = {
  summary: string;
  changeCount: number;
  changes: SupervisorChange[];
  solutions: SupervisorSolution[];
  diffStats: { added: number; removed: number; unchanged: number };
  mode: "demo" | "live";
};

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[…document truncated for analysis…]`;
}

function normalizeSeverity(s: unknown): SupervisorChange["severity"] {
  return s === "high" || s === "low" ? s : "medium";
}

function parseAnalysisJson(raw: string): Omit<SupervisorFeedbackAnalysis, "mode" | "diffStats"> | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(candidate.slice(start, end + 1)) as {
      summary?: string;
      changes?: SupervisorChange[];
      solutions?: SupervisorSolution[];
    };
    const changes: SupervisorChange[] = (parsed.changes ?? []).map((c, i) => ({
      id: c.id || `c${i + 1}`,
      category: c.category || "General",
      location: c.location || "Document",
      supervisorChange: c.supervisorChange || "",
      intent: c.intent || "",
      severity: normalizeSeverity(c.severity),
    }));
    const solutions = (parsed.solutions ?? []).map((s) => ({
      changeId: s.changeId || changes[0]?.id || "c1",
      recommendedAction: s.recommendedAction || "",
      exampleRevision: s.exampleRevision || "",
    }));
    return {
      summary: parsed.summary || "Supervisor feedback analyzed.",
      changeCount: changes.length,
      changes,
      solutions,
    };
  } catch {
    return null;
  }
}

function buildDemoAnalysis(
  diffChunks: DiffChunk[],
  hasStudentDraft: boolean
): SupervisorFeedbackAnalysis {
  const stats = summarizeDiff(diffChunks);
  const changes: SupervisorChange[] = diffChunks
    .filter((c) => c.type !== "unchanged")
    .slice(0, 6)
    .map((c, i) => ({
      id: `c${i + 1}`,
      category: c.type === "added" ? "Addition" : "Deletion",
      location: `Paragraph ${i + 1}`,
      supervisorChange: c.text.slice(0, 280),
      intent:
        c.type === "added"
          ? "Supervisor added or expanded this passage."
          : "Supervisor removed or shortened this passage.",
      severity: "medium" as const,
    }));

  if (changes.length === 0 && !hasStudentDraft) {
    changes.push({
      id: "c1",
      category: "Review",
      location: "Full document",
      supervisorChange: "Supervisor returned an annotated or revised document.",
      intent: "Review comments and edits in the uploaded file.",
      severity: "medium",
    });
  }

  const solutions: SupervisorSolution[] = changes.map((c) => ({
    changeId: c.id,
    recommendedAction: `Address the supervisor's ${c.category.toLowerCase()} feedback at ${c.location}.`,
    exampleRevision:
      "Revise the passage to align with the supervisor's intent, then re-upload for your records.",
  }));

  return {
    summary: hasStudentDraft
      ? `Detected ${stats.added} added and ${stats.removed} removed paragraph(s) between your draft and the supervisor's version.`
      : "Supervisor document uploaded. Connect OpenAI in production for a full AI breakdown of comments and edits.",
    changeCount: changes.length,
    changes,
    solutions,
    diffStats: stats,
    mode: "demo",
  };
}

export async function analyzeSupervisorFeedback(input: {
  studentText?: string | null;
  supervisorText: string;
  supervisorName?: string;
  title: string;
}): Promise<SupervisorFeedbackAnalysis> {
  const student = input.studentText?.trim() ?? "";
  const supervisor = input.supervisorText.trim();
  const diffChunks = student ? diffParagraphs(student, supervisor) : [];
  const diffStats = summarizeDiff(diffChunks);
  const diffExcerpt = student ? formatDiffForPrompt(diffChunks) : "";

  const prompt = `You are an academic writing coach helping a postgraduate student respond to supervisor feedback.
The student's institution may NOT use this platform — they uploaded documents manually.

Title: ${input.title}
Supervisor: ${input.supervisorName || "External supervisor"}

${student ? "The student also uploaded their draft BEFORE supervisor edits. Use the DIFF section to list concrete changes." : "Only the supervisor-returned document was uploaded. Infer likely feedback, comments, and revision requests from the text."}

Respond with ONLY valid JSON (no markdown outside the JSON) in this shape:
{
  "summary": "2-4 sentences overview for the student",
  "changes": [
    {
      "id": "c1",
      "category": "Methodology|Structure|Content|Citations|Grammar|Theory|Ethics|Other",
      "location": "Chapter/section or paragraph reference",
      "supervisorChange": "What the supervisor changed or commented",
      "intent": "Why the supervisor likely requested this",
      "severity": "high|medium|low"
    }
  ],
  "solutions": [
    {
      "changeId": "c1",
      "recommendedAction": "Clear step-by-step fix",
      "exampleRevision": "Short example rewrite in academic English"
    }
  ]
}

Provide 4-10 changes when enough material exists. Every change needs at least one matching solution with the same changeId.

DIFF (supervisor edits vs student draft):
${diffExcerpt || "(no student draft — analyze supervisor document only)"}

SUPERVISOR DOCUMENT (excerpt):
${truncate(supervisor, 12_000)}

${student ? `STUDENT DRAFT BEFORE FEEDBACK (excerpt):\n${truncate(student, 8_000)}` : ""}`;

  const { content, mode } = await generateAcademicText(prompt, { maxTokens: 2200 });
  const parsed = parseAnalysisJson(content);

  if (!parsed) {
    const demo = buildDemoAnalysis(diffChunks, Boolean(student));
    return { ...demo, mode };
  }

  return {
    ...parsed,
    changeCount: parsed.changes.length,
    diffStats,
    mode,
  };
}
