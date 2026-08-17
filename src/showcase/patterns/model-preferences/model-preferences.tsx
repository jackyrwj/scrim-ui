"use client";

import * as React from "react";
import { ModelSelector, type ModelOption } from "../../model-selector/model-selector";
import {
  ReasoningLevel,
  type ReasoningLevel as ReasoningLevelValue,
} from "../../reasoning-level/reasoning-level";
import { ToolToggle, type ToolSetting } from "../../tool-toggle/tool-toggle";
import { MemoryList, type MemoryItem } from "../../memory-list/memory-list";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const MODELS: ModelOption[] = [
  { id: "sonnet", name: "Claude Sonnet", hint: "Balanced speed and quality", badges: ["Default"] },
  { id: "opus", name: "Claude Opus", hint: "Best for hard problems", badges: ["Deep thinking"] },
  { id: "haiku", name: "Claude Haiku", hint: "Fastest responses", badges: ["Fast"] },
];

function initTools(): ToolSetting[] {
  return [
    {
      id: "search",
      name: "Web search",
      description: "Find current information online",
      enabled: true,
      icon: <SearchIcon />,
    },
    {
      id: "code",
      name: "Code execution",
      description: "Run code to verify answers",
      enabled: true,
      icon: <CodeIcon />,
    },
    {
      id: "files",
      name: "File access",
      description: "Read and edit attached files",
      enabled: false,
      icon: <FileIcon />,
    },
    {
      id: "browser",
      name: "Browser",
      description: "Open pages from the conversation",
      enabled: false,
      icon: <GlobeIcon />,
    },
  ];
}

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: "m1",
    text: "Builds AI chat interfaces in TypeScript with Tailwind and zero UI dependencies.",
    updatedAt: "2d ago",
  },
  { id: "m2", text: "Prefers zinc-based palettes and compact, dependency-free components.", updatedAt: "5d ago" },
  { id: "m3", text: "Shipping a voice assistant pattern this week.", updatedAt: "Today" },
];

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* ModelPreferencesPattern                                             */
/* ------------------------------------------------------------------ */

export function ModelPreferencesPattern() {
  const [model, setModel] = React.useState("sonnet");
  const [level, setLevel] = React.useState<ReasoningLevelValue>("balanced");
  const [tools, setTools] = React.useState<ToolSetting[]>(initTools);
  const [memories, setMemories] = React.useState<MemoryItem[]>(INITIAL_MEMORIES);
  const idRef = React.useRef(4);

  function toggleTool(id: string, enabled: boolean) {
    setTools((ts) => ts.map((t) => (t.id === id ? { ...t, enabled } : t)));
  }

  function addMemory(text: string) {
    setMemories((m) => [...m, { id: `m${idRef.current++}`, text, updatedAt: "Just now" }]);
  }

  function forgetMemory(id: string) {
    setMemories((m) => m.filter((item) => item.id !== id));
  }

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Model &amp; Memory Preferences
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            How the assistant thinks, which tools it may use, and what it remembers.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Saved
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Settings */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section className="space-y-2">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Default model</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                Used for new conversations; you can still switch per message.
              </p>
            </div>
            <ModelSelector options={MODELS} value={model} onSelect={setModel} />
          </section>

          <ReasoningLevel value={level} onChange={setLevel} />

          <ToolToggle
            tools={tools}
            onToggle={toggleTool}
            title="Allowed tools"
            description="What the assistant may do on your behalf"
          />
        </div>

        {/* Memory */}
        <div className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-zinc-200 p-5 dark:border-zinc-800 md:flex">
          <MemoryList
            items={memories}
            onAdd={addMemory}
            onForget={forgetMemory}
            description="Facts the assistant keeps across conversations"
          />
          <p className="mt-3 text-[11px] leading-5 text-zinc-400">
            Memories are included with each message so the assistant stays consistent. Remove
            anything you do not want stored.
          </p>
        </div>
      </div>
    </div>
  );
}
