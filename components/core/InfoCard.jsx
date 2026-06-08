import React from "react";
import { Eyebrow } from "./Eyebrow.jsx";
import { StatusPill } from "./StatusPill.jsx";

/**
 * InfoCard — the frosted-glass fact panel that floats over hero imagery.
 * A mono kicker over a short display-weight statement. Optionally shows the
 * pulsing status dot. Designed to sit two-up in a glass row.
 */
export function InfoCard({ kicker, children, statusDot = false, style, ...rest }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "22px 28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "var(--c-glass)",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--c-glass-stroke)",
        transition: "background var(--motion-hover)",
        ...style,
      }}
      {...rest}
    >
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <div
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: 1.25,
          color: "var(--c-ink)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {statusDot && <StatusPill>{children}</StatusPill>}
        {!statusDot && children}
      </div>
    </div>
  );
}
