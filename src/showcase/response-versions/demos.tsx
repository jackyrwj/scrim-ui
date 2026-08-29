"use client";

import * as React from "react";
import { ResponseVersions, type ResponseVersion } from "./response-versions";
import { StreamingMessage } from "../streaming-message/streaming-message";

const ANSWERS = [
  "Streaming works because the first token arrives in milliseconds — the interface feels instant long before the answer is finished. Keep the reveal smooth and offer a stop control.",
  "The real reason to stream is perceived latency: readers start parsing the answer while the model is still writing it. What matters is a stable layout and a visible caret.",
  "Stream when the output is prose for a human; wait for the full payload when it is structured data for a program. The decision rule is who consumes the tokens.",
];

function prose(text: string) {
  return <p className="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">{text}</p>;
}

/** A single assistant answer with the full regenerate loop wired up:
 *  regenerate appends a streaming version, continue-from branches off an
 *  older one, and the pager never yanks the reader forward. */
export function InteractiveVersions({
  initialVersions,
}: {
  initialVersions?: ResponseVersion[];
}) {
  const [versions, setVersions] = React.useState<ResponseVersion[]>(
    () => initialVersions ?? [{ id: "v1", status: "ready", content: prose(ANSWERS[0]) }],
  );
  const counter = React.useRef(1);

  function appendVersion(branchedFrom?: string) {
    const n = counter.current++;
    const id = `v${versions.length + 1}-${n}`;
    const text = ANSWERS[n % ANSWERS.length];
    const version: ResponseVersion = {
      id,
      status: "generating",
      branchedFrom,
      content: (
        <StreamingMessage
          key={id}
          text={text}
          isStreaming
          speed={3}
          onComplete={() =>
            setVersions((vs) => vs.map((v) => (v.id === id ? { ...v, status: "ready" } : v)))
          }
        />
      ),
    };
    setVersions((vs) => [...vs, version]);
  }

  return (
    <ResponseVersions
      versions={versions}
      onRegenerate={() => appendVersion()}
      onContinueFrom={(id) => appendVersion(id)}
    />
  );
}

export function DemoDefault() {
  return <InteractiveVersions />;
}
