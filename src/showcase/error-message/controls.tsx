"use client";

import { ErrorMessage } from "./error-message";
import type { ComponentControls, ControlValues } from "@/lib/component-controls";

export const errorMessageControls: ComponentControls = {
  tag: "ErrorMessage",
  importFrom: "./error-message",
  controls: [
    {
      kind: "enum",
      name: "severity",
      label: "Severity",
      value: "error",
      options: [
        { value: "error", label: "Error" },
        { value: "rate-limit", label: "Rate limit" },
        { value: "warning", label: "Warning" },
      ],
    },
    { kind: "text", name: "title", label: "Title override", value: "" },
    {
      kind: "text",
      name: "message",
      label: "Message",
      value:
        "The request timed out while the model was generating. Your message was saved, so you can retry without retyping.",
      multiline: true,
    },
    { kind: "boolean", name: "retrying", label: "Retry in flight", value: false },
    {
      kind: "number",
      name: "retryCountdown",
      label: "Retry countdown (s)",
      value: 0,
      min: 0,
      max: 60,
    },
  ],
  handlers: ["onRetry"],
  presets: [
    {
      id: "error",
      title: "Error",
      note: "A red-tinted message with a one-line explanation and a single retry action.",
      values: { severity: "error", retrying: false, retryCountdown: 0 },
    },
    {
      id: "retrying",
      title: "Retrying",
      note: "A spinner replaces the button so the retry cannot be fired twice.",
      values: {
        severity: "error",
        message:
          "The connection was interrupted. Retrying the same request with your message intact.",
        retrying: true,
        retryCountdown: 0,
      },
    },
    {
      id: "rate-limit",
      title: "Rate limit",
      note: "A countdown is kinder than a disabled button with no explanation.",
      values: {
        severity: "rate-limit",
        message:
          "You've reached the request limit for this conversation. It resets shortly — no action needed.",
        retrying: false,
        retryCountdown: 12,
      },
    },
    {
      id: "warning",
      title: "Warning",
      note: "Amber, no retry — something the reader should know but need not act on.",
      values: {
        severity: "warning",
        message:
          "Retry succeeded — here's the answer that was generating when the request timed out.",
        retrying: false,
        retryCountdown: 0,
      },
    },
  ],
};

export function renderErrorMessage(v: ControlValues, key: string) {
  return (
    <ErrorMessage
      key={key}
      severity={v.severity as "error" | "rate-limit" | "warning"}
      title={v.title ? String(v.title) : undefined}
      message={String(v.message)}
      retrying={Boolean(v.retrying)}
      retryCountdown={Number(v.retryCountdown)}
      onRetry={() => {}}
    />
  );
}
