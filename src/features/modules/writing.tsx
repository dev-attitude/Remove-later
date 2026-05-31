"use client";

import { useState } from "react";
import { PenTool, ExternalLink, BookOpen } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { GeneratePanel } from "@/components/GeneratePanel";
import {
  WRITING_SECTIONS,
  WRITING_CHAPTERS,
  SMART_TOOLS,
  getWritingTargetLabel,
  isWritingChapter,
} from "@/lib/modules";
import { RESEARCH_LEVELS } from "@/lib/research-levels";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { generateAcademicWritingApi, type AcademicWritingResult } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const DEFAULT_TARGET = WRITING_CHAPTERS[0].id;

export default function WritingPage() {
  const [topic, setTopic] = useState("");
  const [researchLevel, setResearchLevel] = useState<string>(RESEARCH_LEVELS[0].id);
  const [target, setTarget] = useState<string>(DEFAULT_TARGET);
  const [tool, setTool] = useState<string>(SMART_TOOLS[0]);
  const [toolDraft, setToolDraft] = useState("");
  const [result, setResult] = useState<AcademicWritingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [error, setError] = useState("");

  const topicValid = topic.trim().length >= 5;
  const targetLabel = getWritingTargetLabel(target);
  const isChapter = isWritingChapter(target);

  async function generateSection() {
    if (!topicValid) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateAcademicWritingApi({
        topic: topic.trim(),
        target,
        researchLevel,
        portal: "student",
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function runTool() {
    if (!topicValid) return;
    setToolLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await generateAcademicWritingApi({
        topic: topic.trim(),
        researchLevel,
        portal: "student",
        tool,
        draft: toolDraft.trim() || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setToolLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        title="AI Research Writing Assistant"
        description="Enter your research topic and level first. Generate full chapters (1–6) or individual sections with citations from OpenAlex, Semantic Scholar, and PubMed — calibrated to Bachelor's through PhD."
        icon={PenTool}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Research context (required)</CardTitle>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            All generated content is anchored to your topic. Language depth matches your
            research level.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="topic">
                Research topic *
              </label>
              <Textarea
                id="topic"
                rows={2}
                className="resize-y"
                placeholder="e.g. Factors influencing treatment adherence among HIV patients in Windhoek, Namibia"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">Minimum 5 characters</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="level">
                Level of research *
              </label>
              <Select
                id="level"
                value={researchLevel}
                onChange={(e) => setResearchLevel(e.target.value)}
              >
                {RESEARCH_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardTitle>Generate section or chapter</CardTitle>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              {topicValid
                ? `Writing on: "${topic.trim().slice(0, 80)}${topic.length > 80 ? "…" : ""}"`
                : "Enter your research topic above before generating."}
            </p>
            <label className={labelClass} htmlFor="target">
              What to generate
            </label>
            <Select
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={!topicValid}
            >
              <optgroup label="Full chapters">
                {WRITING_CHAPTERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Individual sections">
                {WRITING_SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
            </Select>
            {isChapter && (
              <p className="mt-2 flex items-start gap-2 text-xs text-brand-800">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Full chapter mode pulls literature from multiple academic APIs and builds a
                cited, humanized draft with references.
              </p>
            )}
            <Button
              className="mt-4"
              onClick={generateSection}
              disabled={loading || !topicValid}
            >
              {loading
                ? "Generating from academic sources…"
                : `Generate ${isChapter ? "full chapter" : targetLabel}`}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Card>

          <Card>
            <CardTitle>Smart capabilities</CardTitle>
            <p className="mb-3 text-sm text-slate-500">
              Applied to your topic at the selected research level.
            </p>
            <Select
              value={tool}
              onChange={(e) => setTool(e.target.value)}
              disabled={!topicValid}
            >
              {SMART_TOOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <label className={`${labelClass} mt-3`}>Optional draft to transform</label>
            <Textarea
              rows={3}
              placeholder="Paste text to rewrite, humanize, or improve…"
              value={toolDraft}
              onChange={(e) => setToolDraft(e.target.value)}
              disabled={!topicValid}
            />
            <Button
              className="mt-4"
              variant="secondary"
              onClick={runTool}
              disabled={toolLoading || !topicValid}
            >
              Run tool
            </Button>
            <p className="mt-4 text-xs text-slate-500">
              Sources: OpenAlex · Semantic Scholar · PubMed · Level-calibrated English
            </p>
          </Card>
        </div>

        {(loading || toolLoading || result) && (
          <div className="mt-8">
            {result?.notice && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {result.notice}
              </p>
            )}
            {result && (
              <div className="mb-4 flex flex-wrap gap-2 text-sm text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {result.researchLevelLabel}
                </span>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-800">
                  {result.targetLabel}
                </span>
                {result.sourcesQueried.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                    APIs: {result.sourcesQueried.join(" · ")}
                  </span>
                )}
              </div>
            )}
            <AIOutput
              loading={loading || toolLoading}
              content={result?.content ?? ""}
              mode={result?.mode ?? null}
            />
            {result && result.sourcesUsed.length > 0 && (
              <Card className="mt-6">
                <CardTitle>Sources used in this draft</CardTitle>
                <p className="mb-3 text-sm text-slate-500">
                  Retrieved from academic databases to support citations in your text.
                </p>
                <div className="space-y-3">
                  {result.sourcesUsed.map((s, i) => (
                    <div
                      key={`${s.title}-${i}`}
                      className="rounded-lg border border-slate-100 p-3 text-sm"
                    >
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-slate-600">
                        {s.authors} ({s.year}) · {s.source}
                      </p>
                      {(s.url || s.doi) && (
                        <a
                          href={
                            s.url?.startsWith("http")
                              ? s.url
                              : s.doi
                                ? `https://doi.org/${s.doi}`
                                : "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 underline"
                        >
                          View source <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-8">
          <CardTitle>Free-form writing</CardTitle>
          <p className="mb-4 text-sm text-slate-500">
            General prompts — for chapter/section generation with citations, use the form
            above.
          </p>
          <GeneratePanel
            placeholder="Optional: paste a draft or ask a follow-up question about your topic…"
            portal="student"
          />
        </Card>
      </ModuleWorkspace>
    </>
  );
}
