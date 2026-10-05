"use client";

import { useState } from "react";
import { NativeComponentSample } from "./native-component-sample";
import { useGalleryClock } from "./gallery-preview";
import { sliceTo } from "@/components/templates/use-demo-motion";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { StreamingMessage } from "@/showcase/streaming-message/streaming-message";
import { ToolCall } from "@/showcase/tool-call/tool-call";
import { MessageActions } from "@/showcase/message-actions/message-actions";
import { SourceCard } from "@/showcase/source-card/source-card";
import type { StyledComponentSlug } from "@/lib/component-style";

/** The gallery and style review render the same source that the registry exports. */
export function ComponentStyleSample({ slug, interactive = false }: { slug: StyledComponentSlug; interactive?: boolean }) {
  const clock = useGalleryClock();
  const animate = Boolean(clock?.animate && !interactive);
  const seconds = (clock?.elapsed ?? 9000) / 1000;
  const working = animate && seconds < 5;
  const [notice, setNotice] = useState("");
  const [reply, setReply] = useState({ run: 0, streaming: false, stopped: false });
  const [toolStatus, setToolStatus] = useState<"running" | "success" | "error">("success");
  const [compact, setCompact] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const replyText = "I found three relevant sources. Here is a concise summary of the key ideas, with references you can explore next.";

  if (!(["prompt-input", "streaming-message", "tool-call", "message-actions", "source-card"] as string[]).includes(slug)) return <NativeComponentSample slug={slug} interactive={interactive} />;

  return (
    <div className="w-full min-w-0">
      {slug === "prompt-input" && <PromptInput placeholder={animate && seconds < 6 ? "Summarize the sources for me…".slice(0, Math.max(1, Math.round(seconds * 10))) : "Ask anything…"} models={[{ id: "fast", name: "Fast" }, { id: "reasoning", name: "Reasoning" }]} onSubmit={(value) => setNotice(`Submitted: ${value}`)} onAttach={() => setNotice("Attachment action selected")} onVoice={() => setNotice("Voice action selected")} />}
      {slug === "streaming-message" && <StreamingMessage key={reply.run} text={animate ? sliceTo(replyText, Math.min((seconds + 0.5) / 5, 1)) : replyText} isStreaming={reply.streaming} stopped={reply.stopped} speed={2} onComplete={() => setReply((value) => ({ ...value, streaming: false }))} onStop={() => setReply((value) => ({ ...value, streaming: false, stopped: true }))} onRegenerate={() => setReply((value) => ({ run: value.run + 1, streaming: true, stopped: false }))} />}
      {slug === "tool-call" && <ToolCall key={toolStatus} name="Search the web" status={animate ? working ? "running" : "success" : toolStatus} duration={(animate ? !working : toolStatus === "success") ? "1.2s" : undefined} defaultOpen={false} input={'{ "query": "AI interface patterns" }'} output={toolStatus === "error" ? "The search timed out. Try again." : "3 relevant sources found."} onCancel={toolStatus === "running" ? () => { setToolStatus("error"); setNotice("Search cancelled"); } : undefined} />}
      {slug === "message-actions" && <div><p className="mb-4 text-sm leading-7 text-(--foreground)">Here are the key ideas from the sources I found.</p><MessageActions compact={compact} disabled={disabled} onCopy={() => setNotice("Copy action selected")} onRegenerate={() => setNotice("Regenerate action selected")} onFeedback={(vote) => setNotice(vote === "up" ? "Positive feedback selected" : "Negative feedback selected")} onShare={() => setNotice("Share action selected")} /></div>}
      {slug === "source-card" && <SourceCard title="A guide to AI interfaces" domain="scrimui.dev" url="https://scrimui.dev/components" snippet="Components for conversations, tool calls and the states in between." index={1} />}
      {interactive && slug === "tool-call" && <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Tool status">{(["running", "success", "error"] as const).map((status) => <button key={status} type="button" aria-pressed={toolStatus === status} onClick={() => setToolStatus(status)} className={`min-h-8 rounded-md px-3 text-xs capitalize ${toolStatus === status ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}>{status}</button>)}</div>}
      {interactive && slug === "message-actions" && <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Action options"><button type="button" aria-pressed={compact} onClick={() => setCompact((value) => !value)} className="min-h-8 rounded-md bg-(--muted) px-3 text-xs">{compact ? "Show labels" : "Icons only"}</button><button type="button" aria-pressed={disabled} onClick={() => setDisabled((value) => !value)} className="min-h-8 rounded-md bg-(--muted) px-3 text-xs">{disabled ? "Enable actions" : "Disable actions"}</button></div>}
      {interactive && <p role="status" className="mt-3 min-h-5 break-words text-xs text-(--muted-foreground)">{notice}</p>}
    </div>
  );
}
