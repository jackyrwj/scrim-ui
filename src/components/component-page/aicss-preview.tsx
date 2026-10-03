"use client";

import dynamic from "next/dynamic";

const CodeBlock = dynamic(() => import("@/aicss-source/react/code-block/CodeBlock").then((m) => m.CodeBlock));
const ComparisonTable = dynamic(() => import("@/aicss-source/react/comparison-table/ComparisonTable").then((m) => m.ComparisonTable));
const DataTable = dynamic(() => import("@/aicss-source/react/data-table/DataTable").then((m) => m.DataTable));
const FileDiff = dynamic(() => import("@/aicss-source/react/file-diff/FileDiff").then((m) => m.FileDiff));
const InlineCitations = dynamic(() => import("@/aicss-source/react/inline-citations/InlineCitations").then((m) => m.InlineCitations));
const MessageActions = dynamic(() => import("@/aicss-source/react/message-actions/MessageActions").then((m) => m.MessageActions));
const Orb = dynamic(() => import("@/aicss-source/react/orbs/Orb").then((m) => m.Orb));
const ReasoningEffort = dynamic(() => import("@/aicss-source/react/reasoning-effort/ReasoningEffort").then((m) => m.ReasoningEffort));
const SecureInput = dynamic(() => import("@/aicss-source/react/secure-input/SecureInput").then((m) => m.SecureInput));
const StreamingText = dynamic(() => import("@/aicss-source/react/streaming-text/StreamingText").then((m) => m.StreamingText));
const TextResponse = dynamic(() => import("@/aicss-source/react/text-response/TextResponse").then((m) => m.TextResponse));
const ThinkingReasoning = dynamic(() => import("@/aicss-source/react/thinking-reasoning/ThinkingReasoning").then((m) => m.ThinkingReasoning));
const ThinkingState = dynamic(() => import("@/aicss-source/react/thinking-state/ThinkingState").then((m) => m.ThinkingState));

export function AicssPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "code-block": return <CodeBlock lang="TypeScript" code={'const answer = await agent.run("Find the best source");\nconsole.log(answer);'} />;
    case "comparison-table": return <ComparisonTable />;
    case "data-table": return <DataTable />;
    case "file-diff": return <FileDiff />;
    case "inline-citations": return <InlineCitations />;
    case "message-actions": return <MessageActions />;
    case "orbs": return <div className="flex flex-wrap items-center justify-center gap-8"><Orb variant="S1" size={48} /><Orb variant="B2" size={48} /><Orb variant="C3" size={48} /><Orb variant="G4" size={48} /></div>;
    case "reasoning-effort": return <ReasoningEffort />;
    case "secure-input": return <SecureInput />;
    case "streaming-text": return <StreamingText text="The assistant is writing a thoughtful response, one word at a time." />;
    case "text-response": return <TextResponse>AI interfaces work best when every state is clear and easy to act on.</TextResponse>;
    case "thinking-reasoning": return <ThinkingReasoning />;
    case "thinking-state": return <ThinkingState />;
    default: return null;
  }
}
