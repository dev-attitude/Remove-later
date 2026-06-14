import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { COMPANY } from "@/lib/site-content";
import { StarRating } from "@/components/marketing/StarRating";

function ReviewCard({
  review,
}: {
  review: {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    relativeTime: string;
    profilePhotoUrl?: string;
  };
}) {
  const initials = review.authorName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {review.profilePhotoUrl ? (
          <Image
            src={review.profilePhotoUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials || "G"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{review.authorName}</p>
          {review.relativeTime && (
            <p className="text-xs text-slate-500">{review.relativeTime}</p>
          )}
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700 line-clamp-6">
        &ldquo;{review.text}&rdquo;
      </p>
    </article>
  );
}

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
              Real feedback from Google — updated automatically from our business profile.
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
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
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
