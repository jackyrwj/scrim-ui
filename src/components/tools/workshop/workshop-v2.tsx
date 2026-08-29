"use client";

import * as React from "react";
import {
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  LayoutTemplate,
  Plus,
  Redo2,
  Search,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { CopyButton } from "@/components/component-page/copy-button";
import { AgentStatus } from "@/showcase/agent-status/agent-status";
import { ApprovalRequest } from "@/showcase/approval-request/approval-request";
import { CitationList } from "@/showcase/citation-ui/citation-ui";
import { MarkdownMessage } from "@/showcase/markdown-message/markdown-message";
import { PromptInput } from "@/showcase/prompt-input/prompt-input";
import { ReasoningSteps } from "@/showcase/reasoning-steps/reasoning-steps";
import { ToolCall, type ToolStatus } from "@/showcase/tool-call/tool-call";
import { UserMessage } from "@/showcase/user-message/user-message";

/* ─── Types ─── */

type ElementType =
  | "user-message"
  | "assistant-message"
  | "agent-status"
  | "reasoning-steps"
  | "tool-call"
  | "citation-list"
  | "approval-request"
  | "prompt-input";
type RecipeId = "research" | "agent" | "chat";
type SidebarTab = "add" | "layers";
type ApprovalStatus = "pending" | "approved" | "denied";
type ResizeHandle = "nw" | "ne" | "sw" | "se";

type NodeProps = {
  text?: string;
  title?: string;
  placeholder?: string;
  showWebSearch?: boolean;
  showTools?: boolean;
  toolStatus?: ToolStatus;
  approvalStatus?: ApprovalStatus;
};

type WorkshopNode = {
  id: string;
  type: ElementType;
  visible: boolean;
  props: NodeProps;
  x: number;
  y: number;
  width: number;
  height: number;
};

type WorkshopDocument = {
  recipe: RecipeId;
  title: string;
  subtitle: string;
  nodes: WorkshopNode[];
};

type ElementDefinition = {
  type: ElementType;
  slug: string;
  name: string;
  description: string;
  group: "Messages" | "Agent states" | "Sources" | "Composer";
};

type HistoryState = { past: WorkshopDocument[]; present: WorkshopDocument; future: WorkshopDocument[] };
type HistoryAction =
  | { type: "commit"; document: WorkshopDocument }
  | { type: "undo" }
  | { type: "redo" };

type Interaction = {
  type: "move" | "resize";
  nodeId: string;
  handle?: ResizeHandle;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
  initX: number;
  initY: number;
  initW: number;
  initH: number;
};

/* ─── Constants ─── */

const GRID = 20;
const CANVAS_W = 2400;
const CANVAS_H = 1600;
const MIN_W = 200;
const MIN_H = 60;

const ELEMENTS: ElementDefinition[] = [
  { type: "user-message", slug: "user-message", name: "User message", description: "A customer prompt with optional actions.", group: "Messages" },
  { type: "assistant-message", slug: "markdown-message", name: "Assistant message", description: "A rich answer with inline Markdown.", group: "Messages" },
  { type: "agent-status", slug: "agent-status", name: "Agent status", description: "Progress, elapsed time and current action.", group: "Agent states" },
  { type: "reasoning-steps", slug: "reasoning-steps", name: "Reasoning steps", description: "A concise plan with an active step.", group: "Agent states" },
  { type: "tool-call", slug: "tool-call", name: "Tool call", description: "Running, completed and failed tool states.", group: "Agent states" },
  { type: "approval-request", slug: "approval-request", name: "Approval request", description: "Pause before a consequential action.", group: "Agent states" },
  { type: "citation-list", slug: "citation-ui", name: "Citations", description: "Inspectable sources underneath an answer.", group: "Sources" },
  { type: "prompt-input", slug: "prompt-input", name: "Prompt input", description: "The composer pinned below the conversation.", group: "Composer" },
];
const GROUPS = ["Messages", "Agent states", "Sources", "Composer"] as const;

const DEFAULT_PROPS: Record<ElementType, NodeProps> = {
  "user-message": { text: "Summarize the evidence and show your sources." },
  "assistant-message": { text: "A reliable AI interface keeps **progress visible**, grounds claims in inspectable sources, and asks before taking consequential actions." },
  "agent-status": { title: "Research agent" },
  "reasoning-steps": { title: "Plan" },
  "tool-call": { title: "Search the web", toolStatus: "success" },
  "citation-list": {},
  "approval-request": { title: "Apply changes to 3 files", approvalStatus: "pending" },
  "prompt-input": { placeholder: "Ask a research question…", showWebSearch: true, showTools: false },
};

const DEFAULT_SIZES: Record<ElementType, { width: number; height: number }> = {
  "user-message": { width: 440, height: 100 },
  "assistant-message": { width: 440, height: 140 },
  "agent-status": { width: 440, height: 120 },
  "reasoning-steps": { width: 440, height: 200 },
  "tool-call": { width: 440, height: 120 },
  "citation-list": { width: 440, height: 140 },
  "approval-request": { width: 440, height: 200 },
  "prompt-input": { width: 440, height: 100 },
};

const RECIPES: Record<RecipeId, { title: string; subtitle: string; nodes: ElementType[] }> = {
  research: { title: "Research assistant", subtitle: "Answers grounded in sources", nodes: ["user-message", "reasoning-steps", "tool-call", "assistant-message", "citation-list", "prompt-input"] },
  agent: { title: "Coding agent", subtitle: "Plans, tools and human approval", nodes: ["user-message", "agent-status", "reasoning-steps", "tool-call", "assistant-message", "approval-request", "prompt-input"] },
  chat: { title: "AI assistant", subtitle: "A focused conversational interface", nodes: ["user-message", "assistant-message", "prompt-input"] },
};

const citations = [
  { id: 1, title: "Designing reliable AI interfaces", url: "https://example.com/reliable-ai-interfaces", domain: "example.com" },
  { id: 2, title: "Human control in agent workflows", url: "https://example.com/human-control", domain: "example.com" },
];

/* ─── Helpers ─── */

function snap(v: number) { return Math.round(v / GRID) * GRID; }

function definitionFor(type: ElementType) {
  return ELEMENTS.find((e) => e.type === type)!;
}

function createNode(type: ElementType, id: string, x: number, y: number): WorkshopNode {
  const size = DEFAULT_SIZES[type];
  return { id, type, visible: true, props: structuredClone(DEFAULT_PROPS[type]), x, y, width: size.width, height: size.height };
}

function createRecipe(recipe: RecipeId): WorkshopDocument {
  const source = RECIPES[recipe];
  let y = 60;
  const x = 200;
  const nodes = source.nodes.map((type, index) => {
    const node = createNode(type, `${recipe}-${type}-${index}`, x, y);
    y += node.height + GRID;
    return node;
  });
  return { recipe, title: source.title, subtitle: source.subtitle, nodes };
}

function newId(type: ElementType) {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state;
  }
  if (action.type === "redo") {
    const next = state.future[0];
    return next ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) } : state;
  }
  return { past: [...state.past.slice(-49), state.present], present: action.document, future: [] };
}

