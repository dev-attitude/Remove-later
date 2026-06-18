import { JUNE_PROMO } from "@/lib/pricing";

export function PromoBanner({ className = "" }: { className?: string }) {
  if (!JUNE_PROMO.active) return null;

  return (
    <div
      className={`marketing-chrome rounded-xl border border-offwhite/20 px-5 py-4 shadow-md ${className}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-sky">
        {JUNE_PROMO.badge} · {JUNE_PROMO.title}
      </p>
      <p className="mt-1 text-sm font-medium text-offwhite/95">{JUNE_PROMO.subtitle}</p>
    </div>
  );
}
