import { cn } from "@/lib/utils";

export function ModuleWorkspace({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  /** Use full width for reading-heavy modules (e.g. Research Understanding) */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        wide ? "w-full max-w-none p-6 md:p-10 lg:px-12 lg:py-10" : "p-8"
      )}
    >
      {children}
    </div>
  );
}
