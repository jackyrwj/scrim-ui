"use client";

import * as React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { DEFAULT_CHUNKING, type ChunkOptions } from "@/lib/chunk";
import { citedNumbers, parseCitations } from "@/lib/citations";
import { sourcesOf, textOf, type RagUIMessage, type SourceRef } from "@/lib/message";
import { DEFAULT_MODEL, MODELS } from "@/lib/models";
import { Answer } from "./answer";
import { ChunkingPanel } from "./chunking-panel";
import { DocumentPane } from "./document-pane";
import { Sources } from "./sources";
import { Uploader, type IngestResult } from "./uploader";
import { ErrorMessage } from "./ui/error-message";
import { PromptInput } from "./ui/prompt-input";
import { ThinkingIndicator } from "./ui/thinking-indicator";

/**
 * The app: a document on the left, questions about it on the right, and a
 * click on any citation joining the two.
 *
 * The state worth reading is `activeSource`. It is the only piece of shared
 * state between the two panes, and it exists because a citation is not a
 * decoration — it is a link between two views that would otherwise have no
 * idea about each other. Click `[2]` in an answer, or a row in the source
 * list, and the reading pane scrolls the passage into view and marks it. That
 * one interaction is what people mean when they say a RAG app "shows its
 * work", and it costs one useState because the offsets were carried honestly
 * all the way from lib/chunk.ts.
 *
 * `documentText` lives here rather than being fetched by the pane, for the
 * same reason the sources carry offsets instead of text: one copy of the
 * string, so a highlight and a popover cannot disagree with each other.
 */

