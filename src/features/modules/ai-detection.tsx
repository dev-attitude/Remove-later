"use client";

import { useRef, useState } from "react";
import {
  Shield,
  Upload,
  Copy,
  Download,
  Sparkles,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  detectAIApi,
  extractDocumentTextApi,
  humanizeFlaggedAIApi,
  type AIDetectionResult,
} from "@/lib/client/api";
import {
  buildHighlightSegments,
  riskHighlightClass,
} from "@/lib/ai-detection-highlight";

type InputMode = "paste" | "upload";

export default function AIDetectionModule() {
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<AIDetectionResult | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flagged = result?.sentences.filter((s) => s.risk === "high" || s.risk === "moderate") ?? [];
  const segments =
    result && displayText ? buildHighlightSegments(displayText, result.sentences) : [];

  async function runScan(content: string) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await detectAIApi(content);
      setResult(data);
      setDisplayText(data.fullText);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setError("");
    try {
      const { text: extracted, fileName: name } = await extractDocumentTextApi(file);
      setText(extracted);
      setFileName(name);
      setInputMode("paste");
      await runScan(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read file");
    } finally {
      setExtracting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function humanizeFlagged() {
    if (!result || flagged.length === 0) return;
    setHumanizing(true);
    setError("");
    try {
      const { text: revised } = await humanizeFlaggedAIApi(displayText, flagged);
      setDisplayText(revised);
      setText(revised);
      await runScan(revised);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Humanization failed");
    } finally {
      setHumanizing(false);
    }
  }

  function copyText() {
    void navigator.clipboard.writeText(displayText || text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadText() {
    const blob = new Blob([displayText || text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName?.replace(/\.[^.]+$/, "") || "document") + "-edited.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <ModuleHeader
        title="AI Detection Module"
        description="Upload PDF, DOCX, or TXT — or paste your assignment. Sentences likely written by AI are highlighted in red (high) and orange (moderate). Humanize, copy, or download to edit yourself."
        icon={Shield}
      />
      <ModuleWorkspace>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInputMode("paste")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              inputMode === "paste"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              inputMode === "upload"
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            Upload document
          </button>
        </div>

        <Card>
          {inputMode === "paste" ? (
            <>
              <CardTitle>Paste your research, assignment, or document text</CardTitle>
              <Textarea
                rows={10}
                className="mt-3 font-mono text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste thesis chapter, essay, or assignment here…"
              />
            </>
          ) : (
            <>
              <CardTitle>Upload file</CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                PDF, DOCX, or TXT (max 25MB). Text is extracted automatically, then scanned.
              </p>
              <div
                className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    if (fileRef.current) {
                      fileRef.current.files = dt.files;
                      void onFileChange({
                        target: fileRef.current,
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }
                }}
              >
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  Drag & drop or click to upload
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  className="mt-4 text-sm"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={onFileChange}
                />
                {fileName && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-brand-700">
                    <FileText className="h-4 w-4" />
                    {fileName}
                  </p>
                )}
              </div>
            </>
          )}

          {inputMode === "paste" && (
            <Button
              className="mt-4"
              onClick={() => runScan(text)}
              disabled={loading || extracting || text.trim().length < 10}
            >
              {loading ? "Scanning for AI content…" : "Detect AI content"}
            </Button>
          )}

          {(extracting || loading) && inputMode === "upload" && (
            <p className="mt-4 text-sm text-brand-700">
              {extracting ? "Extracting text from document…" : "Analyzing sentences…"}
            </p>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        {result && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-red-200 px-3 py-1 font-medium text-red-900">
                Red — high AI likelihood (70%+)
              </span>
              <span className="rounded-full bg-orange-200 px-3 py-1 font-medium text-orange-900">
                Orange — moderate (40–69%)
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                Unmarked — likely human-written
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Card>
                <p className="text-sm text-slate-500">Overall AI probability</p>
                <p className="text-4xl font-bold text-amber-600">{result.overallAI}%</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Integrity score</p>
                <p className="text-4xl font-bold text-emerald-600">
                  {result.integrityScore}/100
                </p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500">Flagged sentences</p>
                <p className="text-lg font-semibold text-slate-800">
                  <span className="text-red-600">{result.counts.high} high</span>
                  {" · "}
                  <span className="text-orange-600">{result.counts.moderate} moderate</span>
                </p>
                {result.mode && (
                  <p className="mt-2 text-xs uppercase text-slate-500">{result.mode} engine</p>
                )}
              </Card>
            </div>

            <Card className="mt-6">
              <CardTitle>Highlighted document</CardTitle>
              <div className="mt-4 max-h-[28rem] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800">
                {segments.length > 0 ? (
                  segments.map((seg, i) => (
                    <span
                      key={i}
                      className={
                        seg.risk
                          ? `${riskHighlightClass(seg.risk)} rounded px-0.5 underline decoration-2`
                          : undefined
                      }
                      title={
                        seg.risk === "high"
                          ? "High AI probability"
                          : seg.risk === "moderate"
                            ? "Moderate AI probability"
                            : undefined
                      }
                    >
                      {seg.text}
                    </span>
                  ))
                ) : (
                  <p className="whitespace-pre-wrap">{displayText}</p>
                )}
              </div>
            </Card>

            <Card className="mt-6 border-brand-100 bg-brand-50/40">
              <CardTitle>What would you like to do next?</CardTitle>
              <p className="mt-2 text-sm text-slate-600">
                You can humanize red and orange sentences automatically, or take the text and
                edit it yourself.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={humanizeFlagged}
                  disabled={humanizing || flagged.length === 0}
                >
                  <Sparkles className="h-4 w-4" />
                  {humanizing
                    ? "Humanizing flagged text…"
                    : `Humanize red & orange (${flagged.length} sentences)`}
                </Button>
                <Button variant="secondary" onClick={copyText}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy full text"}
                </Button>
                <Button variant="secondary" onClick={downloadText}>
                  <Download className="h-4 w-4" />
                  Download as .txt
                </Button>
              </div>
              {flagged.length === 0 && (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                  <AlertTriangle className="h-4 w-4" />
                  No high or moderate AI sentences detected — you can still copy or download.
                </p>
              )}
            </Card>

            <Card className="mt-6">
              <CardTitle>Sentence breakdown</CardTitle>
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
                {result.sentences.map((s) => (
                  <li
                    key={s.index}
                    className={`rounded-lg border-l-4 px-3 py-2 ${
                      s.risk === "high"
                        ? "border-red-500 bg-red-50"
                        : s.risk === "moderate"
                          ? "border-orange-500 bg-orange-50"
                          : "border-emerald-400 bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      {s.aiProbability}% AI · {s.risk}
                    </span>
                    <p className="text-slate-800">{s.text}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </ModuleWorkspace>
    </>
  );
}
