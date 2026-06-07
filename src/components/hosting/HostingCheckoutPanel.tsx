"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useHostingCart } from "@/lib/hosting-cart-context";
import { formatHostingPeriod, type HostingDemoAccount } from "@/lib/hosting-demo";
import { normalizeClientAccount, saveClientAccount } from "@/lib/hosting-account-store";
import { useHostingCurrency } from "@/lib/hosting-currency-context";

export function HostingCheckoutPanel() {
  const router = useRouter();
  const { items, totals, clearCart, itemCount } = useHostingCart();
  const { formatPrice } = useHostingCurrency();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ orderId: string; account: HostingDemoAccount } | null>(
    null
  );

  if (itemCount === 0 && !success) {
    return (
      <p className="text-slate-600">
        Your cart is empty.{" "}
        <Link href="/hosting/plans" className="font-medium text-royal underline">
          Add a plan
        </Link>{" "}
        first.
      </p>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-xl font-bold text-navy">Order placed!</h2>
        <p className="mt-2 text-slate-600">
          Order <strong>{success.orderId}</strong> — we&apos;ve started provisioning. Our team will
          email payment instructions shortly. Open your client account to track progress.
        </p>
        <button
          type="button"
          onClick={() => router.push("/hosting/dashboard")}
          className="marketing-btn-primary mt-6"
        >
          Open my account
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hosting/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, items, notes }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        account?: HostingDemoAccount;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.account && data.orderId) {
        const fullAccount = normalizeClientAccount(data.account as HostingDemoAccount);
        saveClientAccount(fullAccount);
        clearCart();
        setSuccess({ orderId: data.orderId, account: data.account });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-navy">Your details</h2>
        <div>
          <label htmlFor="hosting-name" className="block text-sm font-medium text-navy">
            Full name *
          </label>
          <input
            id="hosting-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="hosting-email" className="block text-sm font-medium text-navy">
            Email *
          </label>
          <input
            id="hosting-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="marketing-input mt-1"
          />
        </div>
        <div>
          <label htmlFor="hosting-phone" className="block text-sm font-medium text-navy">
            Phone / WhatsApp
          </label>
          <input
            id="hosting-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="marketing-input mt-1"
            placeholder="+264 81 123 4567"
          />
        </div>
        <div>
          <label htmlFor="hosting-notes" className="block text-sm font-medium text-navy">
            Notes
          </label>
          <textarea
            id="hosting-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="marketing-input mt-1 resize-y"
            placeholder="Existing website to migrate, preferred domain spelling…"
          />
        </div>
      </div>

      <div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Checkout</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.lineId} className="flex justify-between text-slate-700">
                <span>{item.name}</span>
                <span className="font-medium">
                  {formatPrice(item.price, formatHostingPeriod(item.period))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold text-navy">
            <span>Due today</span>
            <span>{formatPrice(totals.firstInvoice)}</span>
          </div>
          <p className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-slate-700">
            After you submit, our team confirms your order and sends payment details (EFT, card, or
            mobile money) within one business day. Your cPanel login is emailed once setup is complete.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="marketing-btn-primary mt-4 w-full justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order…
              </>
            ) : (
              "Place order"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
