import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Structured extraction",
  description: "A form that fills itself in, field by field, as the model produces it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
