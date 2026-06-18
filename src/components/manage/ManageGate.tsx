"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ManageAccessDenied({ email }: { email?: string | null }) {
  async function switchAccount() {
    await signOut({ redirect: false });
    window.location.href = "/business/login?callbackUrl=/manage";
  }

  return (
    <div className="manage-shell-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Staff access only</h1>
        <p className="mt-2 text-sm text-muted">
          Signed in as <strong>{email || "unknown"}</strong>. Business Manager is restricted to
          authorised staff accounts only (Erastus and Gazzy).
        </p>
        <Card variant="manage" className="mt-8 !p-6 text-left">
          <p className="text-sm text-muted">
            Sign in with your company owner or staff account to open clients, invoices, and
            services.
          </p>
        </Card>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={switchAccount}>
            Sign in as staff / owner
          </Button>
          <Link href="/research">
            <Button type="button" variant="secondary">
              Go to Research Suite
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
