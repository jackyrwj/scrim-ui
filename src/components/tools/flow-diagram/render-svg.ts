import type { PositionedNode, Edge } from "./layout-engine";
import type { NodeType } from "./types";

const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; text: string }> = {
  "user-message": { fill: "#dbeafe", stroke: "#3b82f6", text: "#1e3a5f" },
  "ai-response": { fill: "#ede9fe", stroke: "#7c3aed", text: "#3b1f6e" },
  "tool-call": { fill: "#fef3c7", stroke: "#f59e0b", text: "#78350f" },
  "approval-gate": { fill: "#dcfce7", stroke: "#22c55e", text: "#14532d" },
  branch: { fill: "#f1f5f9", stroke: "#64748b", text: "#1e293b" },
};

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function renderNode(node: PositionedNode): string {
  const colors = NODE_COLORS[node.type];
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const label = truncate(node.label || node.type.replace(/-/g, " "), 28);
  const desc = node.description ? truncate(node.description, 34) : "";

  if (node.type === "branch" || node.type === "approval-gate") {
    const size = node.height * 0.45;
    return `
      <g>
        <rect x="${cx - size}" y="${cy - size}" width="${size * 2}" height="${size * 2}"
          rx="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"
          transform="rotate(45 ${cx} ${cy})" />
        <text x="${cx}" y="${cy + (desc ? -4 : 4)}" text-anchor="middle" fill="${colors.text}"
          font-size="11" font-weight="600" font-family="system-ui, sans-serif">
          ${escapeXml(label)}
        </text>
        ${
          desc
            ? `<text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="${colors.text}"
                font-size="9" opacity="0.7" font-family="system-ui, sans-serif">
                ${escapeXml(desc)}
              </text>`
            : ""
        }
      </g>`;
  }

  return `
    <g>
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}"
        rx="12" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" />
      <text x="${cx}" y="${node.y + (desc ? 24 : node.height / 2 + 4)}" text-anchor="middle"
        fill="${colors.text}" font-size="12" font-weight="600" font-family="system-ui, sans-serif">
        ${escapeXml(label)}
      </text>
      ${
        desc
          ? `<text x="${cx}" y="${node.y + 42}" text-anchor="middle" fill="${colors.text}"
              font-size="10" opacity="0.65" font-family="system-ui, sans-serif">
              ${escapeXml(desc)}
            </text>`
          : ""
      }
    </g>`;
}

function renderEdge(edge: Edge): string {
  const midY = (edge.y1 + edge.y2) / 2;
  return `
    <path d="M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}"
      fill="none" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)" />`;
}

export function renderFlowSvg(
  positioned: PositionedNode[],
  edges: Edge[],
  viewBox: string,
  title: string
): string {
  const titleBlock = title
    ? `<text x="${parseFloat(viewBox.split(" ")[2]) / 2}" y="24" text-anchor="middle"
        fill="#1e293b" font-size="16" font-weight="700" font-family="system-ui, sans-serif">
        ${escapeXml(title)}
      </text>`
    : "";

  const titleOffset = title ? 36 : 0;
  const parts = viewBox.split(" ");
  const adjustedViewBox = `${parts[0]} ${parts[1]} ${parts[2]} ${
    parseFloat(parts[3]) + titleOffset
  }`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${adjustedViewBox}" style="width:100%;height:auto">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="white" rx="12" />
  ${titleBlock}
  <g transform="translate(0, ${titleOffset})">
    ${edges.map(renderEdge).join("")}
    ${positioned.map(renderNode).join("")}
  </g>
</svg>`;
}
