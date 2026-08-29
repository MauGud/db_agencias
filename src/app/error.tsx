"use client";

import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-4">
      <Warning weight="fill" className="size-8 text-primary" aria-hidden />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">No pudimos hablar con Pass</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
