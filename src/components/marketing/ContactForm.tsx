"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  BUSINESS_DOCUMENT_PACKAGES,
  BUSINESS_REGISTRATION_PACKAGES,
} from "@/lib/site-content";

export function ContactForm() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") ?? "";
  const serviceParam = searchParams.get("service") ?? "";

  const allBizPackages = [...BUSINESS_REGISTRATION_PACKAGES, ...BUSINESS_DOCUMENT_PACKAGES];
  const matchedPkg = allBizPackages.find((p) => p.id === packageId);

  const defaultSubject =
    serviceParam === "registration"
      ? "business"
      : serviceParam === "documents"
        ? "business"
        : "general";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(
    matchedPkg
      ? `I am interested in: ${matchedPkg.name} (${matchedPkg.price > 0 ? `N$ ${matchedPkg.price.toLocaleString()}` : "quote on request"}).\n\n`
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", name, email, phone, subject, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-4 font-semibold text-slate-900">Message sent</p>
        <p className="mt-2 text-sm text-slate-600">We&apos;ll reply to {email} soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="block text-sm font-medium text-slate-700">
            Name *
          </label>
          <input
            id="c-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="block text-sm font-medium text-slate-700">
            Email *
          </label>
          <input
            id="c-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-phone" className="block text-sm font-medium text-slate-700">
          Phone
        </label>
        <input
          id="c-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="marketing-input mt-1"
        />
      </div>
      <div>
        <label htmlFor="c-subject" className="block text-sm font-medium text-slate-700">
          Topic
        </label>
        <select
          id="c-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="marketing-input mt-1"
        >
          <option value="general">General inquiry</option>
          <option value="it">IT consulting</option>
          <option value="business">Business consulting</option>
          <option value="gadgets">Gadgets & hardware</option>
          <option value="development">System / software development</option>
          <option value="website">Website or app project</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="block text-sm font-medium text-slate-700">
          Message *
        </label>
        <textarea
          id="c-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="marketing-input mt-1 resize-y"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="marketing-btn-primary w-full justify-center">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
      </button>
    </form>
  );
}
