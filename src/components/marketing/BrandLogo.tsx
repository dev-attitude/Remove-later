import Image from "next/image";
import { COMPANY } from "@/lib/site-content";

type BrandLogoProps = {
  /** Tailwind height class, e.g. h-14 */
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Parent already provides a white pad (e.g. navy header/footer) */
  onDark?: boolean;
};

/**
 * Logo file has an opaque white background — pad with white when on dark surfaces.
 */
export function BrandLogo({
  className = "h-14 w-auto",
  width = 200,
  height = 72,
  priority = false,
  onDark = false,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex shrink-0 ${onDark ? "" : "bg-offwhite"}`}>
      <Image
        src="/logo.png"
        alt={COMPANY.name}
        width={width}
        height={height}
        className={`object-contain ${className}`}
        priority={priority}
      />
    </span>
  );
}
