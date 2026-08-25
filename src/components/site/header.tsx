import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { Search } from "./search";
import { ScrimBadge } from "./scrim-mark";
import { components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";
import { publishedTools } from "@/lib/tools";
import { SITE_REPO } from "@/lib/site";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/icons", label: "Icons" },
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
    items.push({ title: t.name, href: `/tools/${t.slug}`, type: "Tool", description: t.tagline });
  }

  return items;
}

export function SiteHeader() {
  const searchItems = buildSearchItems();

  return (
    <header className="sticky top-0 z-50 border-b border-(--border) bg-(--background)/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ScrimBadge />
          <span>Scrim UI</span>
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
          {/* Every component page tells the reader to copy a file rather than
              install a package, so the repo is the only place they can check
              what they are copying. Icon-only, and sized to match the theme
              toggle it sits beside. */}
          <a
            href={SITE_REPO}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Scrim UI on GitHub"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-(--border) text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
            </svg>
          </a>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