function inferRecipe(prompt: string): RecipeId {
  const v = prompt.toLowerCase();
  if (/agent|coding|approval|批准|审批|代理/.test(v)) return "agent";
  if (/research|rag|citation|source|web search|研究|引用|来源|搜索/.test(v)) return "research";
  return "chat";
}

function componentName(type: ElementType) {
  if (type === "citation-list") return "CitationList";
  if (type === "assistant-message") return "MarkdownMessage";
  return type.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
}

function codeForNode(node: WorkshopNode) {
  const p = node.props;
  switch (node.type) {
    case "user-message": return `      <UserMessage text=${JSON.stringify(p.text ?? "")} showActions={false} />`;
    case "assistant-message": return `      <MarkdownMessage text=${JSON.stringify(p.text ?? "")} />`;
    case "agent-status": return `      <AgentStatus name=${JSON.stringify(p.title ?? "Agent")} status="running" action="Reviewing the task" progress={64} />`;
    case "reasoning-steps": return `      <ReasoningSteps title=${JSON.stringify(p.title ?? "Plan")} steps={["Understand", "Gather context", "Compose"]} activeStep={2} />`;
    case "tool-call": return `      <ToolCall name=${JSON.stringify(p.title ?? "Search the web")} status=${JSON.stringify(p.toolStatus ?? "success")} />`;
    case "citation-list": return "      <CitationList citations={citations} />";
    case "approval-request": return `      <ApprovalRequest title=${JSON.stringify(p.title ?? "Approve action")} status=${JSON.stringify(p.approvalStatus ?? "pending")} />`;
    case "prompt-input": return `      <PromptInput placeholder=${JSON.stringify(p.placeholder ?? "Message the assistant…")} showWebSearch={${Boolean(p.showWebSearch)}} showTools={${Boolean(p.showTools)}} />`;
  }
}

function generateCode(doc: WorkshopDocument) {
  const visible = doc.nodes.filter((n) => n.visible);
  const imports = [...new Set(visible.map((n) => n.type))].map((type) => {
    const def = definitionFor(type);
    return `import { ${componentName(type)} } from "@/components/ui/${def.slug}";`;
  });
  const localData = visible.some((n) => n.type === "citation-list")
    ? `\n\nconst citations = [\n  { id: 1, title: "Primary source", url: "https://example.com/source" },\n];`
    : "";
  return `${imports.join("\n")}${localData}

export function AiInterface() {
  return (
    <section className="mx-auto flex min-h-[640px] max-w-3xl flex-col rounded-2xl border bg-background">
      <header className="border-b px-5 py-4">
        <h1 className="font-semibold">${doc.title}</h1>
        <p className="text-sm text-muted-foreground">${doc.subtitle}</p>
      </header>
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
${visible.map(codeForNode).join("\n")}
      </div>
    </section>
  );
}`;
}

