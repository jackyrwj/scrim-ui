"use client";

import * as React from "react";
import { buildPatternPrompt, type PatternPromptInput } from "@/lib/agent-prompt";
import { installCommand, usePackageManager } from "@/lib/package-managers";
import { AgentPromptCard } from "./agent-prompt-card";

/**
 * A pattern's agent prompt.
 *
 * Thin, but it has to be a client component: the install command it quotes
 * follows the package manager the reader picked in the bar above it, and that
 * lives in a client store. Building the prompt on the server would freeze it
 * at npm for everyone.
 */
export function PatternAgentPrompt({
  pattern,
}: {
  pattern: Omit<PatternPromptInput, "installCommand"> & { registryUrl: string };
}) {
  const manager = usePackageManager();
  const prompt = React.useMemo(
    () => buildPatternPrompt({ ...pattern, installCommand: installCommand(manager, pattern.registryUrl) }),
    [pattern, manager],
  );

  return (
    <AgentPromptCard
      prompt={prompt}
      hint="Installs the screen and every component it is built from, and carries the layout rules from this page so an agent does not restyle them away."
    />
  );
}
