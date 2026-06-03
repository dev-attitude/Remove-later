/**
 * Match curriculum topics to the right sections in uploaded textbook PDF text.
 */

const STOP_WORDS = new Set([
  "what",
  "how",
  "why",
  "when",
  "where",
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "your",
  "about",
  "this",
  "that",
  "are",
  "was",
  "were",
  "can",
  "may",
  "will",
]);

/** Extra phrases for common curriculum labels (Kumar / Kothari style headings) */
const TOPIC_PHRASE_HINTS: Record<string, string[]> = {
  "what is research": ["what is research", "meaning of research", "definition of research"],
  "purpose of research": ["purpose of research", "aims of research", "objectives of research"],
  "characteristics of research": ["characteristics of research", "features of research", "nature of research"],
  "importance of research": ["importance of research", "significance of research"],
  "types of research": [
    "types of research",
    "classification of research",
    "basic research",
    "applied research",
    "quantitative research",
    "qualitative research",
    "mixed methods",
  ],
  "basic research": ["basic research", "fundamental research", "pure research"],
  "applied research": ["applied research", "practical research"],
  "quantitative research": ["quantitative research", "quantitative approach", "quantitative methods"],
  "qualitative research": ["qualitative research", "qualitative approach", "qualitative methods"],
  "mixed methods research": ["mixed methods", "mixed-method", "triangulation"],
  "action research": ["action research", "participatory research"],
  "experimental research": ["experimental research", "experiment", "experimental design"],
  "descriptive research": ["descriptive research", "descriptive study"],
  "exploratory research": ["exploratory research", "exploration"],
  "correlational research": ["correlational", "correlation research"],
  "literature review": ["literature review", "review of literature", "literature survey"],
  "research problem": ["research problem", "problem statement", "identifying a problem"],
  "research design": ["research design", "types of research design"],
  "sampling": ["sampling", "sample size", "sampling techniques"],
  "data collection": ["data collection", "methods of data collection"],
  "ethical": ["research ethics", "ethical issues", "informed consent"],
};

export function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/[\uFFFD\uFFFE\uFFFF▯□■▪•]/g, " ")
    .replace(/\f/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\u00ad/g, "")
    .replace(/-\s*\n\s*/g, "")
    .replace(/([a-z,;])\n([a-z])/gi, "$1 $2")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildTopicSearchPhrases(module: string, topic: string): string[] {
  const cleanTopic = topic.replace(/\?+$/, "").trim().toLowerCase();
  const moduleHint = module.replace(/^MODULE \d+:\s*/i, "").trim().toLowerCase();

  const phrases = new Set<string>([cleanTopic, `${cleanTopic} in research`, moduleHint]);

  const words = cleanTopic.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  for (const w of words) phrases.add(w);
  if (words.length >= 2) {
    phrases.add(words.join(" "));
    for (let i = 0; i < words.length - 1; i++) {
      phrases.add(`${words[i]} ${words[i + 1]}`);
    }
  }

  const hints = TOPIC_PHRASE_HINTS[cleanTopic];
  if (hints) hints.forEach((h) => phrases.add(h));

  for (const [key, values] of Object.entries(TOPIC_PHRASE_HINTS)) {
    if (cleanTopic.includes(key) || key.includes(cleanTopic)) {
      values.forEach((v) => phrases.add(v));
    }
  }

  return [...phrases].filter((p) => p.length >= 3).sort((a, b) => b.length - a.length);
}

export function phraseMatchScore(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;

  for (const phrase of phrases) {
    if (phrase.length < 3) continue;
    if (!lower.includes(phrase)) continue;

    score += phrase.length * 3;

    if (new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i").test(text)) {
      score += phrase.length;
    }

    if (/\d+\.\d+/.test(text) && lower.includes(phrase)) {
      score += 20;
    }
  }

  return score;
}

type BookSection = { heading: string; body: string };

