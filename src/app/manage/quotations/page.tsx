"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Mail, Plus, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { StatusPill } from "@/components/manage/StatusPill";
import { formatNad } from "@/lib/business-manage";
import { calculateQuotationTotals, VAT_RATE } from "@/lib/quotation";

type ClientOption = { id: string; name: string; email: string | null; company: string | null };

type QuotationRow = {
  id: string;
  quoteNumber: string;
  title: string;
  subtotalExVat: number;
  vatAmount: number;
  totalInclVat: number;
  status: string;
  emailSent: boolean;
  emailError: string | null;
  sentAt: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string | null; company: string | null };
};

type LineDraft = { description: string; quantity: string; unitPriceExVat: string };

const emptyLine = (): LineDraft => ({ description: "", quantity: "1", unitPriceExVat: "" });

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManageQuotationsPage() {
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(), emptyLine()]);

  const previewTotals = useMemo(() => {
    const items = lines
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity) || 0,
        unitPriceExVat: Number(l.unitPriceExVat) || 0,
      }))
      .filter((l) => l.description && l.quantity > 0);
    if (items.length === 0) return null;
    return calculateQuotationTotals(items, VAT_RATE);
  }, [lines]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        fetch("/api/manage/quotations"),
        fetch("/api/manage/clients"),
      ]);
      const qData = await qRes.json();
      const cData = await cRes.json();
      if (!qRes.ok) throw new Error(qData.error);
      if (!cRes.ok) throw new Error(cData.error);
      setQuotations(qData.quotations);
      setClients(cData.clients);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("clientId");
    if (cid) {
      setClientId(cid);
      setShowForm(true);
    }
  }, []);

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const items = lines
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity),
        unitPriceExVat: Number(l.unitPriceExVat),
      }))
      .filter((l) => l.description && l.quantity > 0 && l.unitPriceExVat >= 0);

    if (!clientId) {
      setError("Select a client.");
      setSubmitting(false);
      return;
    }
    if (items.length === 0) {
      setError("Add at least one line item with description, quantity, and price.");
      setSubmitting(false);
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (Number(validDays) || 30));

    try {
      const res = await fetch("/api/manage/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          items,
          notes: notes.trim() || undefined,
          validUntil: validUntil.toISOString(),
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const email = data.email as { ok?: boolean; error?: string; fallbackSent?: boolean } | null;
      if (email?.ok) {
        setSuccess(`Quotation ${data.quotation.quoteNumber} created and emailed to the client.`);
      } else if (email?.fallbackSent) {
        setSuccess(
          `Quotation ${data.quotation.quoteNumber} saved. ${email.error ?? "Copy sent to your inbox — forward to the client."}`
        );
      } else if (email?.error) {
        setSuccess(`Quotation ${data.quotation.quoteNumber} saved, but email failed: ${email.error}`);
      } else {
        setSuccess(`Quotation ${data.quotation.quoteNumber} created.`);
      }

      setShowForm(false);
      setTitle("");
      setNotes("");
      setLines([emptyLine(), emptyLine()]);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create quotation");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend(id: string) {
    setSendingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/manage/quotations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const email = data.email as { ok?: boolean; error?: string; fallbackSent?: boolean };
      if (email.ok) setSuccess("Quotation resent to client.");
      else setError(email.error ?? "Email failed");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resend failed");
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div>
      <ManagePageHeader
        title="Quotations"
        description="Generate branded quotations with 15% VAT — emailed automatically to your client."
        actions={
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            New quotation
          </Button>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </p>
      )}

      {showForm && (
        <Card variant="manage" className="mb-8">
          <CardTitle>Create &amp; send quotation</CardTitle>
          <p className="mt-1 text-xs text-muted">
            Line prices are <strong>excluding VAT</strong>. We add 15% VAT and email the total to
            the client with your Skyrapay logo.
          </p>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted">Client *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="manage-input mt-1"
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                      {c.email ? ` — ${c.email}` : " — no email"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Quotation title *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website hosting & domain package"
                  className="manage-input mt-1"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-muted">Line items (ex VAT) *</label>
                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, emptyLine()])}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  + Add line
                </button>
              </div>
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_80px_120px_auto]">
                    <input
                      placeholder="Description"
                      value={line.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                      className="rounded-lg border border-line px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, { quantity: e.target.value })}
                      className="rounded-lg border border-line px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit price (ex VAT)"
                      value={line.unitPriceExVat}
                      onChange={(e) => updateLine(i, { unitPriceExVat: e.target.value })}
                      className="rounded-lg border border-line px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {previewTotals && (
              <div className="rounded-lg border border-line bg-cream-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal (ex VAT)</span>
                  <span className="font-semibold">{formatNad(previewTotals.subtotalExVat)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted">VAT (15%)</span>
                  <span className="font-semibold">{formatNad(previewTotals.vatAmount)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-line pt-2 text-base">
                  <span className="font-bold text-charcoal">Total (incl. VAT)</span>
                  <span className="font-bold text-brand-700">
                    {formatNad(previewTotals.totalInclVat)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted">Valid for (days)</label>
                <input
                  type="number"
                  min="1"
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="manage-input mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Payment terms, delivery timeline…"
                  className="manage-input mt-1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Create & email to client"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading quotations…</p>
      ) : quotations.length === 0 ? (
        <Card variant="manage">
          <p className="text-sm text-muted">
            No quotations yet. Create one above — it will be emailed to your client with VAT
            breakdown and your company logo.
          </p>
        </Card>
      ) : (
        <div className="manage-table-wrap">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">Quote #</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3 text-right">Ex VAT</th>
                <th className="px-4 py-3 text-right">VAT</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-charcoal">
                    {q.quoteNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/manage/clients/${q.client.id}`} className="font-medium text-brand-700 hover:underline">
                      {q.client.name}
                    </Link>
                    <p className="text-xs text-muted">{q.client.email ?? "No email"}</p>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{q.title}</td>
                  <td className="px-4 py-3 text-right">{formatNad(q.subtotalExVat)}</td>
                  <td className="px-4 py-3 text-right">{formatNad(q.vatAmount)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatNad(q.totalInclVat)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={q.status} label={q.status} />
                    {q.emailError && (
                      <p className="mt-1 max-w-[140px] truncate text-[10px] text-red-600" title={q.emailError}>
                        {q.emailError}
                      </p>
                    )}
                    <p className="text-[10px] text-muted">{fmtDate(q.sentAt ?? q.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {q.client.email && (
                      <button
                        type="button"
                        disabled={sendingId === q.id}
                        onClick={() => resend(q.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1 text-xs font-semibold text-charcoal hover:bg-cream-50"
                      >
                        <Mail className="h-3 w-3" />
                        {sendingId === q.id ? "…" : "Resend"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-muted">
        <FileText className="h-3.5 w-3.5" />
        Quotations include your Skyrapay logo, 15% VAT, and company details. Requires email
        configured on the server (Resend or SMTP).
      </p>
    </div>
  );
}
