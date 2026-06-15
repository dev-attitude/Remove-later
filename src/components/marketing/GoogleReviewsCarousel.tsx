"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { GoogleReview } from "@/lib/google-reviews";
import { COMPANY } from "@/lib/site-content";
import { StarRating } from "@/components/marketing/StarRating";

function ReviewCard({ review }: { review: GoogleReview }) {
  const initials = review.authorName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const displayText =
    review.text === "Left a star rating on Google."
      ? "Highly rated on Google — thank you for the recommendation."
      : review.text;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {review.profilePhotoUrl ? (
          <Image
            src={review.profilePhotoUrl}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
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
      <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{displayText}&rdquo;</p>
      {review.authorUrl && (
        <a
          href={review.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
        >
          View on Google
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </article>
  );
}

type GoogleReviewsCarouselProps = {
  reviews: GoogleReview[];
  totalReviews: number;
};

export function GoogleReviewsCarousel({ reviews, totalReviews }: GoogleReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = reviews.length;
  const maxIndex = Math.max(0, slideCount - 1);
  const showControls = slideCount > 1;

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || slideCount === 0) return;

      const clamped = Math.max(0, Math.min(index, maxIndex));
      const slide = track.children[clamped] as HTMLElement | undefined;
      if (slide) {
        track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
      }
      setActiveIndex(clamped);
    },
    [maxIndex, slideCount]
  );

  useEffect(() => {
    if (!showControls) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = current >= maxIndex ? 0 : current + 1;
        const track = trackRef.current;
        const slide = track?.children[next] as HTMLElement | undefined;
        slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        return next;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [showControls, maxIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const slides = Array.from(track.children) as HTMLElement[];
      if (!slides.length) return;
      const scrollLeft = track.scrollLeft;
      let nearest = 0;
      let minDist = Infinity;
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });
      setActiveIndex(Math.min(nearest, maxIndex));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [maxIndex, slideCount]);

  if (slideCount === 0) return null;

  return (
    <div className="mt-10">
      <div className="relative mx-auto max-w-2xl">
        {showControls && (
          <>
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:opacity-30 sm:-left-12"
            >
              <ChevronLeft className="h-5 w-5 text-navy" />
            </button>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex >= maxIndex}
              className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:bg-slate-50 disabled:opacity-30 sm:-right-12"
            >
              <ChevronRight className="h-5 w-5 text-navy" />
            </button>
          </>
        )}

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review) => (
            <div key={review.id} className="w-full shrink-0 snap-start">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {reviews.map((review, i) => (
            <button
              key={review.id}
              type="button"
              aria-label={`Go to review by ${review.authorName}`}
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-brand-600" : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}

      {totalReviews > reviews.length && (
        <p className="mt-6 text-center text-sm text-slate-600">
          Showing {reviews.length} of {totalReviews} Google reviews on our site.{" "}
          <Link
            href={COMPANY.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-600 hover:underline"
          >
            Read all on Google
          </Link>
        </p>
      )}
    </div>
  );
}
