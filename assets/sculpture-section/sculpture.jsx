/* =============================================================================
   ARCHETYPE · sculpture.jsx  (SHELL — runs in the main site's React tree)
   -----------------------------------------------------------------------------
   This is the lightweight UMD-React shell: the scroll runway, the sticky black
   stage, the editorial overlays (glow, backdrop word, HUD, rotation readout,
   caption) and an empty `.sc-gl` host. The actual 3D sculpture is a separate
   React-Three-Fiber ESM island (sculpture-gl.module.js) that mounts into that
   host — kept isolated so Three.js / R3F never collide with the site's runtime.

   The bridge is one global: GSAP ScrollTrigger here writes
   window.__archetype.rotTarget (radians); the GL island reads it every frame.
   ========================================================================== */

const { useEffect, useRef } = React;
const FM = window.Motion || window.framerMotion || {};
const { motion, useMotionValue, useSpring, useTransform, useMotionValueEvent, useReducedMotion } = FM;

window.__archetype = window.__archetype || { rotTarget: 0, angleDeg: 0, ready: false };

const TURNS    = 1;      // one full revolution across the scroll
const ROT_END  = 0.55;   // progress at which the turn completes & it settles frontal
const ACT2_IN  = 0.55;   // (legacy) — kept so refs don't break; no shrink phase now
const ACT2_OUT = 0.72;   // single clean curtain-lift exit (no lingering shrink card)
const TEXT_FROM = 0.66;  // caption reveal window
const TEXT_TO   = 1.0;

const VIEW_NAMES = [
  "FRONTAL", "TRES CUARTOS", "PERFIL", "TRES CUARTOS POST.",
  "POSTERIOR", "TRES CUARTOS POST.", "PERFIL", "TRES CUARTOS",
];
const viewNameForAngle = (deg) => VIEW_NAMES[(Math.round(deg / 45) % 8 + 8) % 8];

function ArchetypeSection() {
  const reduced = useReducedMotion?.() || false;
  const sectionRef = useRef(null);

  // Cursor → springs for the editorial overlay layers (depth parallax). The
  // model's own cursor tilt lives in the GL island, independent of scroll.
  const mvX = useMotionValue(0), mvY = useMotionValue(0);
  const spring = { stiffness: 70, damping: 18, mass: 0.6 };
  const sx = useSpring(mvX, spring), sy = useSpring(mvY, spring);
  const glowX = useTransform(sx, [-1, 1], [-36, 36]);
  const glowY = useTransform(sy, [-1, 1], [-24, 24]);
  const backX = useTransform(sx, [-1, 1], [26, -26]);

  // Title reveal (left block). Fades in early and stays through the section.
  const textMV = useMotionValue(0);
  const headStyle = { opacity: useTransform(textMV, [0.0, 0.55], [0, 1]), y: useTransform(textMV, [0.0, 0.55], [26, 0]),
                      filter: useTransform(textMV, [0.0, 0.55], ["blur(12px)", "blur(0px)"]) };
  const subStyle  = { opacity: useTransform(textMV, [0.3, 1.0], [0, 1]),  y: useTransform(textMV, [0.3, 1.0], [22, 0]) };

  // Pointer → overlay parallax springs
  useEffect(() => {
    if (reduced) return;
    const onMove = (e) => { mvX.set((e.clientX / innerWidth) * 2 - 1); mvY.set((e.clientY / innerHeight) * 2 - 1); };
    const onLeave = () => { mvX.set(0); mvY.set(0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerleave", onLeave); };
  }, [reduced]);

  // ScrollTrigger → rotation target + caption + hint
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const rot = Math.min(p / ROT_END, 1);
        window.__archetype.rotTarget = rot * Math.PI * 2 * TURNS;
        // frameloop="demand": ask the GL island to render this scroll frame.
        if (window.__archetype.invalidate) window.__archetype.invalidate();
        textMV.set(Math.max(0, Math.min(p / 0.32, 1)));   // title in early, then holds
      },
    });

    // ── ACT II — same shrink+exit transition as the Reveal section ──────────
    // Once the bust has finished its 360° (ROT_END) and rests frontal, the WHOLE
    // stage shrinks into a rounded, dimmed floating card on the dark backdrop,
    // then lifts entirely out of frame and fades — a sequential handoff into the
    // Tech & AI Stack section below (mirrors RevealSection's ACT II exactly).
    const stage = sectionRef.current.querySelector(".sc-stage");
    let shrinkTl;
    if (stage) {
      gsap.set(stage, { transformOrigin: "50% 50%", willChange: "transform" });
      shrinkTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      // EXIT — a single clean CURTAIN-LIFT: the whole stage slides up and fades
      // in one continuous beat (no lingering shrink-card), so Archetype fully
      // releases and the Tech & AI Stack hero takes the viewport. Sequential
      // handoff — the two sections never sit on screen together for long.
      shrinkTl.to(stage, { yPercent: -114, autoAlpha: 0, ease: "power2.inOut", duration: 0.20 }, ACT2_OUT);
    }

    ScrollTrigger.refresh();
    return () => { st.kill(); if (shrinkTl) { shrinkTl.scrollTrigger && shrinkTl.scrollTrigger.kill(); shrinkTl.kill(); } };
  }, []);

  return (
    <section className="sc-root" ref={sectionRef} data-header="dark" data-screen-label="Archetype">
      <div className="sc-stage">

        <motion.div className="sc-glow" style={{ x: glowX, y: glowY }} />

        {/* React-Three-Fiber island mounts here */}
        <div className="sc-gl" />

        <div className="sc-vignette" />
        <div className="sc-grain" />

        {/* Left title — the only copy in this section */}
        <div className="sc-caption">
          <motion.h2 className="sc-cap-head" style={headStyle}>
            Sabiduría<br />clásica
          </motion.h2>
          <motion.p className="sc-cap-sub" style={subStyle}>
            <em>instrumentos<br />nuevos</em>
          </motion.p>
        </div>

      </div>
    </section>
  );
}

window.ArchetypeSection = ArchetypeSection;
const __mount = document.getElementById("sculpture-root");
if (__mount) ReactDOM.createRoot(__mount).render(<ArchetypeSection />);
