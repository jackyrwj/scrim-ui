"use client";

import * as React from "react";
import Link from "next/link";
import { VoiceConversation } from "@/showcase/voice-conversation/voice-conversation";
import { CopyButton } from "@/components/component-page/copy-button";
import type { VoiceScript, VoiceScriptCategory } from "@/lib/voice-scripts";

function transcriptToText(script: VoiceScript): string {
  return script.config.turns
    .map((turn) => `${turn.role === "user" ? "You" : "Assistant"}: ${turn.text}`)
    .join("\n\n");
}

export function VoiceScriptCard({
  script,
  category,
}: {
  script: VoiceScript;
  category?: VoiceScriptCategory;
}) {
  const previewTurns = script.config.turns.slice(0, 3);

  return (
    <article className="flex flex-col rounded-xl border border-(--border) bg-(--card) p-5 transition-colors hover:border-(--muted-foreground)/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{script.name}</h3>
          {category && (
            <span className="mt-1 inline-block rounded-full bg-(--muted) px-2 py-0.5 text-[11px] text-(--muted-foreground)">
              {category.name}
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{script.description}</p>

      {script.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {script.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-(--border) px-2 py-0.5 text-[11px] text-(--muted-foreground)"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-(--border) bg-(--background) p-3">
        <VoiceConversation turns={previewTurns} />
        {script.config.turns.length > 3 && (
          <p className="mt-2 text-xs text-(--muted-foreground)">
            +{script.config.turns.length - 3} more turns
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/tools/voice-mockup?script=${script.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-(--foreground) px-4 py-2 text-sm font-medium text-(--background) transition-opacity hover:opacity-85"
        >
          Open in mockup
        </Link>
        <CopyButton code={transcriptToText(script)} label="Copy" />
      </div>
    </article>
  );
}
