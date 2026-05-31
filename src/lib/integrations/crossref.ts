export type CrossrefWork = {
  title: string;
  authors: string;
  year: number;
  doi: string;
  journal?: string;
  type?: string;
  verified: boolean;
};

export async function lookupDoi(doi: string): Promise<CrossrefWork | null> {
  const clean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(clean)}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    message?: {
      title?: string[];
      author?: Array<{ given?: string; family?: string }>;
      published?: { "date-parts"?: number[][] };
      DOI?: string;
      "container-title"?: string[];
      type?: string;
    };
  };

  const msg = data.message;
  if (!msg) return null;

  const authors =
    msg.author
      ?.map((a) => `${a.given ?? ""} ${a.family ?? ""}`.trim())
      .filter(Boolean)
      .join("; ") ?? "Unknown";

  return {
    title: msg.title?.[0] ?? "Untitled",
    authors,
    year: msg.published?.["date-parts"]?.[0]?.[0] ?? new Date().getFullYear(),
    doi: msg.DOI ?? clean,
    journal: msg["container-title"]?.[0],
    type: msg.type,
    verified: true,
  };
}
