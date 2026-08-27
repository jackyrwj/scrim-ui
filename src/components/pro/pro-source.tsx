"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { CodeBlock } from "@/components/component-page/code-block";
import { InstallCommand } from "@/components/component-page/install-command";
import { useLicense } from "@/lib/pro-access";
import { PRO_PRICE } from "@/lib/pro";
import { UnlockDialog } from "./unlock-dialog";

/**
 * A Pro component's source and install command, or the lock in their place.
 *
 * The source is fetched, never passed in. The page this renders on is a
 * server component and could hand the code down as a prop — and it would then
 * sit in the RSC payload of a public page, readable by anyone who opens the
 * network tab. So the locked state has nothing to hide: there is no code in
 * the document until /api/pro/source decides there should be.
 *
 * The teaser is a real silhouette — line-shaped bars at the file's true
 * length — rather than blurred lorem. It answers "how much code is this?",
 * which is the question a reader actually has at the lock.
 */
export function ProSource({
  slug,
  lines,
  registryUrl,
}: {
  slug: string;
  /** Line count of the withheld file. Metadata, not content. */
  lines: number;
  /** The key-checked registry endpoint, without the key. */
  registryUrl: string;
}) {
  const license = useLicense();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  /* Both results are keyed by the licence they belong to, so a new key
     invalidates them by comparison at render time instead of an effect that
     clears state — which is the cascading-render pattern the lint rule
     rejects, and which would also blank the code for a frame on every
     re-render that touched the store. */
  const [fetched, setFetched] = React.useState<{ key: string; filename: string; source: string } | null>(null);
  const [failed, setFailed] = React.useState<{ key: string; message: string } | null>(null);

  const source = fetched && fetched.key === license ? fetched : null;
  const error = failed && failed.key === license ? failed.message : null;
  const loading = Boolean(license) && !source && !error;

  React.useEffect(() => {
    if (!license || !loading) return;
    let cancelled = false;
    fetch("/api/pro/source", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, key: license }),
    })
      .then(async (response) => {
        const data: unknown = await response.json().catch(() => null);
        if (cancelled) return;
        if (response.ok) {
          const { filename, source: text } = data as { filename: string; source: string };
          setFetched({ key: license, filename, source: text });
        } else {
          setFailed({
            key: license,
            message: (data as { error?: string } | null)?.error ?? "Could not load the source.",
          });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed({ key: license, message: "Could not reach the server." });
      });
    return () => {
      cancelled = true;
    };
  }, [license, loading, slug]);

  if (source) {
    return (
      <div className="space-y-6">
        {/* The buyer's own key, in their own install command. /r/pro checks it
            on every fetch, so the command is as portable as the licence is. */}
        <InstallCommand url={`${registryUrl}?key=${encodeURIComponent(license ?? "")}`} />
        <CodeBlock code={source.source} filename={source.filename} />
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--muted)/30">
        <div aria-hidden className="space-y-2.5 p-5 opacity-40">
          {Array.from({ length: Math.min(10, Math.max(5, Math.round(lines / 12))) }).map((_, i) => (
            <div
              key={i}
              className="h-2.5 rounded bg-(--muted-foreground)/30"
              /* Varied so it reads as code rather than a loading skeleton. */
              style={{ width: `${[92, 64, 78, 45, 86, 58, 71, 39, 83, 52][i % 10]}%` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-t from-(--background) via-(--background)/90 to-(--background)/40 px-6 text-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-(--muted-foreground)" aria-hidden>
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-sm font-medium">
            {lines} lines of source, included with Pro
          </p>
          <p className="max-w-sm text-[13px] text-(--muted-foreground)">
            The preview above is the real component. Pro unlocks its source, the shadcn install
            command, and every other Pro item — {PRO_PRICE} once.
          </p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={loading}
            className="mt-1 h-10 rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking licence..." : "Unlock Pro"}
          </button>
          {error && (
            <p role="alert" className="text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>

      <UnlockDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onUnlocked={() => setFailed(null)}
        item={pathname}
      />
    </>
  );
}
