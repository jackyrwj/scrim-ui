"use client";

import * as React from "react";
import { SourceList, type RetrievedSource } from "./source-list";

const SOURCES: RetrievedSource[] = [
  { id: "s1", title: "chunking.md · lines 12–18", score: 0.834, passage: "Chunks are stored as positions, not strings. Every chunk carries the start and end offset it was cut from, and the invariant is asserted in development." },
  { id: "s2", title: "streaming.md · lines 3–7", score: 0.791, passage: "Sources are written to the stream as a data part before the first token of the answer, so a marker mid-answer resolves the moment it appears." },
  { id: "s3", title: "retrieval.md · lines 40–46", score: 0.552, passage: "The relevance floor is applied before the model call, not after. A candidate under the floor is not a weak source, it is not a source." },
  { id: "s4", title: "readme.md · lines 1–6", score: 0.271, passage: "A Next.js application demonstrating retrieval-augmented generation with inline citations." },
  { id: "s5", title: "package.json · lines 1–4", score: 0.184, passage: '{ "name": "rag-qa", "private": true, "version": "0.1.0" }' },
];

const NOTHING: RetrievedSource[] = SOURCES.slice(3);

export function DemoDefault() {
  return <SourceList sources={SOURCES} floor={0.35} onOpen={() => {}} />;
}

export function DemoRanked() {
  return <SourceList sources={SOURCES} floor={0.35} />;
}

export function DemoEmpty() {
  return <SourceList sources={NOTHING} floor={0.35} />;
}

export function DemoNoFloor() {
  return <SourceList sources={SOURCES} />;
}
