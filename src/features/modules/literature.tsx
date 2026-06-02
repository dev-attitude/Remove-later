"use client";

import { useState } from "react";
import { Library, Search, ExternalLink } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WorkspaceHistory } from "@/components/WorkspaceHistory";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";
import { usePortalId } from "@/hooks/usePortalId";
import { useWorkspace } from "@/hooks/useWorkspace";
import { INTEGRATION_SOURCES } from "@/lib/integrations/registry";
import type { UnifiedPaper } from "@/lib/integrations/types";

const DEFAULT_SOURCES = [
  "semantic-scholar",
  "openalex",
  "pubmed",
  "arxiv",
  "core",
  "worldbank",
];

const API_LITERATURE = INTEGRATION_SOURCES.filter(
  (s) =>
    s.category === "literature" ||
    s.category === "data" ||
    s.category === "citation" ||
    s.category === "books" ||
    s.category === "education" ||
    s.category === "tools" ||
    s.category === "ai"
);

type LiteratureForm = { query: string; selected: string[] };
type LiteratureResult = {
  papers: UnifiedPaper[];
  datasets: Array<{ id: string; name: string; source: string; value?: string }>;
  sourcesQueried: string[];
  errors: string[];
  framework: string;
};

const DEFAULT_LIT_FORM: LiteratureForm = {
  query: "digital health Namibia",
  selected: DEFAULT_SOURCES,
};

export default function LiteratureModule() {
  const portalId = usePortalId();
  const [loading, setLoading] = useState(false);
  const [fwLoading, setFwLoading] = useState(false);

  const ws = useWorkspace<LiteratureForm, LiteratureResult>({
    portalId,
    moduleId: "literature",
    defaultForm: DEFAULT_LIT_FORM,
    makeTitle: (f, r) => f.query.trim() || (r?.papers?.length ? `${r.papers.length} papers` : "Literature search"),
  });

  const { query, selected } = ws.form;
  const papers = ws.result?.papers ?? [];
  const datasets = ws.result?.datasets ?? [];
  const sourcesQueried = ws.result?.sourcesQueried ?? [];
  const errors = ws.result?.errors ?? [];
  const framework = ws.result?.framework ?? "";

  function toggleSource(id: string) {
    const next = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    ws.setForm({ selected: next });
  }

  async function search() {
    setLoading(true);
    try {
      const res = await fetch("/api/research/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          sources: selected.filter(
            (id) => API_LITERATURE.find((s) => s.id === id)?.apiEnabled
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      ws.setResult({
        papers: data.papers ?? [],
        datasets: data.datasets ?? [],
        sourcesQueried: data.sourcesQueried ?? [],
        errors: data.errors ?? [],
        framework,
      });
    } catch (e) {
      ws.setResult({
        papers: [],
        datasets: [],
        sourcesQueried: [],
        errors: [e instanceof Error ? e.message : "Search failed"],
        framework,
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateFramework() {
    setFwLoading(true);
    try {
      const { content } = await generateText(
        `Literature review themes and conceptual framework for: ${query}. Use sources: ${sourcesQueried.join(", ")}`,
        { portal: portalId }
      );
      ws.setResult({
        papers,
        datasets,
        sourcesQueried,
        errors,
        framework: content,
      });
    } catch (e) {
      ws.setResult({
        papers,
        datasets,
        sourcesQueried,
        errors,
        framework: e instanceof Error ? e.message : "Failed",
      });
    } finally {
      setFwLoading(false);
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
        title="Literature Review & Research Sources"
        description="Search OpenAlex, Semantic Scholar, PubMed, arXiv, CORE, Crossref, and World Bank. Google Scholar opens in browser (no public API)."
        icon={Library}
        moduleId="literature"
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
          <CardTitle>Connected sources</CardTitle>
          <p className="mb-3 text-sm text-slate-500">
            API-enabled sources return results here. Others open official search pages.
          </p>
          <div className="flex flex-wrap gap-2">
            {API_LITERATURE.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSource(s.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selected.includes(s.id)
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s.name}
                {s.apiEnabled ? "" : " ↗"}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={query}
              onChange={(e) => ws.setForm({ query: e.target.value })}
            />
            <Button onClick={search} disabled={loading || selected.length === 0}>
              <Search className="h-4 w-4" />
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>
          {sourcesQueried.length > 0 && (
            <p className="mt-2 text-xs text-emerald-700">
              Queried: {sourcesQueried.join(" · ")}
            </p>
          )}
          {errors.map((e) => (
            <p key={e} className="mt-1 text-xs text-amber-700">
              {e}
            </p>
          ))}
        </Card>

        {papers.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Research papers</h3>
            {papers.map((r) => (
              <Card key={r.id} className="!p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{r.title}</p>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {r.source}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {r.authors} ({r.year}) · {r.citations} citations
                </p>
                {r.doi && <p className="text-xs text-brand-600">DOI: {r.doi}</p>}
                {r.gap && <p className="mt-2 text-sm text-amber-800">Gap: {r.gap}</p>}
                {r.url && (
                  <a
                    href={r.url.startsWith("http") ? r.url : `https://doi.org/${r.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}

        {datasets.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Open data indicators</h3>
            {datasets.map((d) => (
              <Card key={d.id} className="!p-4">
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-slate-500">{d.source}</p>
                {d.value && <p className="mt-1 text-sm text-slate-600">{d.value}</p>}
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6">
          <CardTitle>Quick links (browser)</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTEGRATION_SOURCES.filter((s) => s.searchUrl && !s.apiEnabled).map((s) => (
              <a
                key={s.id}
                href={s.searchUrl!(query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                {s.name} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </Card>

        <Button className="mt-6" variant="secondary" onClick={generateFramework} disabled={fwLoading}>
          Generate themes & conceptual framework
        </Button>
        <div className="mt-4">
          <AIOutput loading={fwLoading} content={framework} />
        </div>
      </ModuleWorkspace>
    </>
  );
}
