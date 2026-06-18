import { Archive, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const THESES = [
  { title: "Telemedicine adoption in rural Ghana", dept: "Public Health", year: 2024, doi: "10.1234/gm.2024.001" },
  { title: "Blockchain in supply chain management", dept: "IT", year: 2023, doi: "10.1234/gm.2023.088" },
];

export default function RepositoryPage() {
  return (
    <>
      <ModuleHeader
        title="Research Repository"
        description="Department archive, thesis upload, search, DOI generation, and publication management."
        icon={Archive}
      />
      <ModuleWorkspace>
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              className="w-full rounded-lg border border-line py-2 pl-10 pr-3 text-sm"
              placeholder="Search repository…"
            />
          </div>
          <Button>Upload thesis</Button>
        </div>
        {THESES.map((t) => (
          <Card key={t.doi} className="mb-3 !p-4">
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-muted">
              {t.dept} · {t.year} · DOI: {t.doi}
            </p>
          </Card>
        ))}
      </ModuleWorkspace>
    </>
  );
}
