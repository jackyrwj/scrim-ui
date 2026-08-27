import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { responseRatingControls, renderResponseRating } from "./controls";

export const responseRatingPageConfig: ComponentPageConfig = {
  sourceFile: "response-rating.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: responseRatingControls, render: renderResponseRating },
  usage: [
    "Drive `rating` from what the server stored, not from a click. The click is a request, and until it lands the thumb is a hope rather than a fact.",
    "Record the vote before asking why. The reason panel is then a bonus you can decline, instead of a toll gate on the conversation.",
    "Treat clearing a rating as a delete. If the filled thumb un-fills but the row stays in your table, your dashboard is counting feedback the user withdrew.",
    "Keep the reason chips to four or five, and write them as things a reader recognises in their own irritation — 'missed the question' beats 'relevance'.",
    "Ask nothing after a thumbs-up. A questionnaire attached to praise is how you teach people to stop rating anything.",
    "Store the message id and the model version alongside the rating. Feedback with no idea which version produced the answer cannot be used to compare two.",
  ],
  mistakes: [
    "Making it a local toggle that never leaves the browser. It looks finished, it tests fine, and it collects nothing.",
    "Opening a modal for the reason. It blocks the conversation to collect data for someone who is not in the room, and the completion rate shows it.",
    "Disabling Send until a reason is picked. The reader may have nothing to add beyond the vote, and the greyed-out button reads as their feedback not being good enough.",
    "Shipping a fourteen-item reason taxonomy. That is a form, and nobody fills in a form to be helpful.",
    "Leaving the down-vote silent until the detail is submitted. The reader cannot tell whether the click registered, so they click again.",
  ],
};
