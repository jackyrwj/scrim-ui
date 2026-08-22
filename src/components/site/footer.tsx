import Link from "next/link";

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
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--foreground) text-(--background) text-xs font-bold">
                AI
              </span>
              AI UI Resources
            </div>
            <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
              Open-source UI patterns and components for AI products. Free to copy, built for designers and developers.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-sm font-semibold">Browse</h3>
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
            <h3 className="text-sm font-semibold">Resources</h3>
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
            <h3 className="text-sm font-semibold">About</h3>
            <ul className="mt-3 space-y-2 text-sm text-(--muted-foreground)">
              <li>Free &amp; open source</li>
              <li>Built with Next.js + Tailwind</li>
              <li>No signup required</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-(--border) pt-6 text-xs text-(--muted-foreground) sm:flex-row">
          <p>© {new Date().getFullYear()} AI UI Resources. Free to copy.</p>
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
