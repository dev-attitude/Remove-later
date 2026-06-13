"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogIn, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { BRAND } from "@/lib/brand";

export function ManageSignInPrompt() {
  const pathname = usePathname();
  const callback = encodeURIComponent(pathname || "/manage");

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
            Sign in to manage clients, services, finances, and operations for {BRAND.companyLegal}.
          </p>
        </div>
        <Card variant="manage" className="!p-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Briefcase className="h-5 w-5" />
          </div>
          <CardTitle className="text-base">Staff access only</CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Use your Skyrapay admin account. After signing in you will return here automatically.
          </p>
          <Link href={`/login?callbackUrl=${callback}`} className="mt-6 block">
            <Button type="button" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Button>
          </Link>
          <Link href="/" className="mt-4 block text-center text-sm font-medium text-slate-500 hover:text-brand-700">
            Back to website
          </Link>
        </Card>
      </div>
    </div>
  );
}

export function ManageAccessDenied({ email }: { email?: string | null }) {
  return (
    <div className="manage-shell-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Access not allowed</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <strong>{email || "unknown"}</strong>, but this account is not authorised for
          business management.
        </p>
        <Card variant="manage" className="mt-8 !p-6 text-left">
          <p className="text-sm text-slate-600">
            Ask the owner to add your email to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">BUSINESS_ADMIN_EMAILS</code> on
            the server, or sign in with the company admin email.
          </p>
        </Card>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/research">
            <Button type="button" variant="secondary">
              Go to Research Suite
            </Button>
          </Link>
          <Link href="/">
            <Button type="button" variant="ghost">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
