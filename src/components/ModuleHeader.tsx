import type { LucideIcon } from "lucide-react";
import { ConnectedSystems } from "@/components/research/ConnectedSystems";

export function ModuleHeader({
  title,
  description,
  icon: Icon,
  moduleId,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  /** When set, shows linked APIs & capabilities from the research suite catalog */
  moduleId?: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-slate-600">{description}</p>
          {moduleId && <ConnectedSystems moduleId={moduleId} />}
        </div>
      </div>
    </header>
  );
}
