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
  type TopicReferenceResult,
  type UnderstandingTopicContentResult,
} from "@/lib/client/api";
import { usePortalId } from "@/hooks/usePortalId";
import { markUnderstandingTopicViewed } from "@/lib/client/understanding-progress";

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
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadIdRef = useRef(0);

  const loadTopic = useCallback(
    async (topic: SelectedTopic, refresh = false) => {
      const loadId = ++loadIdRef.current;
      let hasQuickContent = false;
      setError(null);
      setEnriching(false);

      if (!refresh) {
        setLoading(true);
        setContent(null);
        try {
          const quick = await fetchUnderstandingTopicApi({
            module: topic.module,
            topic: topic.label,
            portal: portalId,
            phase: "quick",
          });
          if (loadId !== loadIdRef.current) return;
          setContent(quick);
          hasQuickContent = true;
          setLoading(false);
          setEnriching(true);
        } catch (e) {
          if (loadId !== loadIdRef.current) return;
          setError(e instanceof Error ? e.message : "Could not load topic");
          setLoading(false);
          return;
        }
      } else {
        setLoading(true);
        setContent(null);
      }

      try {
        const full = await fetchUnderstandingTopicApi({
          module: topic.module,
          topic: topic.label,
          portal: portalId,
          phase: "full",
          refresh,
        });
        if (loadId !== loadIdRef.current) return;
        setContent(full);
        markUnderstandingTopicViewed(
          topic.module,
          topic.label,
          full.references?.length ?? 0
        );
      } catch (e) {
        if (loadId !== loadIdRef.current) return;
        if (!hasQuickContent) {
          setError(e instanceof Error ? e.message : "Could not load topic");
        }
      } finally {
        if (loadId === loadIdRef.current) {
          setLoading(false);
          setEnriching(false);
        }
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
        ? content.fromCache
          ? "Synthesised guide (Grok, cached)"
          : "Synthesised guide (Grok)"
        : content.fromCache
          ? "Synthesised guide (AI, cached)"
          : "Synthesised guide (AI)"
      : content?.mode === "live"
        ? "Live content"
        : undefined;

  return (
    <>
      <ModuleHeader
        title="Research Understanding"
        description="Select a topic for a paragraph-style study guide. References from textbooks, AI, and academic libraries appear below each guide."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace wide>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-600">
          Open a topic for a unified guide in paragraphs. All sources — textbooks, AI, and
          library databases — are listed together in References below each topic.
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
                                enriching={enriching}
                                error={error}
                                statusLabel={statusLabel}
                                portalId={portalId}
                                onRefresh={() => selected && loadTopic(selected, true)}
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
  enriching,
  error,
  statusLabel,
  portalId,
  onRefresh,
}: {
  selected: SelectedTopic;
  content: UnderstandingTopicContentResult | null;
  loading: boolean;
  enriching: boolean;
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
          {!loading && !enriching && (
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
              <p className="text-sm text-slate-500">
                Unified study guide written in paragraphs — sources listed below
              </p>
            </div>
          </div>
          <LearningGuidePanel
            loading={loading}
            enriching={enriching}
            content={content?.overview ?? ""}
            mode={content?.mode}
            statusLabel={statusLabel}
          />
        </section>

        {/* References — textbooks, AI, and library sources */}
        <section className="border-t border-slate-200 bg-slate-50/40 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <ReferencesSection loading={loading && !content} enriching={enriching} content={content} />
        </section>
      </div>
    </div>
  );
}

const INITIAL_REFERENCES_VISIBLE = 2;

function ReferencesSection({
  loading,
  enriching,
  content,
}: {
  loading: boolean;
  enriching: boolean;
  content: UnderstandingTopicContentResult | null;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [content?.topic, content?.module]);

  const references: TopicReferenceResult[] =
    content?.references ??
    (content?.papers ?? []).map((p) => ({
      id: p.id,
      type: "paper" as const,
      title: p.title,
      authors: p.authors,
      year: p.year,
      source: p.source,
      excerpt: p.abstract,
      doi: p.doi,
      citations: p.citations,
    }));

  const hasMore = references.length > INITIAL_REFERENCES_VISIBLE;
  const visible = expanded ? references : references.slice(0, INITIAL_REFERENCES_VISIBLE);
  const hiddenCount = references.length - INITIAL_REFERENCES_VISIBLE;

  return (
    <>
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
          References
          {!loading && references.length > 0 && (
            <span className="ml-2 text-base font-normal text-slate-500">
              ({references.length})
            </span>
          )}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Course textbooks, AI synthesis, and academic library sources for this topic
        </p>
      </div>

      {enriching && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading library references…
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading references…
        </div>
      )}

      {!loading && !enriching && content?.errors && content.errors.length > 0 && (
        <p className="mb-4 text-sm text-amber-800">{content.errors.join(" · ")}</p>
      )}

      {!loading && !enriching && references.length === 0 && (
        <p className="text-sm text-slate-500">
          No references found yet. Try <strong>Refresh topic</strong>.
        </p>
      )}

      {!loading && references.length > 0 && (
        <>
          <ol className="mt-2 list-none space-y-5">
            {visible.map((ref, index) => (
              <ReferenceCard key={ref.id} refItem={ref} index={index + 1} />
            ))}
          </ol>
          {hasMore && (
            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full sm:w-auto"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <>
                  <ChevronDown className="mr-2 h-4 w-4 rotate-180" />
                  View less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  View more ({hiddenCount} more)
                </>
              )}
            </Button>
          )}
        </>
      )}
    </>
  );
}

const REF_TYPE_LABELS: Record<TopicReferenceResult["type"], string> = {
  textbook: "Textbook",
  paper: "Library",
  ai: "AI",
};

const REF_TYPE_STYLES: Record<TopicReferenceResult["type"], string> = {
  textbook: "bg-brand-100 text-brand-800",
  paper: "bg-emerald-100 text-emerald-800",
  ai: "bg-violet-100 text-violet-800",
};

function ReferenceCard({
  refItem,
  index,
}: {
  refItem: TopicReferenceResult;
  index: number;
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          [{index}]
        </p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${REF_TYPE_STYLES[refItem.type]}`}
        >
          {REF_TYPE_LABELS[refItem.type]}
        </span>
      </div>
      <p className="mt-2 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
        {refItem.title}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {refItem.authors && <>{refItem.authors} · </>}
        {refItem.year && <>{refItem.year} · </>}
        <span className="font-medium">{refItem.source}</span>
        {refItem.citations != null && refItem.citations > 0 && ` · ${refItem.citations} citations`}
      </p>
      {refItem.doi && (
        <p className="mt-2 font-mono text-xs text-slate-500">DOI: {refItem.doi}</p>
      )}
      {refItem.excerpt ? (
        <p className="mt-4 text-base leading-[1.75] text-slate-700">{refItem.excerpt}</p>
      ) : (
        <p className="mt-4 text-sm italic text-slate-500">No excerpt available.</p>
      )}
    </li>
  );
}
