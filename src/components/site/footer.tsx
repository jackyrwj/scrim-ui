import Link from "next/link";
import { ScrimBadge } from "./scrim-mark";

const browseLinks = [
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/tools", label: "Tools" },
  { href: "/resources", label: "Resources" },
  { href: "/inspiration", label: "Inspiration" },
];

const resourceLinks = [
  { href: "https://sdk.vercel.ai", label: "Vercel AI SDK" },
  { href: "https://www.assistant-ui.com", label: "assistant-ui" },
  { href: "https://ui.shadcn.com", label: "shadcn/ui" },
  { href: "https://v0.dev", label: "v0" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <ScrimBadge />
              Scrim UI
            </div>
            <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
              Copy-ready UI components, complete patterns, and practical tools for building
              AI products.
            </p>
          </div>

          {/* Browse */}
          {/* h2, not h3, in all three columns: the footer renders on every
              page, and pages whose main content has no h2 (/tools, /patterns,
              /categories) went h1 → h3 here, which axe flags as heading-order.
              These are top-level sections of the document, so h2 is also the
              honest level. */}
          <div>
            <h2 className="text-sm font-semibold">Browse</h2>
            <ul className="mt-3 space-y-2">
              {browseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--muted-foreground) transition-colors hover:text-(--foreground)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h2 className="text-sm font-semibold">Resources</h2>
            <ul className="mt-3 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-(--muted-foreground) transition-colors hover:text-(--foreground)"
                  >
                    {link.label}
                    <span className="ml-1 text-[10px]">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h2 className="text-sm font-semibold">About</h2>
            <ul className="mt-3 space-y-2 text-sm text-(--muted-foreground)">
              <li>Free components, MIT licensed</li>
              <li>Browser tools, no account required</li>
              <li>Pro templates and production workflows</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-(--border) pt-6 text-xs text-(--muted-foreground) sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <span>
              © {new Date().getFullYear()} Scrim UI. Free components are MIT licensed.
            </span>
            <Link href="/privacy" className="transition-colors hover:text-(--foreground)">
              Privacy
            </Link>
          </p>
          <a
            href="#"
            className="transition-colors hover:text-(--foreground)"
            aria-label="Back to top"
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
