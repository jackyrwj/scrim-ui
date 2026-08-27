"use client";

import * as React from "react";
import { RefusalMessage } from "./refusal-message";

export function DemoRefusal() {
  const [accepted, setAccepted] = React.useState(false);
  return accepted ? (
    <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
      To segment a home network, put IoT devices on a guest VLAN so a
      compromised device can’t reach your computers…
      <button
        type="button"
        onClick={() => setAccepted(false)}
        className="mt-2 block text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        Reset demo
      </button>
    </div>
  ) : (
    <RefusalMessage
      message="I can't help with gaining access to a network you don't own."
      reason="This falls under unauthorized access — I can only help with networks you administer yourself."
      suggestion="Ask about securing my own home network instead"
      onSuggestion={() => setAccepted(true)}
    />
  );
}

export function DemoRefusalPlain() {
  return (
    <RefusalMessage message="I can't generate a medical diagnosis from a photo." />
  );
}
