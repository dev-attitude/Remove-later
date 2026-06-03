"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookMarked, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { UNDERSTANDING_RESEARCH_TOPICS } from "@/lib/research-suite/understanding-topics";
import {
  deleteUnderstandingBookApi,
  fetchUnderstandingBooksApi,
  uploadUnderstandingBookApi,
  type UnderstandingBookSummary,
} from "@/lib/client/api";

export function UnderstandingBooksPanel({ onBooksChange }: { onBooksChange?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [books, setBooks] = useState<UnderstandingBookSummary[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [moduleScope, setModuleScope] = useState("");

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnderstandingBooksApi();
      setBooks(data.books);
      setCanManage(data.canManage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load textbooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      await uploadUnderstandingBookApi(file, {
        title: title.trim() || undefined,
        moduleScope: moduleScope || undefined,
      });
      setTitle("");
      await loadBooks();
      onBooksChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeBook(id: string) {
    try {
      await deleteUnderstandingBookApi(id);
      await loadBooks();
      onBooksChange?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove textbook");
    }
  }

  return (
    <Card className="mb-6 border-brand-100 bg-gradient-to-br from-white to-brand-50/30">
      <CardTitle className="flex items-center gap-2 !text-base">
        <BookMarked className="h-5 w-5 text-brand-600" />
        Course textbooks
      </CardTitle>

      {canManage ? (
        <p className="mt-2 text-sm text-slate-600">
          Upload research methods textbooks here once. <strong>All students</strong> will see
          definitions and explanations drawn from these books when they select any topic below.
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          Topic guides use the textbooks your institution has added below. Open a topic to read
          explanations from these books, then academic references under each guide.
        </p>
      )}

      {canManage && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Book title (optional)
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Research Methods in Practice"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            />
          </label>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            Limit to module (optional)
            <select
              value={moduleScope}
              onChange={(e) => setModuleScope(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">All modules</option>
              {UNDERSTANDING_RESEARCH_TOPICS.map((m) => (
                <option key={m.module} value={m.module}>
                  {m.module}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload textbook
              </>
            )}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading course library…
        </p>
      ) : books.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          {canManage
            ? "No textbooks uploaded yet. Add PDF or DOCX files (max 25MB each, up to 20 books)."
            : "No course textbooks have been added yet. Your administrator can upload books so topic guides use them."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {books.map((b) => (
            <li
              key={b.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{b.title}</p>
                <p className="text-xs text-slate-500">
                  {b.fileName} · {(b.charCount / 1000).toFixed(0)}k characters
                  {b.moduleScope
                    ? ` · ${b.moduleScope.replace(/^MODULE \d+: /, "")}`
                    : " · all modules"}
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => removeBook(b.id)}
                  className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${b.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
