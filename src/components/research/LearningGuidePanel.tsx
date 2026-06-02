"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function GuideBlock({ block }: { block: string }) {
  const lines = block.trim().split("\n");
  if (lines.length === 0) return null;

  const first = lines[0].trim();
  const rest = lines.slice(1).join("\n").trim();

  if (first.startsWith("### ")) {
    return (
      <h3 className="mt-10 font-display text-lg font-semibold tracking-tight text-slate-900 first:mt-0">
        {renderInline(first.replace(/^###\s+/, ""))}
      </h3>
    );
  }

  if (first.startsWith("## ")) {
    return (
      <section className="scroll-mt-6 border-b border-slate-200 pb-10 last:border-0 lg:pb-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl lg:text-[2rem]">
          {renderInline(first.replace(/^##\s+/, ""))}
        </h2>
        {rest && <GuideBody text={rest} className="mt-8" />}
      </section>
    );
  }

  return <GuideBody text={block.trim()} />;
}

function GuideBody({ text, className = "" }: { text: string; className?: string }) {
  const chunks = text.split(/\n\n+/);
  return (
    <div className={`space-y-5 ${className}`}>
      {chunks.map((chunk, i) => {
        const trimmed = chunk.trim();
        if (!trimmed) return null;

        if (trimmed === "---") {
          return <hr key={i} className="my-8 border-slate-200" />;
        }

        const lines = trimmed.split("\n");
        if (lines.every((l) => /^[-*]\s/.test(l.trim()) || l.trim() === "")) {
          return (
            <ul key={i} className="space-y-3 pl-1">
              {lines
                .filter((l) => l.trim())
                .map((line, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-base leading-[1.8] text-slate-700"
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
            <ul key={i} className="space-y-2 rounded-lg bg-slate-50 p-5">
              {lines.map((line, j) => (
                <li key={j} className="text-sm leading-relaxed text-slate-700">
                  {renderInline(line.trim())}
                </li>
              ))}
            </ul>
          );
        }

        if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
          return (
            <p key={i} className="text-sm italic leading-relaxed text-slate-600">
              {renderInline(trimmed.replace(/^\*|\*$/g, ""))}
            </p>
          );
        }

        return (
          <p key={i} className="text-base leading-[1.85] text-slate-700 md:text-[1.05rem]">
            {renderInline(trimmed.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}

function parseGuideSections(markdown: string): string[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const parts = normalized.split(/(?=^## )/m).filter((p) => p.trim());
  return parts;
}

export function LearningGuidePanel({
  loading,
  content,
  mode,
  statusLabel,
}: {
  loading: boolean;
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
          <p className="mt-1 text-sm text-slate-600">
            Gathering academic sources and structuring the topic…
          </p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const sections = parseGuideSections(content);

  return (
    <article className="learning-guide">
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

      <div className="w-full space-y-12 md:space-y-14 lg:max-w-[72rem]">
        {sections.length > 0 ? (
          sections.map((block, i) => <GuideBlock key={i} block={block} />)
        ) : (
          <GuideBody text={content} />
        )}
      </div>
    </article>
  );
}
