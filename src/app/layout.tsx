import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { GoogleAnalytics } from "@/components/site/google-analytics";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-ui-resources.vercel.app"),
  title: {
    default: "AI UI Resources — UI patterns and components for AI products",
    template: "%s — AI UI Resources",
  },
  description:
    "Beautiful, copy-ready UI patterns and components for AI products. Prompt inputs, streaming messages, tool calls, citations, agent states, reasoning and more.",
  verification: {
    google: "q9XeVxN3vnRIl6aeqoyMgat1_ehAk9hSGrAw0X5li2w",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI UI Resources",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
