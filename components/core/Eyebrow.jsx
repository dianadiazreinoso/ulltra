import React from "react";

/**
 * Eyebrow — the mono instrument-panel label that precedes headings and sits in
 * section rails. UPPERCASE, wide-tracked JetBrains Mono. Optionally pairs a
 * numeral (e.g. "§ 05") with a label ("Stack · Tech & AI").
 */
export function Eyebrow({ children, numeral, onPaper = false, style, ...rest }) {
  const color = onPaper ? "rgba(26,22,18,0.55)" : "var(--c-ink-mute)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--fs-nav)",
        fontWeight: 500,
        letterSpacing: "var(--ls-wide)",
        textTransform: "uppercase",
        color,
        ...style,
      }}
      {...rest}
    >
      {numeral != null && (
        <span style={{ color: onPaper ? "rgba(26,22,18,0.4)" : "var(--c-ink-dim)" }}>
          {numeral}
        </span>
      )}
      {children}
    </span>
  );
}
