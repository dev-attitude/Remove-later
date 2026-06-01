"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { RESEARCH_DISCIPLINES } from "@/lib/knowledge-library/disciplines";
import { KNOWLEDGE_LIBRARY } from "@/lib/knowledge-library/structure";
import { OPEN_KNOWLEDGE_ECOSYSTEMS, FOUNDATION_OPEN_RESOURCES } from "@/lib/knowledge-library/open-resources";
import { INTEGRATION_SOURCES } from "@/lib/integrations/registry";
import { portalPath, isPortalId } from "@/lib/portals";
import { generateCurriculumApi, type GeneratedCurriculum } from "@/lib/client/api";
import { usePortalId } from "@/hooks/usePortalId";
import { useWorkspace } from "@/hooks/useWorkspace";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
import { getDisciplineLabel } from "@/lib/knowledge-library/disciplines";
import { RESEARCH_LEVELS } from "@/lib/research-levels";

type Tab = "curriculum" | "library" | "sources";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";

type CurriculumForm = {
  researchLevel: string;
  discipline: string;
  goals: string;
};

const DEFAULT_CURRICULUM_FORM: CurriculumForm = {
  researchLevel: RESEARCH_LEVELS[0].id,
  discipline: RESEARCH_DISCIPLINES[0].id,
  goals: "",
};

