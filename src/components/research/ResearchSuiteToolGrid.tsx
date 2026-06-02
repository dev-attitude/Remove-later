import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { getModulesForPortal, portalPath } from "@/lib/portals";
import { getSource } from "@/lib/integrations/registry";
import type { ResearchToolDef } from "@/lib/research-suite/catalog";

function ToolCard({ tool, href }: { tool: ResearchToolDef; href: string }) {
  const mod = getModulesForPortal("student").find((m) => m.id === tool.moduleId);
  const Icon = mod?.icon;
  return (
    <Link href={href}>
      <Card className="flex h-full flex-col transition hover:border-brand-300 hover:shadow-md">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="rounded-lg bg-brand-100 p-2 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="!text-base">{tool.title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{tool.short}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {tool.integrationIds.slice(0, 4).map((id) => {
            const src = getSource(id);
            return (
              <span
                key={id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
              >
                {src?.name ?? id}
              </span>
            );
          })}
          {tool.integrationIds.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              +{tool.integrationIds.length - 4}
            </span>
          )}
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
          Open tool <ArrowRight className="h-3 w-3" />
        </span>
      </Card>
    </Link>
  );
}

export function ResearchSuiteToolGrid({
  tools,
  title,
  description,
}: {
  tools: ResearchToolDef[];
  title: string;
  description?: string;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-slate-600">{description}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard
            key={tool.moduleId}
            tool={tool}
            href={portalPath("student", tool.moduleId)}
          />
        ))}
      </div>
    </section>
  );
}
