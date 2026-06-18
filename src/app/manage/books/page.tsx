"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Trash2, Upload } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  deleteUnderstandingBookApi,
  fetchUnderstandingBooksApi,
  uploadUnderstandingBookApi,
  type UnderstandingBookSummary,
} from "@/lib/client/api";
import { MAX_DIRECT_BOOK_UPLOAD_BYTES } from "@/lib/client/prepare-book-file";

export default function ManageBooksPage() {
  const [books, setBooks] = useState<UnderstandingBookSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<"extracting" | "uploading">("uploading");
  const [title, setTitle] = useState("");
  const [moduleScope, setModuleScope] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetchUnderstandingBooksApi()
      .then((d) => setBooks(d.books))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF, DOCX, or TXT file to upload.");
      return;
    }
    setError(null);
    setNotice(null);
    setUploading(true);
    setUploadPhase(
      file.size > MAX_DIRECT_BOOK_UPLOAD_BYTES && file.name.toLowerCase().endsWith(".pdf")
        ? "extracting"
        : "uploading"
    );
    try {
      const result = await uploadUnderstandingBookApi(file, {
        title: title.trim() || undefined,
        moduleScope: moduleScope.trim() || undefined,
      });

      setTitle("");
      setModuleScope("");
      if (fileRef.current) fileRef.current.value = "";
      if (result.notice) setNotice(result.notice);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadPhase("uploading");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this textbook? Students will no longer get content from it.")) return;
    try {
      await deleteUnderstandingBookApi(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
          Books & resources
        </h1>
        <p className="mt-1 text-sm text-muted">
          Platform textbooks power the Understanding module — every topic guide pulls real
          excerpts from these books for all students.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardTitle>Add a textbook</CardTitle>
          <form onSubmit={handleUpload} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted">
                File (PDF, DOCX, or TXT — max 25MB)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">
                Title (optional — defaults to file name)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Research Methodology, 4th Edition"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">
                Module scope (optional — limit to one module)
              </label>
              <input
                type="text"
                value={moduleScope}
                onChange={(e) => setModuleScope(e.target.value)}
                placeholder="e.g. understanding"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-offwhite transition hover:bg-brand-700 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading
                ? uploadPhase === "extracting"
                  ? "Extracting PDF text in browser…"
                  : "Uploading…"
                : "Upload textbook"}
            </button>
            <p className="text-xs text-muted">
              Text is extracted automatically and matched to topics. Scanned/image-only PDFs
              won&apos;t work — use text-based files. Large PDFs over ~4MB are converted to text
              in your browser before upload.
            </p>
          </form>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <CardTitle>
              Platform textbooks {books ? `(${books.length}/20)` : ""}
            </CardTitle>
          </div>
          {!books ? (
            <p className="p-5 text-sm text-muted">Loading textbooks…</p>
          ) : books.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              No textbooks yet. Upload your first book to enrich topic guides with book-based
              content.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {books.map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="flex min-w-0 gap-3">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal">{b.title}</p>
                      <p className="text-xs text-muted">
                        {b.fileName} · {Math.round(b.charCount / 1000)}k characters
                        {b.moduleScope ? ` · scope: ${b.moduleScope}` : " · all modules"} ·
                        added {new Date(b.createdAt).toLocaleDateString("en-NA")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${b.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
