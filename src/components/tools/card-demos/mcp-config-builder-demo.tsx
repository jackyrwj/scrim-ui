"use client";

import * as React from "react";
import {
  buildJson,
  type McpServerSpec,
  type Target,
} from "../mcp-config-builder/build-json";
import { sliceTo, useInView, useReducedMotion } from "@/components/templates/use-demo-motion";

/**
 * The MCP Config Builder, generating config in a card: servers join the
 * list one at a time, and the JSON below is the tool's own buildJson()
 * output for exactly those servers — re-derived and re-revealed at every
 * step. The target chips are the three the editor offers.
 */

const SERVERS: McpServerSpec[] = [
  {
    name: "filesystem",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-filesystem ~/projects",
    url: "",
    env: [],
  },
  {
    name: "github",
    transport: "stdio",
    command: "npx",
    args: "-y @modelcontextprotocol/server-github",
    url: "",
    env: [{ key: "GITHUB_TOKEN", value: "••••••" }],
  },
  {
    name: "docs",
    transport: "streamable-http",
    command: "",
    args: "",
    url: "https://docs.example.com/mcp",
    env: [],
  },
];

const TARGETS: Target[] = ["Claude Desktop", "Claude Code", "Cursor"];

const STEP_MS = 2500;
const REVEAL_MS = 1400;
const HOLD_MS = 1600;
const LOOP_MS = SERVERS.length * STEP_MS + HOLD_MS;

export function McpConfigBuilderDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(frameRef);
  const playing = inView && !reduced;

  /* Server count (0 → all) plus the JSON slice reveal — both move rarely. */
  const [count, setCount] = React.useState(1);
  const [json, setJson] = React.useState("");

  React.useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const id = window.setInterval(() => {
      const elapsed = (performance.now() - started) % LOOP_MS;
      const idx = Math.min(Math.floor(elapsed / STEP_MS), SERVERS.length - 1);
      const into = elapsed - idx * STEP_MS;
      setCount(idx + 1);
      const full = buildJson(SERVERS.slice(0, idx + 1), "Claude Desktop");
      setJson(sliceTo(full, Math.min(1, into / REVEAL_MS)));
    }, 60);
    return () => window.clearInterval(id);
  }, [playing]);

  const servers = reduced ? SERVERS.slice(0, 2) : SERVERS.slice(0, count);
  const jsonText = reduced ? buildJson(servers, "Claude Desktop") : json;

  return (
    <div ref={frameRef} className="flex h-full flex-col justify-center gap-2 p-2">
      {/* Server rows, joining one at a time. */}
      <div className="space-y-1.5">
        {SERVERS.map((s, i) => {
          const joined = i < servers.length;
          return (
            <div
              key={s.name}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all duration-300 ${
                joined ? "border-(--border) bg-(--background)" : "border-dashed border-(--border)"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                  joined ? "bg-emerald-500" : "bg-(--muted-foreground)/30"
                }`}
              />
              <span className="font-mono text-[11px] text-(--foreground)">{s.name}</span>
              <span className="ml-auto rounded-full bg-(--muted) px-2 py-0.5 font-mono text-[9px] text-(--muted-foreground)">
                {s.transport}
              </span>
              {s.env.length > 0 && joined && (
                <span className="font-mono text-[9px] text-(--muted-foreground)">
                  {s.env[0].key}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Target chips — the three the editor offers, Desktop selected. */}
      <div className="flex gap-1">
        {TARGETS.map((t) => (
          <span
            key={t}
            className={`rounded-full border px-2 py-0.5 text-[9.5px] ${
              t === "Claude Desktop"
                ? "border-transparent bg-(--primary) text-white"
                : "border-(--border) text-(--muted-foreground)"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* The generated config — buildJson() output, revealed. */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-(--border) bg-(--card)">
        <p className="border-b border-(--border) px-3 py-1.5 font-mono text-[10px] text-(--muted-foreground)">
          mcp.json
        </p>
        <pre className="flex-1 overflow-hidden whitespace-pre px-3 py-2 font-mono text-[10px] leading-[1.5] text-(--foreground)">
          {jsonText}
        </pre>
      </div>
    </div>
  );
}
