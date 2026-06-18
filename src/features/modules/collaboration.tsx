"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Upload,
  Loader2,
  FileText,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePortalId } from "@/hooks/usePortalId";
import { notifyDashboardStatsChanged } from "@/lib/client/dashboard-stats-events";
import {
  deleteSupervisorFeedbackApi,
  fetchSupervisorFeedbackApi,
  listSupervisorFeedbackApi,
  uploadSupervisorFeedbackApi,
  type SupervisorFeedbackAnalysis,
  type SupervisorFeedbackReviewSummary,
} from "@/lib/client/api";

const SEVERITY_STYLES = {
  high: "bg-red-50 text-red-800 border-red-200",
  medium: "bg-amber-50 text-amber-900 border-amber-200",
  low: "bg-cream-50 text-charcoal border-line",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CollaborationPage() {
  const portalId = usePortalId();
  const [reviews, setReviews] = useState<SupervisorFeedbackReviewSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SupervisorFeedbackAnalysis | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [supervisorFile, setSupervisorFile] = useState<File | null>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await listSupervisorFeedbackApi();
      setReviews(data.reviews);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const data = await fetchSupervisorFeedbackApi(id);
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load analysis");
      setAnalysis(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else setAnalysis(null);
  }, [selectedId, loadDetail]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!supervisorFile) {
      setError("Upload the document your supervisor sent back (PDF, DOCX, or TXT).");
      return;
    }
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("supervisorFile", supervisorFile);
    if (studentFile) form.append("studentFile", studentFile);
    if (title.trim()) form.append("title", title.trim());
    if (supervisorName.trim()) form.append("supervisorName", supervisorName.trim());
    form.append("portal", portalId);

    try {
      const data = await uploadSupervisorFeedbackApi(form);
      setReviews((prev) => [data.review, ...prev]);
      setSelectedId(data.review.id);
      setAnalysis(data.analysis);
      setStudentFile(null);
      setSupervisorFile(null);
      setTitle("");
      notifyDashboardStatsChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this supervisor feedback review?")) return;
    try {
      await deleteSupervisorFeedbackApi(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setAnalysis(null);
      }
      notifyDashboardStatsChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const selected = reviews.find((r) => r.id === selectedId);

  return (
    <>
      <ModuleHeader
        title="Supervisor & Collaboration"
        description="For students whose university does not use this platform — upload your supervisor’s returned document, compare it with your draft, and get a summary of changes plus recommended fixes."
        icon={Users}
        moduleId="collaboration"
      />
      <ModuleWorkspace>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">
          Works with external supervisors and any institution. Upload the{" "}
          <strong>marked or revised file from your supervisor</strong> (required). Optionally
          upload <strong>your draft before their edits</strong> for a precise change-by-change
          comparison.
        </p>

        {error && (
          <div className="mb-6 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-600" />
                Upload supervisor feedback
              </CardTitle>
              <form onSubmit={handleUpload} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Title (optional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                    placeholder="e.g. Chapter 2 — Methodology review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Supervisor name (optional)
                  </label>
                  <input
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                    placeholder="Dr. Smith"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Your draft before feedback (optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="w-full text-sm"
                    onChange={(e) => setStudentFile(e.target.files?.[0] ?? null)}
                  />
                  {studentFile && (
                    <p className="mt-1 text-xs text-muted">{studentFile.name}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-charcoal">
                    Supervisor’s returned document <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="w-full text-sm"
                    onChange={(e) => setSupervisorFile(e.target.files?.[0] ?? null)}
                  />
                  {supervisorFile && (
                    <p className="mt-1 text-xs text-muted">{supervisorFile.name}</p>
                  )}
                </div>
                <Button type="submit" disabled={uploading || !supervisorFile}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing changes…
                    </>
                  ) : (
                    "Analyze supervisor feedback"
                  )}
                </Button>
              </form>
            </Card>

            <Card className="mt-6">
              <CardTitle>Your reviews</CardTitle>
              {loadingList ? (
                <p className="mt-4 text-sm text-muted">Loading…</p>
              ) : reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted">
                  No uploads yet. Add a supervisor document to track changes and get revision
                  guidance.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {reviews.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.id)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                          selectedId === r.id
                            ? "border-brand-300 bg-brand-50"
                            : "border-line hover:bg-cream-50"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-charcoal">
                            {r.title}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDate(r.createdAt)}
                            {r.status === "complete" && " · Analyzed"}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <p className="mt-4 text-xs text-muted">
              If your institution later adopts this platform, live supervisor chat and approvals
              can be enabled alongside this upload workflow.
            </p>
          </div>

          <div className="lg:col-span-3">
            {!selectedId ? (
              <Card className="flex min-h-[320px] flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted" />
                <p className="mt-4 max-w-sm text-sm text-muted">
                  Select a review from the list or upload a supervisor document to see changes,
                  a summary, and recommended solutions.
                </p>
              </Card>
            ) : loadingDetail ? (
              <Card className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-charcoal">
                      {selected?.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {selected?.supervisorFileName}
                      {selected?.studentFileName && ` · compared with ${selected.studentFileName}`}
                      {selected?.supervisorName && ` · ${selected.supervisorName}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-red-700"
                    onClick={() => selectedId && handleDelete(selectedId)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>

                {analysis ? (
                  <>
                    <Card>
                      <CardTitle>Summary</CardTitle>
                      <p className="mt-3 text-sm leading-relaxed text-charcoal">
                        {analysis.summary}
                      </p>
                      {selected?.studentFileName && (
                        <p className="mt-3 text-xs text-muted">
                          Tracked changes: {analysis.diffStats.added} paragraph(s) added,{" "}
                          {analysis.diffStats.removed} removed (
                          {analysis.mode === "live" ? "AI + diff" : "diff"} analysis)
                        </p>
                      )}
                    </Card>

                    <Card>
                      <CardTitle>
                        Changes detected ({analysis.changes.length})
                      </CardTitle>
                      <ul className="mt-4 space-y-4">
                        {analysis.changes.map((c) => (
                          <li
                            key={c.id}
                            className={`rounded-xl border p-4 ${SEVERITY_STYLES[c.severity]}`}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-offwhite/80 px-2 py-0.5 text-xs font-semibold uppercase">
                                {c.category}
                              </span>
                              <span className="text-xs text-muted">{c.location}</span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-charcoal">
                              {c.supervisorChange}
                            </p>
                            <p className="mt-2 text-sm text-muted">
                              <span className="font-medium">Intent:</span> {c.intent}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Recommended solutions
                      </CardTitle>
                      <ul className="mt-4 space-y-4">
                        {analysis.solutions.map((s, i) => (
                          <li
                            key={`${s.changeId}-${i}`}
                            className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
                          >
                            <p className="flex gap-2 text-sm font-medium text-emerald-900">
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                              {s.recommendedAction}
                            </p>
                            {s.exampleRevision && (
                              <p className="mt-3 rounded-lg bg-offwhite p-3 text-sm leading-relaxed text-charcoal">
                                <span className="font-medium text-muted">Example: </span>
                                {s.exampleRevision}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <p className="text-sm text-muted">
                      {selected?.status === "failed"
                        ? "Analysis failed. Try uploading again or use DOCX/TXT if PDF extraction failed."
                        : "Analysis not available."}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </ModuleWorkspace>
    </>
  );
}