function splitBookIntoSections(text: string): BookSection[] {
  const cleaned = cleanPdfArtifacts(text);
  const markers: { index: number; heading: string }[] = [];

  const patterns: RegExp[] = [
    /\n(\d{1,2}\.\d{1,2}(?:\.\d{1,2})?)\s+([^\n]{4,120})/g,
    /\n(CHAPTER|Chapter)\s+(\d{1,2}[^\n]{0,100})/gi,
    /\n([A-Z][A-Z0-9\s\-–—]{10,75})\s*\n/g,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    const copy = new RegExp(re.source, re.flags);
    while ((m = copy.exec(cleaned)) !== null) {
      const heading =
        m.length >= 3 && m[2] && !/chapter/i.test(m[1])
          ? `${m[1]} ${m[2]}`.trim()
          : (m[2] || m[1]).trim();
      if (heading.length >= 4) {
        markers.push({ index: m.index, heading });
      }
    }
  }

  markers.sort((a, b) => a.index - b.index);

  const deduped: typeof markers = [];
  for (const m of markers) {
    if (deduped.length === 0 || m.index - deduped[deduped.length - 1].index > 80) {
      deduped.push(m);
    }
  }

  if (deduped.length === 0) {
    const chunkSize = 4500;
    const sections: BookSection[] = [];
    for (let i = 0; i < cleaned.length; i += chunkSize - 400) {
      sections.push({
        heading: `Part ${sections.length + 1}`,
        body: cleaned.slice(i, i + chunkSize),
      });
    }
    return sections.length > 0 ? sections : [{ heading: "Full text", body: cleaned }];
  }

  const sections: BookSection[] = [];
  for (let i = 0; i < deduped.length; i++) {
    const start = deduped[i].index;
    const end = i + 1 < deduped.length ? deduped[i + 1].index : cleaned.length;
    const body = cleaned.slice(start, end).trim();
    if (body.length > 100) {
      sections.push({ heading: deduped[i].heading, body });
    }
  }

  return sections;
}

function extractContextWindow(
  text: string,
  phrases: string[],
  maxChars: number
): string {
  const lower = text.toLowerCase();
  let bestAt = -1;
  let bestWeight = 0;

  for (const phrase of phrases) {
    if (phrase.length < 4) continue;
    let idx = 0;
    while ((idx = lower.indexOf(phrase, idx)) !== -1) {
      if (phrase.length > bestWeight) {
        bestWeight = phrase.length;
        bestAt = idx;
      }
      idx += 1;
    }
  }

  if (bestAt < 0) {
    return text.slice(0, maxChars);
  }

  const start = Math.max(0, bestAt - 600);
  const slice = text.slice(start, start + maxChars);
  return cleanPdfArtifacts(slice);
}

/** Pull the textbook passage that best matches this curriculum topic */
export function extractRelevantExcerpt(
  fullText: string,
  module: string,
  topic: string,
  maxChars = 3500
): string {
  const cleaned = cleanPdfArtifacts(fullText);
  if (!cleaned) return "";

  const phrases = buildTopicSearchPhrases(module, topic);
  const sections = splitBookIntoSections(cleaned);

  const scored = sections
    .map((s) => ({
      ...s,
      score:
        phraseMatchScore(s.heading, phrases) * 4 +
        phraseMatchScore(s.body.slice(0, 12_000), phrases),
    }))
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (top && top.score >= 12) {
    const picked: string[] = [];
    let len = 0;
    for (const s of scored) {
      if (s.score < top.score * 0.35 && picked.length > 0) break;
      const block = `### ${s.heading}\n\n${s.body}`;
      if (len + block.length > maxChars) {
        const room = maxChars - len;
        if (room > 400) picked.push(block.slice(0, room));
        break;
      }
      picked.push(block);
      len += block.length;
    }
    return picked.join("\n\n").slice(0, maxChars);
  }

  return extractContextWindow(cleaned, phrases, maxChars);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
