/* SVRN site UI kit · Header + Index menu overlay + Get-started drawer
   Self-contained (no bundle import) so the kit runs via in-browser Babel. */
const { useState: useStateH } = React;

const NAV_ITEMS = [
  { n: "01", label: "Approach" },
  { n: "02", label: "Capabilities" },
  { n: "03", label: "Software" },
  { n: "04", label: "Wisdom" },
  { n: "05", label: "Stack" },
  { n: "06", label: "Work" },
  { n: "07", label: "Clients" },
  { n: "08", label: "Contact" },
];

/* — Brand wordmark — */
function Wordmark({ ink = "var(--c-ink)" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "3px",
                   fontFamily: '"Archivo", sans-serif', fontWeight: 800, fontSize: "22px",
                   letterSpacing: "-0.04em", color: ink }}>
      SVRN<span style={{ width: "6px", height: "6px", borderRadius: "50%",
                         background: "var(--c-accent)", marginLeft: "2px", alignSelf: "center" }} />
    </span>
  );
}

function VoltButton({ children, onClick }) {
  const [h, setH] = useStateH(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", height: "41px", padding: "0 22px",
        borderRadius: "var(--r-pill)", border: "1px solid var(--c-volt)",
        fontFamily: "var(--ff-mono)", fontWeight: 500, fontSize: "14px", letterSpacing: "0.04em",
        textTransform: "uppercase", color: h ? "#0A0807" : "var(--c-volt)",
        background: h ? "var(--c-volt)" : "transparent",
        transition: "all var(--t-base) var(--ease-in-out)" }}>
      {children}
    </button>
  );
}

function Header({ onMenu, onGetStarted }) {
  return (
    <header style={{ position: "fixed", top: "clamp(12px,1.5vw,20px)", left: 0, right: 0,
      marginInline: "auto", width: "min(1480px, 100vw - 32px)", height: "64px", zIndex: "var(--z-header)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", borderRadius: "13px", border: "1px solid var(--c-glass-stroke)",
      background: "rgba(20,17,14,.42)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
      <Wordmark />
      <nav style={{ display: "flex", gap: "26px" }}>
        {NAV_ITEMS.slice(0, 5).map((it) => (
          <button key={it.n} style={{ fontFamily: "var(--ff-mono)", fontSize: "12px",
            letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-ink-sub)",
            display: "inline-flex", gap: "6px", transition: "color var(--t-fast)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--c-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--c-ink-sub)")}>
            <span style={{ color: "var(--c-ink-dim)" }}>{it.n}</span>{it.label}
          </button>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={onMenu} style={{ fontFamily: "var(--ff-mono)", fontSize: "12px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--c-ink-sub)" }}>
          Index
        </button>
        <VoltButton onClick={onGetStarted}>Get Started</VoltButton>
      </div>
    </header>
  );
}

/* — Index menu overlay — */
function IndexMenu({ open, onClose, onGetStarted }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: "var(--z-overlay)",
      background: "rgba(10,8,7,.86)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
      transition: "opacity var(--t-slow) var(--ease-out-cine)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", inset: 0,
        width: "min(680px, 92vw)", marginLeft: "auto", background: "var(--c-bg-1)",
        borderLeft: "1px solid var(--c-line)", padding: "clamp(28px,5vh,56px)",
        transform: open ? "translateX(0)" : "translateX(40px)",
        transition: "transform var(--t-slow) var(--ease-out-cine)", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "clamp(24px,5vh,52px)" }}>
          <span style={{ fontFamily: "var(--ff-mono)", fontSize: "12px", letterSpacing: "0.24em",
            textTransform: "uppercase", color: "rgba(237,229,204,.46)" }}>Index</span>
          <button onClick={onClose} aria-label="Close" style={{ fontFamily: "var(--ff-mono)",
            fontSize: "20px", color: "var(--c-ink-sub)" }}>×</button>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((it) => (
            <li key={it.n}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: "20px",
                padding: "clamp(12px,1.8vh,18px) 0", borderTop: "1px solid rgba(237,229,204,.09)",
                textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.querySelector(".lab").style.color = "var(--c-accent)")}
                onMouseLeave={(e) => (e.currentTarget.querySelector(".lab").style.color = "#EDE5CC")}>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "12px", letterSpacing: "0.12em",
                  color: "rgba(237,229,204,.4)", minWidth: "2.2em" }}>{it.n}</span>
                <span className="lab" style={{ fontFamily: '"Archivo", sans-serif', fontWeight: 500,
                  fontSize: "clamp(30px,4.4vw,46px)", lineHeight: 1.02, letterSpacing: "-0.02em",
                  color: "#EDE5CC", transition: "color var(--t-base) var(--ease-in-out)" }}>{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onGetStarted} style={{ marginTop: "32px", display: "inline-flex",
          alignItems: "center", gap: "10px", background: "var(--c-ink)", color: "#0A0807",
          borderRadius: "var(--r-md)", padding: "0 26px", height: "48px", fontFamily: "var(--ff-mono)",
          fontWeight: 500, fontSize: "15px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Get Started
        </button>
      </div>
    </div>
  );
}

/* — Get-started contact drawer (paper) — */
function GetStartedDrawer({ open, onClose }) {
  const [sent, setSent] = useStateH(false);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: "var(--z-overlay)",
      background: "rgba(10,8,7,.6)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
      transition: "opacity var(--t-slow) var(--ease-out-cine)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0,
        bottom: 0, width: "min(540px, 94vw)", background: "var(--c-paper)", color: "var(--c-paper-ink)",
        padding: "clamp(28px,4vw,48px)", transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform var(--t-slow) var(--ease-out-cine)", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--ff-mono)", fontSize: "12px", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(26,22,18,.5)" }}>Get started</span>
          <button onClick={onClose} aria-label="Close" style={{ width: "36px", height: "36px",
            borderRadius: "50%", border: "1px solid rgba(26,22,18,.25)", color: "var(--c-paper-ink)" }}>×</button>
        </div>
        <h2 style={{ margin: "20px 0 8px", fontFamily: '"Archivo", sans-serif', fontWeight: 600,
          fontSize: "clamp(30px,3.6vw,44px)", lineHeight: 1.05, letterSpacing: "-0.025em", maxWidth: "14ch" }}>
          Build on sovereign infrastructure.
        </h2>
        <p style={{ margin: "0 0 24px", color: "var(--c-paper-ink-sub)", maxWidth: "34ch" }}>
          Tell us what you're building. We'll map the fastest route to a compliant, owned AI system.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {["Name", "Work email", "What are you building?"].map((l) => (
            <label key={l} style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "11px", letterSpacing: "0.16em",
                textTransform: "uppercase", color: "rgba(26,22,18,.55)" }}>{l}</span>
              <input style={{ border: 0, borderBottom: "1px solid rgba(26,22,18,.24)", background: "none",
                padding: "8px 2px", fontFamily: '"Archivo", sans-serif', fontSize: "17px",
                color: "var(--c-paper-ink)", outline: "none" }} />
            </label>
          ))}
          <button type="submit" style={{ marginTop: "8px", display: "inline-flex", alignItems: "center",
            justifyContent: "center", gap: "10px", background: "var(--c-paper-ink)", color: "#F4EFE3",
            borderRadius: "var(--r-md)", height: "52px", fontFamily: "var(--ff-mono)", fontWeight: 500,
            fontSize: "15px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {sent ? "Thank you — we'll be in touch" : "Book a discovery call"}
          </button>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { Header, IndexMenu, GetStartedDrawer, Wordmark });
