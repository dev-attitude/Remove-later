import type { AIRiskLevel, AISentenceResult } from "@/lib/services/ai-detection";

export type HighlightSegment = {
  text: string;
  risk?: AIRiskLevel;
};

export function buildHighlightSegments(
  fullText: string,
  sentences: AISentenceResult[]
): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let pos = 0;

  for (const s of sentences) {
    const idx = fullText.indexOf(s.text, pos);
    if (idx === -1) continue;
    if (idx > pos) {
      segments.push({ text: fullText.slice(pos, idx) });
    }
    segments.push({ text: s.text, risk: s.risk });
    pos = idx + s.text.length;
  }

  if (pos < fullText.length) {
    segments.push({ text: fullText.slice(pos) });
  }

  if (segments.length === 0 && fullText) {
    return [{ text: fullText }];
  }

  return segments;
}

export function riskHighlightClass(risk?: AIRiskLevel): string {
  switch (risk) {
    case "high":
      return "bg-red-200 text-red-950 decoration-red-400";
    case "moderate":
      return "bg-orange-200 text-orange-950 decoration-orange-400";
    default:
      return "";
  }
}
