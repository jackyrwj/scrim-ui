import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { Search } from "./search";
import { components, patterns } from "@/lib/registry";
import { resources } from "@/lib/resources";
import { inspirationEntries } from "@/lib/inspiration";

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

  items.push({ title: "AI Chat Mockup Generator", href: "/tools/chat-mockup", type: "Tool", description: "Compose a realistic AI chat screen and export as PNG" });
  items.push({ title: "Component Playground", href: "/tools/playground", type: "Tool", description: "Interactive playground for all components" });
  items.push({ title: "Prompt Generator", href: "/tools/prompt-generator", type: "Tool", description: "Generate UI prompts for AI coding tools" });
  items.push({ title: "Voice Assistant Mockup Generator", href: "/tools/voice-mockup", type: "Tool", description: "Compose a realistic voice assistant screen and export as PNG" });
  items.push({ title: "Voice Conversation Script Library", href: "/tools/voice-scripts", type: "Tool", description: "Ready-made voice assistant transcripts for common scenarios" });
  items.push({ title: "Model Switcher Builder", href: "/tools/model-switcher", type: "Tool", description: "Design a custom AI model switcher and copy the React component" });
  items.push({ title: "Prompt Token Counter", href: "/tools/token-counter", type: "Tool", description: "Estimated token counts and API costs for GPT, Claude and Gemini" });
  items.push({ title: "AI Chat Theme Generator", href: "/tools/theme-generator", type: "Tool", description: "Generate a full AI chat color scheme from one brand color" });
  items.push({ title: "Screenshot Device Mockup", href: "/tools/screenshot-mockup", type: "Tool", description: "Place a screenshot in an iPhone, MacBook, iPad or browser frame" });
  items.push({ title: "AI Conversation Flow Diagram", href: "/tools/flow-diagram", type: "Tool", description: "Build and export conversation flow diagrams as SVG or PNG" });

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
