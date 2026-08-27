"use client";

import * as React from "react";
import type { ApiTokenSummary } from "@/lib/account-store.server";
import { SITE_URL } from "@/lib/site";

export function ApiTokenPanel({ initialTokens }: { initialTokens: ApiTokenSummary[] }) {
  const [tokens, setTokens] = React.useState(initialTokens);
  const [revealed, setRevealed] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function create() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/account/token", { method: "POST" });
      const data = (await response.json()) as {
        token?: string;
        summary?: ApiTokenSummary;
        error?: string;
      };
      if (!response.ok || !data.token || !data.summary) {
        setError(data.error ?? "Could not create a token.");
        return;
      }
      setRevealed(data.token);
      setTokens((current) => [data.summary!, ...current]);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  async function revoke(id: string) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/account/token", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error();
      setTokens((current) => current.filter((token) => token.id !== id));
      setRevealed(null);
    } catch {
      setError("Could not revoke the token.");
    } finally {
      setPending(false);
    }
  }

  const example = revealed
    ? `npx shadcn@latest add "${SITE_URL}/r/pro/COMPONENT.json?token=${revealed}"`
    : null;

  return (
    <section className="rounded-2xl border border-(--border) p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">CLI access tokens</h2>
          <p className="mt-1 max-w-xl text-sm text-(--muted-foreground)">
            Use a revocable account token with the shadcn CLI. Tokens are shown only once.
          </p>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={pending}
          className="h-9 rounded-lg bg-(--accent) px-4 text-sm font-semibold text-(--accent-foreground) disabled:opacity-50"
        >
          {pending ? "Working…" : "Create token"}
        </button>
      </div>

      {revealed && example && (
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm font-medium">Copy this token now. It will not be shown again.</p>
          <code className="mt-3 block overflow-x-auto rounded-lg bg-(--muted) p-3 text-xs">
            {revealed}
          </code>
          <code className="mt-2 block overflow-x-auto rounded-lg bg-(--muted) p-3 text-xs">
            {example}
          </code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(revealed).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="mt-3 text-xs font-medium underline"
          >
            {copied ? "Copied" : "Copy token"}
          </button>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {tokens.length === 0 ? (
          <p className="text-sm text-(--muted-foreground)">No active tokens.</p>
        ) : (
          tokens.map((token) => (
            <div
              key={token.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--border) px-3 py-2"
            >
              <div>
                <code className="text-xs">{token.prefix}</code>
                <p className="mt-0.5 text-[11px] text-(--muted-foreground)">
                  Created {new Date(token.createdAt).toLocaleDateString("en-US")}
                  {token.lastUsedAt
                    ? ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString("en-US")}`
                    : " · Never used"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void revoke(token.id)}
                disabled={pending}
                className="text-xs font-medium text-red-500 underline disabled:opacity-50"
              >
                Revoke
              </button>
            </div>
          ))
        )}
      </div>
      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
    </section>
  );
}
