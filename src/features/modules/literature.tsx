"use client";

import { useState } from "react";
import { Library, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateText, searchLiteratureApi } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const DATABASES = [
  "Google Scholar",
  "CrossRef",
  "PubMed",
  "Semantic Scholar",
  "CORE",
  "arXiv",
];

export default function LiteraturePage() {
  const [query, setQuery] = useState("climate adaptation agriculture");
  const [results, setResults] = useState<
    Array<{
      title: string;
      authors: string;
      year: number;
      source: string;
      citations: number;
      gap: string;
    }>
  >([]);
  const [framework, setFramework] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    const data = await searchLiteratureApi(query);
    setResults(data.results);
  }

  async function generateFramework() {
    setLoading(true);
    setFramework("");
    const { content: text } = await generateText(
      `Literature review themes and conceptual framework for: ${query}`,
      { portal: "analysis" }
    );
    setFramework(text);
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="AI Literature Review Generator"
        description="Search academic databases, compare studies, identify gaps, and build conceptual frameworks."
        icon={Library}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Search databases</CardTitle>
          <div className="mt-2 flex flex-wrap gap-2">
            {DATABASES.map((db) => (
              <span
                key={db}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {db}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={search}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </Card>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((r, i) => (
              <Card key={i} className="!p-4">
                <p className="font-medium text-slate-900">{r.title}</p>
                <p className="text-sm text-slate-600">
                  {r.authors} ({r.year}) · {r.source} · {r.citations} citations
                </p>
                <p className="mt-2 text-sm text-amber-800">
                  Gap: {r.gap}
                </p>
              </Card>
            ))}
          </div>
        )}

        <Button className="mt-6" variant="secondary" onClick={generateFramework} disabled={loading}>
          Generate themes & conceptual framework
        </Button>
        <div className="mt-4">
          <AIOutput loading={loading} content={framework} />
        </div>
      </ModuleWorkspace>
    </>
  );
}
