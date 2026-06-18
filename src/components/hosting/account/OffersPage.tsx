"use client";

import { useHostingAccount } from "@/lib/use-hosting-account";
import { daysUntil } from "@/lib/hosting-account-store";
import { AccountEmptyState, AccountPageHeader } from "@/components/hosting/account/AccountShared";

export function OffersPage() {
  const { account, loaded, redeemOffer } = useHostingAccount();

  if (!loaded) return null;
  if (!account) return <AccountEmptyState />;

  const active = account.offers.filter((o) => !o.redeemed);
  const redeemed = account.offers.filter((o) => o.redeemed);

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="My Offers"
        description="Promotions and discounts available on your account"
      />

      {active.length === 0 && redeemed.length === 0 ? (
        <p className="text-muted">No offers at this time.</p>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-navy">Available</h2>
              {active.map((o) => (
                <article
                  key={o.id}
                  className="rounded-xl border border-royal/25 bg-gradient-to-r from-brand-50 to-offwhite p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-royal">{o.discount}</p>
                      <h3 className="mt-1 font-bold text-navy">{o.title}</h3>
                      <p className="mt-1 text-sm text-muted">{o.detail}</p>
                      <p className="mt-2 text-xs text-muted">
                        Expires {new Date(o.expiresAt).toLocaleDateString()} ({daysUntil(o.expiresAt)}{" "}
                        days left)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => redeemOffer(o.id)}
                      className="marketing-btn-primary shrink-0 text-sm"
                    >
                      Redeem
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {redeemed.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-navy">Redeemed</h2>
              {redeemed.map((o) => (
                <article key={o.id} className="rounded-xl border border-line bg-cream-50 p-5 opacity-80">
                  <p className="text-xs font-bold uppercase text-muted">{o.discount}</p>
                  <h3 className="mt-1 font-semibold text-navy">{o.title}</h3>
                  <p className="mt-1 text-sm text-emerald-700">Redeemed — applied to your account</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
