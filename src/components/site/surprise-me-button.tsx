"use client";

import { useRouter } from "next/navigation";

export function SurpriseMeButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        const slug = slugs[Math.floor(Math.random() * slugs.length)];
        router.push(`/components/${slug}`);
      }}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-(--border) px-5 text-sm font-medium transition-all hover:bg-(--primary-muted) hover:border-(--primary)/30 active:scale-[0.98]"
    >
      <span aria-hidden>✦</span>
      Surprise Me
    </button>
  );
}
