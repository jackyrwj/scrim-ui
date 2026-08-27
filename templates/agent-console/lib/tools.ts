import { tool } from "ai";
import { z } from "zod";

/**
 * What the agent can do, and which of those need a person.
 *
 * Four tools, chosen so the console has one of each shape it has to render:
 * a read that always succeeds, a read that sometimes finds nothing, a write
 * that needs approval, and one that fails outright. Replace the bodies; the
 * console does not care where the data comes from.
 *
 * `inputSchema` (not `parameters`) is the current name. The descriptions are
 * prompt engineering, not documentation — they are how the model decides
 * when to call.
 */

export const tools = {
  searchIssues: tool({
    description:
      "Search the issue tracker. Use to find issues by keyword before acting on any of them.",
    inputSchema: z.object({
      query: z.string().describe("Search terms, in the user's own words"),
      limit: z.number().int().min(1).max(20).default(5),
    }),
    execute: async ({ query, limit }) => {
      /* Replace with your tracker's API. Returning a small, already-formatted
         shape matters twice over: it is what the model reads next AND what
         components/step-card.tsx renders. A raw provider payload is bad at
         both jobs. */
      const all = [
        { id: "ENG-412", title: "Streaming stalls on Safari 17", state: "open" },
        { id: "ENG-388", title: "Retry storm after gateway 429", state: "open" },
        { id: "ENG-201", title: "Tool output truncated at 8KB", state: "closed" },
      ];
      const hits = all.filter((i) => i.title.toLowerCase().includes(query.toLowerCase().split(" ")[0] ?? ""));
      return { query, results: hits.slice(0, limit), total: hits.length };
    },
  }),

  readFile: tool({
    description: "Read a file from the repository by path. Use before proposing an edit to it.",
    inputSchema: z.object({
      path: z.string().describe("Repository-relative path, e.g. 'src/app/page.tsx'"),
    }),
    execute: async ({ path }) => {
      /* The empty result is deliberate. A model handed "not found" should say
         so rather than invent the file's contents, and a run console is the
         cheapest place to find out whether your system prompt makes it. */
      return { path, found: false, note: "No such file in the sandbox." };
    },
  }),

  postComment: tool({
    description:
      "Post a comment on an issue. This is visible to other people and cannot be unposted.",
    inputSchema: z.object({
      issue: z.string().describe("Issue id, e.g. 'ENG-412'"),
      body: z.string().describe("The comment, in Markdown"),
    }),
    execute: async ({ issue, body }) => {
      /* Only ever reached after an approval — see APPROVAL below. */
      return { issue, posted: true, url: `https://example.invalid/${issue}#comment`, length: body.length };
    },
  }),

  deploy: tool({
    description: "Deploy the current branch to production.",
    inputSchema: z.object({
      environment: z.enum(["staging", "production"]),
    }),
    execute: async ({ environment }) => {
      /* A tool that throws in development, on purpose. Every agent UI needs
         to know what it looks like when a step fails halfway, and "it never
         happened locally" is why so many of them handle it badly. */
      if (!process.env.DEPLOY_TOKEN) {
        throw new Error(`Deploy to ${environment} rejected: no deployment credentials configured.`);
      }
      return { environment, deployed: true, url: `https://example.invalid/${environment}` };
    },
  }),
} as const;

/**
 * The approval policy.
 *
 * A per-tool map handed to `streamText` as `toolApproval`. `'user-approval'`
 * makes the SDK emit a `tool-approval-request` part *instead of* executing,
 * and the run stops there until a `tool-approval-response` message comes
 * back — which is the entire reason this template needs a server-side run
 * store rather than component state.
 *
 * The rule for what belongs here: **can it be undone?** Reads never need
 * approval. Anything another person can see, anything that spends money, and
 * anything that touches production does.
 *
 * A value can also be a function of the parsed input — `deploy` below asks
 * only for production, because a staging deploy nobody has to babysit is a
 * gate people learn to click through, and a gate people click through
 * without reading is worse than no gate.
 */
export const APPROVAL = {
  postComment: "user-approval",
  deploy: ({ environment }: { environment: "staging" | "production" }) =>
    environment === "production" ? ("user-approval" as const) : ("not-applicable" as const),
} as const;
