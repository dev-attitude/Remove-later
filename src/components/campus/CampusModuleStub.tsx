import { CheckCircle2 } from "lucide-react";

type Props = {
  title: string;
  description: string;
  features: string[];
};

export function CampusModuleStub({ title, description, features }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Phase 2 module — foundation and navigation are live; full workflows ship in upcoming releases.
      </p>
    </div>
  );
}
