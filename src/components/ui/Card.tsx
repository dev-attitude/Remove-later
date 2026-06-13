import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "manage" | "flat";
};

export function Card({
  className,
  children,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variant === "manage" && "manage-card",
        variant === "flat" && "rounded-xl border border-slate-200/80 bg-white p-5",
        variant === "default" && "glass-card p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("font-display text-lg font-semibold tracking-tight text-slate-900", className)}>
      {children}
    </h3>
  );
}
