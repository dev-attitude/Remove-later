"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AIOutput } from "@/components/AIOutput";
import { UNDERSTANDING_RESEARCH_TOPICS } from "@/lib/research-suite/understanding-topics";
import {
  fetchUnderstandingTopicApi,
  type UnderstandingTopicContentResult,
} from "@/lib/client/api";
import { usePortalId } from "@/hooks/usePortalId";

type SelectedTopic = { module: string; label: string };

export default function UnderstandingPage() {
  const portalId = usePortalId();
  const [expandedModule, setExpandedModule] = useState<string | null>(
    UNDERSTANDING_RESEARCH_TOPICS[0]?.module ?? null
  );
  const [selected, setSelected] = useState<SelectedTopic | null>(() => {
    const m = UNDERSTANDING_RESEARCH_TOPICS[0];
    if (!m) return null;
    return { module: m.module, label: m.items[0] };
  });
  const [content, setContent] = useState<UnderstandingTopicContentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTopic = useCallback(
    async (topic: SelectedTopic) => {
      setLoading(true);
      setError(null);
      setContent(null);
      try {
        const data = await fetchUnderstandingTopicApi({
          module: topic.module,
          topic: topic.label,
          portal: portalId,
        });
        setContent(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load topic");
      } finally {
        setLoading(false);
      }
    },
    [portalId]
  );

  useEffect(() => {
    if (selected) loadTopic(selected);
  }, [selected, loadTopic]);

  function selectTopic(module: string, label: string) {
    setSelected({ module, label });
    setExpandedModule(module);
  }

  return (
    <>
      <ModuleHeader
        title="Research Understanding"
        description="25 modules to learn research step by step. Select a topic to read the guide and related academic sources — all inside this platform."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace>
        <p className="mb-6 max-w-3xl text-sm text-slate-600">
          For students, research assistants, and supervisors. Each topic includes a structured
          learning guide and papers from OpenAlex, Semantic Scholar, PubMed, arXiv, and CORE —
          displayed here without leaving the Research Suite.
        </p>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 lg:max-h-[70vh] lg:overflow-y-auto">
            <CardTitle>Research learning topics</CardTitle>
            <p className="mt-1 text-xs text-slate-500">25 modules · select a topic</p>
            <div className="mt-4 space-y-2">
              {UNDERSTANDING_RESEARCH_TOPICS.map((mod) => {
                const open = expandedModule === mod.module;
                return (
                  <div key={mod.module} className="rounded-lg border border-slate-200">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                      onClick={() => setExpandedModule(open ? null : mod.module)}
                    >
                      <span className="min-w-0 flex-1 leading-snug">{mod.module}</span>
                      {open ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                    {open && (
                      <ul className="border-t border-slate-100 pb-2">
                        {mod.items.map((item) => {
                          const active =
                            selected?.module === mod.module && selected?.label === item;
                          return (
                            <li key={item}>
                              <button
                                type="button"
                                onClick={() => selectTopic(mod.module, item)}
                                className={`w-full px-4 py-2 text-left text-sm transition ${
                                  active
                                    ? "bg-brand-50 font-medium text-brand-800"
                                    : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {item}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-3">
            {selected ? (
              <>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                    {selected.module}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                    {selected.label}
                  </h2>
                  {content?.sourcesQueried && content.sourcesQueried.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Sources: {content.sourcesQueried.join(" · ")}
                    </p>
                  )}
                </Card>

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
                )}

                <Card>
                  <CardTitle>Learning guide</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Overview, key concepts, and study questions for this topic.
                  </p>
                  <div className="mt-4">
                    <AIOutput
                      loading={loading}
                      content={content?.overview ?? ""}
                      mode={content?.mode}
                      label="Learning content"
                    />
                  </div>
                  {selected && !loading && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 !text-xs"
                      onClick={() => loadTopic(selected)}
                    >
                      Refresh topic
                    </Button>
                  )}
                </Card>

                <Card>
                  <CardTitle>Academic references</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Papers and abstracts from connected research databases (shown in full below).
                  </p>
                  {loading && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading references…
                    </div>
                  )}
                  {content?.errors && content.errors.length > 0 && (
                    <p className="mt-2 text-xs text-amber-800">{content.errors.join(" · ")}</p>
                  )}
                  {!loading && content && content.papers.length === 0 && (
                    <p className="mt-6 text-sm text-slate-500">
                      No papers found for this topic yet. Try Refresh topic.
                    </p>
                  )}
                  <ul className="mt-4 space-y-4">
                    {(content?.papers ?? []).map((p) => (
                      <PaperCard key={p.id} paper={p} />
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card>
                <p className="text-sm text-slate-500">Select a topic from the list.</p>
              </Card>
            )}
          </div>
        </div>
      </ModuleWorkspace>
    </>
  );
}

function PaperCard({
  paper,
}: {
  paper: UnderstandingTopicContentResult["papers"][number];
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-slate-900">{paper.title}</p>
      <p className="mt-1 text-xs text-slate-600">
        {paper.authors} · {paper.year} · <span className="font-medium">{paper.source}</span>
        {paper.citations > 0 && ` · ${paper.citations} citations`}
      </p>
      {paper.doi && (
        <p className="mt-1 font-mono text-xs text-slate-500">DOI: {paper.doi}</p>
      )}
      {paper.abstract ? (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{paper.abstract}</p>
      ) : (
        <p className="mt-3 text-sm italic text-slate-500">No abstract available in this source.</p>
      )}
    </li>
  );
}
