import { tool, type ToolSet } from "ai";
import { askChoice, WIDGETS } from "./widgets";

/**
 * The tools, generated from the registry.
 *
 * Nothing is hand-written here, and that is the point: a widget exists in
 * exactly one place (lib/widgets.ts), so the set the model can call and the
 * set the app can draw cannot drift apart by an edit made in a hurry.
 *
 * A tool per widget rather than one `render(component, props)` tool. Both
 * work; this one is better for the same reason a typed API is better than a
 * string-dispatched one — the model gets a schema *per widget* instead of a
 * union it has to pick through, and the SDK rejects an unknown tool name
 * before your code sees it. The fallback path in
 * components/widgets/registry.tsx still exists, because the *client* can be
 * missing a renderer the server offers, which is a different problem and a
 * routine one.
 */
export const tools: ToolSet = {
  ...Object.fromEntries(
    WIDGETS.map((widget) => [
      widget.name,
      tool({
        description: widget.description,
        inputSchema: widget.input,
        /* The output schema is declared, not just documented. The SDK
           validates against it, so a tool that returns the wrong shape fails
           here rather than three layers away inside a component that assumed
           a field existed. */
        outputSchema: widget.output,
        execute: widget.execute as (input: unknown) => Promise<unknown>,
      }),
    ]),
  ),

  /* No `execute`. The browser answers this one — see components/message.tsx.
     The SDK emits the call and the run waits for `addToolOutput`. */
  [askChoice.name]: tool({
    description: askChoice.description,
    inputSchema: askChoice.input,
  }),
};
