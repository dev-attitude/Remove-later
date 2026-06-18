import Link from "next/link";
import { DOWNLOAD_PLATFORMS } from "@/lib/portals";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Globe,
  Apple,
  Monitor,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  android: Smartphone,
  ios: Apple,
  macos: Apple,
  windows: Monitor,
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-line bg-offwhite px-6 py-8 md:px-12">
        <Link
          href="/research"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" /> Back to portals
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-charcoal">
          Download Skyrapay Research Suite
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Use the web app in any browser, or install native apps on your phone or computer.
          One account works across all platforms.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-12">
        <div className="space-y-8">
          {DOWNLOAD_PLATFORMS.map((platform) => {
            const Icon = ICONS[platform.id] ?? Laptop;
            return (
              <Card
                key={platform.id}
                id={platform.id}
                className="scroll-mt-24"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <CardTitle>{platform.name}</CardTitle>
                      <p className="text-sm font-medium text-muted">
                        {platform.devices}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  {platform.id === "web" ? (
                    <Link href="/research">
                      <Button>{platform.action}</Button>
                    </Link>
                  ) : (
                    <Button variant="secondary">{platform.action}</Button>
                  )}
                </div>
                {platform.id !== "web" && (
                  <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Store builds ship with your production release. Configure download URLs in{" "}
                    <code className="rounded bg-offwhite px-1">src/lib/portals.ts</code> and the
                    Developer Console.
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 bg-brand-50/50">
          <CardTitle>Install web app on mobile or laptop</CardTitle>
          <p className="mt-2 text-sm text-muted">
            On Chrome, Safari, or Edge: open Skyrapay Research in the browser → menu →{" "}
            <strong>Install app</strong> or <strong>Add to Home Screen</strong>. Works offline for
            saved PDFs (Student Pro and above).
          </p>
        </Card>
      </main>
    </div>
  );
}
