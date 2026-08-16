import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/resources", label: "Resources" },
  { href: "/inspiration", label: "Inspiration" },
];

export function SiteHeader() {
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
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden text-sm text-(--muted-foreground) transition-colors hover:text-(--foreground) sm:block"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
