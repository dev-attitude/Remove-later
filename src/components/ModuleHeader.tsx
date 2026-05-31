import type { LucideIcon } from "lucide-react";

export function ModuleHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-slate-600">{description}</p>
        </div>
      </div>
    </header>
  );
}
