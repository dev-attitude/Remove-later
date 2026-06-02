import { getToolByModuleId } from "@/lib/research-suite/catalog";
import { getSource } from "@/lib/integrations/registry";

export function ConnectedSystems({ moduleId }: { moduleId: string }) {
  const tool = getToolByModuleId(moduleId);
  if (!tool) return null;

  const integrations = tool.integrationIds
    .map((id) => getSource(id))
    .filter(Boolean);

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Connected systems
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {integrations.map((s) => (
          <span
            key={s!.id}
            className="rounded-full border border-brand-200 bg-white px-2.5 py-0.5 text-xs font-medium text-brand-800"
          >
            {s!.name}
          </span>
        ))}
      </div>
      {tool.capabilities.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
          {tool.capabilities.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