function generateAgentPrompt(doc: WorkshopDocument) {
  const slugs = [...new Set(doc.nodes.filter((n) => n.visible).map((n) => definitionFor(n.type).slug))];
  return `Build a ${doc.title.toLowerCase()} using Scrim UI.\n\nInstall:\n${slugs.map((s) => `- npx shadcn@latest add https://scrimui.dev/r/${s}.json`).join("\n")}\n\nComponents: ${doc.nodes.map((n) => definitionFor(n.type).name).join(" → ")}. Replace demo data with real handlers and preserve keyboard behavior.`;
}

/* ─── Small UI helpers ─── */

function IconButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-(--muted-foreground) transition-[color,background-color,transform] hover:bg-(--muted) hover:text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-35">
      {children}
    </button>
  );
}

/* ─── Node preview renderer ─── */

function NodePreview({ node, update }: { node: WorkshopNode; update: (props: Partial<NodeProps>) => void }) {
  switch (node.type) {
    case "user-message": return <UserMessage text={node.props.text ?? ""} showActions={false} />;
    case "assistant-message": return <div className="rounded-2xl rounded-ss-md bg-(--muted)/60 p-4"><MarkdownMessage text={node.props.text ?? ""} /></div>;
    case "agent-status": return <AgentStatus name={node.props.title ?? "Research agent"} status="running" action="Reviewing the task and project context" progress={64} elapsed="12s" />;
    case "reasoning-steps": return <ReasoningSteps title={node.props.title ?? "Plan"} steps={["Understand the request", "Gather relevant context", "Compose a grounded answer"]} activeStep={2} elapsed="4.8s" />;
    case "tool-call": return <ToolCall name={node.props.title ?? "Search the web"} status={node.props.toolStatus ?? "success"} duration="1.8s" input={'{"query":"reliable AI interfaces"}'} output="Found 8 relevant sources" />;
    case "citation-list": return <CitationList citations={citations} className="rounded-xl border border-(--border) p-3" />;
    case "approval-request": return <ApprovalRequest title={node.props.title ?? "Apply changes to 3 files"} requester="Workspace agent" description="Review the exact scope before the agent writes to the project." detail={"components/chat.tsx\ncomponents/source-list.tsx\napp/page.tsx"} status={node.props.approvalStatus ?? "pending"} onAllow={() => update({ approvalStatus: "approved" })} onDeny={() => update({ approvalStatus: "denied" })} />;
    case "prompt-input": return <PromptInput placeholder={node.props.placeholder ?? "Message the assistant…"} showWebSearch={Boolean(node.props.showWebSearch)} showTools={Boolean(node.props.showTools)} models={[{ id: "balanced", name: "Balanced", hint: "Fast and capable" }]} onSubmit={() => undefined} />;
  }
}

/* ─── Library preview (scaled‑down) ─── */

function LibraryPreview({ type }: { type: ElementType }) {
  const dummyNode = React.useMemo(() => createNode(type, `preview-${type}`, 0, 0), [type]);
  return (
    <div className="pointer-events-none mt-2 origin-top-left overflow-hidden rounded-lg border border-(--border) bg-(--background)">
      <div className="origin-top-left scale-[0.55]" style={{ width: "181.8%", maxHeight: 160, overflow: "hidden" }}>
        <div className="p-2">
          <NodePreview node={dummyNode} update={() => undefined} />
        </div>
      </div>
    </div>
  );
}

/* ─── Compute display rect for a node during interaction ─── */

function displayRect(node: WorkshopNode, interaction: Interaction | null) {
  let { x, y, width, height } = node;
  if (interaction && interaction.nodeId === node.id) {
    const dx = interaction.currentX - interaction.originX;
    const dy = interaction.currentY - interaction.originY;
    if (interaction.type === "move") {
      x = snap(interaction.initX + dx);
      y = snap(interaction.initY + dy);
    } else {
      const h = interaction.handle!;
      const affectsLeft = h === "nw" || h === "sw";
      const affectsTop = h === "nw" || h === "ne";
      let newW = interaction.initW + (affectsLeft ? -dx : dx);
      let newH = interaction.initH + (affectsTop ? -dy : dy);
      newW = Math.max(MIN_W, snap(newW));
      newH = Math.max(MIN_H, snap(newH));
      x = affectsLeft ? snap(interaction.initX + interaction.initW - newW) : interaction.initX;
      y = affectsTop ? snap(interaction.initY + interaction.initH - newH) : interaction.initY;
      width = newW;
      height = newH;
    }
  }
  return { x: Math.max(0, x), y: Math.max(0, y), width, height };
}

/* ─── Main component ─── */

