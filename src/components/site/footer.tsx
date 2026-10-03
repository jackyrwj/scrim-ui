import Link from "next/link";
import { OutboundLink } from "./outbound-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-(--border)">
      <div className="site-container flex flex-col items-center justify-between gap-4 py-6 text-xs text-(--muted-foreground) sm:flex-row">
        <p>© {new Date().getFullYear()} <Link href="/" className="font-medium text-(--foreground)">Scrim UI</Link>. Built for AI interfaces.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <Link href="/components" className="transition-colors hover:text-(--foreground)">Components</Link>
          <Link href="/resources" className="transition-colors hover:text-(--foreground)">Resources</Link>
          <Link href="/privacy" className="transition-colors hover:text-(--foreground)">Privacy</Link>
          <OutboundLink href="https://github.com/jackyrwj/scrim-ui/issues" item="feedback" className="transition-colors hover:text-(--foreground)">Feedback ↗</OutboundLink>
          <a href="#main-content" className="transition-colors hover:text-(--foreground)">Back to top ↑</a>
        </nav>
      </div>
    </footer>
  );
}
