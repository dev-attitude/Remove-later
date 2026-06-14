import { BRAND } from "@/lib/brand";
import { COMPANY } from "@/lib/site-content";
import { getSiteUrl } from "@/lib/site-url";

export function SeoJsonLd() {
  const url = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}/#organization`,
    name: BRAND.companyLegal,
    alternateName: BRAND.companyName,
    description: BRAND.tagline,
    url,
    email: COMPANY.email,
    telephone: COMPANY.phones,
    areaServed: {
      "@type": "Country",
      name: "Namibia",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Windhoek",
      addressCountry: "NA",
      postOfficeBoxNumber: "5141",
      addressRegion: "Divundu",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    sameAs: [COMPANY.googleReviewUrl],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: BRAND.companyName,
    description: BRAND.tagline,
    publisher: { "@id": `${url}/#organization` },
    inLanguage: "en-NA",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([organization, website]),
      }}
    />
  );
}
