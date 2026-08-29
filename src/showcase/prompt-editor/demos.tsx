"use client";

import * as React from "react";
import { PromptEditor } from "./prompt-editor";

const VARIABLES = ["product", "audience", "tone", "limit"];

const INITIAL = `You are the documentation writer for {{product}}.

Answer for {{audience}} in a {{tone}} tone. Keep the answer under {{limit}} words.

If the docs do not cover the question, say so — do not improvise.`;

const PREVIEW_VALUES: Record<string, string> = {
  product: "Scrim UI",
  audience: "a senior frontend engineer",
  tone: "direct",
  limit: "120",
};

const PREVIOUS_VERSION = `You are the documentation writer for {{product}}.

Answer for {{audience}}. Keep answers short.

If the docs do not cover the question, say so — do not improvise.`;

export function DemoDefault() {
  const [value, setValue] = React.useState(INITIAL);
  return (
    <PromptEditor
      value={value}
      onChange={setValue}
      variables={VARIABLES}
      previewValues={PREVIEW_VALUES}
    />
  );
}

export function DemoWithDiff() {
  const [value, setValue] = React.useState(INITIAL);
  return (
    <PromptEditor
      value={value}
      onChange={setValue}
      variables={VARIABLES}
      previewValues={PREVIEW_VALUES}
      compareWith={PREVIOUS_VERSION}
      rows={6}
    />
  );
}

/* One typo on purpose: {{audienc}} is not in the list, so it takes the
   warning tint and stays as-is in the preview instead of vanishing. */
export function DemoUnknownVariable() {
  const [value, setValue] = React.useState(
    "Write the release notes for {{product}} aimed at {{audienc}}.",
  );
  return (
    <PromptEditor
      value={value}
      onChange={setValue}
      variables={VARIABLES}
      previewValues={PREVIEW_VALUES}
      rows={4}
    />
  );
}
