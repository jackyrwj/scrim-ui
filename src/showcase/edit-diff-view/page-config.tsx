import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoStreaming } from "./demos";
import { editDiffViewControls, renderEditDiffView } from "./controls";

export const editDiffViewPageConfig: ComponentPageConfig = {
  sourceFile: "edit-diff-view.tsx",
  heroDemo: <DemoStreaming />,
  explorer: { schema: editDiffViewControls, render: renderEditDiffView },
  usage: [
    "Ask the model for edits as structured hunks — id, original, edited — rather than a rewritten document. A diff reverse-engineered from two full texts has no stable identity for 'the second change', and stable identity is what every decision hangs off.",
    "Assign each hunk its id before it arrives and only ever append segments. Decisions keyed by id are the only arrangement in which an accept cannot slide onto a different change while the stream re-splits.",
    "Mark a hunk `complete` only when its replacement has finished arriving. Until then the buttons stay disabled and `buildMergedDocument` treats it as undecided — half an edit is not a decision the reader can make.",
    "Keep the context segments in the list even when they are collapsed on screen. `collapseContext` is a display choice; `buildMergedDocument` still needs the verbatim text to produce a whole file.",
    "Produce the output with `buildMergedDocument`, not by stitching decisions together at the call site. Rejected and undecided both keep the original, which is the only rule that can never leak half an edit into the result.",
    "Pass `streaming` while segments are being appended so the header says 'still arriving'. A count that looks final invites Accept all a beat too early.",
  ],
  mistakes: [
    "Keying decisions by hunk index. A streaming diff re-splits itself as more text arrives, and index 2 stops being the hunk the reader was looking at between renders.",
    "Letting an incomplete hunk be accepted. The merged document gets half a function, and the failure shows up in someone else's build rather than in the review UI.",
    "Diffing whole documents instead of keeping a segment list. With only two big strings, 'accept the second change' has no representation, and partial acceptance becomes string surgery.",
    "Recomputing the diff on the client from before and after snapshots. The model already knows what it changed; rendering its structured hunks is exact, and re-deriving them is a second algorithm that disagrees with the first.",
    "Painting whole lines red and green for a one-word change. The reader scans two lines to find one token; word-level marks are what make a small edit read as small.",
    "Shipping a 'copy result' button that joins every hunk's edited text regardless of decisions. The merged document is a function of the decisions; bypassing it is how a rejected edit reaches the clipboard.",
  ],
};
