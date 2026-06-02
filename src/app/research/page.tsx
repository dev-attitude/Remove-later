import Link from "next/link";
import { PORTALS, DOWNLOAD_PLATFORMS } from "@/lib/portals";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  Download,
  Globe,
  ArrowRight,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { BrandLogo } from "@/components/marketing/BrandLogo";
import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import { portalPath } from "@/lib/portals";
import {
  RESEARCH_SUITE_PRIMARY_TOOLS,
  RESEARCH_SUITE_EXTENDED_TOOLS,
} from "@/lib/research-suite/catalog";
import { ResearchSuiteToolGrid } from "@/components/research/ResearchSuiteToolGrid";
import { ResearchSystemsPanel } from "@/components/research/ResearchSystemsPanel";

export const metadata = {
  title: `${BRAND.productName} | Portals`,
  description: "Multi-portal AI research platform for institutions, students, and analysts.",
};

export default function ResearchHubPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="gradient-hero px-6 py-12 text-white md:px-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {COMPANY.name} home
          </Link>
          <div className="flex items-center gap-4">
            <BrandLogo className="h-12 w-auto" width={160} height={56} />
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                {BRAND.productName}
              </h1>
              <p className="text-white/90">Choose your portal to sign in</p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-white/85">
          One platform — four dedicated portals. Use on the web or download apps for
          Android, iPhone, MacBook, and Windows.
        </p>
        <Link
          href="/download"
          className="mx-auto mt-8 inline-flex max-w-6xl items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
        >
          <Download className="h-4 w-4" />
          Download apps for your device
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Select your portal
        </h2>
        <p className="mt-2 text-slate-600">
          Each portal has its own tools, roles, and monthly subscription plans.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {Object.values(PORTALS).map((portal) => {
            const Icon = portal.icon;
            const from = portal.subscriptions[0];
            return (
              <Link key={portal.id} href={`/${portal.id}`}>
                <Card className="h-full transition hover:border-brand-300 hover:shadow-lg">
                  <div
                    className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${portal.accent} p-3 text-white`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="!text-xl">{portal.name}</CardTitle>
                  <p className="mt-1 font-medium text-brand-600">{portal.tagline}</p>
                  <p className="mt-3 text-sm text-slate-600">{portal.description}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {portal.roles.slice(0, 3).join(" · ")}
                    {portal.roles.length > 3 ? " · …" : ""}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    From{" "}
                    {from.priceMonthly === "custom"
                      ? "custom pricing"
                      : from.priceMonthly === 0
                        ? "Free"
                        : `$${from.priceMonthly}/mo`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                    Enter portal <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 space-y-16">
          <ResearchSuiteToolGrid
            title="Core research & assignment tools"
            description="Each tool is wired to live APIs — OpenAI, Grok-2-latest, OpenAlex, Crossref, CORE, Zotero workflows, Turnitin-ready checks, and more. Start with 5 free full-service AI actions, then subscribe for unlimited access."
            tools={RESEARCH_SUITE_PRIMARY_TOOLS}
          />
          <ResearchSuiteToolGrid
            title="Extended research toolkit"
            description="Statistical analysis, journal matching, supervisor chat, surveys, and presentations — same integrated stack."
            tools={RESEARCH_SUITE_EXTENDED_TOOLS}
          />
          <ResearchSystemsPanel />
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap gap-3">
            <Link
              href={portalPath("student")}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Open Student Portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-brand-200 hover:text-brand-700"
            >
              Create account
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Globe className="h-6 w-6 text-brand-600" />
            Web or app — your choice
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DOWNLOAD_PLATFORMS.map((p) => (
              <Card key={p.id} className="!p-4 text-center">
                <CardTitle className="!text-sm">{p.name}</CardTitle>
                <p className="mt-1 text-xs text-slate-500">{p.devices}</p>
                <Link
                  href={p.href}
                  className="mt-3 inline-block text-xs font-medium text-brand-600 underline"
                >
                  {p.action}
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-8 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Academic integrity built in
          </span>
          <div className="flex gap-4">
            <Link href="/login" className="text-brand-600 hover:underline">
              Sign in
            </Link>
            <Link href="/register" className="text-brand-600 hover:underline">
              Register
            </Link>
            <Link href="/" className="text-slate-400 hover:text-slate-600">
              Company website →
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
