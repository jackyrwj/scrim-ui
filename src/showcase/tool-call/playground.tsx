"use client";

import * as React from "react";
import { ToolCall, type ToolStatus } from "./tool-call";
import { Playground, PField, PToggle, pInputCls } from "@/components/component-page/playground";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const DEFAULT_INPUT = `{\n  "query": "best AI chat UI patterns"\n}`;
const DEFAULT_OUTPUT = `{\n  "results": 24,\n  "top": [\n    "streaming message patterns",\n    "citation UI patterns"\n  ]\n}`;

export function ToolCallPlayground() {
  const [name, setName] = React.useState("Search the web");
  const [status, setStatus] = React.useState<ToolStatus>("success");
  const [duration, setDuration] = React.useState("1.2s");
  const [defaultOpen, setDefaultOpen] = React.useState(true);
  const [showInput, setShowInput] = React.useState(true);
  const [showOutput, setShowOutput] = React.useState(true);
  const [run, setRun] = React.useState(0);

  return (
    <Playground
      title="Tool call"
      demo={
        <ToolCall
          key={`${run}-${status}-${defaultOpen}`}
          name={name}
          icon={<SearchIcon />}
          status={status}
          duration={duration}
          defaultOpen={defaultOpen}
          input={showInput ? DEFAULT_INPUT : undefined}
          output={showOutput ? DEFAULT_OUTPUT : undefined}
          onCancel={() => setStatus("success")}
        />
      }
      controls={
        <>
          <PField label="Tool name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={pInputCls}
            />
          </PField>

          <PField label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ToolStatus)}
              className={`${pInputCls} appearance-none`}
            >
              <option value="running">Running</option>
              <option value="success">Completed</option>
              <option value="error">Failed</option>
            </select>
          </PField>

          <PField label="Duration">
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={pInputCls}
            />
          </PField>

          <PToggle label="Open details by default" checked={defaultOpen} onChange={setDefaultOpen} />
          <PToggle label="Show input payload" checked={showInput} onChange={setShowInput} />
          <PToggle label="Show output" checked={showOutput} onChange={setShowOutput} />

          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            className="w-full rounded-lg border border-(--border) px-3 py-2 text-xs font-medium transition-colors hover:bg-(--muted)"
          >
            Reset demo
          </button>
        </>
      }
    />
  );
}
