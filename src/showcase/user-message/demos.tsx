"use client";

import * as React from "react";
import { UserMessage } from "./user-message";

const DEFAULT_TEXT =
  "Give me a table comparing the three streaming approaches — time to first token, perceived latency and implementation cost.";

const LONG_TEXT =
  "Walk through the full flow: user sends a prompt, the model streams a draft, the draft includes a tool call to fetch sources, the tool returns, and the final answer cites those sources inline. Then show me where each of those transitions should live in the UI — which states are worth animating and which should just swap instantly.\n\nPay special attention to the moment the tool call returns: does the composer stay focused, does the message keep its place, and is there a visible affordance that the turn isn't finished yet?";

export function DemoDefault() {
  return <UserMessage text={DEFAULT_TEXT} onCopy={() => {}} onEdit={() => {}} onRegenerate={() => {}} />;
}

export function DemoEdited() {
  return <UserMessage text={DEFAULT_TEXT} edited onCopy={() => {}} onEdit={() => {}} />;
}

export function DemoLong() {
  return <UserMessage text={LONG_TEXT} onCopy={() => {}} />;
}
