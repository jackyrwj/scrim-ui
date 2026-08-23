"use client";

import * as React from "react";
import { ModelSelector, type ModelOption } from "./model-selector";

const models: ModelOption[] = [
  {
    id: "atlas",
    name: "Atlas",
    hint: "Flagship model — best for complex reasoning",
    badges: ["Reasoning", "Tools"],
  },
  {
    id: "nova",
    name: "Nova",
    hint: "Balanced speed and quality for daily work",
    badges: ["Fast"],
  },
  {
    id: "pulse",
    name: "Pulse",
    hint: "Lightning fast and cheap for simple tasks",
    badges: ["Cheapest"],
  },
];

export function DemoDefault() {
  const [value, setValue] = React.useState("nova");
  return <ModelSelector options={models} value={value} onSelect={setValue} />;
}

export function DemoOpen() {
  return <ModelSelector options={models} value="atlas" defaultOpen />;
}

export function DemoSettings() {
  const [value, setValue] = React.useState("atlas");
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Model</p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Which model answers your messages</p>
        </div>
        <ModelSelector
          options={models}
          value={value}
          onSelect={setValue}
          className="w-44"
        />
      </div>
    </div>
  );
}
