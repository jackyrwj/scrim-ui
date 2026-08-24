"use client";

import { CodeExecution } from "./code-execution";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

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

export const codeExecutionControls: ComponentControls = {
  tag: "CodeExecution",
  importFrom: "./code-execution",
  controls: [
    { kind: "text", name: "code", label: "Code", value: CODE, multiline: true },
    {
      kind: "enum",
      name: "status",
      label: "Status",
      value: "success",
      options: [
        { value: "running", label: "Running" },
        { value: "success", label: "Success" },
        { value: "error", label: "Error" },
      ],
    },
    { kind: "text", name: "output", label: "stdout", value: OUTPUT, multiline: true },
    { kind: "text", name: "error", label: "stderr", value: "", multiline: true },
    { kind: "number", name: "exitCode", label: "Exit code", value: 0, min: 0, max: 255 },
    { kind: "text", name: "duration", label: "Duration", value: "1.2s" },
  ],
  handlers: ["onStop"],
  presets: [
    {
      id: "running",
      title: "Running",
      note: "A spinner pill and a Stop control while execution is in flight.",
      values: { status: "running", output: "", error: "", duration: "0.4s" },
    },
    {
      id: "success",
      title: "Success",
      note: "stdout and the exit code, so the reader sees exactly what ran.",
      values: { status: "success", output: OUTPUT, error: "", exitCode: 0, duration: "1.2s" },
    },
    {
      id: "error",
      title: "Error",
      note: "stderr in red with the traceback — error text stays selectable and copyable.",
      values: { status: "error", output: "", error: ERROR_OUT, exitCode: 1, duration: "0.9s" },
    },
  ],
  remountOn: ["status"],
};

export function renderCodeExecution(v: ControlValues, key: string) {
  return (
    <CodeExecution
      key={key}
      code={String(v.code)}
      status={v.status as "running" | "success" | "error"}
      output={v.output ? String(v.output) : undefined}
      error={v.error ? String(v.error) : undefined}
      exitCode={Number(v.exitCode)}
      duration={String(v.duration)}
      onStop={() => {}}
    />
  );
}
