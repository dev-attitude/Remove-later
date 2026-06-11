"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { SMARTCAMPUS } from "@/lib/campus/brand";

export default function CampusLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/campus/acacia-college";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-6">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <div className="mb-2 flex items-center gap-2 text-blue-700">
          <Building2 className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">{SMARTCAMPUS.productName}</span>
        </div>
        <CardTitle>Institutional portal sign in</CardTitle>
        <p className="mt-2 text-sm text-slate-600">
          Access the multi-tenant ERP demo — executive dashboards, student success AI, CRM, finance,
          LMS, and verification modules.
        </p>
        <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          <p className="text-sm font-medium">Demo accounts</p>
          {[
            ["Management (VC)", "campus@gmconsultations.com", "SmartCampus!Demo2026"],
            ["Student", "student@smartcampus.demo", "Student!Demo2026"],
            ["Registrar", "registrar@smartcampus.demo", "Staff!Demo2026"],
            ["Finance", "finance@smartcampus.demo", "Staff!Demo2026"],
            ["Lecturer", "lecturer@smartcampus.demo", "Staff!Demo2026"],
            ["Examinations", "exams@smartcampus.demo", "Staff!Demo2026"],
          ].map(([label, mail, pass]) => (
            <p key={mail}>
              <span className="font-medium">{label}:</span>{" "}
              <code className="rounded bg-white px-1">{mail}</code> /{" "}
              <code className="rounded bg-white px-1">{pass}</code>
            </p>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Enter SmartCampus 360"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm text-slate-600">
          <Link href="/campus" className="font-medium text-blue-600 hover:underline">
            Product overview (no login)
          </Link>
          <Link href="/" className="text-slate-500 hover:underline">
            Back to gmconsultations.com
          </Link>
        </div>
      </Card>
    </div>
  );
}
