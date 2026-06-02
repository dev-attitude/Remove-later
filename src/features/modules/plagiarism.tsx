"use client";

import { useState } from "react";
import { FileSearch, Download } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { checkPlagiarismApi } from "@/lib/client/api";

export default function PlagiarismModule() {
  const [text, setText] = useState(
    "Research methodology encompasses the systematic approach used to investigate phenomena. Validity and reliability of instruments remain central to trustworthy findings."
  );
  const [report, setReport] = useState<import("@/lib/client/api").PlagiarismResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const result = await checkPlagiarismApi(text);
      setReport(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        title="Plagiarism Checker"
        description="Similarity scan with citation mismatch detection. Export reports for Turnitin or institutional submission."
        icon={FileSearch}
        moduleId="plagiarism"
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Document text</CardTitle>
          <Textarea
            rows={6}
            className="mt-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={check} disabled={loading}>
              {loading ? "Checking…" : "Check plagiarism"}
            </Button>
            <Button variant="outline" disabled={!report}>
              <Download className="h-4 w-4" /> Download report
            </Button>
          </div>
        </Card>

        {report && (
          <Card className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Similarity</p>
              {report.mode && (
                <span className="text-xs uppercase text-amber-700">{report.mode} mode</span>
              )}
            </div>
            <p
              className={`text-5xl font-bold ${report.similarity < 20 ? "text-emerald-600" : "text-red-600"}`}
            >
              {report.similarity}%
            </p>
            <div className="mt-6 space-y-4">
              {report.matches.map((m, i) => (
                <div key={i} className="rounded-lg bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900">&quot;{m.text}&quot;</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {m.percent}% match · {m.source}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </ModuleWorkspace>
    </>
  );
}
