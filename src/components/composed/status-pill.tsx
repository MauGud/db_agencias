"use client";

import { CheckCircle, PencilSimple, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { AgencyStatus } from "@/lib/pass/types";

const MAP: Record<
  AgencyStatus,
  { label: string; className: string; Icon: typeof CheckCircle }
> = {
  ready: {
    label: "Lista para cruzar",
    className: "bg-success/10 text-success",
    Icon: CheckCircle,
  },
  needs_review: {
    label: "Faltan datos",
    className: "bg-warning/15 text-warning-foreground",
    Icon: WarningCircle,
  },
  draft: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground",
    Icon: PencilSimple,
  },
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: AgencyStatus;
  label?: string;
  className?: string;
}) {
  const item = MAP[status];
  const Icon = item.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        item.className,
        className,
      )}
    >
      <Icon weight="fill" className="size-3.5" aria-hidden />
      {label ?? item.label}
    </span>
  );
}
