"use client";

import * as React from "react";
import { MemoryToast } from "./memory-toast";

export function DemoMemoryToast() {
  const [undone, setUndone] = React.useState(false);
  return undone ? (
    <MemoryToast kind="forgotten" fact="Prefers concise, bullet-point answers" />
  ) : (
    <MemoryToast
      kind="saved"
      fact="Prefers concise, bullet-point answers"
      onUndo={() => setUndone(true)}
      onManage={() => {}}
    />
  );
}

export function DemoMemoryToastUpdated() {
  return (
    <MemoryToast
      kind="updated"
      fact="Works as a backend engineer, mostly Go"
      onUndo={() => {}}
      onManage={() => {}}
    />
  );
}
