import { cn } from "@/lib/utils";

/** Isotipo geométrico de Nexcar — currentColor, para pintar con tokens. */
export function IsoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      aria-hidden
      fill="currentColor"
    >
      <path d="M4 4h7.2v24H4V4Zm16.8 0H28v24h-7.2V4Z" />
      <path d="M11.2 4 28 28h-7.2L4 4h7.2Z" />
    </svg>
  );
}

export function Logo({
  className,
  isoClassName,
  wordmarkClassName,
}: {
  className?: string;
  isoClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <IsoMark className={cn("text-primary", isoClassName)} />
      <span
        className={cn(
          "text-base font-semibold tracking-tight text-foreground",
          wordmarkClassName,
        )}
      >
        nexcar
      </span>
    </span>
  );
}
