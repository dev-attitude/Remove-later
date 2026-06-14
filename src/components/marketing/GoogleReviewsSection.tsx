import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { COMPANY } from "@/lib/site-content";
import { StarRating } from "@/components/marketing/StarRating";
import { GoogleReviewsCarousel } from "@/components/marketing/GoogleReviewsCarousel";

export async function GoogleReviewsSection() {
  const data = await fetchGoogleReviews();
  const hasReviews = data.reviews.length > 0;

  return (
    <section id="reviews" className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="marketing-eyebrow">Client reviews</p>
            <h2 className="marketing-section-title">What our clients say</h2>
            <p className="mt-4 marketing-body">
              Real feedback from Google — swipe or use the arrows to browse reviews from our
              clients.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {data.rating != null && data.totalReviews > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <StarRating rating={data.rating} size="lg" />
                  <div>
                    <p className="text-2xl font-bold text-navy">{data.rating.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">
                      {data.totalReviews} Google review{data.totalReviews === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <a
              href={COMPANY.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-btn-primary shrink-0"
            >
              <Star className="h-4 w-4 fill-white/90" />
              Leave a review
            </a>
          </div>
        </div>

        {hasReviews ? (
          <GoogleReviewsCarousel reviews={data.reviews} totalReviews={data.totalReviews} />
        ) : data.live && data.totalReviews > 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <StarRating rating={data.rating ?? 5} size="lg" className="justify-center" />
            <p className="mt-4 text-lg font-semibold text-slate-900">
              {data.rating?.toFixed(1)} on Google · {data.totalReviews} review
              {data.totalReviews === 1 ? "" : "s"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Your business is rated on Google. Open your profile to read the full review and add
              more.
            </p>
            <a
              href={COMPANY.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-btn-primary mt-6 inline-flex"
            >
              Read &amp; leave reviews on Google
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <StarRating rating={5} size="lg" className="justify-center" />
            <p className="mt-4 text-lg font-semibold text-slate-900">
              Be among the first to review {COMPANY.shortName}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {data.live
                ? "We’re live on Google — share your experience after working with us."
                : "Google reviews will appear here once the Places API key is configured on the server."}
            </p>
            <a
              href={COMPANY.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-btn-primary mt-6 inline-flex"
            >
              Review us on Google
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Reviews from{" "}
          <a
            href={COMPANY.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 hover:underline"
          >
            Google
          </a>
          {hasReviews && data.placeName ? ` · ${data.placeName}` : null}
        </p>

        {data.rating != null && data.totalReviews > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                name: data.placeName,
                url: COMPANY.googleReviewUrl,
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: data.rating,
                  bestRating: 5,
                  worstRating: 1,
                  reviewCount: data.totalReviews,
                },
              }),
            }}
          />
        )}
      </div>
    </section>
  );
}