export function WorkshopV2() {
  const [history, dispatch] = React.useReducer(historyReducer, { past: [], present: createRecipe("research"), future: [] });
  const doc = history.present;
  const [selectedId, setSelectedId] = React.useState(doc.nodes[0]?.id ?? "");
  const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>("add");
  const [query, setQuery] = React.useState("");
  const [composePrompt, setComposePrompt] = React.useState("");
  const [interaction, setInteraction] = React.useState<Interaction | null>(null);
  const [dragOver, setDragOver] = React.useState<{ x: number; y: number } | null>(null);
  const [status, setStatus] = React.useState("Workshop ready");

  const selectedNode = doc.nodes.find((n) => n.id === selectedId) ?? null;
  const code = React.useMemo(() => generateCode(doc), [doc]);
  const agentPrompt = React.useMemo(() => generateAgentPrompt(doc), [doc]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredElements = ELEMENTS.filter((e) => !normalizedQuery || e.name.toLowerCase().includes(normalizedQuery) || e.description.toLowerCase().includes(normalizedQuery));

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const stableRef = React.useRef<{ doc: WorkshopDocument; interaction: Interaction | null; commit: (d: WorkshopDocument, m?: string) => void }>({ doc, interaction, commit: () => {} });

  function commit(next: WorkshopDocument, message?: string) {
    dispatch({ type: "commit", document: next });
    if (message) setStatus(message);
  }
  React.useEffect(() => {
    stableRef.current = { doc, interaction, commit };
  });

  function updateNode(id: string, patch: Partial<WorkshopNode> | { props: Partial<NodeProps> }) {
    commit({ ...doc, nodes: doc.nodes.map((n) => n.id !== id ? n : "props" in patch ? { ...n, props: { ...n.props, ...patch.props } } : { ...n, ...patch }) });
  }

  function addNodeAt(type: ElementType, x: number, y: number) {
    const node = createNode(type, newId(type), snap(x), snap(y));
    commit({ ...doc, nodes: [...doc.nodes, node] }, `${definitionFor(type).name} added`);
    setSelectedId(node.id);
    setSidebarTab("layers");
  }

  function addNode(type: ElementType) {
    const maxY = doc.nodes.reduce((m, n) => Math.max(m, n.y + n.height), 0);
    addNodeAt(type, 200, snap(maxY + GRID * 2));
  }

  function removeNode(id: string) {
    const node = doc.nodes.find((n) => n.id === id);
    if (!node) return;
    commit({ ...doc, nodes: doc.nodes.filter((n) => n.id !== id) }, `${definitionFor(node.type).name} removed`);
    if (selectedId === id) setSelectedId(doc.nodes.find((n) => n.id !== id)?.id ?? "");
  }

  function duplicateNode(id: string) {
    const source = doc.nodes.find((n) => n.id === id);
    if (!source) return;
    const clone = { ...structuredClone(source), id: newId(source.type), x: source.x + GRID * 2, y: source.y + GRID * 2 };
    commit({ ...doc, nodes: [...doc.nodes, clone] }, `${definitionFor(source.type).name} duplicated`);
    setSelectedId(clone.id);
  }

  function applyRecipe(recipe: RecipeId) {
    const next = createRecipe(recipe);
    commit(next, `${RECIPES[recipe].title} recipe loaded`);
    setSelectedId(next.nodes[0]?.id ?? "");
  }

  function quickCompose(event: React.FormEvent) {
    event.preventDefault();
    if (!composePrompt.trim()) return setStatus("Describe an interface before composing");
    applyRecipe(inferRecipe(composePrompt));
    setComposePrompt("");
  }

  function undo() { if (history.past.length) { dispatch({ type: "undo" }); setStatus("Change undone"); } }
  function redo() { if (history.future.length) { dispatch({ type: "redo" }); setStatus("Change restored"); } }

  /* ── Keyboard shortcuts ── */
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const target = e.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  /* ── Canvas move / resize handlers ── */
  React.useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      setInteraction((prev) => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
    }
    function onMouseUp(e: MouseEvent) {
      const { doc: d, interaction: ia, commit: c } = stableRef.current;
      if (!ia) return;
      const dx = e.clientX - ia.originX;
      const dy = e.clientY - ia.originY;
      let nx = ia.initX, ny = ia.initY, nw = ia.initW, nh = ia.initH;
      if (ia.type === "move") {
        nx = Math.max(0, snap(ia.initX + dx));
        ny = Math.max(0, snap(ia.initY + dy));
      } else {
        const h = ia.handle!;
        const aL = h === "nw" || h === "sw";
        const aT = h === "nw" || h === "ne";
        nw = Math.max(MIN_W, snap(ia.initW + (aL ? -dx : dx)));
        nh = Math.max(MIN_H, snap(ia.initH + (aT ? -dy : dy)));
        nx = Math.max(0, aL ? snap(ia.initX + ia.initW - nw) : ia.initX);
        ny = Math.max(0, aT ? snap(ia.initY + ia.initH - nh) : ia.initY);
      }
      c({ ...d, nodes: d.nodes.map((n) => n.id !== ia.nodeId ? n : { ...n, x: nx, y: ny, width: nw, height: nh }) }, ia.type === "move" ? "Component moved" : "Component resized");
      setInteraction(null);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  function startMove(nodeId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const node = doc.nodes.find((n) => n.id === nodeId)!;
    setInteraction({ type: "move", nodeId, handle: undefined, originX: e.clientX, originY: e.clientY, currentX: e.clientX, currentY: e.clientY, initX: node.x, initY: node.y, initW: node.width, initH: node.height });
    setSelectedId(nodeId);
  }

  function startResize(nodeId: string, handle: ResizeHandle, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const node = doc.nodes.find((n) => n.id === nodeId)!;
    setInteraction({ type: "resize", nodeId, handle, originX: e.clientX, originY: e.clientY, currentX: e.clientX, currentY: e.clientY, initX: node.x, initY: node.y, initW: node.width, initH: node.height });
  }

  /* ── Canvas drop from sidebar ── */
  function onCanvasDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    setDragOver({ x: snap(e.clientX - cr.left + canvas.scrollLeft), y: snap(e.clientY - cr.top + canvas.scrollTop) });
  }

  function onCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDragOver(null);
    try {
      const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (payload?.source === "library" && payload.elementType) {
        const cr = canvas.getBoundingClientRect();
        const x = snap(e.clientX - cr.left + canvas.scrollLeft - DEFAULT_SIZES[payload.elementType as ElementType].width / 2);
        const y = snap(e.clientY - cr.top + canvas.scrollTop - 20);
        addNodeAt(payload.elementType, Math.max(0, x), Math.max(0, y));
      }
    } catch { /* ignore invalid drag data */ }
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-5 lg:px-6">
      <h1 className="sr-only">AI Component Workshop</h1>
      <div className="overflow-hidden rounded-2xl bg-(--card) shadow-[0_20px_70px_oklch(0_0_0/0.10)] ring-1 ring-black/8 dark:ring-white/10">
        {/* ── Header ── */}
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-(--border) px-3 py-2 sm:px-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--foreground) text-(--background)"><LayoutTemplate aria-hidden="true" className="h-5 w-5" strokeWidth={2} /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{doc.title}</p><p className="truncate text-xs text-(--muted-foreground)">Scrim Workshop</p></div>
          <div className="ms-auto flex items-center gap-1 rounded-xl bg-(--muted)/70 p-1">
            <IconButton label="Undo" disabled={!history.past.length} onClick={undo}><Undo2 aria-hidden="true" className="h-4 w-4" /></IconButton>
            <IconButton label="Redo" disabled={!history.future.length} onClick={redo}><Redo2 aria-hidden="true" className="h-4 w-4" /></IconButton>
          </div>
          <label className="relative hidden sm:block">
            <span className="sr-only">Start from a recipe</span>
            <select value={doc.recipe} onChange={(e) => applyRecipe(e.target.value as RecipeId)} className="h-10 appearance-none rounded-xl border border-(--border) bg-(--background) ps-3 pe-9 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--ring)">
              <option value="research">Research assistant</option><option value="agent">Coding agent</option><option value="chat">AI chat</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
          </label>
          <div className="flex items-center gap-2"><CopyButton code={agentPrompt} label="Copy agent prompt" /><CopyButton code={code} label="Copy React" /></div>
        </header>

        {/* ── Main grid ── */}
        <div className="grid h-[calc(100vh-10rem)] min-h-[600px] lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(400px,1fr)_320px]">
          {/* ── Sidebar ── */}
          <aside aria-label="Component library and layers" className="order-2 overflow-y-auto border-b border-(--border) lg:order-1 lg:border-b-0 lg:border-e">
            <div className="flex gap-1 p-3">
              {(["add", "layers"] as SidebarTab[]).map((tab) => <button key={tab} type="button" aria-pressed={sidebarTab === tab} onClick={() => setSidebarTab(tab)} className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium capitalize transition-[color,background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 ${sidebarTab === tab ? "bg-(--muted) shadow-sm" : "text-(--muted-foreground) hover:text-(--foreground)"}`}>{tab}</button>)}
            </div>
            {sidebarTab === "add" ? (
              <LibraryPanel query={query} setQuery={setQuery} composePrompt={composePrompt} setComposePrompt={setComposePrompt} quickCompose={quickCompose} elements={filteredElements} addNode={addNode} />
            ) : (
              <LayersPanel doc={doc} selectedId={selectedId} setSelectedId={setSelectedId} />
            )}
          </aside>

          {/* ── Free Canvas ── */}
          <section aria-label="Canvas" className="relative order-1 min-w-0 overflow-auto bg-[radial-gradient(circle_at_center,oklch(0_0_0/0.045)_1px,transparent_1px)] bg-size-[20px_20px] dark:bg-[radial-gradient(circle_at_center,oklch(1_0_0/0.055)_1px,transparent_1px)] lg:order-2"
            ref={canvasRef}
            onDragOver={onCanvasDragOver}
            onDragLeave={() => setDragOver(null)}
            onDrop={onCanvasDrop}
            onMouseDown={() => { if (!interaction) setSelectedId(""); }}
          >
            <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
              {/* Drop indicator */}
              {dragOver && (
                <div className="pointer-events-none absolute z-50 rounded-xl border-2 border-dashed border-(--primary)/60 bg-(--primary)/5" style={{ left: dragOver.x - 100, top: dragOver.y - 20, width: 200, height: 40 }}>
                  <div className="flex h-full items-center justify-center text-xs font-medium text-(--primary)">Drop here</div>
                </div>
              )}
              {/* Nodes */}
              {doc.nodes.map((node) => {
                const rect = displayRect(node, interaction);
                const isSelected = selectedId === node.id;
                const isMoving = interaction?.type === "move" && interaction.nodeId === node.id;
                return (
                  <FreeCanvasNode
                    key={node.id}
                    node={node}
                    rect={rect}
                    selected={isSelected}
                    moving={isMoving}
                    onMouseDown={(e) => startMove(node.id, e)}
                    onSelect={() => setSelectedId(node.id)}
                    onResizeStart={(handle, e) => startResize(node.id, handle, e)}
                    updateNode={(props) => updateNode(node.id, { props })}
                  />
                );
              })}
            </div>
          </section>

          {/* ── Inspector ── */}
          <Inspector selectedNode={selectedNode} doc={doc} updateNode={updateNode} updateDocument={(patch) => commit({ ...doc, ...patch })} duplicateNode={duplicateNode} removeNode={removeNode} />
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{status}</p>
    </div>
  );
}

/* ─── Library panel ─── */

function LibraryPanel({ query, setQuery, composePrompt, setComposePrompt, quickCompose, elements, addNode }: {
  query: string; setQuery: (v: string) => void; composePrompt: string; setComposePrompt: (v: string) => void; quickCompose: (e: React.FormEvent) => void; elements: ElementDefinition[]; addNode: (type: ElementType) => void;
}) {
  function onDragStart(e: React.DragEvent<HTMLDivElement>, type: ElementType) {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: "library", elementType: type }));
  }

  return <div className="px-3 pb-5">
    <form onSubmit={quickCompose} className="rounded-2xl bg-(--muted)/55 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold"><Sparkles aria-hidden="true" className="h-4 w-4 text-(--primary)" />Quick compose</div>
      <label htmlFor="workshop-compose" className="sr-only">Describe an AI interface</label>
      <textarea id="workshop-compose" value={composePrompt} onChange={(e) => setComposePrompt(e.target.value)} rows={3} placeholder="A research assistant with sources…" className="mt-2 w-full resize-none rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-base leading-5 outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" />
      <button type="submit" className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--foreground) px-3 text-sm font-semibold text-(--background) transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.96]"><Sparkles aria-hidden="true" className="h-4 w-4" />Compose layout</button>
    </form>
    <label className="relative mt-4 block"><span className="sr-only">Search components</span><Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search components" className="h-10 w-full rounded-xl border border-(--border) bg-(--background) ps-9 pe-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>
    <div className="mt-5 space-y-6">
      {GROUPS.map((group) => {
        const entries = elements.filter((e) => e.group === group);
        if (!entries.length) return null;
        return <section key={group}><h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--muted-foreground)">{group}</h2><div className="mt-2 space-y-3">
          {entries.map((el) => (
            <div key={el.type} draggable onDragStart={(e) => onDragStart(e, el.type)} className="group cursor-grab rounded-xl bg-(--background) p-3 shadow-[0_1px_0_oklch(0_0_0/0.06),0_5px_18px_oklch(0_0_0/0.04)] ring-1 ring-black/7 transition-[box-shadow,transform,opacity] hover:-translate-y-0.5 hover:shadow-[0_1px_0_oklch(0_0_0/0.08),0_8px_24px_oklch(0_0_0/0.08)] active:cursor-grabbing dark:ring-white/8">
              <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{el.name}</p><p className="mt-0.5 text-xs leading-4 text-(--muted-foreground)">{el.description}</p></div><button type="button" onClick={() => addNode(el.type)} aria-label={`Add ${el.name}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--muted) transition-[background-color,transform] hover:bg-(--primary) hover:text-(--primary-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.96]"><Plus aria-hidden="true" className="h-3.5 w-3.5" /></button></div>
              <LibraryPreview type={el.type} />
            </div>
          ))}
        </div></section>;
      })}
    </div>
  </div>;
}

