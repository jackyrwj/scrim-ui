"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { CodeBlock } from "@/components/component-page/code-block";
import { InstallCommand } from "@/components/component-page/install-command";
import { useProAccess } from "@/lib/pro-access";
import { PRO_PRICE } from "@/lib/pro";
import { UnlockDialog } from "./unlock-dialog";

export type TemplateFileMeta = { path: string; lines: number };

/**
 * The template's source browser: file list on the left, file on the right.
 *
 * The file LIST is rendered whether or not you own the template, and that is
 * the point — "app/api/chat/route.ts, 68 lines" tells a buyer more about what
 * they are getting than any feature bullet, and a path name gives nothing
 * away. The contents stay in the private artifact origin and are fetched only
 * after the public server verifies access.
 */
export function ProTemplate({
  slug,
  files,
  registryUrl,
}: {
  slug: string;
  files: TemplateFileMeta[];
  registryUrl: string;
}) {
  const access = useProAccess();
  const pathname = usePathname();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(files[0]?.path ?? "");
  const [fetched, setFetched] = React.useState<{ key: string; files: Record<string, string> } | null>(null);
  const [failed, setFailed] = React.useState<{ key: string; message: string } | null>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  /* Keyed by licence and compared at render, so a changed key invalidates
     without an effect that calls setState — see pro-source.tsx. */
  const contents = fetched && fetched.key === access.identity ? fetched.files : null;
  const error = failed && failed.key === access.identity ? failed.message : null;
  const loading = access.unlocked && !contents && !error;

  React.useEffect(() => {
    if (!access.unlocked || !access.identity || !loading) return;
    let cancelled = false;
    fetch("/api/pro/template", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, key: access.key }),
    })
      .then(async (response) => {
        const data: unknown = await response.json().catch(() => null);
        if (cancelled) return;
        if (response.ok) {
          const list = (data as { files: { path: string; content: string }[] }).files;
          setFetched({
            key: access.identity!,
            files: Object.fromEntries(list.map((f) => [f.path, f.content])),
          });
        } else {
          setFailed({
            key: access.identity!,
            message: (data as { error?: string } | null)?.error ?? "Could not load the template.",
          });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed({ key: access.identity!, message: "Could not reach the server." });
      });
    return () => {
      cancelled = true;
    };
  }, [access.identity, access.key, access.unlocked, loading, slug]);

  /* Fetched and saved from a blob rather than linked: the licence goes in the
     POST body, and an <a href> carrying a key would leak it into history and
     the referrer. The cost is that the click has to await the bytes, hence
     the pending label. */
  async function download() {
    if (!access.unlocked) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch("/api/pro/template/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, key: access.key }),
      });
      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        setDownloadError((data as { error?: string } | null)?.error ?? "Could not build the archive.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      trackEvent("template_download", { item: pathname });
    } catch {
      setDownloadError("Could not reach the server.");
    } finally {
      setDownloading(false);
    }
  }

  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);

  return (
    <>
      {contents ? (
        <div className="mb-6 space-y-3">
          {access.mode === "license" ? (
            <InstallCommand url={`${registryUrl}?key=${encodeURIComponent(access.key ?? "")}`} />
          ) : (
            <p className="text-sm text-(--muted-foreground)">
              Create a private CLI token in your{" "}
              <Link href="/dashboard" className="font-medium text-(--foreground) underline underline-offset-4">
                dashboard
              </Link>
              .
            </p>
          )}
          {/* The second way out, and for a template arguably the first: this
              is a standalone app with its own package.json, so the natural
              move is unzip, install, run — not merge twenty-three files into
              a project that already exists. Both are offered because both
              are real; the shadcn line is above because that is the one the
              rest of the site teaches. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-(--border) px-3.5 text-[13px] font-medium transition-colors hover:bg-(--muted) disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              {downloading ? "Preparing…" : `Download .zip (${files.length} files)`}
            </button>
            <span className="text-xs text-(--muted-foreground)">
              Unpacks to <code className="font-mono">{slug}/</code> — then{" "}
              <code className="font-mono">npm install</code>.
            </span>
          </div>
          {downloadError && (
            <p role="alert" className="text-xs text-red-500">
              {downloadError}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-(--border) bg-(--muted)/30 px-6 py-8 text-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-(--muted-foreground)" aria-hidden>
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="text-sm font-medium">
            {files.length} files, {totalLines.toLocaleString()} lines
          </p>
          <p className="max-w-md text-[13px] text-(--muted-foreground)">
            Every file below is real and readable once you have Pro — downloaded as a zip, installed
            with one shadcn command, or read here in the browser. {PRO_PRICE} once, for this and
            every other Pro item.
          </p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            disabled={access.checking || loading}
            className="mt-1 h-10 rounded-xl bg-(--accent) px-5 text-sm font-semibold text-(--accent-foreground) transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {access.checking || loading ? "Checking access..." : "Unlock Pro"}
          </button>
          {error && (
            <p role="alert" className="text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-(--border) p-2">
          {files.map((file) => {
            const active = file.path === selected;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelected(file.path)}
                className={`flex w-full items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-(--muted) ${
                  active ? "bg-(--muted)" : ""
                }`}
              >
                <span className={`truncate font-mono text-[12px] ${active ? "text-(--foreground)" : "text-(--muted-foreground)"}`}>
                  {file.path}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-(--muted-foreground)">{file.lines}</span>
              </button>
            );
          })}
        </div>

        {contents ? (
          <CodeBlock code={contents[selected] ?? ""} filename={selected} maxLines={26} />
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-(--border) bg-(--muted)/30">
            <div aria-hidden className="space-y-2.5 p-5 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded bg-(--muted-foreground)/30"
                  style={{ width: `${[92, 64, 78, 45, 86, 58, 71, 39, 83, 52, 68, 74][i]}%` }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-(--background) via-(--background)/90 to-(--background)/40">
              <span className="font-mono text-[12px] text-(--muted-foreground)">{selected}</span>
            </div>
          </div>
        )}
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
