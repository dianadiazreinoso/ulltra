import React from "react";

/**
 * StatusPill — the "operating" signal. A small pulsing dot + mono label.
 * Default colour is the operational yellow (--c-status); pass tone="accent"
 * for magenta or tone="live" (default).
 */
export function StatusPill({ children = "Operating 24 / 7 / 365", tone = "live", style, ...rest }) {
  const dot = tone === "accent" ? "var(--c-accent)" : "var(--c-status)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        fontFamily: "var(--ff-mono)",
        fontSize: "var(--fs-nav)",
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: "var(--c-ink-sub)",
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: dot,
          boxShadow: `0 0 10px 1px color-mix(in oklab, ${dot} 50%, transparent)`,
          animation: "svrn-pulse 2.4s var(--ease-in-out) infinite",
        }}
      />
      {children}
      <style>{`@keyframes svrn-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}`}</style>
    </span>
  );
}
