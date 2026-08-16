"use client";

import * as React from "react";
import { ReasoningLevel, type ReasoningLevel as Level } from "./reasoning-level";

export function DemoDefault() {
  const [level, setLevel] = React.useState<Level>("balanced");
  return <ReasoningLevel value={level} onChange={setLevel} />;
}

export function DemoDeep() {
  const [level, setLevel] = React.useState<Level>("deep");
  return <ReasoningLevel value={level} onChange={setLevel} />;
}

export function DemoCompact() {
  const [level, setLevel] = React.useState<Level>("balanced");
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <ReasoningLevel value={level} onChange={setLevel} compact />
    </div>
  );
}
