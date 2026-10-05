"use client";

import { Card } from "@/components/ui/card";
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
    <Card className="gap-0 py-0 rounded-xl border border-border bg-card p-4">
      <ReasoningLevel value={level} onChange={setLevel} compact />
    </Card>
  );
}
