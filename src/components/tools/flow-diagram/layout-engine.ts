import type { FlowNode } from "./types";

export type PositionedNode = FlowNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Edge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 56;
const NODE_HEIGHT_WITH_DESC = 76;
const VERTICAL_GAP = 44;
const CANVAS_PADDING = 40;

export function layoutNodes(nodes: FlowNode[]): {
  positioned: PositionedNode[];
  edges: Edge[];
  viewBox: string;
} {
  if (nodes.length === 0)
    return { positioned: [], edges: [], viewBox: "0 0 300 100" };

  const positioned: PositionedNode[] = [];
  const edges: Edge[] = [];

  const centerX = CANVAS_PADDING + NODE_WIDTH / 2;
  let currentY = CANVAS_PADDING;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const h = node.description ? NODE_HEIGHT_WITH_DESC : NODE_HEIGHT;

    positioned.push({
      ...node,
      x: centerX - NODE_WIDTH / 2,
      y: currentY,
      width: NODE_WIDTH,
      height: h,
    });

    if (i > 0) {
      const prev = positioned[i - 1];
      edges.push({
        x1: centerX,
        y1: prev.y + prev.height,
        x2: centerX,
        y2: currentY,
      });
    }

    currentY += h + VERTICAL_GAP;
  }

  const totalWidth = NODE_WIDTH + CANVAS_PADDING * 2;
  const totalHeight = currentY - VERTICAL_GAP + CANVAS_PADDING;

  return {
    positioned,
    edges,
    viewBox: `0 0 ${totalWidth} ${totalHeight}`,
  };
}
