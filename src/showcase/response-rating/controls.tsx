"use client";

import * as React from "react";
import { ResponseRating, type Rating } from "./response-rating";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const responseRatingControls: ComponentControls = {
  tag: "ResponseRating",
  importFrom: "./response-rating",
  controls: [
    {
      kind: "enum",
      name: "rating",
      label: "Rating on the server",
      value: "none",
      options: [
        { value: "none", label: "Unrated" },
        { value: "up", label: "Thumbs up" },
        { value: "down", label: "Thumbs down" },
      ],
    },
    { kind: "boolean", name: "submitted", label: "Detail already sent", value: false },
    { kind: "boolean", name: "compact", label: "Icons only", value: false },
    {
      kind: "text",
      name: "reasons",
      label: "Reason chips (one per line)",
      value: "Incorrect\nMissed the question\nToo long\nUnsafe",
      multiline: true,
    },
  ],
  snippet: (v) => {
    const list = String(v.reasons)
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);
    const props = [
      v.rating === "none" ? null : `  rating="${v.rating}"`,
      v.submitted ? "  submitted" : null,
      v.compact ? "  compact" : null,
      "  reasons={REASONS}",
      "  // undefined means the reader cleared their vote — delete it server-side.",
      "  onRate={(rating) => saveRating(messageId, rating)}",
      "  onSubmitDetail={(reasons, comment) => saveDetail(messageId, reasons, comment)}",
    ].filter(Boolean);
    return `const REASONS = ${JSON.stringify(list)};\n\n<ResponseRating\n${props.join("\n")}\n/>\n`;
  },
  presets: [
    {
      id: "idle",
      title: "Unrated",
      note: "The resting state. Two buttons and nothing else — the follow-up is earned by a click, not shown in advance.",
      values: { rating: "none", submitted: false, compact: false },
    },
    {
      id: "up",
      title: "Thumbs up",
      note: "No follow-up. A positive rating with a questionnaire attached is how you teach people to stop rating things.",
      values: { rating: "up", submitted: false, compact: false },
    },
    {
      id: "reasons",
      title: "Thumbs down",
      note: "The vote is already recorded — the panel says so — so the reasons are optional and Skip is a real option.",
      values: { rating: "down", submitted: false, compact: false },
    },
    {
      id: "submitted",
      title: "Detail sent",
      note: "Collapsed to a receipt. Clicking the filled thumb again clears the rating, which has to mean a delete on the server.",
      values: { rating: "down", submitted: true, compact: false },
    },
    {
      id: "compact",
      title: "Icons only",
      note: "For a row of message actions, where the labels are competing with copy, retry and share.",
      values: { rating: "up", submitted: false, compact: true },
    },
  ],
};

export function renderResponseRating(v: ControlValues, key: string) {
  const reasons = String(v.reasons)
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <ResponseRating
      key={key}
      rating={v.rating === "none" ? undefined : (String(v.rating) as Rating)}
      submitted={Boolean(v.submitted)}
      compact={Boolean(v.compact)}
      reasons={reasons}
    />
  );
}
