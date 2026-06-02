"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LearningGuidePanel } from "@/components/research/LearningGuidePanel";
import { UNDERSTANDING_RESEARCH_TOPICS } from "@/lib/research-suite/understanding-topics";
import {
  fetchUnderstandingTopicApi,
  type UnderstandingTopicContentResult,
} from "@/lib/client/api";
import { usePortalId } from "@/hooks/usePortalId";

type SelectedTopic = { module: string; label: string };

export default function UnderstandingPage() {
  const portalId = usePortalId();
  const [topicsOpen, setTopicsOpen] = useState(true);
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

  const statusLabel =
    content?.contentSource === "ai"
      ? content.aiProvider === "grok"
        ? "Live guide (Grok)"
        : "Live AI guide"
      : content?.mode === "live"
        ? "From academic databases"
        : undefined;

  return (
    <>
      <ModuleHeader
        title="Research Understanding"
        description="25 modules to learn research step by step. Select a topic to read the full guide and academic references in this workspace."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace wide>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
            Master research from introduction through publication. The learning guide uses the
            full width of your screen for easier reading.
          </p>
          <Button
            type="button"
            variant="outline"
            className="!text-xs lg:hidden"
            onClick={() => setTopicsOpen((o) => !o)}
          >
            {topicsOpen ? (
              <>
                <PanelLeftClose className="mr-1 h-4 w-4" /> Hide topics
              </>
            ) : (
              <>
                <PanelLeftOpen className="mr-1 h-4 w-4" /> Show topics
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Topic list — fixed width so the guide gets the rest */}
          <aside
            className={`w-full shrink-0 lg:w-72 xl:w-80 ${
              topicsOpen ? "block" : "hidden lg:block"
            }`}
          >
            <Card className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
              <CardTitle className="!text-base">Topics</CardTitle>
              <p className="mt-1 text-xs text-slate-500">25 modules</p>
              <div className="mt-4 space-y-2">
                {UNDERSTANDING_RESEARCH_TOPICS.map((mod) => {
                  const open = expandedModule === mod.module;
                  return (
                    <div key={mod.module} className="rounded-lg border border-slate-200">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold leading-snug text-slate-800 hover:bg-slate-50"
                        onClick={() => setExpandedModule(open ? null : mod.module)}
                      >
                        <span className="min-w-0 flex-1">{mod.module.replace(/^MODULE \d+: /, "M")}</span>
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
                                  className={`w-full px-3 py-2.5 text-left text-sm transition ${
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
          </aside>

          {/* Learning guide — takes all remaining horizontal space */}
          <div className="min-w-0 flex-1 space-y-6">
            {selected ? (
              <>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
                    <p>{error}</p>
                    {error.includes("trial") && (
                      <Link
                        href={`/${portalId}/subscription`}
                        className="mt-2 inline-block font-semibold text-brand-700 underline"
                      >
                        View subscription plans
                      </Link>
                    )}
                  </div>
                )}

                {content?.trialNotice && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
                    {content.trialNotice}{" "}
                    <Link
                      href={`/${portalId}/subscription`}
                      className="font-semibold text-brand-800 underline"
                    >
                      Subscribe
                    </Link>
                  </div>
                )}

                <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-brand-50/50 px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
                      {selected.module}
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">
                      {selected.label}
                    </h2>
                    <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-600">
                      Read the full learning guide below — overview, key concepts, practical steps,
                      and exam-style questions.
                    </p>
                    {content?.sourcesQueried && content.sourcesQueried.length > 0 && (
                      <p className="mt-4 text-sm text-slate-500">
                        Sources: {content.sourcesQueried.join(" · ")}
                      </p>
                    )}
                    {selected && !loading && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={() => loadTopic(selected)}
                      >
                        Refresh topic
                      </Button>
                    )}
                  </div>

                  <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-16 xl:py-20">
                    <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-slate-900 lg:text-2xl">
                          Learning guide
                        </h3>
                        <p className="text-sm text-slate-500">Scroll to read all sections</p>
                      </div>
                    </div>
                    <div className="max-w-none">
                      <LearningGuidePanel
                        loading={loading}
                        content={content?.overview ?? ""}
                        mode={content?.mode}
                        statusLabel={statusLabel}
                      />
                    </div>
                  </div>
                </div>

                <Card className="w-full !p-6 lg:!p-8">
                  <CardTitle className="!text-xl">Academic references</CardTitle>
                  <p className="mt-2 text-sm text-slate-500">
                    Supporting papers and full abstracts from connected databases.
                  </p>
                  {loading && (
                    <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading references…
                    </div>
                  )}
                  {content?.errors && content.errors.length > 0 && (
                    <p className="mt-3 text-sm text-amber-800">{content.errors.join(" · ")}</p>
                  )}
                  {!loading && content && content.papers.length === 0 && (
                    <p className="mt-8 text-sm text-slate-500">
                      No papers found for this topic yet. Try Refresh topic.
                    </p>
                  )}
                  <ul className="mt-8 grid gap-6 lg:grid-cols-1">
                    {(content?.papers ?? []).map((p) => (
                      <PaperCard key={p.id} paper={p} />
                    ))}
                  </ul>
                </Card>
              </>
            ) : (
              <Card className="w-full p-12 text-center">
                <p className="text-slate-500">Select a topic from the list.</p>
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
    <li className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 lg:p-8">
      <p className="text-xl font-semibold leading-snug text-slate-900">{paper.title}</p>
      <p className="mt-3 text-sm text-slate-600">
        {paper.authors} · {paper.year} · <span className="font-medium">{paper.source}</span>
        {paper.citations > 0 && ` · ${paper.citations} citations`}
      </p>
      {paper.doi && (
        <p className="mt-2 font-mono text-xs text-slate-500">DOI: {paper.doi}</p>
      )}
      {paper.abstract ? (
        <p className="mt-5 text-base leading-[1.8] text-slate-700 lg:text-[1.0625rem]">
          {paper.abstract}
        </p>
      ) : (
        <p className="mt-5 text-sm italic text-slate-500">No abstract available in this source.</p>
      )}
    </li>
  );
}
