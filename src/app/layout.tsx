import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/layout/providers";
import { agenciesBackend, phaseLabel } from "@/lib/pass/config";
import { getPassDiagnostics } from "@/lib/pass/diagnostics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Captura de agencias · Nexcar",
  description: "Base de grupos automotrices y agencias para cruzar facturas en inspección documental.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const diagnostics = await getPassDiagnostics();
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Providers>
          <AppShell phaseLabel={phaseLabel(agenciesBackend())} notice={diagnostics.notice}>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
