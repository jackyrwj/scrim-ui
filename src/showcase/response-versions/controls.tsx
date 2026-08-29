"use client";

import type { ComponentControls, ControlValues } from "@/lib/component-controls";
import type { ResponseVersion, ResponseVersionStatus } from "./response-versions";
import { InteractiveVersions } from "./demos";

/** The reader edits the version stack as text: `## status` starts a version
 *  (`ready`, `generating`, `failed`, `stopped`, optionally `from vN` to mark
 *  a branch), the lines under it are that version's answer. */
const SAMPLE = [
  "## ready",
  "Streaming works because the first token arrives in milliseconds — the interface feels instant long before the answer is finished.",
  "## ready",
  "The real reason to stream is perceived latency: readers start parsing the answer while the model is still writing it.",
  "## ready from v1",
  "Branched off the first answer after the prompt was edited — the pager marks the parent version.",
].join("\n");

const STATUSES: ResponseVersionStatus[] = ["ready", "generating", "failed", "stopped"];

function parse(text: string): { versions: ResponseVersion[]; error?: string } {
  const versions: ResponseVersion[] = [];
  let status: ResponseVersionStatus = "ready";
  let branchedFrom: string | undefined;
  let body: string[] = [];

  function flush() {
    const text = body.join(" ").trim();
    if (!text && versions.length === 0 && !body.length) return;
    if (!text) return;
    versions.push({
      id: `v${versions.length + 1}`,
      status,
      branchedFrom,
      content: <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{text}</p>,
    });
  }

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const m = /^##\s+(\w+)(?:\s+from\s+(v\d+))?\s*$/.exec(line);
    if (m) {
      flush();
      status = (STATUSES.find((s) => s === m[1]) ?? "ready") as ResponseVersionStatus;
      branchedFrom = m[2];
      body = [];
    } else {
      body.push(raw);
    }
  }
  flush();
  return { versions };
}

function serialize(versions: ResponseVersion[]) {
  const rows = versions
    .map((v) => {
      const text = ((v.content as React.ReactElement<{ children: string }>).props.children) ?? "";
      return (
        `  { id: ${JSON.stringify(v.id)}, status: ${JSON.stringify(v.status ?? "ready")}` +
        `${v.branchedFrom ? `, branchedFrom: ${JSON.stringify(v.branchedFrom)}` : ""}` +
        `, content: <p>{${JSON.stringify(text)}}</p> },`
      );
    })
    .join("\n");
  return `const VERSIONS = [\n${rows}\n];`;
}

export const responseVersionsControls: ComponentControls = {
  tag: "ResponseVersions",
  importFrom: "./response-versions",
  controls: [
    {
      kind: "text",
      name: "versions",
      label: "Versions (## status [from vN], then the answer)",
      value: SAMPLE,
      multiline: true,
    },
  ],
  handlers: ["onVersionChange", "onRegenerate", "onContinueFrom", "onCompare"],
  remountOn: ["versions"],
  derive: (v) => {
    const { versions } = parse(String(v.versions));
    if (versions.length === 0) return { props: { versions: "[]" } };
    return { preamble: serialize(versions), props: { versions: "VERSIONS" } };
  },
  presets: [
    {
      id: "single",
      title: "Single",
      note: "One version, no pager — only the regenerate entry shows.",
      values: { versions: "## ready\nThe only answer so far. Nothing to page through yet." },
    },
    {
      id: "multiple",
      title: "Multiple",
      note: "Three regenerations deep. The reader pages back without losing the newest.",
      values: {},
    },
    {
      id: "generating",
      title: "Generating",
      note: "The newest version is still arriving. Auto-follow only happens at the tail.",
      values: {
        versions:
          "## ready\nThe first answer, finished and readable.\n## generating\nThe regeneration is still streaming in…",
      },
    },
    {
      id: "branched",
      title: "Branched",
      note: "Continue-from-here off v1 created a branch — the chip names the parent.",
      values: {},
    },
    {
      id: "failed",
      title: "Failed",
      note: "A version that died mid-stream keeps its partial text, with Retry attached.",
      values: {
        versions:
          "## ready\nThe first answer, finished and readable.\n## failed\nThis regeneration got as far as",
      },
    },
  ],
};

export function renderResponseVersions(v: ControlValues, key: string) {
  const { versions } = parse(String(v.versions));
  return <InteractiveVersions key={key} initialVersions={versions.length ? versions : undefined} />;
}
