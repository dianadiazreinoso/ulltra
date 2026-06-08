import React from "react";

/**
 * CapabilityCard — the numbered editorial card used on paper sections
 * (Capabilities / Stack). A mono numeral + display title over a hairline-ruled
 * list of items. Hover lifts it a few px and brightens the rule.
 */
export function CapabilityCard({ numeral, title, items = [], style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        color: "var(--c-paper-ink)",
        padding: "28px 30px 30px",
        borderTop: `1px solid ${hover ? "var(--c-paper-ink)" : "var(--c-paper-line)"}`,
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: "transform var(--motion-hover), border-color var(--motion-hover)",
        ...style,
      }}
      {...rest}
    >
      {numeral != null && (
        <span
          style={{
            fontFamily: "var(--ff-mono)",
            fontSize: "var(--fs-micro)",
            letterSpacing: "var(--ls-wide)",
            color: "var(--c-paper-ink-sub)",
          }}
        >
          {numeral}
        </span>
      )}
      <h3
        style={{
          margin: "14px 0 20px",
          fontFamily: "var(--ff-display)",
          fontWeight: 800,
          fontSize: "clamp(22px, 1.7vw, 27px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        {title}
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              fontFamily: "var(--ff-display)",
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: 1.35,
              color: "var(--c-paper-ink)",
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--c-accent)", flex: "0 0 auto" }}
            />
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}
