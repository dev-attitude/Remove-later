"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { BRAND } from "@/lib/brand";

export function ManageSignInPrompt() {
  const pathname = usePathname();
  const callback = encodeURIComponent(pathname || "/manage");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <Briefcase className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Skyrapay Business Manager</h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Sign in to manage clients, track service progress, and record income & expenses for{" "}
        {BRAND.companyLegal}.
      </p>
      <Card className="mt-8 w-full">
        <CardTitle className="text-base">Staff access only</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Use your Skyrapay admin account. After signing in you will return here automatically.
        </p>
        <Link href={`/login?callbackUrl=${callback}`} className="mt-4 block">
          <Button type="button" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm text-slate-500 underline">
          Back to website
        </Link>
      </Card>
    </div>
  );
}

export function ManageAccessDenied({ email }: { email?: string | null }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Access not allowed</h1>
      <p className="mt-2 text-center text-sm text-slate-600">
        Signed in as <strong>{email || "unknown"}</strong>, but this account is not authorised for
        business management.
      </p>
      <p className="mt-2 text-center text-xs text-slate-500">
        Ask the owner to add your email to <code className="rounded bg-slate-100 px-1">BUSINESS_ADMIN_EMAILS</code> on
        the server, or sign in with the company admin email.
      </p>
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
  );
}
