"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Could not reset password.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardTitle>Invalid reset link</CardTitle>
        <p className="mt-2 text-sm text-muted">
          This link is missing or incomplete. Request a new password reset email.
        </p>
        <Link href="/forgot-password" className="mt-6 block">
          <Button type="button" className="w-full">
            Request new link
          </Button>
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardTitle>Password updated</CardTitle>
        <p className="mt-2 text-sm text-emerald-700">
          Your password has been changed. Redirecting you to sign in…
        </p>
        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-brand-600 underline">
          Sign in now
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardTitle>Choose a new password</CardTitle>
      <p className="mt-2 text-sm text-muted">Must be at least 8 characters.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-charcoal">New password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Confirm password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
      <Link href="/forgot-password" className="mt-4 block text-center text-sm text-muted underline">
        Request a new link
      </Link>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <p className="text-sm text-muted">Loading…</p>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
