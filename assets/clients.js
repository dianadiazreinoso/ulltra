/* =============================================================================
   Ulltra · Clients — "Selected work" (scroll-driven exhibition)
   -----------------------------------------------------------------------------
   A theatre stage: the classical ruins background is pinned (sticky) and never
   moves. Project cards are independent actors that travel UP through the stage
   as the user scrolls, each at its own parallax speed, entering progressively.

     Architecture
     ────────────
     · .clients          — a 620vh-tall scroll canvas (drives the whole sequence)
     · .clients-stage     — position:sticky, 100vh, overflow:hidden (the stage)
         ├─ .clients-bg   — FIXED background layer, stationary, always fills view
         └─ .cl-canvas    — the floating CARD layer (completely separate)

     Motion (GSAP ScrollTrigger, scrub — no autoplay, transform/opacity only)
     ────────────────────────────────────────────────────────────────────────
     Each card gets TWO independent ScrollTriggers:
       1. PARALLAX  — outer .cl-slot drifts y from below the stage up and out the
                      top across the full pinned scroll. Speed differs per card
                      (0.6×–1.4×) → depth + spatial hierarchy.
       2. ENTRANCE  — inner .cl-slot-anim reveals over a staggered sub-window:
                      opacity 0→1, translateY 150→0, scale .92→1.
     The two layers never fight (different elements). Cards enter one after the
     other, sweep through, overlap naturally, then slide off the top (clipped).
   ========================================================================== */

const { useRef: clUseRef, useEffect: clUseEffect } = React;

/* Reveal order matches the curated sequence:
   1 project · 2 project · art · 3 project · 4 project · art · 5 project
   Positions are CENTRES, as % of the stage. `speed` is the parallax multiplier. */
const CL_ITEMS = [
  { kind: "project", tone: "lime",
    name: "DataLab", type: "Platform", year: "2024",
    desc: "Internal data platform unifying ingestion, governance and AI model operations for a retail group.",
    left: "27%", top: "50%", speed: 0.8 },

  { kind: "project", tone: "dark",
    name: "Securitas Hub", type: "System", year: "2024",
    desc: "Operational control surface integrating live telemetry, incident flow and field coordination.",
    left: "70%", top: "46%", speed: 1.0 },

  { kind: "art", src: "assets/cap-cyber.webp",
    alt: "A classical painted figure wearing a sleek cyber visor",
    left: "46%", top: "53%", speed: 0.6 },

  { kind: "project", tone: "magenta",
    name: "Lista Robinson", type: "System", year: "2023",
    desc: "National opt-out registry modernisation — identity, compliance and high-availability operations.",
    left: "30%", top: "54%", speed: 1.25 },

  { kind: "project", tone: "lime",
    name: "Solairis", type: "AI · Data", year: "2025",
    desc: "Energy-sector analytics product with forecasting models and a governed data layer for operators.",
    left: "69%", top: "50%", speed: 0.9 },

  { kind: "art", src: "assets/work-portrait.webp",
    alt: "A classical painted portrait of a woman with an electric scooter",
    left: "51%", top: "47%", speed: 0.6 },

  { kind: "project", tone: "magenta",
    name: "Heva", type: "Data · Regulated", year: "2025",
    desc: "Healthcare data environment enabling regulated research on sovereign, auditable infrastructure.",
    left: "41%", top: "52%", speed: 1.4 }
];

function ClPlus() {
  return (
    <span className="cl-plus" aria-hidden="true">
      <span></span><span></span>
    </span>);
}

function ClCard({ item }) {
  if (item.kind === "art") {
    return (
      <div className="cl-card cl-card--art" aria-hidden="true">
        <img src={window.__asset(item.src)} alt={item.alt} draggable="false" />
      </div>);
  }
  return (
    <article className={`cl-card cl-card--${item.tone}`} role="listitem">
      <div className="cl-card-top">
        <div className="cl-card-id">
          <h3 className="cl-card-name">{item.name}</h3>
          <p className="cl-card-type">{item.type}</p>
        </div>
        <ClPlus />
      </div>
      <p className="cl-card-desc">{item.desc}</p>
      <span className="cl-card-year" aria-hidden="true">{item.year}</span>
    </article>);
}