export function Rag() {
  const [document, setDocument] = React.useState<IngestResult>();
  const [chunking, setChunking] = React.useState<ChunkOptions>(DEFAULT_CHUNKING);
  const [activeSource, setActiveSource] = React.useState<SourceRef>();
  const [rechunking, setRechunking] = React.useState(false);
  const [rechunkError, setRechunkError] = React.useState<string>();
  const [model, setModel] = React.useState(DEFAULT_MODEL);
  const [pane, setPane] = React.useState<"document" | "answers">("answers");

  const transport = React.useMemo(
    () => new DefaultChatTransport<RagUIMessage>({ api: "/api/ask" }),
    [],
  );
  const { messages, setMessages, sendMessage, status, stop, error, regenerate } =
    useChat<RagUIMessage>({ transport });

  const busy = status === "submitted" || status === "streaming";
  const documentText = document?.text ?? "";

  function ask(question: string, selected?: string) {
    if (!document) return;
    const chosen = selected ?? model;
    setModel(chosen);
    setActiveSource(undefined);
    /* The document id travels with the question rather than being baked into
       the transport, so switching documents does not mean tearing down the
       chat — and so the server can refuse an id that is no longer in the
       store instead of answering from the wrong one. */
    sendMessage({ text: question }, { body: { documentId: document.document.id, model: chosen } });
  }

  function jumpTo(source: SourceRef) {
    setActiveSource(source);
    setPane("document");
  }

  /** Re-chunk and re-embed the document already in the store. */
  async function applyChunking(next: ChunkOptions) {
    setChunking(next);
    if (!document) return;

    setRechunking(true);
    setRechunkError(undefined);
    try {
      const form = new FormData();
      form.set("documentId", document.document.id);
      form.set("chunking", JSON.stringify(next));
      const response = await fetch("/api/ingest", { method: "POST", body: form });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const { error: message } = (payload ?? {}) as { error?: string };
        setRechunkError(message ?? "Re-chunking failed.");
        return;
      }
      setDocument(payload as IngestResult);
      /* Every answer on screen cites offsets from the OLD chunking. They are
         not wrong about the document — the text has not changed — but the
         passages they point at no longer correspond to anything retrieval
         would return now, and leaving them there invites a comparison
         between two things that were never comparable. Clearing the thread
         is the honest move, and saying so is better than doing it silently. */
      setMessages([]);
      setActiveSource(undefined);
    } catch {
      setRechunkError("The request did not reach the server.");
    } finally {
      setRechunking(false);
    }
  }

  if (!document) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-4 py-12">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ask a document</h1>
          <p className="mt-1.5 text-[13px] leading-6 text-zinc-500">
            Upload something and ask questions about it. Every claim in the answer carries a
            citation you can click, and it lands on the sentence it came from — not on a list of
            filenames at the bottom.
          </p>
        </div>
        <Uploader chunking={chunking} onIngested={setDocument} />
        <ChunkingPanel applied={chunking} onApply={setChunking} />
      </main>
    );
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <main className="flex h-dvh flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Only below md, where the two panes cannot sit side by side. Tabs
          rather than stacking: a document and an answer are both things you
          scroll, and stacking two scroll regions on a phone means neither is
          usable. */}
      <div className="flex shrink-0 gap-1 border-b border-zinc-200 p-2 md:hidden dark:border-zinc-800">
        {(["document", "answers"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPane(id)}
            data-selected={pane === id ? "" : undefined}
            className="flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium capitalize text-zinc-500 transition-colors data-selected:bg-zinc-100 data-selected:text-zinc-900 dark:data-selected:bg-zinc-900 dark:data-selected:text-zinc-100"
          >
            {id}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <section
          data-hidden={pane === "answers" ? "" : undefined}
          className="min-w-0 flex-1 data-hidden:hidden md:data-hidden:block"
        >
          <DocumentPane
            name={document.document.name}
            text={documentText}
            sources={lastMessage ? sourcesOf(lastMessage) : []}
            activeSource={activeSource}
            chunkCount={document.document.chunkCount}
          />
        </section>

        <section
          data-hidden={pane === "document" ? "" : undefined}
          className="flex min-w-0 flex-1 flex-col border-zinc-200 data-hidden:hidden md:flex md:max-w-[30rem] md:border-l md:data-hidden:flex dark:border-zinc-800"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-[13px] leading-6 text-zinc-500">
                  Ask something the document answers — and then ask it something the document does
                  not. The second one is the interesting test.
                </p>
                <ChunkingPanel
                  applied={document.document.chunking}
                  appliedStats={{
                    chunkCount: document.document.chunkCount,
                    embedMs: document.timings.embed,
                  }}
                  onApply={applyChunking}
                  busy={rechunking}
                />
                {rechunkError && <ErrorMessage message={rechunkError} />}
              </div>
            )}

            {messages.map((message, i) => {
              if (message.role === "user") {
                return (
                  <div key={message.id} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2 text-[13px] leading-6 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                      {textOf(message)}
                    </p>
                  </div>
                );
              }

              const text = textOf(message);
              const sources = sourcesOf(message);
              const streaming = status === "streaming" && i === messages.length - 1;

              return (
                <div key={message.id}>
                  <Answer
                    text={text}
                    sources={sources}
                    documentText={documentText}
                    streaming={streaming}
                    onJump={jumpTo}
                  />
                  {/* Only once the answer has settled: which passages were
                      cited is not knowable while the citations are still
                      arriving, and a list that grows under the reader is a
                      list they will re-read three times. */}
                  {!streaming && (
                    <Sources
                      sources={sources}
                      documentText={documentText}
                      cited={citedNumbers(parseCitations(text).segments)}
                      activeSource={activeSource}
                      onSelect={jumpTo}
                    />
                  )}
                </div>
              );
            })}

            {status === "submitted" && <ThinkingIndicator />}

            {error && (
              <ErrorMessage
                message={error.message || "Something went wrong."}
                onRetry={() => regenerate({ body: { documentId: document.document.id, model } })}
              />
            )}
          </div>

          <div className="shrink-0 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
            <PromptInput
              models={MODELS.map((m) => ({ id: m.id, name: m.name, hint: m.hint }))}
              defaultModel={DEFAULT_MODEL}
              placeholder={busy ? "Answering…" : `Ask about ${document.document.name}…`}
              loading={busy}
              disabled={rechunking}
              onSubmit={ask}
              onStop={stop}
            />
            <p className="mt-2 text-center text-[11px] text-zinc-400">
              Answers come only from this document. Click any citation to see where.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
