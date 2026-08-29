import type { PatternPageConfig } from "@/lib/pattern-page";
import { ExtractionReviewPattern } from "./extraction-review";

export const extractionReviewPageConfig: PatternPageConfig = {
  sourceFile: "extraction-review.tsx",
  heroDemo: <ExtractionReviewPattern />,
  elements: [
    { label: "File Upload", componentSlug: "file-upload" },
    { label: "Agent Status", componentSlug: "agent-status" },
    { label: "Confidence Answer", componentSlug: "confidence-answer" },
    { label: "Inline Correction", componentSlug: "inline-correction" },
  ],
  usage: [
    "Render the table the moment extraction starts — pending rows are honest placeholders, fields fill in as they land.",
    "Badge the risk per field, not the document: high-confidence values stay quiet, medium and low carry the reason.",
    "Keep the extracted value under every correction — the audit trail is the point of the review pass.",
    "Validate the human's edit at the field; a bad value blocks that row, not the document.",
    "Make export a computed state: disabled until every flagged field is confirmed or corrected.",
  ],
  mistakes: [
    "A single confidence score for the whole document — the smudged tax ID deserves the badge, not the invoice number.",
    "Overwriting the extracted value with the correction, destroying the evidence the review existed to check.",
    "Export enabled with unresolved low-confidence fields — the warning then means nothing.",
    "Validation errors that only surface at export time, far from the field that caused them.",
  ],
};
