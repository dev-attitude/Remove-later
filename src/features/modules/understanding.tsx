"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
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
  const contentRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (selected && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected?.module, selected?.label]);

  function selectTopic(module: string, label: string) {
    const same =
      selected?.module === module && selected?.label === label;
    if (same) {
      setSelected(null);
      setContent(null);
      setError(null);
      return;
    }
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
        description="25 modules to learn research step by step. Each topic includes a learning guide and academic references directly below it."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace wide>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600">
          Expand a module, then click a topic — read the guide, then the references listed
          immediately below it on the same topic.
        </p>

        <div className="space-y-3">
          {UNDERSTANDING_RESEARCH_TOPICS.map((mod) => {
            const moduleOpen = expandedModule === mod.module;
            return (
              <div
                key={mod.module}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                  onClick={() => setExpandedModule(moduleOpen ? null : mod.module)}
                >
                  <span className="font-display text-sm font-semibold text-slate-900 sm:text-base">
                    {mod.module}
                  </span>
                  {moduleOpen ? (
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>

                {moduleOpen && (
                  <ul className="border-t border-slate-100">
                    {mod.items.map((item) => {
                      const active =
                        selected?.module === mod.module && selected?.label === item;
                      return (
                        <li key={item} className="border-b border-slate-100 last:border-b-0">
                          <button
                            type="button"
                            onClick={() => selectTopic(mod.module, item)}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition sm:px-6 sm:text-base ${
                              active
                                ? "bg-brand-50 font-medium text-brand-800"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <BookOpen
                              className={`h-4 w-4 shrink-0 ${
                                active ? "text-brand-600" : "text-slate-400"
                              }`}
                            />
                            {item}
                          </button>

                          {active && (
                            <div
                              ref={contentRef}
                              className="border-t border-brand-100 bg-slate-50/60 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10"
                            >
                              <TopicContent
                                selected={selected}
                                content={content}
                                loading={loading}
                                error={error}
                                statusLabel={statusLabel}
                                portalId={portalId}
                                onRefresh={() => selected && loadTopic(selected)}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </ModuleWorkspace>
    </>
  );
}

function TopicContent({
  selected,
  content,
  loading,
  error,
  statusLabel,
  portalId,
  onRefresh,
}: {
  selected: SelectedTopic;
  content: UnderstandingTopicContentResult | null;
  loading: boolean;
  error: string | null;
  statusLabel: string | undefined;
  portalId: string;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-brand-50/50 px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            {selected.module}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            {selected.label}
          </h2>
          {content?.sourcesQueried && content.sourcesQueried.length > 0 && (
            <p className="mt-3 text-sm text-slate-500">
              Databases: {content.sourcesQueried.join(" · ")}
            </p>
          )}
          {!loading && (
            <Button type="button" variant="outline" className="mt-4" onClick={onRefresh}>
              Refresh topic
            </Button>
          )}
        </div>

        {/* Learning guide */}
        <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
                Learning guide
              </h3>
              <p className="text-sm text-slate-500">Overview, concepts, and study questions</p>
            </div>
          </div>
          <LearningGuidePanel
            loading={loading}
            content={content?.overview ?? ""}
            mode={content?.mode}
            statusLabel={statusLabel}
          />
        </section>

        {/* References — always directly below the guide for this topic */}
        <section className="border-t border-slate-200 bg-slate-50/40 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
                References
                {!loading && content && content.papers.length > 0 && (
                  <span className="ml-2 text-base font-normal text-slate-500">
                    ({content.papers.length})
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Academic papers for this topic — read after the guide above
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading references for this topic…
            </div>
          )}

          {!loading && content?.errors && content.errors.length > 0 && (
            <p className="mb-4 text-sm text-amber-800">{content.errors.join(" · ")}</p>
          )}

          {!loading && content && content.papers.length === 0 && (
            <p className="text-sm text-slate-500">
              No papers found for this topic yet. Try <strong>Refresh topic</strong> to search
              OpenAlex, Semantic Scholar, PubMed, arXiv, and CORE again.
            </p>
          )}

          {!loading && (content?.papers ?? []).length > 0 && (
            <ol className="mt-2 list-none space-y-5">
              {(content?.papers ?? []).map((p, index) => (
                <PaperCard key={p.id} paper={p} index={index + 1} />
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function PaperCard({
  paper,
  index,
}: {
  paper: UnderstandingTopicContentResult["papers"][number];
  index: number;
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Reference {index}
      </p>
      <p className="mt-2 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
        {paper.title}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {paper.authors} · {paper.year} · <span className="font-medium">{paper.source}</span>
        {paper.citations > 0 && ` · ${paper.citations} citations`}
      </p>
      {paper.doi && (
        <p className="mt-2 font-mono text-xs text-slate-500">DOI: {paper.doi}</p>
      )}
      {paper.abstract ? (
        <p className="mt-4 text-base leading-[1.75] text-slate-700">{paper.abstract}</p>
      ) : (
        <p className="mt-4 text-sm italic text-slate-500">No abstract available in this source.</p>
      )}
    </li>
  );
}
