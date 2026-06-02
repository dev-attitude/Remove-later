"use client";

import { useState } from "react";
import { BarChart3, Upload } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { mockStatsSummary } from "@/lib/mock-ai";
import { generateText } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const TESTS = [
  "Descriptive statistics",
  "Correlation",
  "Regression",
  "T-tests",
  "ANOVA",
  "Chi-square",
  "Logistic regression",
  "Reliability (Cronbach's α)",
  "Factor analysis",
];

const CHARTS = [
  "Bar graph",
  "Pie chart",
  "Histogram",
  "Scatter plot",
  "Heat map",
  "Line graph",
  "Box plot",
];

export default function DataAnalysisPage() {
  const [tab, setTab] = useState<"quant" | "qual">("quant");
  const [stats, setStats] = useState<ReturnType<typeof mockStatsSummary> | null>(null);
  const [findings, setFindings] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setStats(mockStatsSummary());
    setLoading(true);
    setFindings("");
    const { content: text } = await generateText(
      "Generate findings chapter interpretation for regression results",
      { portal: "analysis" }
    );
    setFindings(text);
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="Data Analysis Module"
        description="Upload Excel, CSV, or SPSS. Clean data, run statistics, auto-chart, and generate findings."
        icon={BarChart3}
        moduleId="data-analysis"
      />
      <ModuleWorkspace>
        <div className="mb-6 flex gap-2">
          <Button
            variant={tab === "quant" ? "primary" : "outline"}
            onClick={() => setTab("quant")}
          >
            Quantitative
          </Button>
          <Button
            variant={tab === "qual" ? "primary" : "outline"}
            onClick={() => setTab("qual")}
          >
            Qualitative
          </Button>
        </div>

        {tab === "quant" ? (
          <>
            <Card className="mb-6">
              <CardTitle>Upload dataset</CardTitle>
              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 p-6">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-sm text-slate-600">Excel, CSV, SPSS (.sav)</span>
                <input type="file" className="hidden" accept=".csv,.xlsx,.sav" />
              </label>
              <Button className="mt-4" onClick={analyze}>
                Clean data & suggest test
              </Button>
            </Card>

            {stats && (
              <Card className="mb-6 !p-4">
                <p className="text-sm">
                  <strong>n:</strong> {stats.n} · <strong>Missing:</strong> {stats.missing} ·{" "}
                  <strong>Suggested:</strong> {stats.suggestedTest}
                </p>
                <p className="mt-2 text-sm text-slate-600">{stats.interpretation}</p>
              </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardTitle>Statistical tests</CardTitle>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {TESTS.map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <CardTitle>Auto charts</CardTitle>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {CHARTS.map((c) => (
                    <div
                      key={c}
                      className="flex h-16 items-center justify-center rounded bg-gradient-to-br from-brand-100 to-brand-200 text-xs font-medium text-brand-800"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <AIOutput loading={loading} content={findings} />
            </div>
          </>
        ) : (
          <Card>
            <CardTitle>Qualitative analysis</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Thematic analysis · Coding assistant · Sentiment · Keyword extraction ·
              Interview & focus group analysis
            </p>
            <p className="mt-4 text-sm">
              Upload: audio, video, or text transcripts. AI identifies themes, generates codes,
              extracts quotes, and drafts findings.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium">Transcript</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm"
                rows={6}
                placeholder="Paste interview transcript…"
                defaultValue="Participant 3: The main barrier we faced was access to resources…"
              />
            </label>
            <Button className="mt-4" variant="secondary">
              Run thematic analysis
            </Button>
          </Card>
        )}
      </ModuleWorkspace>
    </>
  );
}
