"use client";

import * as React from "react";
import type { UIMessage } from "ai";

/**
 * Conversations, in the browser.
 *
 * localStorage rather than a database on purpose: this is the part of a chat
 * app that everyone rewrites against whatever they already run. What is worth
 * keeping is the shape — a list of conversations, each with an id, a title
 * derived from its first user message, and its messages — because the
 * sidebar, "New chat", and reload-and-it-is-still-there are all built on it.
 * To move this to a server, replace the four mutators and leave the callers
 * alone.
 *
 * It is an external store rather than component state because it has to be
 * read AFTER hydration and shared by the sidebar and the chat pane. Loading
 * it in an effect and calling setState is the pattern that both trips
 * react-hooks/set-state-in-effect and paints an empty sidebar for a frame;
 * useSyncExternalStore has a server snapshot built in, so the prerender and
 * the first client pass agree by construction.
 */

const STORAGE_KEY = "scrim-chat:conversations";

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

const EMPTY: Conversation[] = [];

let snapshot: Conversation[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function read(): Conversation[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    /* Stored data is the one input you cannot version-control. A shape check
       here beats a white screen after you change the message type. */
    return parsed.filter(
      (c): c is Conversation =>
        typeof c === "object" &&
        c !== null &&
        typeof (c as Conversation).id === "string" &&
        Array.isArray((c as Conversation).messages),
    );
  } catch {
    return EMPTY;
  }
}

function write(next: Conversation[]) {
  snapshot = next;
  emit();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Quota exceeded or storage blocked. The chat keeps working for this
       session — losing history beats losing the conversation. */
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrated = true;
    const stored = read();
    if (stored.length > 0) {
      snapshot = stored;
      /* Async so the store is not mutated during React's subscribe pass. */
      queueMicrotask(emit);
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useConversations(): Conversation[] {
  return React.useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );
}

export function newConversationId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Creates the conversation if it is new, updates it if it is not, and keeps
 *  the list in most-recent-first order. */
export function saveConversation(id: string, messages: UIMessage[]) {
  if (messages.length === 0) return;
  const rest = snapshot.filter((c) => c.id !== id);
  write([{ id, title: titleFor(messages), updatedAt: Date.now(), messages }, ...rest]);
}

export function deleteConversation(id: string) {
  write(snapshot.filter((c) => c.id !== id));
}

export function getConversation(id: string): Conversation | undefined {
  return snapshot.find((c) => c.id === id);
}

/** First user text, trimmed to something that fits a sidebar row. */
export function titleFor(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  const part = first?.parts.find((p) => p.type === "text");
  const value = part && "text" in part ? part.text.trim() : "";
  if (!value) return "New chat";
  return value.length > 40 ? `${value.slice(0, 40)}…` : value;
}
