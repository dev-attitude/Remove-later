"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { normalizeGuideMarkdown } from "@/lib/services/format-book-text";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-charcoal">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function GuideSubheading({ text }: { text: string }) {
  return (
    <h3 className="mt-8 font-display text-lg font-semibold tracking-tight text-charcoal first:mt-0 md:text-xl">
      {renderInline(text)}
    </h3>
  );
}

function GuideBody({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\n+/).filter((b) => b.trim());

  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed === "---") {
          return <hr key={i} className="my-8 border-line" />;
        }

        if (trimmed.startsWith("### ")) {
          const lines = trimmed.split("\n");
          const title = lines[0].replace(/^###\s+/, "");
          const rest = lines.slice(1).join("\n").trim();
          return (
            <div key={i} className="rounded-xl border border-line bg-cream-50/50 px-5 py-5 md:px-6 md:py-6">
              <GuideSubheading text={title} />
              {rest && <GuideBody text={rest} className="mt-4" />}
            </div>
          );
        }

        const lines = trimmed.split("\n");

        if (lines.every((l) => /^[-*]\s/.test(l.trim()) || l.trim() === "")) {
          return (
            <ul key={i} className="space-y-2.5 pl-1">
              {lines
                .filter((l) => l.trim())
                .map((line, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-base leading-[1.75] text-charcoal"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>{renderInline(line.replace(/^[-*]\s+/, ""))}</span>
                  </li>
                ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\[[ x]\]\s/i.test(l.trim()))) {
          return (
            <ul key={i} className="space-y-2 rounded-lg bg-cream-50 p-5">
              {lines.map((line, j) => (
                <li key={j} className="text-sm leading-relaxed text-charcoal">
                  {renderInline(line.trim())}
                </li>
              ))}
            </ul>
          );
        }

        if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
          return (
            <p key={i} className="text-sm italic leading-relaxed text-muted">
              {renderInline(trimmed.replace(/^\*|\*$/g, ""))}
            </p>
          );
        }

        // Single newlines within a block → separate short paragraphs (not one wall of text)
        if (lines.length > 1 && trimmed.length > 200) {
          return (
            <div key={i} className="space-y-4">
              {lines.map((line, j) => {
                const t = line.trim();
                if (!t) return null;
                if (t.startsWith("### ")) {
                  return <GuideSubheading key={j} text={t.replace(/^###\s+/, "")} />;
                }
                return (
                  <p key={j} className="text-base leading-[1.85] text-charcoal md:text-[1.05rem]">
                    {renderInline(t)}
                  </p>
                );
              })}
            </div>
          );
        }

        return (
          <p key={i} className="text-base leading-[1.85] text-charcoal md:text-[1.05rem]">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function GuideBlock({ block }: { block: string }) {
  const lines = block.trim().split("\n");
  if (lines.length === 0) return null;

  const first = lines[0].trim();
  const rest = lines.slice(1).join("\n").trim();

  if (first.startsWith("### ")) {
    return (
      <div className="rounded-xl border border-line bg-cream-50/40 px-5 py-6 md:px-7 md:py-7">
        <GuideSubheading text={first.replace(/^###\s+/, "")} />
        {rest && <GuideBody text={rest} className="mt-5" />}
      </div>
    );
  }

  if (first.startsWith("## ")) {
    return (
      <section className="scroll-mt-6 border-b border-line pb-10 last:border-0 lg:pb-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-charcoal md:text-3xl lg:text-[2rem]">
          {renderInline(first.replace(/^##\s+/, ""))}
        </h2>
        {rest && <GuideBody text={rest} className="mt-8" />}
      </section>
    );
  }

  return <GuideBody text={block.trim()} />;
}

function parseGuideSections(markdown: string): string[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  return normalized.split(/(?=^## )/m).filter((p) => p.trim());
}

export function LearningGuidePanel({
  loading,
  enriching,
  content,
  mode,
  statusLabel,
}: {
  loading: boolean;
  enriching?: boolean;
  content: string;
  mode?: "demo" | "live" | null;
  statusLabel?: string;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[min(55vh,560px)] w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-brand-200 bg-brand-50/30 px-8 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <div className="text-center">
          <p className="font-medium text-brand-900">Preparing your learning guide</p>
          <p className="mt-1 text-sm text-muted">
            Loading textbook excerpts for this topic…
          </p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const prepared = normalizeGuideMarkdown(content);
  const sections = parseGuideSections(prepared);

  return (
    <article className="learning-guide">
      {enriching && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-brand-900">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-600" />
          Enhancing with AI synthesis and academic library sources…
        </div>
      )}
      {mode && (
        <div className="mb-8 flex flex-wrap items-center justify-end gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              mode === "live"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {statusLabel ?? (mode === "live" ? "Live" : "Demo")}
          </span>
        </div>
      )}

      <div className="prose-guide w-full space-y-10 md:space-y-12 lg:max-w-[72rem]">
        {sections.length > 0 ? (
          sections.map((block, i) => <GuideBlock key={i} block={block} />)
        ) : (
          <GuideBody text={prepared} />
        )}
      </div>
    </article>
  );
}
