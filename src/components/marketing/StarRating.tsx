import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function StarRating({ rating, max = 5, size = "md", className = "" }: StarRatingProps) {
  const clamped = Math.min(max, Math.max(0, rating));
  const full = Math.floor(clamped);
  const partial = clamped - full >= 0.5;

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${clamped} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < full || (i === full && partial);
        return (
          <Star
            key={i}
            className={`${SIZE[size]} ${filled ? "fill-amber-400 text-amber-400" : "text-offwhite"}`}
          />
        );
      })}
    </div>
  );
}
