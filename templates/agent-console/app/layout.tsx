import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent run console",
  description: "Multi-step tool use you can watch, interrupt and approve.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
