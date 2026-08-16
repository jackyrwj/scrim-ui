"use client";

import * as React from "react";
import { ToolToggle, type ToolSetting } from "./tool-toggle";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="m4 17 6-6-6-6M12 19h8" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
      <path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

const defaultTools: ToolSetting[] = [
  {
    id: "web",
    name: "Web search",
    description: "Search the web for up-to-date answers",
    enabled: true,
    icon: <GlobeIcon />,
  },
  {
    id: "code",
    name: "Code execution",
    description: "Run code to verify or compute answers",
    enabled: true,
    icon: <TerminalIcon />,
  },
  {
    id: "files",
    name: "File access",
    description: "Read files from your connected workspace",
    enabled: false,
    icon: <FileIcon />,
  },
  {
    id: "browser",
    name: "Browser",
    description: "Open and interact with web pages",
    enabled: false,
    icon: <MonitorIcon />,
  },
];

export function DemoDefault() {
  const [tools, setTools] = React.useState(defaultTools);
  return (
    <ToolToggle
      tools={tools}
      onToggle={(id, enabled) =>
        setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled } : t)))
      }
    />
  );
}

export function DemoDisabled() {
  const [tools, setTools] = React.useState<ToolSetting[]>([
    ...defaultTools.map((t) => ({ ...t })),
    {
      id: "memory",
      name: "Memory",
      description: "Recall prior conversations · Pro plan",
      enabled: true,
      disabled: true,
      icon: <SparkleIcon />,
    },
  ]);
  return (
    <ToolToggle
      tools={tools}
      onToggle={(id, enabled) =>
        setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled } : t)))
      }
    />
  );
}
