import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

const MARKETING_PAGES: SitemapEntry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/hosting", priority: 0.88, changeFrequency: "weekly" },
  { path: "/hosting/domains", priority: 0.86, changeFrequency: "weekly" },
  { path: "/hosting/plans", priority: 0.86, changeFrequency: "weekly" },
  { path: "/hosting/dashboard", priority: 0.84, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.85, changeFrequency: "weekly" },
  { path: "/quote", priority: 0.85, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.75, changeFrequency: "monthly" },
  { path: "/research", priority: 0.7, changeFrequency: "weekly" },
  { path: "/campus", priority: 0.88, changeFrequency: "weekly" },
  { path: "/campus/meyfield", priority: 0.85, changeFrequency: "weekly" },
  { path: "/campus/unam-demo", priority: 0.82, changeFrequency: "weekly" },
  { path: "/campus/nursing-demo", priority: 0.82, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = MARKETING_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const servicePages: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${base}/services/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: service.slug === "student-assistance" || service.slug === "it-consulting" ? 0.85 : 0.8,
  }));

  return [...staticPages, ...servicePages];
}
