"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Buildings, Car, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Logo } from "@/components/composed/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { href: "/agencias", label: "Agencias", icon: Buildings },
  { href: "/grupos", label: "Grupos", icon: Car },
];

export function AppShell({
  children,
  phaseLabel,
}: {
  children: ReactNode;
  phaseLabel: string;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-full bg-background">
      <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center px-5">
          <Link href="/agencias" className="outline-none">
            <Logo />
            <span className="sr-only">Inicio</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-sidebar-foreground",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/70",
                )}
              >
                <Icon weight="fill" className={cn("size-4", active && "text-primary")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">{phaseLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">Captura de agencias</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-border px-6">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cambiar tema"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun weight="fill" className="size-4 dark:hidden" />
            <Moon weight="fill" className="hidden size-4 dark:block" />
          </Button>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
