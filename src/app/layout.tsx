import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { PreviewMotion } from "@/components/site/preview-motion";
import { SiteFooter } from "@/components/site/footer";
import { GoogleAnalytics } from "@/components/site/google-analytics";
import { SITE_URL as BASE_URL, SITE_NAME } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    /* The head term first, the brand after it. The brand token does not
       rank; the descriptive half does, and SERP titles truncate around 60
       characters, so the words worth reading go where they survive. */
    default: "Copy-ready UI components for AI products — Scrim UI",
    template: "%s — Scrim UI",
  },
  description:
    "Beautiful, copy-ready UI patterns and components for AI products. Prompt inputs, streaming messages, tool calls, citations, agent states, reasoning and more.",
  verification: {
    google: "q9XeVxN3vnRIl6aeqoyMgat1_ehAk9hSGrAw0X5li2w",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
};

/**
 * Site-level structured data.
 *
 * Two nodes, linked by @id so they are one graph rather than two unrelated
 * blobs: the Organization is who publishes, the WebSite is what is published.
 * Emitted only from the root layout — repeating it per page would have every
 * page claim to be the site.
 *
 * No SearchAction. That markup promises a URL a search engine can hand a
 * query to, and this site's search is a client-side command palette with no
 * results route to point at. Claiming one would be a lie Google can check.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      description:
        "Free in-browser tools and copy-ready components for building AI product interfaces.",
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      name: SITE_NAME,
      url: BASE_URL,
      inLanguage: "en-US",
      publisher: { "@id": `${BASE_URL}/#organization` },
    },
  ],
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          /* JSON.stringify, not a template literal: the values are ours, but
             serialising by hand is how a stray quote becomes broken markup. */
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <PreviewMotion />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
