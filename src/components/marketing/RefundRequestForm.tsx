"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const PRODUCT_TYPES = [
  { id: "business-consultation", label: "Business consultation" },
  { id: "business-plan", label: "Business plan / proposal / company profile" },
  { id: "business-registration", label: "Business registration or documents" },
  { id: "consulting", label: "IT consulting" },
  { id: "student-writing", label: "Student / assignment / research writing" },
  { id: "hosting", label: "Hosting, domain or email" },
  { id: "shop", label: "Shop order (gadgets / hardware)" },
  { id: "subscription", label: "Research App subscription" },
  { id: "other", label: "Other" },
] as const;

export function RefundRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [productType, setProductType] = useState("business-consultation");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          orderRef,
          paymentDate,
          amount: amount || undefined,
          productType,
          reason,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
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
        <p className="mt-4 font-semibold text-charcoal">Refund request submitted</p>
        <p className="mt-2 text-sm text-muted">
          We received your request and will reply to <strong>{email}</strong> within 2 business
          days.
        </p>
        <p className="mt-2 text-xs text-muted">
          Reference: {orderRef || "—"} · Keep this for your records.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-name" className="block text-sm font-medium text-charcoal">
            Full name *
          </label>
          <input
            id="r-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="r-email" className="block text-sm font-medium text-charcoal">
            Email *
          </label>
          <input
            id="r-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="r-phone" className="block text-sm font-medium text-charcoal">
          Phone
        </label>
        <input
          id="r-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="marketing-input mt-1"
          placeholder="+264 …"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-order" className="block text-sm font-medium text-charcoal">
            Order / invoice / quote reference *
          </label>
          <input
            id="r-order"
            required
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            className="marketing-input mt-1"
            placeholder="e.g. INV-2026-0042 or quote number"
          />
        </div>
        <div>
          <label htmlFor="r-date" className="block text-sm font-medium text-charcoal">
            Payment date *
          </label>
          <input
            id="r-date"
            type="date"
            required
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-type" className="block text-sm font-medium text-charcoal">
            What did you purchase? *
          </label>
          <select
            id="r-type"
            required
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="marketing-input mt-1"
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="r-amount" className="block text-sm font-medium text-charcoal">
            Amount paid (NAD)
          </label>
          <input
            id="r-amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="marketing-input mt-1"
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label htmlFor="r-reason" className="block text-sm font-medium text-charcoal">
          Reason for refund request *
        </label>
        <textarea
          id="r-reason"
          required
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="marketing-input mt-1 resize-y"
          placeholder="Please explain what happened and why you are requesting a refund. Include any relevant details (delivery issues, service not started, duplicate payment, etc.)."
        />
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Submitting this form does not guarantee a refund. Business consultation, business plans,
        and related business services are subject to a{" "}
        <strong>30% service charge</strong> on approved refunds (70% returned). See our{" "}
        <a href="#policy" className="text-royal hover:underline">
          refund policy
        </a>
        . Please contact us before initiating a chargeback.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className="marketing-btn-primary w-full justify-center">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit refund request"}
      </button>
    </form>
  );
}
