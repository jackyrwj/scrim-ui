import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { Search } from "./search";
import { components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";
import { publishedTools } from "@/lib/tools";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/resources", label: "Resources" },
  { href: "/inspiration", label: "Inspiration" },
];

function buildSearchItems() {
  const items: { title: string; href: string; type: "Component" | "Pattern" | "Resource" | "Inspiration" | "Tool"; description?: string }[] = [];

  for (const c of components.filter((c) => c.status === "published")) {
    items.push({ title: c.name, href: `/components/${c.slug}`, type: "Component", description: c.description });
  }
  for (const p of patterns) {
    items.push({ title: p.name, href: `/patterns/${p.slug}`, type: "Pattern", description: p.description });
  }
  for (const r of resources.slice(0, 30)) {
    items.push({ title: r.name, href: r.url, type: "Resource", description: r.description });
  }
  for (const e of inspirationEntries) {
    items.push({ title: e.title, href: `/inspiration/${e.slug}`, type: "Inspiration", description: e.summary });
  }

  for (const t of publishedTools) {
    items.push({ title: t.name, href: `/tools/${t.slug}`, type: "Tool", description: t.searchDescription });
  }

  return items;
}

export function SiteHeader() {
  const searchItems = buildSearchItems();

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--foreground) text-(--background) text-xs font-bold">
            AI
          </span>
          <span>AI UI Resources</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-(--muted-foreground) md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-(--foreground)"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Search items={searchItems} />
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-(--muted-foreground) transition-colors hover:text-(--foreground) sm:block"
          >
            GitHub
          </a>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
