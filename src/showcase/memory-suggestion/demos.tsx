"use client";

import * as React from "react";
import { MemorySuggestion } from "./memory-suggestion";

export function DemoSuggestion() {
  const [saved, setSaved] = React.useState(false);
  return (
    <MemorySuggestion
      fact="You prefer TypeScript over JavaScript"
      saved={saved}
      onSave={() => setSaved(true)}
      onUndo={() => setSaved(false)}
    />
  );
}

export function DemoSaved() {
  return <MemorySuggestion fact="You prefer TypeScript" saved />;
}
