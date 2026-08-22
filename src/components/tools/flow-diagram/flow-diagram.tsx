"use client";

import * as React from "react";
import { toPng } from "html-to-image";
import { Section, Field, inputCls, selectCls } from "../tool-ui";
import type { FlowBranch, FlowConfig, FlowNode, NodeType } from "./types";
import {
  MAX_BRANCH_DEPTH,
  NODE_TYPE_OPTIONS,
  canBranch,
  createBranch,
  createNode,
  defaultConfig,
} from "./types";
import { layoutNodes } from "./layout-engine";
import { renderFlowSvg } from "./render-svg";

const MAX_PATHS = 3;

function NodeEditor({
  node,
  index,
  total,
  depth = 0,
  onChange,
  onMove,
  onDelete,
}: {
  node: FlowNode;
  index: number;
  total: number;
  depth?: number;
  onChange: (updated: FlowNode) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  const allowBranching = depth < MAX_BRANCH_DEPTH;
  const branches = node.branches ?? [];
  const showPaths = canBranch(node.type) && allowBranching;

  function changeType(type: NodeType) {
    if (canBranch(type)) {
      onChange({
        ...node,
        type,
        branches: allowBranching
          ? (node.branches ?? [createBranch("Yes"), createBranch("No")])
          : undefined,
      });
      return;
    }
    const { branches: _dropped, ...rest } = node;
    void _dropped;
    onChange({ ...rest, type });
  }

  function updateBranch(bi: number, patch: Partial<FlowBranch>) {
    onChange({
      ...node,
      branches: branches.map((b, i) => (i === bi ? { ...b, ...patch } : b)),
    });
  }

  function updateBranchNodes(bi: number, nodes: FlowNode[]) {
    updateBranch(bi, { nodes });
  }

  function addPath() {
    if (branches.length >= MAX_PATHS) return;
    onChange({ ...node, branches: [...branches, createBranch("")] });
  }

  function removePath(bi: number) {
    if (branches.length <= 2) return;
    onChange({ ...node, branches: branches.filter((_, i) => i !== bi) });
  }

  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
          {depth === 0 ? `Node ${index + 1}` : `Step ${index + 1}`}
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
          onChange={(e) => changeType(e.target.value as NodeType)}
          aria-label="Node type"
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

      {showPaths && (
        <div className="mt-3 space-y-3 border-t border-(--border) pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">
              Paths
            </span>
            {branches.length < MAX_PATHS && (
              <button
                type="button"
                onClick={addPath}
                className="text-[11px] font-medium text-(--muted-foreground) transition-colors hover:text-(--foreground)"
              >
                + Add path
              </button>
            )}
          </div>

          {branches.map((branch, bi) => (
            <div
              key={branch.id}
              className="rounded-lg border border-dashed border-(--border) p-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={branch.label}
                  onChange={(e) => updateBranch(bi, { label: e.target.value })}
                  placeholder={`Path ${bi + 1} label`}
                  aria-label="Path label"
                  className={inputCls + " h-7 py-0 text-xs"}
                />
                <button
                  type="button"
                  onClick={() => removePath(bi)}
                  disabled={branches.length <= 2}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs text-(--muted-foreground) transition-colors hover:text-red-500 disabled:opacity-30"
                  aria-label="Remove path"
                >
                  ✕
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {branch.nodes.map((child, ci) => (
                  <NodeEditor
                    key={child.id}
                    node={child}
                    index={ci}
                    total={branch.nodes.length}
                    depth={depth + 1}
                    onChange={(updated) =>
                      updateBranchNodes(
                        bi,
                        branch.nodes.map((n, i) => (i === ci ? updated : n)),
                      )
                    }
                    onMove={(dir) => {
                      const target = ci + dir;
                      if (target < 0 || target >= branch.nodes.length) return;
                      const next = [...branch.nodes];
                      [next[ci], next[target]] = [next[target], next[ci]];
                      updateBranchNodes(bi, next);
                    }}
                    onDelete={() =>
                      updateBranchNodes(
                        bi,
                        branch.nodes.filter((_, i) => i !== ci),
                      )
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateBranchNodes(bi, [...branch.nodes, createNode("ai-response")])
                }
                className="mt-2 w-full rounded-lg border border-dashed border-(--border) px-2 py-1.5 text-[11px] font-medium text-(--muted-foreground) transition-colors hover:border-(--foreground) hover:text-(--foreground)"
              >
                + Add step to this path
              </button>

              {branch.nodes.length === 0 && (
                <p className="mt-2 text-[11px] leading-4 text-(--muted-foreground)">
                  Empty path — drawn as a labelled edge straight to the merge point.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FlowDiagram() {
  const [config, setConfig] = React.useState<FlowConfig>(
    structuredClone(defaultConfig)
  );
  const previewRef = React.useRef<HTMLDivElement>(null);

  const { positioned, edges, merges, viewBox } = React.useMemo(
    () => layoutNodes(config.nodes),
    [config.nodes]
  );

  const svgString = React.useMemo(
    () => renderFlowSvg(positioned, edges, merges, viewBox, config.title),
    [positioned, edges, merges, viewBox, config.title]
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
            responses, tool calls, and approval gates. Decision nodes split into
            parallel paths that merge back. Export as SVG or PNG.
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
