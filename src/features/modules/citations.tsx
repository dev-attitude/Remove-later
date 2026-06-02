"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CITATION_STYLES } from "@/lib/modules";

function formatApa(work: {
  title: string;
  authors: string;
  year: number;
  doi: string;
  journal?: string;
}) {
  return `${work.authors} (${work.year}). ${work.title}. ${work.journal ?? "Journal"}. https://doi.org/${work.doi}`;
}

export default function CitationsPage() {
  const [style, setStyle] = useState<(typeof CITATION_STYLES)[number]>("APA 7");
  const [doi, setDoi] = useState("");
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyDoi() {
    if (!doi.trim()) return;
    setLoading(true);
    setError("");
    setVerified(false);
    try {
      const res = await fetch("/api/citations/doi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doi: doi.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "DOI not found");
      setReference(formatApa(data));
      setVerified(data.verified === true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
      setReference("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        title="Citation & Referencing"
        description="Crossref DOI lookup, citation verification, and reference generation. APA, Harvard, MLA, Chicago, Vancouver."
        icon={Quote}
        moduleId="citations"
      />
      <ModuleWorkspace>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>DOI lookup (Crossref)</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Verify any DOI and generate a reference from live metadata.
            </p>
            <label className="mt-4 block text-sm font-medium">DOI</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="10.1234/example"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
            <label className="mt-4 block text-sm font-medium">Citation style</label>
            <Select value={style} onChange={(e) => setStyle(e.target.value as typeof style)}>
              {CITATION_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button className="mt-4" onClick={verifyDoi} disabled={loading}>
              {loading ? "Verifying…" : "Verify & generate"}
            </Button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {verified && (
              <p className="mt-2 text-sm text-emerald-600">✓ Verified via Crossref</p>
            )}
            {reference && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                {reference}
              </p>
            )}
          </Card>
          <Card>
            <CardTitle>Linked databases</CardTitle>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Crossref — DOI & metadata</li>
              <li>• Semantic Scholar — citation networks</li>
              <li>• OpenAlex — publications & institutions</li>
              <li>• PubMed — health sciences</li>
              <li>• Google Scholar — browser search (Literature module)</li>
            </ul>
          </Card>
        </div>
      </ModuleWorkspace>
    </>
  );
}
