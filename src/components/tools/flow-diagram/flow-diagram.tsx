"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import { Section, Field, inputCls, selectCls } from "../tool-ui";
import type { FlowConfig, FlowNode, NodeType } from "./types";
import { defaultConfig, createNode, NODE_TYPE_OPTIONS } from "./types";
import { layoutNodes } from "./layout-engine";
import { renderFlowSvg } from "./render-svg";

function NodeEditor({
  node,
  index,
  total,
  onChange,
  onMove,
  onDelete,
}: {
  node: FlowNode;
  index: number;
  total: number;
  onChange: (updated: FlowNode) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
          Node {index + 1}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded px-1.5 py-0.5 text-xs text-(--muted-foreground) hover:text-(--foreground) disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="rounded px-1.5 py-0.5 text-xs text-(--muted-foreground) hover:text-(--foreground) disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:text-red-600"
            aria-label="Delete node"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <select
          value={node.type}
          onChange={(e) =>
            onChange({ ...node, type: e.target.value as NodeType })
          }
          className={selectCls + " text-xs"}
        >
          {NODE_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={node.label}
          onChange={(e) => onChange({ ...node, label: e.target.value })}
          placeholder="Label"
          className={inputCls + " text-xs"}
        />
        <input
          type="text"
          value={node.description}
          onChange={(e) => onChange({ ...node, description: e.target.value })}
          placeholder="Description (optional)"
          className={inputCls + " text-xs"}
        />
      </div>
    </div>
  );
}

export function FlowDiagram() {
  const [config, setConfig] = React.useState<FlowConfig>(
    structuredClone(defaultConfig)
  );
  const previewRef = React.useRef<HTMLDivElement>(null);

  const { positioned, edges, viewBox } = React.useMemo(
    () => layoutNodes(config.nodes),
    [config.nodes]
  );

  const svgString = React.useMemo(
    () => renderFlowSvg(positioned, edges, viewBox, config.title),
    [positioned, edges, viewBox, config.title]
  );

  function updateNode(index: number, updated: FlowNode) {
    setConfig((c) => {
      const nodes = [...c.nodes];
      nodes[index] = updated;
      return { ...c, nodes };
    });
  }

  function moveNode(index: number, direction: -1 | 1) {
    setConfig((c) => {
      const nodes = [...c.nodes];
      const target = index + direction;
      if (target < 0 || target >= nodes.length) return c;
      [nodes[index], nodes[target]] = [nodes[target], nodes[index]];
      return { ...c, nodes };
    });
  }

  function deleteNode(index: number) {
    setConfig((c) => ({
      ...c,
      nodes: c.nodes.filter((_, i) => i !== index),
    }));
  }

  function addNode() {
    setConfig((c) => ({
      ...c,
      nodes: [...c.nodes, createNode("user-message")],
    }));
  }

  async function exportPng() {
    if (!previewRef.current) return;
    const url = await toPng(previewRef.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-diagram.png";
    a.click();
  }

  function exportSvg() {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flow-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            AI Conversation Flow Diagram
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-(--muted-foreground)">
            Build a visual flow of your AI conversation — user messages, AI
            responses, tool calls, and approval gates. Export as SVG or PNG.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfig(structuredClone(defaultConfig))}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={exportSvg}
            disabled={config.nodes.length === 0}
            className="inline-flex h-8 items-center rounded-lg border border-(--border) px-3 text-xs font-medium text-(--foreground) transition-colors hover:bg-(--muted) disabled:opacity-40"
          >
            Export SVG
          </button>
          <button
            type="button"
            onClick={exportPng}
            disabled={config.nodes.length === 0}
            className="inline-flex h-8 items-center rounded-lg bg-(--foreground) px-3 text-xs font-semibold text-(--background) transition-opacity disabled:opacity-40"
          >
            Export PNG
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          <Section title="Diagram Title">
            <Field label="Title">
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, title: e.target.value }))
                }
                className={inputCls}
                placeholder="My AI Flow"
              />
            </Field>
          </Section>

          <Section title="Nodes">
            <div className="space-y-3">
              {config.nodes.map((node, i) => (
                <NodeEditor
                  key={node.id}
                  node={node}
                  index={i}
                  total={config.nodes.length}
                  onChange={(updated) => updateNode(i, updated)}
                  onMove={(dir) => moveNode(i, dir)}
                  onDelete={() => deleteNode(i)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addNode}
              className="mt-3 w-full rounded-lg border border-dashed border-(--border) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition-colors hover:border-(--foreground) hover:text-(--foreground)"
            >
              + Add Node
            </button>
          </Section>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <div
            ref={previewRef}
            className="overflow-hidden rounded-xl border border-(--border) bg-white p-4"
          >
            {config.nodes.length > 0 ? (
              <div dangerouslySetInnerHTML={{ __html: svgString }} />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-(--muted-foreground)">
                Add nodes to see your flow diagram
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
