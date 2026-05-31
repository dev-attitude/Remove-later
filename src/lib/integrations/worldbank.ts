export type WorldBankIndicator = {
  id: string;
  name: string;
  source: string;
  value?: string;
  date?: string;
};

export async function searchWorldBank(
  query: string,
  limit = 5
): Promise<WorldBankIndicator[]> {
  const url = `https://api.worldbank.org/v2/indicator?format=json&per_page=${limit}&q=${encodeURIComponent(query)}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = (await res.json()) as [
    unknown,
    Array<{ id?: string; name?: string; sourceNote?: string }> | undefined,
  ];

  const items = data[1] ?? [];
  return items.map((item) => ({
    id: item.id ?? "",
    name: item.name ?? "Indicator",
    source: "World Bank Open Data",
    value: item.sourceNote?.slice(0, 200),
  }));
}
