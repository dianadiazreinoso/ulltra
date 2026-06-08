/* SVRN site UI kit · Capabilities — the light "paper" inversion: faint
   Old-Master ground, centred editorial title, three numbered CapabilityCards. */

const CAP_CARDS = [
  { n: "01", title: "AI & Innovation", items: [
    "AI maturity & opportunity mapping",
    "Applied research & rapid prototyping",
    "Model selection & evaluation",
  ]},
  { n: "02", title: "Data Architecture & Platforms", items: [
    "Lakehouse / Data Mesh",
    "Streaming & real-time pipelines",
    "Governance & lineage",
  ]},
  { n: "03", title: "AI Systems & Applications", items: [
    "ML & LLM development",
    "Agentic orchestration",
    "Production MLOps",
  ]},
];

function PaperCapabilityCard({ n, title, items }) {
  const [h, setH] = React.useState(false);
  return (
    <article onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ padding: "28px 30px 30px", color: "var(--c-paper-ink)",
        borderTop: `1px solid ${h ? "var(--c-paper-ink)" : "var(--c-paper-line)"}`,
        transform: h ? "translateY(-4px)" : "translateY(0)",
        transition: "transform var(--motion-hover), border-color var(--motion-hover)" }}>
      <span style={{ fontFamily: "var(--ff-mono)", fontSize: "var(--fs-micro)",
        letterSpacing: "var(--ls-wide)", color: "var(--c-paper-ink-sub)" }}>{n}</span>
      <h3 style={{ margin: "14px 0 20px", fontFamily: '"Archivo", sans-serif', fontWeight: 800,
        fontSize: "clamp(22px,1.7vw,27px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{title}</h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex",
        flexDirection: "column", gap: "11px" }}>
        {items.map((it, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: "11px",
            fontFamily: '"Archivo", sans-serif', fontWeight: 500, fontSize: "15px", lineHeight: 1.35 }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%",
              background: "var(--c-accent)", flex: "0 0 auto" }} />
            {it}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CapabilitiesKit() {
  return (
    <section style={{ position: "relative", background: "var(--c-paper)", color: "var(--c-paper-ink)",
      padding: "clamp(96px,12vw,176px) 0", overflow: "hidden" }}>
      {/* faint Old-Master ground */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url(../../assets/brand/cap-bg.png)", backgroundSize: "cover",
        backgroundPosition: "center", opacity: 0.5 }} />
      <div style={{ position: "relative", zIndex: 1 }} className="container">
        <div style={{ textAlign: "center", maxWidth: "1170px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 22px", fontFamily: "var(--ff-mono)", fontSize: "var(--fs-nav)",
            letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "rgba(26,22,18,.55)",
            display: "inline-flex", gap: "10px" }}>
            <span style={{ color: "rgba(26,22,18,.4)" }}>§ 02</span> Capabilities
          </p>
          <h2 style={{ margin: 0, fontFamily: '"Archivo", sans-serif', fontWeight: 800,
            fontSize: "clamp(40px,6vw,86px)", letterSpacing: "-0.045em", lineHeight: 0.98 }}>
            Discover our capabilities
          </h2>
          <p style={{ margin: "24px auto 0", maxWidth: "60ch", fontFamily: '"Archivo", sans-serif',
            fontWeight: 400, fontSize: "clamp(15px,1.15vw,18px)", lineHeight: 1.5,
            color: "var(--c-paper-ink-sub)" }}>
            A deliberately small set of disciplines, operated in depth — from opportunity mapping
            to production AI systems on infrastructure you own.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 clamp(20px,3vw,48px)",
          marginTop: "clamp(48px,6vw,84px)" }}>
          {CAP_CARDS.map((c) => <PaperCapabilityCard key={c.n} {...c} />)}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CapabilitiesKit, PaperCapabilityCard });
