import { RESEARCH_SUITE_SYSTEMS } from "@/lib/research-suite/catalog";
import { INTEGRATION_SOURCES } from "@/lib/integrations/registry";
import { config } from "@/lib/config";

function isConfigured(id: string): boolean {
  if (id === "openai") return config.openai.enabled();
  if (id === "grok") return config.xai.enabled();
  if (id === "gptzero") return config.aiDetection.gptzero.enabled();
  if (id === "core") return Boolean(process.env.CORE_API_KEY?.trim());
  const src = INTEGRATION_SOURCES.find((s) => s.id === id);
  if (src?.requiresKey) return Boolean(process.env[src.requiresKey]?.trim());
  return src?.apiEnabled ?? false;
}

export function ResearchSystemsPanel() {
  return (
    <section className="mt-16 rounded-2xl border border-line bg-offwhite p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">
        Powered by research-grade systems
      </h2>
      <p className="mt-2 max-w-3xl text-muted">
        Skyrapay Research Suite connects your assignments and thesis work to trusted APIs and
        tools — OpenAI, Grok-2-latest, OpenAlex, Crossref, CORE, Zotero, Turnitin workflows, and
        SPSS/JASP export support.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESEARCH_SUITE_SYSTEMS.map((sys) => {
          const live = isConfigured(sys.id);
          return (
            <div
              key={sys.id}
              className="rounded-xl border border-line bg-cream-50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-charcoal">{sys.label}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    live
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {live ? "Live" : "Link"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{sys.detail}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-muted">
        Configure API keys in Vercel (<code className="rounded bg-line px-1">OPENAI_API_KEY</code>,{" "}
        <code className="rounded bg-line px-1">XAI_API_KEY</code>,{" "}
        <code className="rounded bg-line px-1">CORE_API_KEY</code>, etc.) for full live
        connectivity. External tools like Zotero and Turnitin open in their official apps.
      </p>
    </section>
  );
}
