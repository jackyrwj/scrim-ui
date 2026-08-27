"use client";

import * as React from "react";
import { OutputComparison, type Candidate, type Choice } from "./output-comparison";

const PROMPT = "Explain why my RAG answers cite the right document but the wrong paragraph.";

const A: Candidate = {
  id: "cand_a",
  model: "claude-sonnet-5",
  text: "Almost always the offsets, not the retrieval. The chunk that matched is correct; what is lost is where it sat in the source. If chunks are stored as detached strings, the only thing left to cite with is the document id, so every citation from that document resolves to the same place — usually the first paragraph.\n\nStore start and end offsets with each chunk and assert chunk.text === source.slice(start, end) in development. The assertion fails at the point the offsets are dropped rather than months later in a citation nobody trusts.",
};

const B: Candidate = {
  id: "cand_b",
  model: "gpt-5.2",
  text: "This is a common issue with RAG pipelines. There are several possible causes:\n\n1. Chunking strategy — your chunks may be too large or too small.\n2. Embedding quality — consider a different embedding model.\n3. Retrieval parameters — try adjusting top-k or the similarity threshold.\n4. Re-ranking — a cross-encoder re-ranker often improves paragraph-level precision.\n\nI would start by inspecting the retrieved chunks directly to confirm which stage is at fault, then tune from there.",
};

export function DemoDefault() {
  const [choice, setChoice] = React.useState<Choice | undefined>(undefined);
  return <OutputComparison prompt={PROMPT} a={A} b={B} choice={choice} onChoose={setChoice} />;
}

export function DemoBlind() {
  return <OutputComparison prompt={PROMPT} a={A} b={B} />;
}

export function DemoRevealed() {
  return <OutputComparison prompt={PROMPT} a={A} b={B} choice="a" />;
}

export function DemoTie() {
  return <OutputComparison prompt={PROMPT} a={A} b={B} choice="tie" />;
}
