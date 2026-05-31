"use client";

import { useState } from "react";
import { PenTool, ExternalLink, BookOpen } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { GeneratePanel } from "@/components/GeneratePanel";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
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
import { usePortalId } from "@/hooks/usePortalId";
import { useWorkspace } from "@/hooks/useWorkspace";
import { generateAcademicWritingApi, type AcademicWritingResult } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const DEFAULT_TARGET = WRITING_CHAPTERS[0].id;

type WritingForm = {
  topic: string;
  researchLevel: string;
  target: string;
  tool: string;
  toolDraft: string;
};

const DEFAULT_FORM: WritingForm = {
  topic: "",
  researchLevel: RESEARCH_LEVELS[0].id,
  target: DEFAULT_TARGET,
  tool: SMART_TOOLS[0],
  toolDraft: "",
};

function makeWritingTitle(form: WritingForm, result: AcademicWritingResult | null) {
  const section = result?.targetLabel ?? getWritingTargetLabel(form.target);
  const topic = form.topic.trim().slice(0, 60);
  if (topic) return `${section}: ${topic}`;
  return section;
}

export default function WritingPage() {
  const portalId = usePortalId();
  const [loading, setLoading] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [error, setError] = useState("");

  const ws = useWorkspace<WritingForm, AcademicWritingResult>({
    portalId,
    moduleId: "writing",
    defaultForm: DEFAULT_FORM,
    makeTitle: makeWritingTitle,
  });

  const { topic, researchLevel, target, tool, toolDraft } = ws.form;
  const result = ws.result;

  const topicValid = topic.trim().length >= 5;
  const targetLabel = getWritingTargetLabel(target);
  const isChapter = isWritingChapter(target);

  async function generateSection() {
    if (!topicValid) return;
    setLoading(true);
    setError("");
    try {
      const data = await generateAcademicWritingApi({
        topic: topic.trim(),
        target,
        researchLevel,
        portal: portalId,
      });
      ws.setResult(data);
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
    try {
      const data = await generateAcademicWritingApi({
        topic: topic.trim(),
        researchLevel,
        portal: portalId,
        tool,
        draft: toolDraft.trim() || undefined,
      });
      ws.setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setToolLoading(false);
    }
  }

  if (!ws.hydrated) {
    return (
      <ModuleWorkspace>
        <p className="text-sm text-slate-500">Loading your saved work…</p>
      </ModuleWorkspace>
    );
  }

  return (
    <>
      <ModuleHeader
        title="AI Research Writing Assistant"
        description="Your work is saved automatically. Enter your research topic and level, then generate chapters or sections with citations."
        icon={PenTool}
      />
      <ModuleWorkspace>
        <WorkspaceHistory
          items={ws.items}
          activeId={ws.activeId}
          onSelect={ws.loadItem}
          onDelete={ws.removeItem}
          onNew={ws.startNew}
        />

        <Card>
          <CardTitle>Research context (required)</CardTitle>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="topic">
                Research topic *
              </label>
              <Textarea
                id="topic"
                rows={2}
                value={topic}
                onChange={(e) => ws.setForm({ topic: e.target.value })}
                placeholder="e.g. Predictors and barriers affecting nurses, doctors, interns…"
              />
            </div>
            <div>
              <label className={labelClass}>Level of research *</label>
              <Select
                value={researchLevel}
                onChange={(e) => ws.setForm({ researchLevel: e.target.value })}
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
            <Select
              className="mt-3"
              value={target}
              onChange={(e) => ws.setForm({ target: e.target.value })}
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
                Full chapter with citations from academic APIs.
              </p>
            )}
            <Button className="mt-4" onClick={generateSection} disabled={loading || !topicValid}>
              {loading ? "Generating…" : `Generate ${isChapter ? "full chapter" : targetLabel}`}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Card>

          <Card>
            <CardTitle>Smart capabilities</CardTitle>
            <Select
              className="mt-3"
              value={tool}
              onChange={(e) => ws.setForm({ tool: e.target.value })}
              disabled={!topicValid}
            >
              {SMART_TOOLS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Textarea
              className="mt-3"
              rows={3}
              placeholder="Optional draft to transform…"
              value={toolDraft}
              onChange={(e) => ws.setForm({ toolDraft: e.target.value })}
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
          </Card>
        </div>

        {(loading || toolLoading || result) && (
          <div className="mt-8">
            {result?.notice && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {result.notice}
              </p>
            )}
            <AIOutput
              loading={loading || toolLoading}
              content={result?.content ?? ""}
              mode={result?.mode ?? null}
            />
            {result && result.sourcesUsed.length > 0 && (
              <Card className="mt-6">
                <CardTitle>Sources used</CardTitle>
                <div className="mt-3 space-y-3">
                  {result.sourcesUsed.map((s, i) => (
                    <div key={`${s.title}-${i}`} className="rounded-lg border border-slate-100 p-3 text-sm">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-slate-600">
                        {s.authors} ({s.year})
                      </p>
                      {(s.url || s.doi) && (
                        <a
                          href={s.url?.startsWith("http") ? s.url : `https://doi.org/${s.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
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
          <GeneratePanel portal={portalId} workspaceModuleId="writing-freeform" />
        </Card>
      </ModuleWorkspace>
    </>
  );
}
