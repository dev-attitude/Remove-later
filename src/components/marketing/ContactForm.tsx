"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
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
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-4 font-semibold text-white">Message sent</p>
        <p className="mt-2 text-sm text-slate-400">We&apos;ll reply to {email} soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="block text-sm font-medium text-slate-300">
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
          <label htmlFor="c-email" className="block text-sm font-medium text-slate-300">
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
        <label htmlFor="c-phone" className="block text-sm font-medium text-slate-300">
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
        <label htmlFor="c-subject" className="block text-sm font-medium text-slate-300">
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
        <label htmlFor="c-message" className="block text-sm font-medium text-slate-300">
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
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={loading} className="marketing-btn-primary w-full justify-center">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
      </button>
    </form>
  );
}
