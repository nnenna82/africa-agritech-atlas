import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Bar from "@/components/Bar";

// The three Atlas fonts (see docs/04-design-system.md)
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const DESCRIPTION =
  "A living map of agricultural and infrastructure technology across all 54 African countries: who is building, who funds, who regulates, and where the real problems are.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Africa AgriTech Atlas", template: "%s · Africa AgriTech Atlas" },
  description: DESCRIPTION,
  // The picture and text shown when someone shares a link to the Atlas.
  openGraph: {
    type: "website",
    siteName: "Africa AgriTech Atlas",
    title: "Africa AgriTech Atlas",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "The Africa AgriTech Atlas home page with its map of Africa" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <Bar />
        <main id="main" className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pb-16 pt-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
