"use client";

import * as React from "react";
import { PromptInput, type Attachment } from "./prompt-input";
import { Playground, PField, PToggle, pInputCls } from "@/components/component-page/playground";

const demoModels = [
  { id: "gpt-5", name: "GPT-5", hint: "Fast" },
  { id: "claude-sonnet", name: "Claude Sonnet", hint: "Balanced" },
  { id: "claude-opus", name: "Claude Opus", hint: "Reasoning" },
];

const sampleFiles: Attachment[] = [
  { id: "s1", name: "screenshot.png", size: "1.2 MB", type: "image" },
  { id: "s2", name: "requirements.pdf", size: "340 KB", type: "file" },
];

export function PromptInputPlayground() {
  const [placeholder, setPlaceholder] = React.useState("Ask anything…");
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [showWebSearch, setShowWebSearch] = React.useState(true);
  const [showTools, setShowTools] = React.useState(true);
  const [showModels, setShowModels] = React.useState(true);
  const [showAttachments, setShowAttachments] = React.useState(false);

  const submit = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Playground
      title="Prompt input"
      demo={
        <PromptInput
          placeholder={placeholder}
          loading={loading}
          disabled={disabled}
          showWebSearch={showWebSearch}
          showTools={showTools}
          models={showModels ? demoModels : undefined}
          attachments={showAttachments ? sampleFiles : []}
          onSubmit={submit}
          onStop={() => setLoading(false)}
        />
      }
      controls={
        <>
          <PField label="Placeholder">
            <input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className={pInputCls}
            />
          </PField>

          <PToggle label="Loading (stop button)" checked={loading} onChange={setLoading} />
          <PToggle label="Disabled" checked={disabled} onChange={setDisabled} />
          <PToggle label="Web search toggle" checked={showWebSearch} onChange={setShowWebSearch} />
          <PToggle label="Tools toggle" checked={showTools} onChange={setShowTools} />
          <PToggle label="Model selector" checked={showModels} onChange={setShowModels} />
          <PToggle label="Attachments" checked={showAttachments} onChange={setShowAttachments} />

          <p className="pt-1 text-xs leading-5 text-(--muted-foreground)">
            Type a message and press Enter to see the send button become a stop button for two
            seconds.
          </p>
        </>
      }
    />
  );
}
