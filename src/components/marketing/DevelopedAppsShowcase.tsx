import Link from "next/link";
import { ExternalLink, ArrowRight, Globe, Layers, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { DEVELOPED_APPLICATIONS, type DevelopedApp, type DevelopedAppType } from "@/lib/site-content";

const TYPE_LABELS: Record<DevelopedAppType, string> = {
  website: "Website",
  "web-app": "Web application",
  platform: "Platform",
};

const TYPE_ICONS: Record<DevelopedAppType, typeof Globe> = {
  website: Globe,
  "web-app": Sparkles,
  platform: Layers,
};

function AppCard({ app }: { app: DevelopedApp }) {
  const Icon = TYPE_ICONS[app.type];
  const isExternal = app.external ?? false;

  return (
    <article
      className={`marketing-service-card group flex flex-col ${
        app.featured ? "border-charcoal/30 shadow-focusWarm ring-1 ring-charcoal/15 lg:col-span-2" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="marketing-icon-pill h-12 w-12">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {TYPE_LABELS[app.type]}
              {app.featured && " · Flagship"}
            </span>
            <h3 className="text-xl font-normal tracking-tight text-charcoal">{app.name}</h3>
          </div>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{app.description}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {app.highlights.map((h) => (
          <li
            key={h}
            className="rounded-full border border-line bg-cream-50 px-3 py-1 text-xs text-charcoal"
          >
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={app.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="marketing-btn-primary text-sm"
        >
          {app.type === "website" ? "Visit website" : "Open application"}
          {isExternal ? (
            <ExternalLink className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Link>
      </div>

      {app.accessLinks && app.accessLinks.length > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quick access
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {app.accessLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="rounded-lg border border-line bg-cream-50 px-3 py-1.5 text-xs font-medium text-charcoal transition hover:border-charcoal/30 hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function DevelopedAppsShowcase() {
  return (
    <section id="our-apps" className="scroll-mt-24">
      <p className="marketing-eyebrow">Our work</p>
      <h2 className="marketing-section-title">Apps & websites we&apos;ve built</h2>
      <p className="mt-3 max-w-2xl marketing-body">
        Explore live products developed by {BRAND.companyLegal}. Use them directly or ask us to build
        something similar for your business.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {DEVELOPED_APPLICATIONS.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Want a custom app or website like these?{" "}
        <Link href="/quote?package=business-website" className="font-medium text-charcoal underline underline-offset-2">
          Request a quote below
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="font-medium text-charcoal underline underline-offset-2">
          contact us
        </Link>
        .
      </p>
    </section>
  );
}
