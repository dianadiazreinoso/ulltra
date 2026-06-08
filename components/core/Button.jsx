import React from "react";

/**
 * SVRN Button — the brand's pill action.
 *
 * Three intents:
 *  · volt    — high-voltage lime outline on transparent; fills lime on hover.
 *              The single primary CTA in the header. Use sparingly (one per view).
 *  · solid   — near-black fill with cream ink (the in-page "Get started" /
 *              "Book a discovery call" action on paper sections).
 *  · ghost   — cream hairline outline on transparent, for secondary actions on
 *              dark surfaces.
 *
 * Always mono, UPPERCASE, wide-tracked, pill-radius. Motion is slow (--t-base).
 */
export function Button({
  children,
  intent = "volt",
  href,
  type = "button",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontFamily: "var(--ff-mono)",
    fontWeight: 500,
    fontSize: "14px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    whiteSpace: "nowrap",
    borderRadius: "var(--r-pill)",
    padding: "0 22px",
    height: "44px",
    transition:
      "background-color var(--t-base) var(--ease-in-out), color var(--t-base) var(--ease-in-out), border-color var(--t-base) var(--ease-in-out), transform var(--t-fast) var(--ease-out-edit)",
  };

  const intents = {
    volt: {
      background: "transparent",
      border: "1px solid var(--c-volt)",
      color: "var(--c-volt)",
    },
    solid: {
      background: "var(--c-paper-ink)",
      border: "1px solid var(--c-paper-ink)",
      color: "#F4EFE3",
      borderRadius: "var(--r-md)",
    },
    ghost: {
      background: "transparent",
      border: "1px solid var(--c-line)",
      color: "var(--c-ink)",
    },
  };

  const hover = {
    volt: (e, on) => {
      e.currentTarget.style.background = on ? "var(--c-volt)" : "transparent";
      e.currentTarget.style.color = on ? "#0A0807" : "var(--c-volt)";
    },
    solid: (e, on) => {
      e.currentTarget.style.transform = on ? "translateY(-2px)" : "translateY(0)";
    },
    ghost: (e, on) => {
      e.currentTarget.style.borderColor = on ? "var(--c-ink)" : "var(--c-line)";
      e.currentTarget.style.background = on
        ? "rgba(237,229,204,0.05)"
        : "transparent";
    },
  };

  const handlers = disabled
    ? {}
    : {
        onMouseEnter: (e) => hover[intent](e, true),
        onMouseLeave: (e) => hover[intent](e, false),
      };

  const props = {
    style: { ...base, ...intents[intent], ...style },
    ...handlers,
    ...rest,
  };

  if (href && !disabled) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
