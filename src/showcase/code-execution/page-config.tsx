import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoRunning, DemoSuccess, DemoError } from "./demos";

export const codeExecutionPageConfig: ComponentPageConfig = {
  sourceFile: "code-execution.tsx",
  heroDemo: <DemoRunning />,
  variants: [
    {
      id: "running",
      title: "Running",
      note: "A spinner pill and a Stop control while execution runs; click Stop to see the interrupted state.",
      demo: <DemoRunning />,
    },
    {
      id: "success",
      title: "Success",
      note: "A green pill with stdout and the exit code — the user can read exactly what the code produced.",
      demo: <DemoSuccess />,
    },
    {
      id: "error",
      title: "Error",
      note: "stderr renders in red with the traceback and exit code — error messages stay visible and copyable.",
      demo: <DemoError />,
    },
  ],
  usage: [
    "Show the exact code that ran — trust in an agent's work comes from auditability, not from a summary.",
    "Render stdout and stderr as real text with a mono font, always scrollable; never truncate silently.",
    "Keep the Stop control live while running and mark the result as 'stopped' — interruption with retention builds trust.",
    "Show the exit code and duration; a successful tool call that took 30 seconds is a different signal than one that took 0.3s.",
  ],
  mistakes: [
    "Collapsing the code after it runs — the user can't verify what produced the output.",
    "Rendering output with a normal-width font, making columns and diffs unreadable.",
    "Hiding a nonzero exit code behind a red pill — the user needs the numbers and the traceback.",
  ],
};
