"use client";

import { useState } from "react";
import {
  getPortal,
  portalPath,
  type PortalId,
} from "@/lib/portals";
import { PortalTierPrice } from "@/components/portal/PortalTierPrice";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, Check } from "lucide-react";
import Link from "next/link";
import { createCheckout } from "@/lib/client/api";

export function SubscriptionPage({ portalId }: { portalId: PortalId }) {
  const portal = getPortal(portalId)!;
  const [selected, setSelected] = useState(portal.subscriptions.find((s) => s.highlighted)?.id ?? portal.subscriptions[0]?.id);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubscribe() {
    if (!selected) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await createCheckout(portalId, selected);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setMessage(result.message || "Billing runs in demo mode until Stripe is configured.");
    } catch {
      setMessage("Could not start checkout. Sign in and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-brand-600">
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Subscription</span>
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold text-charcoal">
          {portal.name} — Plans
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Monthly billing per user role. Cancel anytime. Institution plans can be invoiced annually.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {portal.subscriptions.map((tier) => (
          <Card
            key={tier.id}
            className={`relative cursor-pointer transition ${
              selected === tier.id
                ? "border-2 border-brand-500 ring-2 ring-brand-500/20"
                : "hover:border-line"
            } ${tier.highlighted ? "border-brand-200" : ""}`}
            onClick={() => setSelected(tier.id)}
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-4 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-offwhite">
                Popular
              </span>
            )}
            <CardTitle>{tier.name}</CardTitle>
            <p className="mt-2 text-3xl font-bold text-brand-600">
              <PortalTierPrice tier={tier} />
            </p>
            <p className="mt-2 text-sm text-muted">{tier.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-charcoal">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={handleSubscribe} disabled={loading}>
          {loading
            ? "Redirecting…"
            : `Subscribe to ${portal.subscriptions.find((s) => s.id === selected)?.name}`}
        </Button>
        {message && <p className="text-sm text-amber-800">{message}</p>}
        <p className="text-sm text-muted">
          Live billing when Stripe keys are set in <code className="rounded bg-line px-1">.env</code>
        </p>
        <Link href={portalPath(portalId)} className="text-sm text-brand-600 underline">
          Back to dashboard
        </Link>
      </div>

      <Card className="mt-10 bg-cream-50">
        <CardTitle>Access on every device</CardTitle>
        <p className="mt-2 text-sm text-muted">
          All paid plans include web access. Pro tiers include mobile and desktop apps.
        </p>
        <Link href="/download">
          <Button className="mt-4" variant="outline">
            View download options
          </Button>
        </Link>
      </Card>
    </div>
  );
}
