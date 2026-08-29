import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoWithDiff } from "./demos";
import { promptEditorControls, renderPromptEditor } from "./controls";

export const promptEditorPageConfig: ComponentPageConfig = {
  sourceFile: "prompt-editor.tsx",
  heroDemo: <DemoWithDiff />,
  explorer: { schema: promptEditorControls, render: renderPromptEditor },
  usage: [
    "Pass the list of variables your deployment actually fills. It is what turns a typo'd {{name}} from a silent hole in the output into an amber highlight with a warning line.",
    "Fill the preview with realistic sample values, not lorem ipsum — a preview that reads like the real prompt is the one reviewers actually check before saving.",
    "Use `renderTemplate` for the substitution at send time too, so the preview and the request can never disagree about how a variable resolves.",
    "Pass `compareWith` when editing a versioned prompt. The diff is the answer to the only question a reviewer has: what did this change actually do.",
    "Give the editor room. A system prompt is the longest text in the product, and a three-line box invites the kind of edit that never gets reviewed.",
  ],
  mistakes: [
    "Highlighting with a rich-text editor. A contentEditable with inline spans fights the browser's own editing behavior; the transparent-textarea-over-pre split keeps the browser's textarea and adds color underneath it.",
    "Letting the two layers' typography drift. Font, size, line height, padding and wrapping must match exactly — the shared class constant in the source is load-bearing, not tidiness.",
    "Forgetting scroll sync. The textarea scrolls and the pre does not, so without mirroring scrollTop the highlights stay behind while the text moves.",
    "Substituting unknown variables with an empty string. '{{naem}}' in the output is a visible mistake; a gap where a name should be is an invisible one that ships.",
    "Diffing prompts by eye in a PR. Two long strings in a code review hide a one-word change; compareWith puts the changed lines under the editor where the edit happens.",
  ],
};
