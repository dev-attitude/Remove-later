"use client";

import { useState } from "react";
import { Lightbulb, ExternalLink } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
import { RESEARCH_METHODS } from "@/lib/research-methods";
import { RESEARCH_LEVELS } from "@/lib/research-levels";
import { usePortalId } from "@/hooks/usePortalId";
import { useWorkspace } from "@/hooks/useWorkspace";
import { generateResearchTopicsApi, type TopicGenerationResult } from "@/lib/client/api";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type TopicsForm = {
  fieldOfStudy: string;
  problems: string;
  researchLocation: string;
  researchMethod: string;
  researchLevel: string;
};

const DEFAULT_FORM: TopicsForm = {
  fieldOfStudy: "",
  problems: "",
  researchLocation: "",
  researchMethod: RESEARCH_METHODS[0],
  researchLevel: RESEARCH_LEVELS[0].id,
};

function makeTopicsTitle(form: TopicsForm, result: TopicGenerationResult | null) {
  if (result?.topics?.[0]?.topic?.title) {
    return result.topics[0].topic.title.slice(0, 100);
  }
  if (form.fieldOfStudy.trim()) return form.fieldOfStudy.trim();
  return "Topic search";
}

export default function ResearchTopicsModule() {
  const portalId = usePortalId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ws = useWorkspace<TopicsForm, TopicGenerationResult>({
    portalId,
    moduleId: "research-topics",
    defaultForm: DEFAULT_FORM,
    makeTitle: makeTopicsTitle,
  });

  const { fieldOfStudy, problems, researchLocation, researchMethod, researchLevel } = ws.form;
  const result = ws.result;

  const canSubmit =
    fieldOfStudy.trim().length >= 2 &&
    problems.trim().length >= 10 &&
    researchLocation.trim().length >= 2;

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const data = await generateResearchTopicsApi({
        fieldOfStudy: fieldOfStudy.trim(),
        problems: problems.trim(),
        researchLocation: researchLocation.trim(),
        researchMethod,
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
        title="Research Topic Generator"
        description="Enter your research level, field, problems, location, and method. Topics and literature are calibrated for Bachelor's through PhD — complexity and originality increase with level."
        icon={Lightbulb}
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
          <CardTitle>Your research context</CardTitle>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Complete every field before generating. Topics are tailored to your research level,
            discipline, location, and methodology.
          </p>

          <div className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="level">
                Level of research *
              </label>
              <Select
                id="level"
                className="max-w-md"
                value={researchLevel}
                onChange={(e) => ws.setForm({ researchLevel: e.target.value })}
              >
                {RESEARCH_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </Select>
              {(() => {
                const selected = RESEARCH_LEVELS.find((l) => l.id === researchLevel);
                if (!selected) return null;
                return (
                  <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-800">{selected.short}</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>
                        <span className="font-medium">Complexity:</span> {selected.complexity}
                      </li>
                      <li>
                        <span className="font-medium">Original contribution:</span>{" "}
                        {selected.originality}
                      </li>
                      <li>
                        <span className="font-medium">Literature review:</span>{" "}
                        {selected.literatureReview}
                      </li>
                    </ul>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className={labelClass} htmlFor="field">
                Field of study *
              </label>
              <input
                id="field"
                className={inputClass}
                placeholder="e.g. Public Health, Computer Science, Education"
                value={fieldOfStudy}
                onChange={(e) => ws.setForm({ fieldOfStudy: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="problems">
                Problems observed or problems you want to solve *
              </label>
              <Textarea
                id="problems"
                rows={4}
                placeholder="Describe real issues you have seen, gaps in practice, or research problems you want to investigate…"
                value={problems}
                onChange={(e) => ws.setForm({ problems: e.target.value })}
              />
              <p className="mt-1 text-xs text-slate-400">Minimum 10 characters</p>
            </div>

            <div>
              <label className={labelClass} htmlFor="location">
                Where you plan to conduct the research *
              </label>
              <input
                id="location"
                className={inputClass}
                placeholder="e.g. Windhoek, Khomas Region, Namibia"
                value={researchLocation}
                onChange={(e) => ws.setForm({ researchLocation: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="method">
                Research method you want to use *
              </label>
              <Select
                id="method"
                className="max-w-md"
                value={researchMethod}
                onChange={(e) => ws.setForm({ researchMethod: e.target.value })}
              >
                {RESEARCH_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Button className="mt-6" onClick={handleGenerate} disabled={loading || !canSubmit}>
            {loading ? "Generating topics & literature…" : "Generate 3 research topics"}
          </Button>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        {result && (
          <div className="mt-8 space-y-8">
            <p className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">{result.researchLevelLabel} topics</span>
              {" · "}
              Mode:{" "}
              <span className={result.mode === "live" ? "text-emerald-700" : "text-amber-700"}>
                {result.mode === "live" ? "Live AI + literature APIs" : "Demo"}
              </span>
            </p>

            {result.topics.map(({ topic, articles }, index) => (
              <Card key={topic.id} className="border-brand-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Topic {index + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{topic.title}</h3>
                <p className="mt-3 text-sm text-slate-700">{topic.rationale}</p>

                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-800">Research questions</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                    {topic.researchQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Method & location fit: </span>
                  {topic.alignmentNote}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="font-semibold text-slate-900">
                    Similar research ({articles.length} articles)
                  </p>
                  <div className="mt-4 space-y-3">
                    {articles.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border border-slate-100 bg-white p-4"
                      >
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {a.authors} ({a.year}) · {a.citations} citations · {a.source}
                        </p>
                        {(a.url || a.doi) && (
                          <a
                            href={
                              a.url?.startsWith("http")
                                ? a.url
                                : a.doi
                                  ? `https://doi.org/${a.doi}`
                                  : "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 underline"
                          >
                            Open paper <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ModuleWorkspace>
    </>
  );
}
