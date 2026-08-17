"use client";

import * as React from "react";
import { ContextFiles } from "./context-files";

const DEFAULT_FILES = [
  { name: "README.md", detail: "12 KB" },
  { name: "src/lib/registry.ts", detail: "48 KB" },
  { name: "design-system.css", detail: "21 KB" },
];

const FULL_FILES = [
  { name: "README.md", detail: "12 KB" },
  { name: "src/lib/registry.ts", detail: "48 KB" },
  { name: "src/showcase/streaming-message.tsx", detail: "9 KB" },
  { name: "design-system.css", detail: "21 KB" },
  { name: "src/app/page.tsx", detail: "17 KB" },
  { name: "src/components/site/header.tsx", detail: "4 KB" },
  { name: "src/lib/inspiration.ts", detail: "14 KB" },
];

export function DemoDefault() {
  return <ContextFiles files={DEFAULT_FILES} usage={{ used: 5400, limit: 20000 }} onRemove={() => {}} />;
}

export function DemoFull() {
  const [files, setFiles] = React.useState(FULL_FILES);
  return (
    <ContextFiles
      files={files}
      usage={{ used: 18200, limit: 20000 }}
      onRemove={(name) => setFiles((f) => f.filter((x) => x.name !== name))}
    />
  );
}

export function DemoEmpty() {
  return <ContextFiles files={[]} usage={{ used: 1200, limit: 20000 }} />;
}