/* ─── Layers panel ─── */

function LayersPanel({ doc, selectedId, setSelectedId }: { doc: WorkshopDocument; selectedId: string; setSelectedId: (id: string) => void }) {
  return <div className="px-3 pb-5"><p className="px-1 text-xs leading-5 text-(--muted-foreground)">Click a layer to select it on the canvas.</p><div className="mt-4 space-y-1.5">
    {doc.nodes.map((node) => {
      const def = definitionFor(node.type);
      return <button key={node.id} type="button" onClick={() => setSelectedId(node.id)} className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-medium transition-[background-color,box-shadow,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedId === node.id ? "bg-(--muted) shadow-sm" : "hover:bg-(--muted)/55"} ${node.visible ? "" : "opacity-55"}`}>
        <span className="h-2 w-2 shrink-0 rounded-full bg-(--primary)/60" />
        {def.name}
        <span className="ms-auto text-[11px] text-(--muted-foreground)">{Math.round(node.x)}, {Math.round(node.y)}</span>
      </button>;
    })}
    {!doc.nodes.length && <p className="px-1 text-sm text-(--muted-foreground)">No components yet. Drag from the library.</p>}
  </div></div>;
}

/* ─── Free canvas node ─── */

const HANDLE_CURSORS: Record<ResizeHandle, string> = { nw: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", se: "nwse-resize" };
const HANDLE_POSITIONS: Record<ResizeHandle, string> = {
  nw: "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  ne: "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
};

function FreeCanvasNode({ node, rect, selected, moving, onMouseDown, onSelect, onResizeStart, updateNode }: {
  node: WorkshopNode;
  rect: { x: number; y: number; width: number; height: number };
  selected: boolean;
  moving: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
  updateNode: (props: Partial<NodeProps>) => void;
}) {
  const def = definitionFor(node.type);
  return (
    <div
      className={`absolute select-none rounded-2xl bg-(--background) shadow-[0_2px_12px_oklch(0_0_0/0.08),0_1px_3px_oklch(0_0_0/0.06)] ring-1 transition-shadow ${
        selected ? "z-20 ring-2 ring-(--primary) shadow-[0_4px_24px_oklch(0_0_0/0.12)]" : "z-10 ring-black/8 hover:ring-(--primary)/40 dark:ring-white/10"
      } ${moving ? "cursor-grabbing opacity-90" : "cursor-grab"} ${node.visible ? "" : "opacity-40"}`}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      onMouseDown={(e) => { e.stopPropagation(); onSelect(); onMouseDown(e); }}
    >
      {/* Component label */}
      <div className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-md bg-(--foreground) px-2 py-1 text-[11px] font-semibold text-(--background) shadow-md">
        {def.name}
      </div>
      {/* Content */}
      <div className="h-full overflow-hidden rounded-2xl p-2">
        <NodePreview node={node} update={updateNode} />
      </div>
      {/* Resize handles */}
      {selected && (Object.keys(HANDLE_POSITIONS) as ResizeHandle[]).map((h) => (
        <div
          key={h}
          className={`absolute z-30 h-4 w-4 rounded-full border-2 border-(--primary) bg-(--background) shadow-sm ${HANDLE_POSITIONS[h]}`}
          style={{ cursor: HANDLE_CURSORS[h] }}
          onMouseDown={(e) => onResizeStart(h, e)}
        />
      ))}
    </div>
  );
}

/* ─── Inspector ─── */

function Inspector({ selectedNode, doc, updateNode, updateDocument, duplicateNode, removeNode }: {
  selectedNode: WorkshopNode | null;
  doc: WorkshopDocument;
  updateNode: (id: string, patch: Partial<WorkshopNode> | { props: Partial<NodeProps> }) => void;
  updateDocument: (patch: Partial<Pick<WorkshopDocument, "title" | "subtitle">>) => void;
  duplicateNode: (id: string) => void;
  removeNode: (id: string) => void;
}) {
  return (
    <aside aria-label="Inspector" className="order-3 overflow-y-auto border-t border-(--border) bg-(--card) lg:col-span-2 xl:col-span-1 xl:border-s xl:border-t-0">
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--muted-foreground)">Inspector</p>
        <h2 className="mt-1 text-base font-semibold">{selectedNode ? definitionFor(selectedNode.type).name : "Page"}</h2>
        {selectedNode ? <>
          <div className="mt-5 flex items-center gap-1 rounded-xl bg-(--muted)/60 p-1">
            <IconButton label={selectedNode.visible ? "Hide" : "Show"} onClick={() => updateNode(selectedNode.id, { visible: !selectedNode.visible })}>{selectedNode.visible ? <Eye aria-hidden="true" className="h-4 w-4" /> : <EyeOff aria-hidden="true" className="h-4 w-4" />}</IconButton>
            <IconButton label="Duplicate" onClick={() => duplicateNode(selectedNode.id)}><Copy aria-hidden="true" className="h-4 w-4" /></IconButton>
            <div className="ms-auto"><IconButton label="Delete" onClick={() => removeNode(selectedNode.id)}><Trash2 aria-hidden="true" className="h-4 w-4 text-red-500" /></IconButton></div>
          </div>
          {/* Position & size */}
          <section className="mt-6"><h3 className="text-xs font-semibold">Position & Size</h3><div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium">X<input type="number" step={GRID} value={selectedNode.x} onChange={(e) => updateNode(selectedNode.id, { x: snap(Number(e.target.value)) })} className="mt-1 h-9 w-full rounded-lg border border-(--border) bg-(--background) px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-(--ring)" /></label>
            <label className="block text-xs font-medium">Y<input type="number" step={GRID} value={selectedNode.y} onChange={(e) => updateNode(selectedNode.id, { y: snap(Number(e.target.value)) })} className="mt-1 h-9 w-full rounded-lg border border-(--border) bg-(--background) px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-(--ring)" /></label>
            <label className="block text-xs font-medium">W<input type="number" step={GRID} min={MIN_W} value={selectedNode.width} onChange={(e) => updateNode(selectedNode.id, { width: Math.max(MIN_W, snap(Number(e.target.value))) })} className="mt-1 h-9 w-full rounded-lg border border-(--border) bg-(--background) px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-(--ring)" /></label>
            <label className="block text-xs font-medium">H<input type="number" step={GRID} min={MIN_H} value={selectedNode.height} onChange={(e) => updateNode(selectedNode.id, { height: Math.max(MIN_H, snap(Number(e.target.value))) })} className="mt-1 h-9 w-full rounded-lg border border-(--border) bg-(--background) px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-(--ring)" /></label>
          </div></section>
          {/* Content */}
          <section className="mt-6"><h3 className="text-xs font-semibold">Content</h3><div className="mt-3 space-y-4">
            {(selectedNode.type === "user-message" || selectedNode.type === "assistant-message") && <label className="block text-xs font-medium">Message<textarea value={selectedNode.props.text ?? ""} onChange={(e) => updateNode(selectedNode.id, { props: { text: e.target.value } })} rows={4} className="mt-1.5 w-full resize-y rounded-xl border border-(--border) bg-(--background) px-3 py-2.5 text-base leading-6 outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>}
            {(["agent-status", "reasoning-steps", "tool-call", "approval-request"] as ElementType[]).includes(selectedNode.type) && <label className="block text-xs font-medium">Title<input value={selectedNode.props.title ?? ""} onChange={(e) => updateNode(selectedNode.id, { props: { title: e.target.value } })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>}
            {selectedNode.type === "prompt-input" && <label className="block text-xs font-medium">Placeholder<input value={selectedNode.props.placeholder ?? ""} onChange={(e) => updateNode(selectedNode.id, { props: { placeholder: e.target.value } })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>}
          </div></section>
          {/* State & behavior */}
          {(selectedNode.type === "tool-call" || selectedNode.type === "approval-request" || selectedNode.type === "prompt-input") && <section className="mt-6"><h3 className="text-xs font-semibold">State & behavior</h3><div className="mt-3 space-y-3">
            {selectedNode.type === "tool-call" && <label className="block text-xs font-medium">Status<select value={selectedNode.props.toolStatus ?? "success"} onChange={(e) => updateNode(selectedNode.id, { props: { toolStatus: e.target.value as ToolStatus } })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"><option value="running">Running</option><option value="success">Completed</option><option value="error">Failed</option></select></label>}
            {selectedNode.type === "approval-request" && <label className="block text-xs font-medium">Decision<select value={selectedNode.props.approvalStatus ?? "pending"} onChange={(e) => updateNode(selectedNode.id, { props: { approvalStatus: e.target.value as ApprovalStatus } })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"><option value="pending">Pending</option><option value="approved">Approved</option><option value="denied">Denied</option></select></label>}
            {selectedNode.type === "prompt-input" && <><label className="flex min-h-10 items-center justify-between gap-3 text-sm">Web search<input type="checkbox" checked={Boolean(selectedNode.props.showWebSearch)} onChange={(e) => updateNode(selectedNode.id, { props: { showWebSearch: e.target.checked } })} className="h-5 w-5 accent-(--foreground)" /></label><label className="flex min-h-10 items-center justify-between gap-3 text-sm">Tools<input type="checkbox" checked={Boolean(selectedNode.props.showTools)} onChange={(e) => updateNode(selectedNode.id, { props: { showTools: e.target.checked } })} className="h-5 w-5 accent-(--foreground)" /></label></>}
          </div></section>}
        </> : <div className="mt-5 space-y-4">
          <label className="block text-xs font-medium">Page title<input value={doc.title} onChange={(e) => updateDocument({ title: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>
          <label className="block text-xs font-medium">Supporting text<input value={doc.subtitle} onChange={(e) => updateDocument({ subtitle: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-(--border) bg-(--background) px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-(--ring) sm:text-sm" /></label>
        </div>}
      </div>
    </aside>
  );
}
