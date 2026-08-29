import { SCRIM_MARK_PATH } from "@/components/site/scrim-mark";

/**
 * The shared open-graph card.
 *
 * Rendered by next/og's Satori, not by a browser: flexbox only (no grid, no
 * float), every element that holds more than one child needs an explicit
 * `display: flex`, and only inline styles apply — no classes, no CSS
 * variables, so the palette is spelled out here rather than read from the
 * tokens. Kept deliberately plain for that reason; the mark and the type do
 * the work.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#09090b";
const MUTED = "#52525b";
const LINE = "#e4e4e7";
const VIOLET = "#7c3aed";

export function OgCard({
  eyebrow,
  title,
  description,
  tagline = "Free · copy-ready · no signup",
}: {
  /** What kind of page this is — "Component", "Pattern", "Tool". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** The footer claim. Defaults to the free library's, because that is what
   *  almost every page on the site is — but a Pro page must override it. A
   *  card reading "Free" under a paid template is the kind of detail that
   *  costs more trust than the share was ever going to earn. */
  tagline?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#ffffff",
        /* Satori has no radial-gradient, so the glow is a linear wash. */
        backgroundImage: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 55%)",
      }}
    >
      {/* Brand lockup */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: INK,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 96 96" fill="#ffffff">
            <path fillRule="evenodd" d={SCRIM_MARK_PATH} />
          </svg>
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, color: INK, letterSpacing: -0.5 }}>
          Scrim UI
        </div>
      </div>

      {/* The page */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 18px",
              marginBottom: 24,
              borderRadius: 999,
              backgroundColor: "#ede9fe",
              color: "#5b21b6",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </div>
        )}
        <div
          style={{
            fontSize: title.length > 46 ? 60 : 72,
            fontWeight: 600,
            color: INK,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              color: MUTED,
              lineHeight: 1.4,
              /* Satori supports line-clamp only via these three together. */
              display: "block",
              overflow: "hidden",
            }}
          >
            {description.length > 130 ? `${description.slice(0, 127)}…` : description}
          </div>
        )}
      </div>

      {/* Footer rule */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 28,
          borderTop: `2px solid ${LINE}`,
          fontSize: 24,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex" }}>scrimui.dev</div>
        <div style={{ display: "flex", color: VIOLET, fontWeight: 500 }}>
          {tagline}
        </div>
      </div>
    </div>
  );
}