function ClientsSection() {
  const sectionRef = clUseRef(null);
  const slotRefs = clUseRef(CL_ITEMS.map(() => React.createRef()));
  const animRefs = clUseRef(CL_ITEMS.map(() => React.createRef()));
  // Mobile tap-to-front: the tapped project card is raised above the others via
  // the .is-active class (mobile-only CSS) — same size/position, just on top.
  // Tapping it again clears it. Desktop keeps its :hover behaviour untouched.
  const [activeIndex, setActiveIndex] = React.useState(null);

  clUseEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const slots = slotRefs.current.map((r) => r.current);
    const anims = animRefs.current.map((r) => r.current);

    const ctx = gsap.context(() => {
      const N = CL_ITEMS.length;

      // Hide all cards up-front so nothing flashes before the scrub initialises.
      gsap.set(anims, { autoAlpha: 0, y: 150, scale: 0.92 });

      // ── ONE CONTINUOUS MASTER TIMELINE (scrub) ─────────────────────────────
      // The entire section is driven by a single scrubbed timeline. Cards enter
      // on staggered beats but each LIVES a long time, so 2–4 coexist on stage,
      // overlapping, each drifting upward at its OWN speed (parallax). Nothing
      // has its own trigger → motion is continuous, never segmented.
      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      // Opening: cards arrive over a continuous scrubbed timeline. The section
      // title is a PERSISTENT heading — it is never added to this timeline, so
      // its opacity / position / scale stay fixed while the cards animate below.

      const ENTER_GAP = 11;   // timeline units between card entrances
      const LIFE = 42;        // how long each card stays on stage → big overlap
      const FADE = 11;        // fade-in / fade-out portion of a card's life
      const FIRST = 2;        // la primera card entra casi enseguida

      slots.forEach((slot, i) => {
        const item = CL_ITEMS[i];
        const anim = anims[i];
        if (!slot || !anim) return;

        // Centre the card on its (left,top) anchor. GSAP owns the transform.
        gsap.set(slot, { xPercent: -50, yPercent: -50 });

        const at = FIRST + i * ENTER_GAP;            // entrance beat on the timeline

        // PARALLAX (outer slot): continuous upward drift across the card's whole
        // life. Faster `speed` → longer travel in the same time → reads as nearer
        // and moving faster. Artwork cards (0.6×) glide slowly behind the work.
        const enterY = window.innerHeight * 0.62 * item.speed;
        const exitY  = -window.innerHeight * 0.62 * item.speed;
        master.fromTo(slot,
          { y: enterY },
          { y: exitY, duration: LIFE }, at);

        // REVEAL (inner anim): fade + scale in as it rises into view…
        master.fromTo(anim,
          { autoAlpha: 0, scale: 0.92 },
          { autoAlpha: 1, scale: 1, duration: FADE, ease: "power2.out" }, at);
        // …and fade + shrink out as it leaves the top, so later cards take over.
        master.to(anim,
          { autoAlpha: 0, scale: 0.95, duration: FADE, ease: "power2.in" },
          at + LIFE - FADE);
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <React.Fragment>
    <section
      ref={sectionRef}
      id="work"
      className="clients"
      data-header="light"
      data-screen-label="Selected work"
      aria-label="Clients — selected work">

      <div className="clients-stage">
        <div className="clients-bg" aria-hidden="true">
          <img src={window.__asset("assets/clients-bg.webp")} alt="" draggable="false" />
        </div>
        <div className="clients-bg-veil" aria-hidden="true"></div>

        <h2 className="cl-title">
          <span className="cl-title-a">Selected</span>
          <span className="cl-title-b">work</span>
        </h2>

        <div className="cl-canvas" role="list">
          {CL_ITEMS.map((item, i) => (
            <div
              key={i}
              ref={slotRefs.current[i]}
              className={"cl-slot" + (activeIndex === i ? " is-active" : "")}
              onClick={item.kind === "art" ? undefined : () => {
                if (window.matchMedia && window.matchMedia("(max-width:760px)").matches) setActiveIndex(activeIndex === i ? null : i);
              }}
              style={{ left: item.left, top: item.top, zIndex: i + 1 }}>
              <div ref={animRefs.current[i]} className="cl-slot-anim">
                <ClCard item={item} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </React.Fragment>);
}

Object.assign(window, { ClientsSection });
