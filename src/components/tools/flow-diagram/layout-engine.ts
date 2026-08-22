import { isSplit, type FlowNode } from "./types";

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
  /** Drawn at the midpoint — the branch label. */
  label?: string;
  /** Bows the curve out towards this x, used by empty branch paths. */
  viaX?: number;
};

/** Where parallel paths come back together. */
export type MergePoint = {
  x: number;
  y: number;
  r: number;
};

export type Layout = {
  positioned: PositionedNode[];
  edges: Edge[];
  merges: MergePoint[];
  viewBox: string;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 56;
const NODE_HEIGHT_WITH_DESC = 76;
const VERTICAL_GAP = 44;
const HORIZONTAL_GAP = 32;
const CANVAS_PADDING = 40;
const MERGE_RADIUS = 9;

function nodeHeight(node: FlowNode): number {
  return node.description ? NODE_HEIGHT_WITH_DESC : NODE_HEIGHT;
}

/* ------------------------------------------------------------------ */
/* Measure pass — how wide a subtree needs to be                       */
/* ------------------------------------------------------------------ */

function measureNode(node: FlowNode): number {
  if (!isSplit(node)) return NODE_WIDTH;
  const branches = node.branches ?? [];
  const total =
    branches.reduce((sum, b) => sum + measureSequence(b.nodes), 0) +
    HORIZONTAL_GAP * Math.max(0, branches.length - 1);
  return Math.max(NODE_WIDTH, total);
}

function measureSequence(nodes: FlowNode[]): number {
  return nodes.reduce((widest, n) => Math.max(widest, measureNode(n)), NODE_WIDTH);
}

/* ------------------------------------------------------------------ */
/* Place pass — walk the tree and assign coordinates                   */
/* ------------------------------------------------------------------ */

type Context = {
  positioned: PositionedNode[];
  edges: Edge[];
  merges: MergePoint[];
  maxX: number;
  maxY: number;
};

/**
 * Lays a sequence out top to bottom centered on `centerX`, starting at
 * `startY`. Returns the y the next element should connect from — for a
 * plain node that is its bottom edge, for a decision it is the bottom of
 * the merge point where its paths came back together.
 */
function placeSequence(
  nodes: FlowNode[],
  centerX: number,
  startY: number,
  ctx: Context,
): number {
  let y = startY;
  let exitY: number | null = null;

  for (const node of nodes) {
    if (exitY !== null) {
      ctx.edges.push({ x1: centerX, y1: exitY, x2: centerX, y2: y });
    }

    const h = nodeHeight(node);
    ctx.positioned.push({
      ...node,
      x: centerX - NODE_WIDTH / 2,
      y,
      width: NODE_WIDTH,
      height: h,
    });
    ctx.maxX = Math.max(ctx.maxX, centerX + NODE_WIDTH / 2);
    ctx.maxY = Math.max(ctx.maxY, y + h);

    if (!isSplit(node)) {
      exitY = y + h;
      y = exitY + VERTICAL_GAP;
      continue;
    }

    // Decision node: lay every path out side by side, then merge them.
    const branches = node.branches ?? [];
    const widths = branches.map((b) => measureSequence(b.nodes));
    const totalWidth =
      widths.reduce((a, b) => a + b, 0) + HORIZONTAL_GAP * Math.max(0, widths.length - 1);

    const splitY = y + h;
    const pathTop = splitY + VERTICAL_GAP;
    const bottoms: { x: number; y: number; empty: boolean }[] = [];

    let cursorX = centerX - totalWidth / 2;
    branches.forEach((branch, i) => {
      const columnCenter = cursorX + widths[i] / 2;
      cursorX += widths[i] + HORIZONTAL_GAP;

      if (branch.nodes.length === 0) {
        bottoms.push({ x: columnCenter, y: splitY, empty: true });
        return;
      }

      ctx.edges.push({
        x1: centerX,
        y1: splitY,
        x2: columnCenter,
        y2: pathTop,
        label: branch.label,
      });
      const columnExit = placeSequence(branch.nodes, columnCenter, pathTop, ctx);
      bottoms.push({ x: columnCenter, y: columnExit, empty: false });
    });

    const deepest = bottoms.reduce((m, b) => Math.max(m, b.y), pathTop);
    const mergeY = deepest + VERTICAL_GAP;

    bottoms.forEach((b, i) => {
      if (b.empty) {
        // Nothing on this path — bow a labelled edge around to the merge.
        ctx.edges.push({
          x1: centerX,
          y1: splitY,
          x2: centerX,
          y2: mergeY - MERGE_RADIUS,
          label: branches[i].label,
          viaX: b.x,
        });
      } else {
        ctx.edges.push({ x1: b.x, y1: b.y, x2: centerX, y2: mergeY - MERGE_RADIUS });
      }
    });

    ctx.merges.push({ x: centerX, y: mergeY, r: MERGE_RADIUS });
    ctx.maxY = Math.max(ctx.maxY, mergeY + MERGE_RADIUS);

    exitY = mergeY + MERGE_RADIUS;
    y = exitY + VERTICAL_GAP;
  }

  return exitY ?? startY;
}

export function layoutNodes(nodes: FlowNode[]): Layout {
  if (nodes.length === 0)
    return { positioned: [], edges: [], merges: [], viewBox: "0 0 300 100" };

  const totalWidth = measureSequence(nodes);
  const centerX = CANVAS_PADDING + totalWidth / 2;

  const ctx: Context = {
    positioned: [],
    edges: [],
    merges: [],
    maxX: centerX,
    maxY: CANVAS_PADDING,
  };

  placeSequence(nodes, centerX, CANVAS_PADDING, ctx);

  return {
    positioned: ctx.positioned,
    edges: ctx.edges,
    merges: ctx.merges,
    viewBox: `0 0 ${totalWidth + CANVAS_PADDING * 2} ${ctx.maxY + CANVAS_PADDING}`,
  };
}
