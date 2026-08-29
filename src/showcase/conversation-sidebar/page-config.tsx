import type { ComponentPageConfig } from "@/lib/component-page";
import { DemoDefault } from "./demos";
import { conversationSidebarControls, renderConversationSidebar } from "./controls";

export const conversationSidebarPageConfig: ComponentPageConfig = {
  sourceFile: "conversation-sidebar.tsx",
  heroDemo: <DemoDefault />,
  explorer: { schema: conversationSidebarControls, render: renderConversationSidebar },
  usage: [
    "Group by recency — Today, Yesterday, Previous 7 days — and let the caller own the date math.",
    "Delete should land instantly and offer Undo; a confirm dialog punishes the careful, not the careless.",
    "Rename inline where the title sits. A modal for twelve characters is a whole screen change.",
    "Reveal row actions on hover and on keyboard focus, so the list stays quiet without hiding them.",
    "Keep the active conversation visibly distinct — it is the reader's anchor in the list.",
  ],
  mistakes: [
    "A sidebar with no search becomes unusable within a week of real use.",
    "Truncating long titles with no way to read them — hover-reveal the full text or widen the panel.",
    "Resetting the scroll position or collapsing groups every time a new chat appears.",
    "Deleting the active conversation and leaving the reader staring at the old thread.",
  ],
};
