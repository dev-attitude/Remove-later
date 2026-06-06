export type DiffChunk = {
  type: "added" | "removed" | "unchanged";
  text: string;
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s+/g, " "))
    .filter((p) => p.length > 0);
}

/** Paragraph-level diff between student draft and supervisor-returned version */
export function diffParagraphs(oldText: string, newText: string): DiffChunk[] {
  const oldParas = splitParagraphs(oldText);
  const newParas = splitParagraphs(newText);
  const m = oldParas.length;
  const n = newParas.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldParas[i - 1] === newParas[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const chunks: DiffChunk[] = [];
  let i = m;
  let j = n;
  const stack: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldParas[i - 1] === newParas[j - 1]) {
      stack.push({ type: "unchanged", text: oldParas[i - 1] });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: newParas[j - 1] });
      j -= 1;
    } else if (i > 0) {
      stack.push({ type: "removed", text: oldParas[i - 1] });
      i -= 1;
    }
  }

  while (stack.length) chunks.push(stack.pop()!);
  return chunks;
}

export function summarizeDiff(chunks: DiffChunk[]) {
  return {
    added: chunks.filter((c) => c.type === "added").length,
    removed: chunks.filter((c) => c.type === "removed").length,
    unchanged: chunks.filter((c) => c.type === "unchanged").length,
  };
}

export function formatDiffForPrompt(chunks: DiffChunk[], maxChars = 14_000): string {
  const lines: string[] = [];
  for (const c of chunks) {
    if (c.type === "unchanged") continue;
    const prefix = c.type === "added" ? "[ADDED by supervisor] " : "[REMOVED by supervisor] ";
    lines.push(prefix + c.text.slice(0, 1200));
    if (lines.join("\n").length > maxChars) break;
  }
  return lines.join("\n\n").slice(0, maxChars);
}
