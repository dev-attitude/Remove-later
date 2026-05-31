"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { detectAIApi } from "@/lib/client/api";

export default function AIDetectionModule() {
  const [text, setText] = useState(
    "The findings indicate a significant relationship between variables. This study utilized a mixed-methods approach. Furthermore, the literature suggests multiple theoretical perspectives."
  );
  const [result, setResult] = useState<import("@/lib/client/api").AIDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function scan() {
    setLoading(true);
    try {
      const data = await detectAIApi(text);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ModuleHeader
        title="AI Detection Module"
        description="Sentence-level AI probability, integrity score, highlighting, and humanization suggestions."
        icon={Shield}
      />
      <ModuleWorkspace>
        <Card>
          <CardTitle>Paste text to scan</CardTitle>
          <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} className="mt-3" />
          <Button className="mt-4" onClick={scan} disabled={loading}>
            {loading ? "Scanning…" : "Detect AI content"}
          </Button>
        </Card>

        {result && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-sm text-slate-500">Overall AI probability</p>
              <p className="text-4xl font-bold text-amber-600">{result.overallAI}%</p>
              <p className="mt-4 text-sm text-slate-500">Academic integrity score</p>
              <p className="text-4xl font-bold text-emerald-600">{result.integrityScore}/100</p>
              {result.mode && (
                <p className="mt-2 text-xs uppercase text-slate-500">{result.mode} engine</p>
              )}
            </Card>
            <Card>
              <CardTitle>Sentence analysis</CardTitle>
              <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
                {result.sentences.map((s, i) => (
                  <li
                    key={i}
                    className="rounded border-l-4 pl-2"
                    style={{
                      borderColor:
                        s.aiProbability > 60
                          ? "#f59e0b"
                          : s.aiProbability > 30
                            ? "#fbbf24"
                            : "#10b981",
                    }}
                  >
                    <span className="text-xs font-medium text-slate-500">
                      {s.aiProbability}% AI
                    </span>
                    <p className="text-slate-700">{s.text}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </ModuleWorkspace>
    </>
  );
}
