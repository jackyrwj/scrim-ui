/* The tool's config serializer — shared by the editor page and the /tools
   card demo. Server definitions in, the exact JSON blob each target
   (Claude Desktop / Claude Code / Cursor) expects, out. */

export type Transport = "stdio" | "sse" | "streamable-http";
export type Target = "Claude Desktop" | "Claude Code" | "Cursor";

export interface EnvVar {
  key: string;
  value: string;
}

export interface McpServerSpec {
  name: string;
  transport: Transport;
  command: string;
  args: string;
  url: string;
  env: EnvVar[];
}

export function buildJson(servers: McpServerSpec[], target: Target): string {
  void target;
  const entries: Record<string, Record<string, unknown>> = {};

  for (const s of servers) {
    const name = s.name.trim() || "unnamed";
    const entry: Record<string, unknown> = {};

    if (s.transport === "stdio") {
      entry.command = s.command.trim();
      const argTokens = s.args.trim().split(/\s+/).filter(Boolean);
      if (argTokens.length > 0) entry.args = argTokens;
    } else {
      entry.type = s.transport;
      entry.url = s.url.trim();
    }

    if (s.env.length > 0) {
      const envObj: Record<string, string> = {};
      for (const e of s.env) {
        if (e.key.trim()) envObj[e.key.trim()] = e.value;
      }
      if (Object.keys(envObj).length > 0) entry.env = envObj;
    }

    entries[name] = entry;
  }

  return JSON.stringify({ mcpServers: entries }, null, 2);
}

export function configHint(target: Target): string {
  switch (target) {
    case "Claude Code":
      return "Paste into ~/.claude/settings.json (Claude Code) or claude_desktop_config.json (Claude Desktop)";
    case "Claude Desktop":
      return "Paste into ~/Library/Application Support/Claude/claude_desktop_config.json";
    case "Cursor":
      return "Paste into .cursor/mcp.json in your project root";
  }
}
