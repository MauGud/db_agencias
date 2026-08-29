"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "bg-card text-card-foreground border-border shadow-md",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
