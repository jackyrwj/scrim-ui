export type NodeType =
  | "user-message"
  | "ai-response"
  | "tool-call"
  | "approval-gate"
  | "branch";

export type FlowNode = {
  id: string;
  type: NodeType;
  label: string;
  description: string;
};

export type FlowConfig = {
  title: string;
  nodes: FlowNode[];
};

let _nextId = 1;
export function newNodeId(): string {
  return `node-${_nextId++}`;
}

export function createNode(type: NodeType = "user-message"): FlowNode {
  return { id: newNodeId(), type, label: "", description: "" };
}

export const defaultConfig: FlowConfig = {
  title: "AI Chat Flow",
  nodes: [
    { id: "node-s1", type: "user-message", label: "User sends message", description: "" },
    { id: "node-s2", type: "ai-response", label: "AI processes request", description: "Model generates response" },
    { id: "node-s3", type: "tool-call", label: "Search the web", description: "External API call" },
    { id: "node-s4", type: "approval-gate", label: "User approves action", description: "" },
    { id: "node-s5", type: "ai-response", label: "AI returns final answer", description: "" },
  ],
};

export const NODE_TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: "user-message", label: "User Message" },
  { value: "ai-response", label: "AI Response" },
  { value: "tool-call", label: "Tool Call" },
  { value: "approval-gate", label: "Approval Gate" },
  { value: "branch", label: "Branch (If/Else)" },
];
