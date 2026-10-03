"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNav } from "@/lib/nav";

export function PrimaryNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 text-[13px] xl:flex">
      {siteNav.filter((item) => item.href !== "/pro").map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-2 transition-colors hover:text-(--foreground) ${active ? "bg-(--primary-muted) font-medium text-(--foreground)" : "text-(--muted-foreground)"}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
