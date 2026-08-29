import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { approvalGateControls, renderApprovalGate } from "./controls";

export const approvalGatePageConfig: ComponentPageConfig = {
  sourceFile: "approval-gate.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: approvalGateControls, render: renderApprovalGate },
  usage: [
    "Feed `outcome` from the run's event log, not from the click handler. Every hard case here — a closed tab, a second tab, a reload — stops being a case at all once the outcome has a single source outside React.",
    "Send `request.id` with the decision and dedupe on it server-side. Two tabs, a double click and a retried fetch are three ways to send the same decision twice.",
    "Clear `submitting` when the outcome arrives over the stream, not when the fetch resolves. A 200 means the decision was received; it does not mean the run acted on it.",
    "Set `expiresAt` to the run's own deadline. Derived state beats stored state — the expired render is then correct on a reload months later, with no expiry event needed.",
    "Show the exact payload in `detail`. The question is 'should I do this?', and it cannot be answered from a summary of what 'this' is.",
    "Pass `connection` from the stream's health so a pending gate stops claiming to be current while the tab is catching up.",
  ],
  mistakes: [
    "Keeping the pending state in React. The tab closes, the state goes with it, and the run waits forever for an answer nobody can give any more.",
    "Rendering the decision optimistically. With the run open in two tabs, one of them is then showing a decision the server may reject, and there is no honest way back from a green tick.",
    "Rendering a late decision as a normal approval. It is the one state a tick actively lies about: the answer was recorded and the action never ran.",
    "Hiding the buttons the moment they are clicked. The card empties, the answer is still in flight, and the reader has no way to tell 'sent' from 'ignored'.",
    "Letting the deadline expire silently into the pending state. A gate that just sits there is indistinguishable from a run that is still waiting.",
    "Announcing the countdown to screen readers. Once a second, forever, over whatever the reader was actually trying to hear.",
  ],
};
