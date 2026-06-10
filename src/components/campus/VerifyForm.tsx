"use client";

import { useState } from "react";

type Result = {
  valid: boolean;
  studentName?: string;
  qualification?: string;
  yearAwarded?: number;
  blockchainHash?: string;
  message?: string;
};

export function VerifyForm({ tenantSlug }: { tenantSlug: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/campus/verify?tenant=${encodeURIComponent(tenantSlug)}&code=${encodeURIComponent(code.trim())}`
      );
      const data = (await res.json()) as Result;
      setResult(data);
    } catch {
      setResult({ valid: false, message: "Verification service unavailable." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SC360-MEYFIELD-2024-DEMO"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Checking…" : "Verify"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            result.valid
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {result.valid ? (
            <>
              <p className="font-semibold">Credential verified</p>
              <p className="mt-2">{result.studentName}</p>
              <p>{result.qualification}</p>
              <p className="text-xs opacity-80">Awarded {result.yearAwarded}</p>
              {result.blockchainHash && (
                <p className="mt-2 break-all font-mono text-xs">Hash: {result.blockchainHash}</p>
              )}
            </>
          ) : (
            <p>{result.message ?? "No matching credential found."}</p>
          )}
        </div>
      )}
    </div>
  );
}
