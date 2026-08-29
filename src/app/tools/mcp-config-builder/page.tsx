import type { Metadata } from "next";
import { McpConfigBuilder } from "@/components/tools/mcp-config-builder/mcp-config-builder";

export const metadata: Metadata = {
  title: "MCP Config Builder",
  description:
    "Visually configure MCP server connections for Claude, Cursor and other AI tools. Add servers, set transport and environment variables, then copy the JSON.",
};

export default function McpConfigBuilderPage() {
  return <McpConfigBuilder />;
}
