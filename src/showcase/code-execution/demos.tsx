"use client";

import * as React from "react";
import { CodeExecution } from "./code-execution";

const CODE = `import json, urllib.request

with urllib.request.urlopen("https://api.example.com/sources") as r:
    data = json.load(r)
print(f"collected {len(data["items"])} sources")
print(sorted(s["domain"] for s in data["items"]))`;

const OUTPUT = `collected 12 sources
['arxiv.org', 'github.com', 'huggingface.co', 'openai.com', ...]`;

const ERROR_OUT = `Traceback (most recent call last):
  File "<stdin>", line 4, in <module>
KeyError: 'domain'`;

export function DemoRunning() {
  const [stopped, setStopped] = React.useState(false);
  return (
    <CodeExecution
      code={CODE}
      status={stopped ? "error" : "running"}
      output={stopped ? undefined : "collected 7 sources"}
      error={stopped ? "Execution stopped by user. Partial output was kept." : undefined}
      exitCode={stopped ? 1 : 0}
      duration="1.4s"
      onStop={() => setStopped(true)}
    />
  );
}

export function DemoSuccess() {
  return <CodeExecution code={CODE} status="success" output={OUTPUT} exitCode={0} duration="1.4s" />;
}

export function DemoError() {
  return <CodeExecution code={CODE} status="error" error={ERROR_OUT} exitCode={1} duration="0.3s" />;
}
