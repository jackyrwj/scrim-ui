"use client";

import * as React from "react";
import { PromptInput, type Attachment } from "./prompt-input";

const demoModels = [
  { id: "gpt-5", name: "GPT-5", hint: "Fast" },
  { id: "claude-sonnet", name: "Claude Sonnet", hint: "Balanced" },
  { id: "claude-opus", name: "Claude Opus", hint: "Reasoning" },
  { id: "gemini-pro", name: "Gemini Pro", hint: "Long context" },
];

export function DemoDefault() {
  const [loading, setLoading] = React.useState(false);
  return (
    <PromptInput
      loading={loading}
      onSubmit={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2500);
      }}
      onStop={() => setLoading(false)}
    />
  );
}

export function DemoAttachments() {
  const [files, setFiles] = React.useState<Attachment[]>([
    { id: "1", name: "screenshot.png", size: "1.2 MB", type: "image" },
    { id: "2", name: "requirements.pdf", size: "340 KB", type: "file" },
  ]);
  return (
    <PromptInput
      attachments={files}
      onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      onAttach={() =>
        setFiles((f) => [
          ...f,
          { id: String(Date.now()), name: `document-${f.length + 1}.txt`, size: "12 KB", type: "file" },
        ])
      }
      onSubmit={() => {}}
    />
  );
}

export function DemoModelSelector() {
  return <PromptInput models={demoModels} defaultModel="claude-sonnet" onSubmit={() => {}} />;
}

export function DemoLoading() {
  return <PromptInput loading onStop={() => {}} placeholder="Waiting for response…" />;
}

export function DemoError() {
  return (
    <PromptInput
      error="Message couldn't be sent. Check your connection and try again."
      onSubmit={() => {}}
    />
  );
}

export function DemoDisabled() {
  return <PromptInput disabled placeholder="Sign in to start chatting…" onSubmit={() => {}} />;
}
