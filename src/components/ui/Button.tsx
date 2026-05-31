"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50",
        variant === "primary" &&
          "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
        variant === "secondary" &&
          "bg-slate-100 text-slate-800 hover:bg-slate-200",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100",
        variant === "outline" &&
          "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
