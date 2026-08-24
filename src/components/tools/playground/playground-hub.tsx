"use client";

import * as React from "react";
import Link from "next/link";
import { PromptInputPlayground } from "@/showcase/prompt-input/playground";
import { StreamingMessagePlayground } from "@/showcase/streaming-message/playground";
import { ToolCallPlayground } from "@/showcase/tool-call/playground";
import { Chip } from "../tool-ui";

type TabId = "prompt-input" | "streaming-message" | "tool-call";

/* Module-scope so no component is defined inside render
   (react-hooks/static-components). */
const TABS: {
  id: TabId;
  label: string;
  blurb: string;
  Component: () => React.ReactNode;
  href: string;
}[] = [
  {
    id: "prompt-input",
    label: "Prompt input",
    blurb: "Composer with model picker, web-search and tool toggles, attachments.",
    Component: PromptInputPlayground,
    href: "/components/prompt-input",
  },
  {
    id: "streaming-message",
    label: "Streaming message",
    blurb: "Typewriter text, speed, Stop and regenerate.",
    Component: StreamingMessagePlayground,
    href: "/components/streaming-message",
  },
  {
    id: "tool-call",
    label: "Tool call",
    blurb: "Status states, duration and collapsible input/output.",
    Component: ToolCallPlayground,
    href: "/components/tool-call",
  },
];

export function PlaygroundHub() {
  const [active, setActive] = React.useState<TabId>("prompt-input");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Component Playground</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Tune AI interface components live in one place — prompt inputs, streaming messages and
            tool call states — then open the full component page for the code.
          </p>
        </div>
        <Link
          href={tab.href}
          className="inline-flex h-9 items-center rounded-lg border border-(--border) px-4 text-sm font-medium transition-colors hover:bg-(--muted)"
        >
          Open full component page →
        </Link>
      </div>

      {/* A group, not a tablist. role="tablist" requires role="tab" children
          wired to role="tabpanel" via aria-controls, plus arrow-key roving
          focus — none of which this has. The Chips already carry aria-pressed,
          which describes what they actually are. A wrong role is worse for a
          screen reader than no role. */}
      <div className="mt-8 flex flex-wrap items-center gap-1.5" role="group" aria-label="Component">
        {TABS.map((t) => (
          <Chip key={t.id} active={active === t.id} onClick={() => setActive(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">{tab.blurb}</p>

      {/* Active playground */}
      <div className="mt-6">
        <tab.Component />
      </div>
    </div>
  );
}
