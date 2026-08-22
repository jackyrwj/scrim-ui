import type { VoiceMockupConfig, VoiceTurn } from "@/components/tools/voice-mockup/types";

export type VoiceScriptCategory = {
  slug: string;
  name: string;
};

export type VoiceScript = {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  config: VoiceMockupConfig;
};

export const voiceScriptCategories: VoiceScriptCategory[] = [
  { slug: "daily", name: "Daily utilities" },
  { slug: "productivity", name: "Productivity" },
  { slug: "learning", name: "Learning" },
  { slug: "wellness", name: "Wellness" },
];

function createPresetTurn(
  id: string,
  role: VoiceTurn["role"],
  text: string,
  time?: string,
  speaking?: boolean,
): VoiceTurn {
  return { id, role, text, time, speaking };
}

const deviceBase: Pick<
  VoiceMockupConfig,
  "device" | "theme" | "showControls"
> = {
  device: "mobile",
  theme: "light",
  showControls: true,
};

export const voiceScripts: VoiceScript[] = [
  {
    slug: "weather-assistant",
    name: "Weather Assistant",
    description:
      "A quick weather lookup with a natural follow-up about the weekend forecast.",
    category: "daily",
    tags: ["facts", "concise", "follow-up"],
    config: {
      ...deviceBase,
      title: "Weather",
      subtitle: "Local forecasts",
      stage: "speaking",
      liveTranscript: "",
      elapsedTime: "0:03",
      assistantReply:
        "It’s 24°C and partly cloudy right now. The weekend looks dry with highs around 27°C — great for outdoor plans.",
      turns: [
        createPresetTurn("t1", "user", "What’s the weather like today?", "0:02"),
        createPresetTurn(
          "t2",
          "assistant",
          "Today will be partly cloudy with a high of 24°C. There's a light breeze from the southwest.",
          "Now",
          true,
        ),
      ],
    },
  },
  {
    slug: "interview-coach",
    name: "Interview Coach",
    description:
      "A structured behavioral-interview prep session with follow-up probing.",
    category: "productivity",
    tags: ["coaching", "STAR", "feedback"],
    config: {
      ...deviceBase,
      title: "Interview Coach",
      subtitle: "Practice your answers",
      stage: "listening",
      liveTranscript: "I led a redesign that cut signup drop-off by 30%.",
      elapsedTime: "0:07",
      assistantReply: "",
      turns: [
        createPresetTurn(
          "t1",
          "assistant",
          "Tell me about a time you improved a product metric. Use the STAR format.",
          "Now",
        ),
        createPresetTurn(
          "t2",
          "user",
          "I led a redesign that cut signup drop-off by 30%.",
          "0:08",
        ),
      ],
    },
  },
  {
    slug: "customer-support",
    name: "Customer Support",
    description:
      "A polite troubleshooting flow for a missing delivery, ending with a refund option.",
    category: "productivity",
    tags: ["service", "troubleshooting", "empathy"],
    config: {
      ...deviceBase,
      title: "Support",
      subtitle: "We’re here to help",
      stage: "thinking",
      liveTranscript: "",
      elapsedTime: "0:04",
      assistantReply:
        "I see your order #4821 was marked delivered but you didn’t receive it. I can file a courier trace or process a refund right now — which would you prefer?",
      turns: [
        createPresetTurn(
          "t1",
          "user",
          "My package never arrived, but the app says it was delivered.",
          "0:05",
        ),
        createPresetTurn(
          "t2",
          "assistant",
          "I’m sorry — let me look that up for you. Could you confirm your order number?",
          "Now",
        ),
      ],
    },
  },
  {
    slug: "language-tutor",
    name: "Language Tutor",
    description:
      "A short Spanish practice turn with gentle correction and encouragement.",
    category: "learning",
    tags: ["education", "correction", "encouragement"],
    config: {
      ...deviceBase,
      title: "Spanish Tutor",
      subtitle: "Practice every day",
      stage: "speaking",
      liveTranscript: "",
      elapsedTime: "0:06",
      assistantReply:
        "Muy bien. You said ‘Yo quiero café’ — that’s perfectly correct. In casual settings you can also drop the ‘yo’ and just say ‘Quiero café’.",
      turns: [
        createPresetTurn("t1", "assistant", "How would you order a coffee in Spanish?", "Now"),
        createPresetTurn(
          "t2",
          "user",
          "Yo quiero café, por favor.",
          "0:06",
        ),
      ],
    },
  },
  {
    slug: "meeting-summarizer",
    name: "Meeting Summarizer",
    description:
      "A voice recap that pulls out action items and ownership after a team sync.",
    category: "productivity",
    tags: ["recap", "action-items", "work"],
    config: {
      ...deviceBase,
      title: "Meeting Notes",
      subtitle: "Voice recap",
      stage: "speaking",
      liveTranscript: "",
      elapsedTime: "0:05",
      assistantReply:
        "Here are the action items: Maria will finalize the designs by Thursday. Tom is updating the API docs. You and I will review the QA plan tomorrow at 10.",
      turns: [
        createPresetTurn(
          "t1",
          "user",
          "Summarize yesterday’s product sync and list the action items.",
          "0:04",
        ),
        createPresetTurn(
          "t2",
          "assistant",
          "Sure. The team aligned on the Q3 roadmap and identified three blockers.",
          "Now",
          true,
        ),
      ],
    },
  },
  {
    slug: "fitness-coach",
    name: "Fitness Coach",
    description:
      "A workout check-in that adapts the plan based on how the user feels today.",
    category: "wellness",
    tags: ["health", "adaptation", "motivation"],
    config: {
      ...deviceBase,
      title: "Fitness Coach",
      subtitle: "Train smarter",
      stage: "interrupted",
      liveTranscript: "",
      elapsedTime: "0:04",
      assistantReply:
        "Got it. Since your shoulders are sore, I’ll swap the overhead press for an inclined push-up and keep the rest of the upper-body routine—",
      turns: [
        createPresetTurn(
          "t1",
          "user",
          "My shoulders are a bit sore today. Should I skip push day?",
          "0:05",
        ),
        createPresetTurn(
          "t2",
          "assistant",
          "Let’s adapt instead of skip. I can swap the overhead press for a lighter variation.",
          "Now",
        ),
      ],
    },
  },
];

export function getVoiceScript(slug: string): VoiceScript | undefined {
  return voiceScripts.find((s) => s.slug === slug);
}
