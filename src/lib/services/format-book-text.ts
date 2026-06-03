import { cleanPdfArtifacts } from "@/lib/services/book-topic-match";

/**
 * Turn messy PDF-extracted textbook text into readable markdown for LearningGuidePanel.
 */
export function formatExtractedBookText(raw: string, topicLabel?: string): string {
  if (!raw?.trim()) return "";

  let text = cleanPdfArtifacts(raw)
    .replace(/\r\n/g, "\n")
    .replace(/\u00ad/g, "")
    .replace(/-\s*\n\s*/g, "")
    .replace(/([a-z,;])\n([a-z])/gi, "$1 $2")
    .replace(/([.!?])\s*\n\s*([A-Z])/g, "$1\n\n$2")
    .replace(/[ \t]+/g, " ")
    .trim();

  // "Structure: 1.1 Foo 1.2 Bar" → outline list
  text = text.replace(
    /Structure:\s*/gi,
    "\n\n**Chapter outline**\n\n"
  );

  // Numbered section headings: 1.1 WHAT IS RESEARCH? or 1.1 What is Research?
  text = text.replace(
    /\b(\d+\.\d+)\s+([A-Z][A-Za-z0-9\s,\-–—'?]{3,80}?)(?=\s+\d+\.\d+\s|\s*$|\s+[A-Z]{2,})/g,
    "\n\n### $1 $2\n\n"
  );

  // Standalone ALL-CAPS headings (common in PDFs)
  text = text.replace(
    /\b([A-Z][A-Z0-9\s,\-–—'?]{8,60})\b(?=\s+[a-z])/g,
    (match) => {
      if (/^(AND|THE|FOR|FROM|WITH|THAT|THIS|YOUR|RESEARCH|METHODOLOGY)$/.test(match.trim()))
        return match;
      return `\n\n### ${titleCase(match.trim())}\n\n`;
    }
  );

  // Outline items: "1.1 What is Research?" in a run of sections
  text = text.replace(
    /(?:^|\n)(\d+\.\d+)\s+([A-Z][a-z][^\n.]{2,55}?)(?=\s+\d+\.\d+\s)/g,
    "\n- **$1** $2"
  );

  // Question prompts
  text = text.replace(/\b(Questions?\s+for\s+self-study)\s*/gi, "\n\n**$1**\n\n");

  if (topicLabel) {
    const topicRe = new RegExp(
      `(${escapeRegExp(topicLabel)}[^.]{0,120}\\.)`,
      "gi"
    );
    const matches = text.match(topicRe);
    if (matches && matches.length > 0) {
      const lead = matches.slice(0, 2).join(" ");
      text = `**Focus: ${topicLabel}**\n\n${lead}\n\n---\n\n${text}`;
    }
  }

  text = collapseBlankLines(text);
  text = splitLongParagraphs(text, 520);

  return text.trim();
}

export function normalizeGuideMarkdown(markdown: string): string {
  if (!markdown?.trim()) return "";

  let text = markdown.replace(/\r\n/g, "\n").trim();

  // Ensure ## sections have breathing room
  text = text.replace(/([^\n])\n(## )/g, "$1\n\n$2");
  text = text.replace(/([^\n])\n(### )/g, "$1\n\n$2");

  // Format raw blocks under ### that look like PDF dumps (no double newlines, very long)
  text = text.replace(
    /(### [^\n]+\n\n)([^\n#]{400,})/g,
    (_, heading, body) => `${heading}${formatExtractedBookText(body)}`
  );

  return collapseBlankLines(text);
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function splitLongParagraphs(text: string, maxLen: number): string {
  return text
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-") || trimmed.startsWith("*"))
        return trimmed;
      if (trimmed.length <= maxLen) return trimmed;

      const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [trimmed];
      const parts: string[] = [];
      let current = "";

      for (const s of sentences) {
        if (current.length + s.length > maxLen && current) {
          parts.push(current.trim());
          current = s;
        } else {
          current += s;
        }
      }
      if (current.trim()) parts.push(current.trim());
      return parts.join("\n\n");
    })
    .join("\n\n");
}
