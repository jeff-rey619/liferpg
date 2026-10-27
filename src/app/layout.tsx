import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/AppShell";

// Hearth & Timber type roles: display, narrative body, HUD labels.
// Fonts are self-hosted (src/app/fonts.css + src/app/fonts/) so the build
// works offline — next/font/google requires network access.
export const metadata: Metadata = {
  title: "Life RPG",
  description: "Cozy, game-like life management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        "--font-bricolage": "'Bricolage Grotesque', ui-rounded, system-ui, sans-serif",
        "--font-quicksand": "'Quicksand', ui-rounded, system-ui, sans-serif",
        "--font-epilogue": "'Epilogue', system-ui, sans-serif",
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:border-2 focus:border-mahogany focus:bg-lamplight focus:px-3 focus:py-2 focus:text-mahogany"
        >
          Skip to main content
        </a>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
