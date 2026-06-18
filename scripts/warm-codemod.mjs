import { readFileSync, writeFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Maps cold neutral Tailwind utilities (slate/gray/zinc/neutral) and pure
 * white/black onto the warm Lovable design tokens (cream / line / muted /
 * charcoal / offwhite). Semantic status colors (red/amber/emerald/etc.) are
 * intentionally left untouched so dashboards keep meaningful state colors.
 */

const NEUTRALS = "(?:slate|gray|zinc|neutral|stone|cool-gray|true-gray|blue-gray)";

// Utility categories grouped by how their shade should map.
const TEXT_UTILS = ["text", "fill", "stroke", "decoration", "caret", "accent", "placeholder"];
const BG_UTILS = ["bg", "from", "to", "via"];
const LINE_UTILS = ["border", "ring", "ring-offset", "divide", "outline"];

function mapText(shade) {
  const n = Number(shade);
  if (n <= 200) return "offwhite";
  if (n <= 300) return "muted";
  if (n <= 600) return "muted";
  return "charcoal";
}
function mapBg(shade) {
  const n = Number(shade);
  if (n <= 50) return "cream-50";
  if (n <= 300) return "line";
  return "charcoal";
}
function mapLine(shade) {
  const n = Number(shade);
  if (n <= 400) return "line";
  return "charcoal";
}

function transform(src) {
  let out = src;

  // text-like utilities
  for (const util of TEXT_UTILS) {
    const re = new RegExp(`\\b${util}-${NEUTRALS}-(\\d{2,3})(\\/\\d+)?\\b`, "g");
    out = out.replace(re, (_m, shade, op = "") => `${util}-${mapText(shade)}${op}`);
  }
  // bg / gradient utilities
  for (const util of BG_UTILS) {
    const re = new RegExp(`\\b${util}-${NEUTRALS}-(\\d{2,3})(\\/\\d+)?\\b`, "g");
    out = out.replace(re, (_m, shade, op = "") => `${util}-${mapBg(shade)}${op}`);
  }
  // border / ring / divide utilities
  for (const util of LINE_UTILS) {
    const re = new RegExp(`\\b${util}-${NEUTRALS}-(\\d{2,3})(\\/\\d+)?\\b`, "g");
    out = out.replace(re, (_m, shade, op = "") => `${util}-${mapLine(shade)}${op}`);
  }
  // bare border/ring with neutral and no shade -> line
  out = out.replace(new RegExp(`\\b(border|ring|divide)-${NEUTRALS}\\b`, "g"), "$1-line");

  // Pure white -> offwhite (keeps opacity suffix)
  out = out.replace(/\b(bg|text|border|ring|fill|stroke|divide|from|to|via|placeholder|decoration|outline|caret|accent|ring-offset)-white(\/\d+)?\b/g,
    (_m, util, op = "") => `${util}-offwhite${op}`);
  // Pure black -> charcoal
  out = out.replace(/\b(bg|text|border|ring|fill|stroke|divide|from|to|via|placeholder|decoration|outline|caret|accent|ring-offset)-black(\/\d+)?\b/g,
    (_m, util, op = "") => `${util}-charcoal${op}`);

  return out;
}

function listFiles() {
  const out = execSync(
    "find src -type f \\( -name '*.tsx' -o -name '*.ts' \\)",
    { cwd: process.cwd(), encoding: "utf8" }
  );
  return out.split("\n").filter(Boolean);
}

let changed = 0;
for (const file of listFiles()) {
  try {
    if (!statSync(file).isFile()) continue;
  } catch {
    continue;
  }
  const src = readFileSync(file, "utf8");
  const next = transform(src);
  if (next !== src) {
    writeFileSync(file, next);
    changed++;
    console.log("[warm] updated", file);
  }
}
console.log(`[warm] done. ${changed} files updated.`);
