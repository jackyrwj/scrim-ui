import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { costMeterControls, renderCostMeter } from "./controls";

export const costMeterPageConfig: ComponentPageConfig = {
  sourceFile: "cost-meter.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: costMeterControls, render: renderCostMeter },
  usage: [
    "Pass `cachedInputTokens` as the share of `inputTokens` served from cache, not as a separate bucket added on top. Every provider reports it the first way and the second way over-bills a long conversation several times over.",
    "Leave a field `undefined` when the provider did not report it. That is the signal the component needs to show a ~ instead of a confident number.",
    "Pass `reasoningTokens` for display only. They are already inside `outputTokens`, and the reason to surface them is that they are the line which explains an unexpectedly large bill.",
    "Keep the rate table in your own code and pass it in. Prices change, and a component that ships its own is one that will be quietly wrong after the next provider announcement.",
    "Accumulate with `addUsage` rather than adding fields by hand — it keeps a missing field missing across a whole conversation instead of quietly turning it into a zero at the first sum.",
    "Show the per-conversation total once a conversation is long enough for the per-message figure to stop being the interesting one.",
  ],
  mistakes: [
    "Pricing all input at the fresh rate. On an agent run or a long chat the same prefix is re-read every turn, and the meter reads roughly an order of magnitude high.",
    "Adding reasoning tokens to output tokens. They are already counted, and the double-count grows with exactly the kind of turn a user is most likely to check.",
    "Treating a missing field as zero. '$0.00' and 'we do not know' look identical on screen and mean opposite things to whoever reads the invoice later.",
    "Rounding to two decimals under a cent. Six turns at $0.00 followed by a jump to $0.01 reads as a broken meter, and the reader stops trusting the number at exactly the point it starts to matter.",
    "Animating the figure as it climbs mid-stream. It is a subtotal, and a number that counts up smoothly looks more settled than one that is still moving.",
    "Letting the budget bar overflow its track. A bar past 100% is a rendering bug; a bar pinned at full beside a number that keeps climbing is the actual situation.",
  ],
};
