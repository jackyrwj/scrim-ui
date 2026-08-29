import { ModelIcon } from "@/components/brands/brand-icon";
import type { ColorScheme } from "./types";

/* The tool's live sample, shown beside its controls and reused by the
   /tools card demo — the palette on screen is always derived by
   color-engine from the current brand color, never hand-picked. */
export function ChatPreview({ scheme }: { scheme: ColorScheme }) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-sm"
      style={{ background: scheme.background, color: scheme.foreground, borderColor: scheme.inputBorder }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2.5"
        style={{ borderColor: scheme.inputBorder }}
      >
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: scheme.streamingCursor }}
        />
        <span className="text-sm font-medium">AI Assistant</span>
        <span
          className="ml-auto inline-flex items-center gap-1.5 text-xs"
          style={{ color: scheme.mutedText }}
        >
          <ModelIcon name="GPT-5.6 Sol" size={11} tone="current" />
          GPT-5.6
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3 p-4">
        {/* User message */}
        <div className="flex justify-end">
          <div
            className="max-w-[75%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm"
            style={{ background: scheme.userBubble, color: scheme.userBubbleText }}
          >
            How does streaming work in AI chat?
          </div>
        </div>

        {/* Thinking indicator */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: scheme.thinkingIndicator }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Thinking for 2.3s
        </div>

        {/* Assistant message */}
        <div className="flex justify-start">
          <div
            className="max-w-[75%] rounded-2xl rounded-bl-md px-3.5 py-2 text-sm"
            style={{ background: scheme.assistantBubble, color: scheme.assistantBubbleText }}
          >
            Streaming delivers tokens incrementally so the user sees partial
            responses in real-time
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse"
              style={{ background: scheme.streamingCursor }}
            />
          </div>
        </div>

        {/* Tool call */}
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: scheme.toolCallAccent, color: scheme.toolCallAccent }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          {/* A string expression, not bare JSX text: the double quotes are part
              of the code sample being shown, and entity-escaping them here
              would make the source harder to read than the output. */}
          {'search_web("streaming protocol SSE")'}
        </div>

        {/* Source card */}
        <div
          className="rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: scheme.sourceCardBorder, color: scheme.mutedText }}
        >
          <div className="font-medium" style={{ color: scheme.foreground }}>
            MDN — Server-Sent Events
          </div>
          <div className="mt-0.5">developer.mozilla.org</div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: scheme.inputBorder }}>
        <div
          className="flex items-center rounded-xl border px-3 py-2"
          style={{
            background: scheme.inputBackground,
            borderColor: scheme.inputBorder,
            color: scheme.mutedText,
          }}
        >
          <span className="text-sm">Ask a follow-up...</span>
          <div
            className="ml-auto h-6 w-6 rounded-lg"
            style={{ background: scheme.streamingCursor }}
          />
        </div>
      </div>
    </div>
  );
}