export default function ResearchLibraryModule() {
  const params = useParams();
  const portalId = usePortalId();
  const portalFromParams =
    typeof params?.portal === "string" && isPortalId(params.portal) ? params.portal : portalId;

  const [tab, setTab] = useState<Tab>("curriculum");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const curriculumWs = useWorkspace<CurriculumForm, GeneratedCurriculum>({
    portalId: portalFromParams,
    moduleId: "research-library-curriculum",
    defaultForm: DEFAULT_CURRICULUM_FORM,
    makeTitle: (f, r) =>
      r?.summary?.slice(0, 60) ||
      `${RESEARCH_LEVELS.find((l) => l.id === f.researchLevel)?.label ?? "Level"} · ${getDisciplineLabel(f.discipline)}`,
  });

  const { researchLevel, discipline, goals } = curriculumWs.form;
  const curriculum = curriculumWs.result;
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(
    new Set(["foundations", "methodology"])
  );
  const [sourceQuery, setSourceQuery] = useState("research methods");

  function toggleLevel(id: string) {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generateCurriculum() {
    setLoading(true);
    setError("");
    try {
      const data = await generateCurriculumApi({
        researchLevel,
        discipline,
        goals: goals.trim() || undefined,
        portal: portalFromParams,
      });
      curriculumWs.setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate curriculum");
    } finally {
      setLoading(false);
    }
  }

  function moduleHref(moduleId: string) {
    return portalPath(portalFromParams, moduleId);
  }

  function openSourceSearch(sourceId: string, query: string) {
    const src = INTEGRATION_SOURCES.find((s) => s.id === sourceId);
    if (src?.searchUrl) window.open(src.searchUrl(query), "_blank", "noopener,noreferrer");
    else if (src?.website) window.open(src.website, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <ModuleHeader
        title="Research Knowledge Library"
        description="Seven-level research education curriculum, open knowledge ecosystems, and an AI curriculum generator — from foundations to PhD."
        icon={GraduationCap}
      />
      <ModuleWorkspace>
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {(
            [
              ["curriculum", "AI Curriculum Generator"],
              ["library", "Browse Library (Levels 1–7)"],
              ["sources", "Knowledge Sources"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "curriculum" && (
          <Card>
            {curriculumWs.hydrated && (
              <WorkspaceHistory
                items={curriculumWs.items}
                activeId={curriculumWs.activeId}
                onSelect={curriculumWs.loadItem}
                onDelete={curriculumWs.removeItem}
                onNew={curriculumWs.startNew}
              />
            )}
            <CardTitle>AI Research Curriculum Generator</CardTitle>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Example: &quot;I&apos;m a Master&apos;s student in Education&quot; — get a learning
              roadmap, books, methodologies, statistics path, and writing exercises.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Research level</label>
                <Select
                  value={researchLevel}
                  onChange={(e) => curriculumWs.setForm({ researchLevel: e.target.value })}
                >
                  {RESEARCH_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className={labelClass}>Discipline / field</label>
                <Select
                  value={discipline}
                  onChange={(e) => curriculumWs.setForm({ discipline: e.target.value })}
                >
                  {RESEARCH_DISCIPLINES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <label className={`${labelClass} mt-4`}>Goals (optional)</label>
            <Textarea
              rows={2}
              placeholder="e.g. Complete thesis in 12 months, focus on qualitative classroom research…"
              value={goals}
              onChange={(e) => curriculumWs.setForm({ goals: e.target.value })}
            />
            <Button className="mt-4" onClick={generateCurriculum} disabled={loading}>
              <Sparkles className="h-4 w-4" />
              {loading ? "Building your curriculum…" : "Generate my research curriculum"}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            {curriculum && (
              <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-700">{curriculum.summary}</p>
                {curriculum.sourcesQueried.length > 0 && (
                  <p className="text-xs text-emerald-700">
                    Papers from: {curriculum.sourcesQueried.join(" · ")}
                  </p>
                )}

                <div>
                  <h3 className="font-semibold text-slate-900">Learning roadmap</h3>
                  <div className="mt-3 space-y-3">
                    {curriculum.roadmap.map((phase, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-4">
                        <p className="font-medium">
                          {phase.title}{" "}
                          <span className="text-sm font-normal text-slate-500">
                            ({phase.duration})
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-brand-600">
                          Library levels: {phase.libraryLevels.join(", ")}
                        </p>
                        <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                          {phase.activities.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">Recommended books & OER</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {curriculum.recommendedBooks.map((b, i) => (
                        <li key={i} className="rounded-lg bg-slate-50 p-3">
                          <p className="font-medium">{b.title}</p>
                          <p className="text-slate-500">{b.source}</p>
                          <p className="mt-1 text-slate-600">{b.reason}</p>
                          {b.url && (
                            <a
                              href={b.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 underline"
                            >
                              Open <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Skyrapay Suite modules</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {curriculum.recommendedModules.map((m, i) => (
                        <li key={i} className="rounded-lg bg-brand-50 p-3">
                          <Link
                            href={moduleHref(m.moduleId)}
                            className="font-medium text-brand-800 underline"
                          >
                            {m.name}
                          </Link>
                          <p className="text-slate-600">{m.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="font-semibold">Methodologies</h3>
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {curriculum.methodologies.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Statistics path</h3>
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {curriculum.statisticsPath.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Writing exercises</h3>
                    <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                      {curriculum.writingExercises.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {curriculum.recommendedPapers.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Recommended papers</h3>
                    <div className="mt-2 space-y-2">
                      {curriculum.recommendedPapers.map((p, i) => (
                        <div key={i} className="rounded-lg border border-slate-100 p-3 text-sm">
                          <p className="font-medium">{p.title}</p>
                          <p className="text-slate-500">
                            {p.authors} ({p.year}) · {p.source}
                          </p>
                          {p.url && (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-600 underline"
                            >
                              Open paper
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {tab === "library" && (
          <div className="space-y-4">
            <Card className="!p-4">
              <p className="text-sm text-slate-600">
                <strong>Level 1</strong> is where every user starts. Progress through methodology,
                your discipline, statistics, software, writing, and PhD-level skills.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Open resources: {FOUNDATION_OPEN_RESOURCES.map((r) => r.name).join(" · ")}
              </p>
            </Card>

            {KNOWLEDGE_LIBRARY.map((level) => (
              <Card key={level.id} className="!p-0 overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
                  onClick={() => toggleLevel(level.id)}
                >
                  <div>
                    <span className="text-xs font-bold uppercase text-brand-600">
                      Level {level.level}
                    </span>
                    <p className="font-semibold text-slate-900">{level.title}</p>
                    <p className="text-sm text-slate-500">{level.subtitle}</p>
                  </div>
                  {expandedLevels.has(level.id) ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                {expandedLevels.has(level.id) && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {level.sections.map((section) => (
                      <div key={section.id} className="mt-4">
                        <p className="text-sm font-medium text-slate-800">{section.title}</p>
                        <ul className="mt-2 space-y-2">
                          {section.topics.map((topic) => (
                            <li
                              key={topic.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                            >
                              <span>{topic.title}</span>
                              <span className="flex gap-2">
                                {topic.moduleLink && (
                                  <Link
                                    href={moduleHref(topic.moduleLink)}
                                    className="text-xs font-medium text-brand-600 underline"
                                  >
                                    Open module
                                  </Link>
                                )}
                                {topic.searchQuery && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 text-xs text-slate-600 underline"
                                    onClick={() =>
                                      openSourceSearch("openalex", topic.searchQuery!)
                                    }
                                  >
                                    <Search className="h-3 w-3" />
                                    Search papers
                                  </button>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {tab === "sources" && (
          <div className="space-y-6">
            <Card>
              <CardTitle>Search all ecosystems</CardTitle>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={sourceQuery}
                  onChange={(e) => setSourceQuery(e.target.value)}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {INTEGRATION_SOURCES.filter((s) => s.searchUrl).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openSourceSearch(s.id, sourceQuery)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                  >
                    {s.name}
                    {s.apiEnabled ? " ✓" : " ↗"}
                  </button>
                ))}
              </div>
            </Card>

            {(
              [
                ["Research papers", OPEN_KNOWLEDGE_ECOSYSTEMS.papers],
                ["Books & OER", OPEN_KNOWLEDGE_ECOSYSTEMS.books],
                ["Statistics & global data", OPEN_KNOWLEDGE_ECOSYSTEMS.statistics],
              ] as const
            ).map(([title, items]) => (
              <Card key={title}>
                <CardTitle>{title}</CardTitle>
                <ul className="mt-3 space-y-2">
                  {items.map((item) => {
                    const src = INTEGRATION_SOURCES.find((s) => s.id === item.id);
                    if (!src) return null;
                    return (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{src.name}</p>
                          <p className="text-slate-500">{src.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openSourceSearch(item.id, sourceQuery)}
                          className="shrink-0 text-xs text-brand-600 underline"
                        >
                          Search <ExternalLink className="inline h-3 w-3" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}

            <Card>
              <CardTitle>
                <BookOpen className="mr-2 inline h-5 w-5" />
                Tools academy (Level 5)
              </CardTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTEGRATION_SOURCES.filter((s) => s.category === "tools").map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openSourceSearch(s.id, sourceQuery)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </ModuleWorkspace>
    </>
  );
}
