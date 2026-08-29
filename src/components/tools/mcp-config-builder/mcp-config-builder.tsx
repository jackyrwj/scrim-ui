"use client";

import * as React from "react";
import { Section, Field, Chip, inputCls, selectCls } from "../tool-ui";
import { CopyButton } from "@/components/component-page/copy-button";
import {
  buildJson,
  configHint,
  type McpServerSpec,
  type Target,
  type Transport,
} from "./build-json";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ServerConfig extends McpServerSpec {
  id: string;
  envOpen: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let nextId = 1;
function uid() {
  return `srv_${nextId++}`;
}

function makeDefault(): ServerConfig[] {
  return [
    {
      id: uid(),
      name: "filesystem",
      transport: "stdio",
      command: "npx",
      args: "-y @modelcontextprotocol/server-filesystem /Users/me/projects",
      url: "",
      env: [],
      envOpen: false,
    },
    {
      id: uid(),
      name: "github",
      transport: "stdio",
      command: "npx",
      args: "-y @modelcontextprotocol/server-github",
      url: "",
      env: [{ key: "GITHUB_TOKEN", value: "your-token-here" }],
      envOpen: true,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ServerCard({
  server,
  onChange,
  onDelete,
}: {
  server: ServerConfig;
  onChange: (s: ServerConfig) => void;
  onDelete: () => void;
}) {
  const update = (patch: Partial<ServerConfig>) => onChange({ ...server, ...patch });

  return (
    <div className="rounded-xl border border-(--border) bg-(--card) p-4">
      {/* Name + delete */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <Field label="Server Name">
          <input
            className={inputCls}
            value={server.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. filesystem"
          />
        </Field>
        <button
          type="button"
          onClick={onDelete}
          className="mt-5 shrink-0 rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
          aria-label="Delete server"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Transport */}
      <div className="mb-3">
        <Field label="Transport">
          <select
            className={selectCls}
            value={server.transport}
            onChange={(e) => update({ transport: e.target.value as Transport })}
          >
            <option value="stdio">stdio</option>
            <option value="sse">sse</option>
            <option value="streamable-http">streamable-http</option>
          </select>
        </Field>
      </div>

      {/* Transport-specific fields */}
      {server.transport === "stdio" ? (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <Field label="Command">
            <input
              className={inputCls}
              value={server.command}
              onChange={(e) => update({ command: e.target.value })}
              placeholder="e.g. npx"
            />
          </Field>
          <Field label="Args (space-separated)">
            <input
              className={inputCls}
              value={server.args}
              onChange={(e) => update({ args: e.target.value })}
              placeholder="e.g. -y @modelcontextprotocol/server-filesystem /path"
            />
          </Field>
        </div>
      ) : (
        <div className="mb-3">
          <Field label="URL">
            <input
              className={inputCls}
              value={server.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="e.g. http://localhost:3000/sse"
            />
          </Field>
        </div>
      )}

      {/* Environment Variables */}
      <div>
        <button
          type="button"
          onClick={() => update({ envOpen: !server.envOpen })}
          className="flex items-center gap-1.5 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${server.envOpen ? "rotate-90" : ""}`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          Environment Variables
          {server.env.length > 0 && (
            <span className="rounded-full bg-(--muted) px-1.5 py-0.5 text-[10px]">
              {server.env.length}
            </span>
          )}
        </button>

        {server.envOpen && (
          <div className="mt-2 space-y-2">
            {server.env.map((envVar, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={envVar.key}
                  onChange={(e) => {
                    const next = [...server.env];
                    next[i] = { ...next[i], key: e.target.value };
                    update({ env: next });
                  }}
                  placeholder="KEY"
                />
                <input
                  className={inputCls}
                  value={envVar.value}
                  onChange={(e) => {
                    const next = [...server.env];
                    next[i] = { ...next[i], value: e.target.value };
                    update({ env: next });
                  }}
                  placeholder="value"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = server.env.filter((_, j) => j !== i);
                    update({ env: next });
                  }}
                  className="shrink-0 rounded-lg p-1.5 text-(--muted-foreground) transition-colors hover:bg-(--muted) hover:text-(--foreground)"
                  aria-label="Remove variable"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update({ env: [...server.env, { key: "", value: "" }] })}
              className="text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
            >
              + Add Variable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function McpConfigBuilder() {
  const [target, setTarget] = React.useState<Target>("Claude Code");
  const [servers, setServers] = React.useState<ServerConfig[]>(makeDefault);

  const json = React.useMemo(() => buildJson(servers, target), [servers, target]);

  function updateServer(id: string, updated: ServerConfig) {
    setServers((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function deleteServer(id: string) {
    setServers((prev) => prev.filter((s) => s.id !== id));
  }

  function addServer() {
    setServers((prev) => [
      ...prev,
      {
        id: uid(),
        name: "",
        transport: "stdio",
        command: "",
        args: "",
        url: "",
        env: [],
        envOpen: false,
      },
    ]);
  }

  function reset() {
    nextId = 1;
    setServers(makeDefault());
    setTarget("Claude Code");
  }

  const targets: Target[] = ["Claude Desktop", "Claude Code", "Cursor"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            MCP Config Builder
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">
            Configure MCP servers for Claude Desktop, Claude Code, or Cursor.
            Add servers visually and copy the JSON config.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Reset
          </button>
          <CopyButton code={json} label="Copy JSON" />
        </div>
      </div>

      {/* Target selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {targets.map((t) => (
          <Chip key={t} active={target === t} onClick={() => setTarget(t)}>
            {t}
          </Chip>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left — server list */}
        <div className="space-y-4">
          {servers.map((s) => (
            <ServerCard
              key={s.id}
              server={s}
              onChange={(updated) => updateServer(s.id, updated)}
              onDelete={() => deleteServer(s.id)}
            />
          ))}

          <button
            type="button"
            onClick={addServer}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--border) py-3 text-sm font-medium text-(--muted-foreground) transition-colors hover:border-(--foreground) hover:text-(--foreground)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add Server
          </button>
        </div>

        {/* Right — JSON preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Section title="Generated Config">
            <pre className="overflow-x-auto rounded-lg border border-(--border) bg-(--background) p-4 font-mono text-xs leading-relaxed">
              <code>{json}</code>
            </pre>
            <p className="mt-3 text-xs text-(--muted-foreground)">
              {configHint(target)}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
