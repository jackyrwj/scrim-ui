"use client";

import * as React from "react";
import { OutputComparison, type Candidate, type Choice } from "./output-comparison";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

const PROMPT = "Explain why my RAG answers cite the right document but the wrong paragraph.";

const A: Candidate = {
  id: "cand_a",
  model: "claude-sonnet-5",
  text: "Almost always the offsets, not the retrieval. The chunk that matched is correct; what is lost is where it sat in the source. If chunks are stored as detached strings, the only thing left to cite with is the document id, so every citation from that document resolves to the same place.\n\nStore start and end offsets with each chunk and assert the slice invariant in development.",
};

const B: Candidate = {
  id: "cand_b",
  model: "gpt-5.6-terra",
  text: "This is a common issue with RAG pipelines. There are several possible causes:\n\n1. Chunking strategy — your chunks may be too large or too small.\n2. Embedding quality — consider a different embedding model.\n3. Retrieval parameters — try adjusting top-k.\n4. Re-ranking — a cross-encoder often improves precision.",
};

const PREAMBLE = `// Randomise the slots per comparison and record which model landed in each.
// Left wins more than right, reliably, and no component can fix that for you.
const [a, b] = shuffle([sonnet, gpt]);`;

export const outputComparisonControls: ComponentControls = {
  tag: "OutputComparison",
  importFrom: "./output-comparison",
  controls: [
    {
      kind: "enum",
      name: "choice",
      label: "Recorded choice",
      value: "none",
      options: [
        { value: "none", label: "Not yet judged" },
        { value: "a", label: "A is better" },
        { value: "b", label: "B is better" },
        { value: "tie", label: "Tie" },
      ],
    },
    { kind: "boolean", name: "revealed", label: "Force labels visible", value: false },
    { kind: "boolean", name: "prompt", label: "Show the prompt", value: true },
  ],
  snippet: (v) => {
    const props = [
      v.prompt ? "  prompt={prompt}" : null,
      "  a={a}",
      "  b={b}",
      v.choice === "none" ? null : `  choice="${v.choice}"`,
      v.revealed ? "  revealed" : null,
      "  onChoose={(choice, winnerId) => recordPreference(pairId, choice, winnerId)}",
    ].filter(Boolean);
    return `${PREAMBLE}\n\n<OutputComparison\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "blind",
      title: "Blind",
      note: "Names hidden. Show them and you stop measuring the answers and start measuring what the reader already believes about the models.",
      values: { choice: "none", revealed: false, prompt: true },
    },
    {
      id: "revealed",
      title: "Judged",
      note: "Revealed immediately after the choice. Keeping the names hidden forever makes the tool feel like it is hiding something.",
      values: { choice: "a", revealed: false, prompt: true },
    },
    {
      id: "tie",
      title: "Tie",
      note: "A first-class answer. Forcing a winner out of two indistinguishable outputs manufactures signal, which is worse than a smaller sample.",
      values: { choice: "tie", revealed: false, prompt: true },
    },
  ],
};

export function renderOutputComparison(v: ControlValues, key: string) {
  return (
    <OutputComparison
      key={key}
      prompt={v.prompt ? PROMPT : undefined}
      a={A}
      b={B}
      choice={v.choice === "none" ? undefined : (String(v.choice) as Choice)}
      revealed={v.revealed ? true : undefined}
    />
  );
}
