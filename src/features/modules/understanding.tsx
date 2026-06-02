"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UNDERSTANDING_RESEARCH_TOPICS } from "@/lib/research-suite/understanding-topics";
import {
  UNDERSTANDING_API_SOURCE_IDS,
  buildUnderstandingSearchQuery,
  getUnderstandingExternalSources,
  openUnderstandingSourceSearch,
} from "@/lib/research-suite/understanding-sources";
import type { UnifiedPaper } from "@/lib/integrations/types";

type SelectedTopic = { module: string; label: string };

export default function UnderstandingPage() {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    UNDERSTANDING_RESEARCH_TOPICS[0]?.module ?? null
  );
  const [selected, setSelected] = useState<SelectedTopic | null>(() => {
    const m = UNDERSTANDING_RESEARCH_TOPICS[0];
    if (!m) return null;
    return { module: m.module, label: m.items[0] };
  });
  const [papers, setPapers] = useState<UnifiedPaper[]>([]);
  const [sourcesQueried, setSourcesQueried] = useState<string[]>([]);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const externalSources = useMemo(() => getUnderstandingExternalSources(), []);
  const searchQuery = selected ? buildUnderstandingSearchQuery(selected.label) : "";

  const fetchPapers = useCallback(async (topic: SelectedTopic) => {
    const query = buildUnderstandingSearchQuery(topic.label);
    setLoading(true);
    setPapers([]);
    setSearchErrors([]);
    try {
      const res = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          sources: [...UNDERSTANDING_API_SOURCE_IDS],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setPapers(data.papers ?? []);
      setSourcesQueried(data.sourcesQueried ?? []);
      setSearchErrors(data.errors ?? []);
    } catch (e) {
      setSearchErrors([e instanceof Error ? e.message : "Could not load articles"]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) fetchPapers(selected);
  }, [selected, fetchPapers]);

  function selectTopic(module: string, label: string) {
    setSelected({ module, label });
    setExpandedModule(module);
  }

  return (
    <>
      <ModuleHeader
        title="Research Understanding"
        description="25 modules to learn research step by step. Select a topic to open trusted databases and find papers, books, and tools."
        icon={BookOpen}
        moduleId="understanding"
      />
      <ModuleWorkspace>
        <p className="mb-6 max-w-3xl text-sm text-slate-600">
          For students, research assistants, and supervisors — master research from introduction
          through publication. Pick any topic below; we link you to OpenAlex, Semantic Scholar,
          CORE, PubMed, arXiv, textbooks, and reference tools.
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
                  <p className="mt-2 text-sm text-slate-500">
                    Search query: <span className="font-mono text-slate-700">{searchQuery}</span>
                  </p>
                </Card>

                <Card>
                  <CardTitle>Find information on other platforms</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Opens the official search page for this topic in each source.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {externalSources.map((src) => (
                      <Button
                        key={src.id}
                        type="button"
                        variant="outline"
                        className="!text-xs"
                        onClick={() => openUnderstandingSourceSearch(src.id, searchQuery)}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        {src.name}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>Articles from connected databases</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      className="!text-xs"
                      disabled={loading}
                      onClick={() => selected && fetchPapers(selected)}
                    >
                      <Search className="mr-1 h-3.5 w-3.5" />
                      {loading ? "Searching…" : "Refresh"}
                    </Button>
                  </div>
                  {sourcesQueried.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Queried: {sourcesQueried.join(" · ")}
                    </p>
                  )}
                  {searchErrors.length > 0 && (
                    <p className="mt-2 text-xs text-amber-800">{searchErrors.join(" · ")}</p>
                  )}
                  {loading && (
                    <p className="mt-6 text-sm text-slate-500">Loading papers…</p>
                  )}
                  {!loading && papers.length === 0 && (
                    <p className="mt-6 text-sm text-slate-500">
                      No papers returned. Use the platform buttons above or try Refresh.
                    </p>
                  )}
                  <ul className="mt-4 space-y-3">
                    {papers.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                      >
                        <p className="font-medium text-slate-900">{p.title}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {p.authors} · {p.year} · {p.source}
                          {p.citations > 0 && ` · ${p.citations} citations`}
                        </p>
                        {p.abstract && (
                          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.abstract}</p>
                        )}
                        {(p.url || p.doi) && (
                          <a
                            href={p.url || `https://doi.org/${p.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </li>
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
