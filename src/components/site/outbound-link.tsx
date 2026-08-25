"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * An external link that reports itself to analytics.
 *
 * Exists as its own client component so server-rendered callers — the resource
 * cards on the homepage, the resource detail page — can keep rendering on the
 * server and only pay for a client boundary around the link itself.
 */
export function OutboundLink({
  href,
  item,
  className,
  children,
}: {
  href: string;
  item: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
      onClick={() => trackEvent("outbound_click", { item, destination: href })}
    >
      {children}
    </a>
  );
}
