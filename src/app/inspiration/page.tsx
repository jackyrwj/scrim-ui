import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inspiration" };

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Inspiration</h1>
      <p className="mt-3 max-w-2xl text-lg text-(--muted-foreground)">
        UI pattern breakdowns of ChatGPT, Claude, Perplexity, Cursor and more. In progress.
      </p>
    </div>
  );
}
