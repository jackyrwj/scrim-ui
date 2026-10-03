import type { ReactNode } from "react";

export function CatalogHeader({ eyebrow, title, children }: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="max-w-2xl">
      <p className="mb-3 text-xs text-(--muted-foreground)">{eyebrow}</p>
      <h1 className="text-4xl font-medium tracking-[-0.035em]">{title}</h1>
      <p className="mt-4 text-base leading-7 text-pretty text-(--muted-foreground)">{children}</p>
    </header>
  );
}
