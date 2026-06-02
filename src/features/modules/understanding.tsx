"use client";

import { useMemo, useState } from "react";
import { BookOpen, Upload, FileText, Sparkles } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { AIOutput } from "@/components/AIOutput";
import {
  analyzeUnderstandingApi,
  extractDocumentTextApi,
  type UnderstandingResult,
} from "@/lib/client/api";
import { RESEARCH_LEVELS } from "@/lib/research-levels";
import {
  UNDERSTANDING_ACTIONS,
  getUnderstandingTopicOptions,
  type UnderstandingActionId,
} from "@/lib/services/research-understanding";
import { usePortalId } from "@/hooks/usePortalId";

const TOPIC_OPTIONS = getUnderstandingTopicOptions();

export default function UnderstandingPage() {
  const portalId = usePortalId();
  const [researchLevel, setResearchLevel] = useState<string>(RESEARCH_LEVELS[0].id);
  const [field, setField] = useState("");
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0]?.label ?? "What is Research?");
  const [action, setAction] = useState<UnderstandingActionId>("study-guide");
  const [fileName, setFileName] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UnderstandingResult | null>(null);

  const hasDocument = documentText.trim().length >= 80;
  const topicsByModule = useMemo(() => {
    return TOPIC_OPTIONS.reduce<Record<string, string[]>>((acc, o) => {
      (acc[o.module] ||= []).push(o.label);
      return acc;
    }, {});
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setExtracting(true);
    setFileName(f.name);
    try {
      const { text } = await extractDocumentTextApi(f);
      setDocumentText(text);
      setPasteMode(false);
    } catch (err) {
      setFileName(null);
      setDocumentText("");
      setError(err instanceof Error ? err.message : "Could not read file");
    } finally {
      setExtracting(false);
    }
  }

  function clearDocument() {
    setFileName(null);
    setDocumentText("");
    setPasteMode(false);
  }

  async function run() {
    setError(null);
    setResult(null);

    setLoading(true);
    try {
      const res = await analyzeUnderstandingApi({
        mode: hasDocument ? "document" : "topic",
        action,
        researchLevel,
        field: field.trim() || undefined,
        topic: topic.trim() || undefined,
        documentText: hasDocument ? documentText : undefined,
        fileName: fileName ?? (hasDocument ? "Pasted article" : undefined),
        portal: portalId,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        title="Research Understanding Assistant"
        description="Study any topic with academic guides and exam prep — or upload an article for a full analysis report. Upload is optional."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace>
        <Card className="mb-6">
          <CardTitle>Your study context</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Research level</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={researchLevel}
                onChange={(e) => setResearchLevel(e.target.value)}
              >
                {RESEARCH_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Field / discipline (optional)</span>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="e.g. Nursing, Education, Economics"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="font-medium text-slate-700">
              Research learning topic
            </span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={hasDocument}
            >
              {Object.entries(topicsByModule).map(([module, labels]) => (
                <optgroup key={module} label={module}>
                  {labels.map((label) => (
                    <option key={`${module}:${label}`} value={label}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {hasDocument
                ? "Topic selection is disabled because you uploaded/pasted an article."
                : "Pick from the research-learning curriculum (25 modules)."}
            </p>
          </label>
        </Card>

        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Article upload (optional)</CardTitle>
            {hasDocument && (
              <Button type="button" variant="outline" className="!py-1 !text-xs" onClick={clearDocument}>
                Clear article
              </Button>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {hasDocument
              ? "Report will be based on your uploaded or pasted article."
              : "Without an article, we generate academic study material from the selected research learning topic."}
          </p>

          {!pasteMode ? (
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 hover:border-brand-400">
              <Upload className="mb-2 h-8 w-8 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                {extracting
                  ? "Reading document…"
                  : fileName ?? "PDF, DOCX, or TXT — optional"}
              </span>
              {hasDocument && (
                <span className="mt-1 text-xs text-emerald-700">
                  {documentText.length.toLocaleString()} characters ready
                </span>
              )}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                disabled={extracting}
                onChange={onFile}
              />
            </label>
          ) : (
            <Textarea
              rows={8}
              className="mt-4 font-mono text-sm"
              placeholder="Paste article or chapter text here…"
              value={documentText}
              onChange={(e) => {
                setDocumentText(e.target.value);
                if (!fileName) setFileName("Pasted text");
              }}
            />
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="!text-xs"
              onClick={() => {
                setPasteMode(!pasteMode);
                if (!pasteMode) setFileName(null);
              }}
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              {pasteMode ? "Use file upload" : "Paste text instead"}
            </Button>
          </div>
        </Card>

        <div>
          <p className="text-sm font-medium text-slate-700">What do you need?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {UNDERSTANDING_ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAction(a.id)}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  action === a.id
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-6" onClick={run} disabled={loading || extracting}>
          <Sparkles className="mr-2 h-4 w-4" />
          {loading
            ? hasDocument
              ? "Analyzing article…"
              : "Generating study material…"
            : hasDocument
              ? `Generate report: ${UNDERSTANDING_ACTIONS.find((x) => x.id === action)?.label}`
              : `Generate: ${UNDERSTANDING_ACTIONS.find((x) => x.id === action)?.label}`}
        </Button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        )}

        {result && (
          <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50/50 px-4 py-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">{result.modeLabel}</span>
              {" · "}
              {result.actionLabel}
              {" · "}
              <span className="text-slate-500">{result.sourceLabel}</span>
            </p>
          </div>
        )}

        <div className="mt-4">
          <AIOutput loading={loading} content={result?.content ?? ""} />
        </div>
      </ModuleWorkspace>
    </>
  );
}
