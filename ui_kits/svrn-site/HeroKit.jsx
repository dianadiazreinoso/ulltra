/* SVRN site UI kit · Hero — dark Renaissance-cyber portrait, giant Archivo
   wordmark with an editorial italic accent, two frosted InfoCards. */

function HeroInfoCard({ kicker, children, statusDot }) {
  return (
    <div style={{ flex: 1, padding: "22px 28px 24px", display: "flex", flexDirection: "column",
      gap: "16px", background: "var(--c-glass)", backdropFilter: "var(--blur-glass)",
      WebkitBackdropFilter: "var(--blur-glass)", borderRadius: "var(--r-md)",
      border: "1px solid var(--c-glass-stroke)" }}>
      <span style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--fs-micro)",
        letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--c-ink-mute)",
        fontWeight: 500 }}>{kicker}</span>
      <div style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: "14px",
        lineHeight: 1.25, color: "var(--c-ink)", display: "flex", alignItems: "center", gap: "10px",
        flexWrap: "wrap" }}>
        {statusDot && <span style={{ width: "7px", height: "7px", borderRadius: "50%",
          background: "var(--c-status)", boxShadow: "0 0 10px 1px color-mix(in oklab, var(--c-status) 50%, transparent)",
          flex: "0 0 auto" }} />}
        {children}
      </div>
    </div>
  );
}

function HeroKit({ onGetStarted }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", overflow: "hidden",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
      paddingBottom: "clamp(40px, 6vh, 72px)" }}>
      {/* backdrop */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: "var(--z-bg)" }}>
        <img src="../../assets/brand/hero-frame.webp" alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background:
          "linear-gradient(180deg, rgba(10,8,7,.55) 0%, rgba(10,8,7,.15) 30%, rgba(10,8,7,.55) 72%, rgba(10,8,7,.96) 100%), linear-gradient(90deg, rgba(10,8,7,.55) 0%, rgba(10,8,7,0) 55%)" }} />
      </div>

      {/* content */}
      <div className="container" style={{ position: "relative", zIndex: "var(--z-content)" }}>
        <p style={{ margin: "0 0 18px", fontFamily: "var(--ff-mono)", fontSize: "var(--fs-nav)",
          letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--c-ink-sub)",
          display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--c-status)",
            boxShadow: "0 0 10px 1px color-mix(in oklab, var(--c-status) 50%, transparent)" }} />
          Sovereign AI Infrastructure
        </p>

        <h1 style={{ margin: 0, fontFamily: '"Archivo", sans-serif', fontWeight: 700,
          fontSize: "clamp(56px, 7.4vw, 100px)", lineHeight: 0.97, letterSpacing: "-0.05em",
          color: "var(--c-ink)", maxWidth: "16ch" }}>
          Old wisdom,{" "}
          <span style={{ fontFamily: "var(--ff-editor)", fontStyle: "italic", fontWeight: 400,
            letterSpacing: "-0.01em" }}>new instruments.</span>
        </h1>

        <p style={{ margin: "26px 0 0", maxWidth: "44ch", fontFamily: '"Archivo", sans-serif',
          fontWeight: 300, fontSize: "clamp(18px, 1.5vw, 24px)", lineHeight: 1.4,
          color: "var(--c-ink-sub)" }}>
          European AI &amp; data engineering, built as the operating layer for sovereign systems.
        </p>

        <div style={{ display: "flex", gap: "14px", maxWidth: "720px", marginTop: "clamp(32px,5vh,48px)" }}>
          <HeroInfoCard kicker="Origin">
            European AI &amp; Data Engineering — established for sovereign systems.
          </HeroInfoCard>
          <HeroInfoCard kicker="Status" statusDot>
            Operating&nbsp;&nbsp;24&thinsp;/&thinsp;7&thinsp;/&thinsp;365
          </HeroInfoCard>
        </div>
      </div>

      {/* scroll cue */}
      <div style={{ position: "absolute", right: "clamp(16px,2vw,30px)", bottom: "clamp(26px,4vh,52px)",
        zIndex: "var(--z-content)", display: "flex", flexDirection: "column", alignItems: "center",
        gap: "10px", fontFamily: "var(--ff-mono)", fontSize: "10px", letterSpacing: "0.2em",
        textTransform: "uppercase", color: "var(--c-ink-mute)", writingMode: "vertical-rl" }}>
        Scroll
      </div>
    </section>
  );
}

Object.assign(window, { HeroKit, HeroInfoCard });
