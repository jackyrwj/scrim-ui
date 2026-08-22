export type NodeType =
  | "user-message"
  | "ai-response"
  | "tool-call"
  | "approval-gate"
  | "branch";

/** One path out of a decision node. Paths run in parallel and merge back. */
export type FlowBranch = {
  id: string;
  /** Drawn on the edge leaving the decision node, e.g. "Approved". */
  label: string;
  nodes: FlowNode[];
};

export type FlowNode = {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  /** Only meaningful on decision nodes — see canBranch(). */
  branches?: FlowBranch[];
};

export type FlowConfig = {
  title: string;
  nodes: FlowNode[];
};

/** Decision shapes can split the flow; every other node is a single step. */
export function canBranch(type: NodeType): boolean {
  return type === "branch" || type === "approval-gate";
}

/** A node that actually splits right now (a decision with paths on it). */
export function isSplit(node: FlowNode): boolean {
  return canBranch(node.type) && !!node.branches && node.branches.length > 0;
}

/** How deep branches may nest before the Branch option is hidden. */
export const MAX_BRANCH_DEPTH = 2;

let _nextId = 1;
export function newNodeId(): string {
  return `node-${_nextId++}`;
}

export function createBranch(label = ""): FlowBranch {
  return { id: newNodeId(), label, nodes: [] };
}

export function createNode(type: NodeType = "user-message"): FlowNode {
  const node: FlowNode = { id: newNodeId(), type, label: "", description: "" };
  if (canBranch(type)) node.branches = [createBranch("Yes"), createBranch("No")];
  return node;
}

export const defaultConfig: FlowConfig = {
  title: "AI Agent Flow",
  nodes: [
    { id: "node-s1", type: "user-message", label: "User sends message", description: "" },
    { id: "node-s2", type: "ai-response", label: "AI plans the work", description: "Model picks the tools" },
    { id: "node-s3", type: "tool-call", label: "Search the web", description: "External API call" },
    {
      id: "node-s4",
      type: "approval-gate",
      label: "Run the action?",
      description: "",
      branches: [
        {
          id: "node-s4a",
          label: "Approved",
          nodes: [
            { id: "node-s5", type: "tool-call", label: "Execute the action", description: "Writes to the database" },
            { id: "node-s6", type: "ai-response", label: "Summarise the result", description: "" },
          ],
        },
        {
          id: "node-s4b",
          label: "Rejected",
          nodes: [
            { id: "node-s7", type: "ai-response", label: "Explain what was skipped", description: "" },
          ],
        },
      ],
    },
    { id: "node-s8", type: "ai-response", label: "AI returns final answer", description: "" },
  ],
};

export const NODE_TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: "user-message", label: "User Message" },
  { value: "ai-response", label: "AI Response" },
  { value: "tool-call", label: "Tool Call" },
  { value: "approval-gate", label: "Approval Gate" },
  { value: "branch", label: "Branch (If/Else)" },
];
