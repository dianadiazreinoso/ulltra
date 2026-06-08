/* =============================================================================
   Ulltra · Footer CTA — "The Creation of Adam"
   -----------------------------------------------------------------------------
   Play-once cinematic footer (Framer Motion + useInView). Two-zone card:
     TOP zone    — the arms animation (human from left, robot from right)
     BOTTOM zone — the closing headline + description + CTA (stacked, centred)

   Continuous cinematic timeline (~4s total) — phases OVERLAP so motion never
   stops between beats:
     0      P1  card scales/fades in           (0.4s easeOut)
     300    P2  intro headline rises in         (0.5s easeOut, holds ~1.3s)
     1800   P3  headline begins fading out       (0.45s)
     2000   P4  arms launch while headline is still fading — spring settle
     3100   P5  glow ignites as the arms settle
     3200   P6  description + CTA stagger in immediately (no pause)
   Arms use a spring (stiffness 120 / damping 18): confident launch, gentle settle.
   ========================================================================== */

const fcR = React;
const FCFM = window.Motion || window.framerMotion || {};
const fcMotion = FCFM.motion;
const fcUseInView = FCFM.useInView;
const fcUseReduced = FCFM.useReducedMotion;
const fcUseScroll = FCFM.useScroll;
const fcUseTransform = FCFM.useTransform;

const FC_EASE = [0.62, 0, 0.2, 1];      // cinematic easeInOut
const FC_EASE_OUT = [0.22, 0.61, 0.36, 1];

function FooterCTA() {
  const ref = fcR.useRef(null);
  const reduced = fcUseReduced ? fcUseReduced() : false;
  const [phase, setPhase] = fcR.useState(0);
  const [scrollSeen, setScrollSeen] = fcR.useState(false);

  // Trigger the moment the CARD enters the viewport — not the tall 100vh section.
  // The card is pinned to the bottom of the section, so watching the section top
  // (or a negative inView margin) would either fire far too early or far too late
  // and the sequence would feel detached from the scroll. Firing when the card's
  // upper edge crosses into the lower ~85% of the viewport makes the headline
  // appear right as the footer comes into view — a small scroll, instant response.
  fcR.useEffect(() => {
    if (scrollSeen) return;
    const check = () => {
      const el = ref.current; if (!el) return;
      const card = el.querySelector(".fc-card") || el;
      const r = card.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.top < vh * 0.92 && r.bottom > vh * 0.08) setScrollSeen(true);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [scrollSeen]);

  const started = scrollSeen;

  fcR.useEffect(() => {
    if (!started) return;
    if (reduced) { setPhase(6); return; }
    const ts = [];
    // No idle/empty beat: the headline rises in together with the card, so the
    // instant the card is visible the animation already reads as started.
    setPhase(2);
    ts.push(setTimeout(() => setPhase(3), 1100));
    ts.push(setTimeout(() => setPhase(4), 1300));
    ts.push(setTimeout(() => setPhase(5), 2400));
    ts.push(setTimeout(() => setPhase(6), 2500));
    return () => ts.forEach(clearTimeout);
  }, [started, reduced]);

  const dur = (t) => (reduced ? 0 : t);
  const M = fcMotion;

  // Subtle scroll parallax — gives the card depth as the footer travels through
  // the viewport. Transform-only (GPU); fully neutralised under reduced-motion.
  const { scrollYProgress } = fcUseScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY  = fcUseTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);   // background drifts (slow)
  const armY = fcUseTransform(scrollYProgress, [0, 1], ["3.5%", "-3.5%"]); // arms counter-drift (faster → depth)
  const parallax = reduced ? {} : { bg: { y: bgY }, arm: { y: armY } };

  return (
    <section className="fc" id="footer" ref={ref} data-header="light" data-screen-label="Footer">
      <M.div
        className="fc-card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: dur(0.4), ease: FC_EASE_OUT }}>

        <M.div className="fc-bg" aria-hidden="true" style={parallax.bg}></M.div>
        <div className="fc-vignette" aria-hidden="true"></div>

        {/* Intro headline — phase 2 only, centred over the whole card, fully
            fades out before the arms enter. */}
        <M.div
          className="fc-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={
            phase === 2 ? { opacity: 1, y: 0 }
              : phase < 2 ? { opacity: 0, y: 20 }
              : { opacity: 0, y: -16 }}
          transition={{ duration: dur(0.5), ease: FC_EASE_OUT }}>
          <h2 className="fc-headline">
            <span className="fc-h-a">Do not worry</span>
            <span className="fc-h-b">we are still early</span>
          </h2>
        </M.div>

        {/* TOP ZONE — arms animation */}
        <M.div className="fc-top" style={parallax.arm}>
          <M.img
            className="fc-arm fc-arm--human"
            src={window.__asset("assets/arm-human.png")}
            alt="" aria-hidden="true" draggable="false"
            initial={{ x: -520, opacity: 0 }}
            animate={phase >= 4 ? { x: 0, opacity: 1 } : { x: -520, opacity: 0 }}
            transition={ reduced ? { duration: 0 } : { x: { type: "spring", stiffness: 120, damping: 18 }, opacity: { duration: 0.45, ease: FC_EASE_OUT } } } />

          <M.img
            className="fc-arm fc-arm--robot"
            src={window.__asset("assets/arm-robot.png")}
            alt="" aria-hidden="true" draggable="false"
            initial={{ x: 520, opacity: 0 }}
            animate={phase >= 4 ? { x: 0, opacity: 1 } : { x: 520, opacity: 0 }}
            transition={ reduced ? { duration: 0 } : { x: { type: "spring", stiffness: 120, damping: 18 }, opacity: { duration: 0.45, ease: FC_EASE_OUT } } } />

          <div className={"fc-glow" + (phase >= 5 ? " is-on" : "")} aria-hidden="true"></div>
        </M.div>

        {/* Scrim grounds the bottom zone so content never fights the arms. */}
        <div className="fc-scrim" aria-hidden="true"></div>

        {/* BOTTOM ZONE — closing description + CTA only (the headline lives in
            the intro and is gone by the time the arms meet). */}
        <div className="fc-bottom">
          <M.p
            className="fc-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: dur(0.6), ease: FC_EASE_OUT }}>
            We reply in person, within 48 hours.<br />
            Engagements begin at six weeks.
          </M.p>

          <M.button
            type="button"
            className="fc-btn"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: dur(0.6), delay: dur(0.1), ease: FC_EASE_OUT }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}>
            Get Started
          </M.button>
        </div>
      </M.div>
    </section>);
}

Object.assign(window, { FooterCTA });
