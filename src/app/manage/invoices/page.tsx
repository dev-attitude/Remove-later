"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, FileText, Mail, Plus, Receipt, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ManagePageHeader } from "@/components/manage/ManagePageHeader";
import { StatusPill } from "@/components/manage/StatusPill";
import { formatNad } from "@/lib/business-manage";
import { calculateInvoiceTotals, computeBalanceDue, VAT_RATE } from "@/lib/invoice";

type ClientOption = { id: string; name: string; email: string | null; company: string | null };

type EngagementOption = {
  id: string;
  title: string;
  quotedAmount: number | null;
  paidAmount: number;
};

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  title: string;
  subtotalExVat: number;
  vatAmount: number;
  totalInclVat: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  emailSent: boolean;
  emailError: string | null;
  reminderEnabled: boolean;
  reminderIntervalDays: number;
  dueDate: string | null;
  nextReminderAt: string | null;
  lastReminderAt: string | null;
  sentAt: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string | null; company: string | null };
  engagement: { id: string; title: string } | null;
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

export default function ManageInvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [engagements, setEngagements] = useState<EngagementOption[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const [clientId, setClientId] = useState("");
  const [engagementId, setEngagementId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [amountPaid, setAmountPaid] = useState("0");
  const [dueDays, setDueDays] = useState("14");
  const [reminderDays, setReminderDays] = useState("3");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);

  const previewTotals = useMemo(() => {
    const items = lines
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity) || 0,
        unitPriceExVat: Number(l.unitPriceExVat) || 0,
      }))
      .filter((l) => l.description && l.quantity > 0);
    if (items.length === 0) return null;
    return calculateInvoiceTotals(items, VAT_RATE);
  }, [lines]);

  const previewBalance = useMemo(() => {
    if (!previewTotals) return null;
    return computeBalanceDue(previewTotals.totalInclVat, Number(amountPaid) || 0);
  }, [previewTotals, amountPaid]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, cRes, rRes] = await Promise.all([
        fetch("/api/manage/invoices"),
        fetch("/api/manage/clients"),
        fetch("/api/manage/invoice-reminders"),
      ]);
      const iData = await iRes.json();
      const cData = await cRes.json();
      const rData = rRes.ok ? await rRes.json() : { count: 0 };
      if (!iRes.ok) throw new Error(iData.error);
      if (!cRes.ok) throw new Error(cData.error);
      setInvoices(iData.invoices);
      setClients(cData.clients);
      setDueCount(rData.count ?? 0);
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
    const eid = params.get("engagementId");
    if (cid) {
      setClientId(cid);
      setShowForm(true);
    }
    if (eid) setEngagementId(eid);
  }, []);

  useEffect(() => {
    if (!clientId) {
      setEngagements([]);
      return;
    }
    fetch(`/api/manage/engagements?clientId=${clientId}`)
      .then((r) => r.json())
      .then((d) => setEngagements(d.engagements ?? []))
      .catch(() => setEngagements([]));
  }, [clientId]);

  useEffect(() => {
    if (!engagementId) return;
    const eng = engagements.find((e) => e.id === engagementId);
    if (!eng) return;
    setTitle(eng.title);
    setAmountPaid(String(eng.paidAmount ?? 0));
    if (eng.quotedAmount != null && eng.quotedAmount > 0) {
      setLines([
        {
          description: eng.title,
          quantity: "1",
          unitPriceExVat: String(eng.quotedAmount),
        },
      ]);
    }
  }, [engagementId, engagements]);

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

    if (!clientId || !title.trim() || items.length === 0) {
      setError("Client, title, and at least one line item are required.");
      setSubmitting(false);
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (Number(dueDays) || 14));

    try {
      const res = await fetch("/api/manage/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          engagementId: engagementId || undefined,
          title: title.trim(),
          items,
          amountPaid: Number(amountPaid) || 0,
          notes: notes.trim() || undefined,
          dueDate: dueDate.toISOString(),
          reminderEnabled,
          reminderIntervalDays: Number(reminderDays) || 3,
          invoiceType: Number(amountPaid) > 0 ? "balance" : "service",
          sendEmail: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create invoice");

      const email = data.email as { ok?: boolean; error?: string } | null;
      if (email?.ok) {
        setSuccess(`Invoice ${data.invoice.invoiceNumber} created and emailed. Balance due: ${formatNad(data.invoice.balanceDue)}`);
      } else if (email?.error) {
        setSuccess(`Invoice ${data.invoice.invoiceNumber} saved, but email failed: ${email.error}`);
      } else {
        setSuccess(`Invoice ${data.invoice.invoiceNumber} created.`);
      }

      setShowForm(false);
      setLines([emptyLine()]);
      setTitle("");
      setNotes("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendInvoice(id: string) {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/manage/invoices/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setSuccess("Invoice resent to client.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setActionId(null);
    }
  }

  async function sendReminder(id: string) {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/manage/invoices/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remind" }),
      });
      const data = await res.json();
      const email = data.email as { ok?: boolean; error?: string };
      if (!res.ok || !email.ok) throw new Error(email.error ?? data.error ?? "Reminder failed");
      setSuccess("Balance reminder sent to client.");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reminder failed");
    } finally {
      setActionId(null);
    }
  }

  async function sendAllDueReminders() {
    setActionId("all");
    try {
      const res = await fetch("/api/manage/invoice-reminders", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Sent ${data.result.sent} balance reminder(s).`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setActionId(null);
    }
  }

  async function recordPayment(id: string) {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    setActionId(id);
    try {
      const res = await fetch(`/api/manage/invoices/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_payment", amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Payment recorded. Balance: ${formatNad(data.invoice.balanceDue)}`);
      setPayId(null);
      setPayAmount("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading invoices…</p>;
  }

  return (
    <div>
      <ManagePageHeader
        title="Invoices"
        description={`Branded tax invoices with 15% VAT, balance due tracking, and automatic payment reminders every ${reminderDays} days until settled.`}
        actions={
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            New invoice
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

      {dueCount > 0 && (
        <Card variant="manage" className="mb-6 !border-amber-200 !bg-amber-50/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-amber-900">
              {dueCount} invoice{dueCount === 1 ? "" : "s"} with balance due — reminder ready to
              send
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={sendAllDueReminders}
              disabled={actionId === "all"}
            >
              <Bell className="mr-2 h-4 w-4" />
              {actionId === "all" ? "Sending…" : "Send all due reminders"}
            </Button>
          </div>
        </Card>
      )}

      {showForm && (
        <Card variant="manage" className="mb-8">
          <CardTitle>Create tax invoice</CardTitle>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">
              Line prices are <strong>excluding VAT</strong>. VAT at 15% is added automatically.
              Set amount already paid to invoice the <strong>balance due</strong> on ongoing
              services.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Client</span>
                <select
                  className="manage-input mt-1"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setEngagementId("");
                  }}
                  required
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.email ? ` — ${c.email}` : " — no email"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-slate-700">Linked service (optional)</span>
                <select
                  className="manage-input mt-1"
                  value={engagementId}
                  onChange={(e) => setEngagementId(e.target.value)}
                  disabled={!clientId}
                >
                  <option value="">None</option>
                  {engagements.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} — paid {formatNad(e.paidAmount)}
                      {e.quotedAmount != null ? ` / ${formatNad(e.quotedAmount)}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Invoice title / service</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Line items (ex VAT)</p>
              {lines.map((line, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <input
                    className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) => updateLine(i, { description: e.target.value })}
                  />
                  <input
                    className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: e.target.value })}
                  />
                  <input
                    className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Unit N$"
                    value={line.unitPriceExVat}
                    onChange={(e) => updateLine(i, { unitPriceExVat: e.target.value })}
                  />
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                + Add line
              </button>
            </div>

            {previewTotals && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <p>Subtotal (ex VAT): {formatNad(previewTotals.subtotalExVat)}</p>
                <p>VAT (15%): {formatNad(previewTotals.vatAmount)}</p>
                <p className="font-semibold">Total (incl. VAT): {formatNad(previewTotals.totalInclVat)}</p>
                <p className="mt-2 text-brand-800 font-bold">
                  Balance due: {formatNad(previewBalance ?? 0)}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Already paid (N$)</span>
                <input
                  className="manage-input mt-1"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Payment due in (days)</span>
                <input
                  className="manage-input mt-1"
                  type="number"
                  min="1"
                  value={dueDays}
                  onChange={(e) => setDueDays(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Remind every (days)</span>
                <input
                  className="manage-input mt-1"
                  type="number"
                  min="1"
                  max="30"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                />
                <span className="font-medium text-slate-700">Auto balance reminders</span>
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Notes</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <Button type="submit" disabled={submitting}>
              <Receipt className="mr-2 h-4 w-4" />
              {submitting ? "Sending…" : "Create & email invoice"}
            </Button>
          </form>
        </Card>
      )}

      {invoices.length === 0 ? (
        <Card variant="manage">
          <p className="text-sm text-slate-500">
            No invoices yet. Create one above — balance reminders will email automatically until
            paid.
          </p>
        </Card>
      ) : (
        <div className="manage-table-wrap">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Reminders</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-500">{inv.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/manage/clients/${inv.client.id}`} className="text-brand-700 hover:underline">
                      {inv.client.name}
                    </Link>
                    <p className="text-xs text-slate-500">{inv.client.email ?? "No email"}</p>
                  </td>
                  <td className="px-4 py-3">{formatNad(inv.totalInclVat)}</td>
                  <td className="px-4 py-3 font-semibold text-red-700">
                    {inv.balanceDue > 0 ? formatNad(inv.balanceDue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {inv.reminderEnabled && inv.balanceDue > 0 ? (
                      <>
                        Every {inv.reminderIntervalDays}d
                        <br />
                        Next: {fmtDate(inv.nextReminderAt)}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={inv.status} label={inv.status} />
                    {inv.emailError && (
                      <p className="mt-1 max-w-[120px] truncate text-[10px] text-red-600" title={inv.emailError}>
                        {inv.emailError}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {inv.client.email && (
                        <button
                          type="button"
                          onClick={() => resendInvoice(inv.id)}
                          disabled={actionId === inv.id}
                          className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Mail className="h-3 w-3" />
                          Resend
                        </button>
                      )}
                      {inv.balanceDue > 0 && inv.client.email && (
                        <button
                          type="button"
                          onClick={() => sendReminder(inv.id)}
                          disabled={actionId === inv.id}
                          className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                        >
                          <Bell className="h-3 w-3" />
                          Remind
                        </button>
                      )}
                      {inv.balanceDue > 0 && (
                        <>
                          {payId === inv.id ? (
                            <span className="inline-flex items-center gap-1">
                              <input
                                className="w-20 rounded border px-1 py-0.5 text-xs"
                                placeholder="N$"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => recordPayment(inv.id)}
                                className="text-xs font-semibold text-emerald-700"
                              >
                                Save
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setPayId(inv.id);
                                setPayAmount(String(inv.balanceDue));
                              }}
                              className="text-xs font-semibold text-emerald-700 hover:underline"
                            >
                              Record pay
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <FileText className="h-3.5 w-3.5" />
        Includes Skyrapay logo and 15% VAT. Balance reminders run daily via cron until the invoice
        is paid.
      </p>
    </div>
  );
}
