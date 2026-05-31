"use client";

import { useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateText, uploadDocument } from "@/lib/client/api";
import { AIOutput } from "@/components/AIOutput";

const ACTIONS = [
  "Summarize research",
  "Explain difficult concepts",
  "Simplify statistics",
  "Explain methodology",
  "Translate to simple English",
  "Create study notes",
  "Generate flashcards",
  "Generate quiz",
  "Explain tables and graphs",
  "Explain like first-year student",
];

export default function UnderstandingPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [action, setAction] = useState(ACTIONS[0]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    try {
      await uploadDocument(f, "student");
    } catch {
      /* upload optional in demo */
    }
  }

  async function run() {
    setLoading(true);
    setOutput("");
    const prompt =
      action === "Explain like first-year student"
        ? "Explain this like I'm a first-year student"
        : action;
    const result = await generateText(`${prompt} for document: ${fileName ?? "sample.pdf"}`, {
      portal: "student",
    });
    setOutput(result.content);
    setLoading(false);
  }

  return (
    <>
      <ModuleHeader
        title="Research Understanding Assistant"
        description="Upload PDFs, articles, journals, theses, or books. Summarize, quiz, simplify stats, and explain at any level."
        icon={BookOpen}
      />
      <ModuleWorkspace>
        <Card className="mb-6">
          <CardTitle>Upload document</CardTitle>
          <p className="mb-4 text-sm text-slate-500">
            PDF, DOCX, EPUB — processed with OCR + RAG chunking
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 hover:border-brand-400">
            <Upload className="mb-2 h-8 w-8 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">
              {fileName ?? "Drop file or click to browse"}
            </span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onFile} />
          </label>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAction(a)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                action === a
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <Button className="mt-6" onClick={run} disabled={loading}>
          Run: {action}
        </Button>
        <div className="mt-4">
          <AIOutput loading={loading} content={output} />
        </div>
      </ModuleWorkspace>
    </>
  );
}
