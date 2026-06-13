"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { BRAND } from "@/lib/brand";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/manage")) return "/manage";
  return raw;
}

export function BusinessManagerLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/manage/session");
        if (!cancelled && res.ok) {
          router.replace(callbackUrl);
          return;
        }
      } catch {
        /* not signed in */
      }
      if (!cancelled) setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, callbackUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    const check = await fetch("/api/manage/session");
    if (!check.ok) {
      await signOut({ redirect: false });
      setLoading(false);
      setError(
        "This account does not have Business Manager access. Use your company owner or staff admin account."
      );
      return;
    }

    setLoading(false);
    router.push(callbackUrl);
    router.refresh();
  }

  if (checkingSession) {
    return (
      <div className="manage-shell-bg flex min-h-screen items-center justify-center px-4 py-12">
        <p className="text-sm text-slate-500">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="manage-shell-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/brand/skyrapay-logo.png"
            alt={BRAND.companyLegal}
            width={160}
            height={48}
            className="mx-auto h-12 w-auto"
            priority
          />
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900">
            Business Manager
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Sign in to manage clients, services, invoices, and operations for {BRAND.companyLegal}.
          </p>
        </div>
        <Card variant="manage" className="!p-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Briefcase className="h-5 w-5" />
          </div>
          <CardTitle className="text-base">Staff & owner sign in</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            For company owners and authorised staff only. You will go straight to your dashboard
            after signing in.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Signing in…" : "Sign in to Business Manager"}
            </Button>
          </form>
          <Link href="/" className="mt-4 block text-center text-sm font-medium text-slate-500 hover:text-brand-700">
            Back to website
          </Link>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-500">
          Students and research app users{" "}
          <Link href="/login" className="font-medium text-brand-600 underline">
            sign in here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
