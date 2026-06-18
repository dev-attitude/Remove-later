"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { PORTALS, type PortalId } from "@/lib/portals";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<PortalId>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const reg = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, portal }),
    });

    if (!reg.ok) {
      const data = await reg.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push(`/${portal}`);
    router.refresh();
  }

  const registerable = Object.values(PORTALS).filter((p) => p.id !== "developer");

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
      <Card className="w-full max-w-md">
        <CardTitle>Create account</CardTitle>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Portal</label>
            <select
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={portal}
              onChange={(e) => setPortal(e.target.value as PortalId)}
            >
              {registerable.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password (min 8 characters)</label>
            <input
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
