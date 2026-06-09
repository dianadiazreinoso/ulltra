(function(){
const {
  useEffect,
  useRef
} = React;
const FM = window.Motion || window.framerMotion || {};
const {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion
} = FM;
window.__archetype = window.__archetype || {
  rotTarget: 0,
  angleDeg: 0,
  ready: false
};
const TURNS = 1;
const ROT_END = 0.55;
const ACT2_IN = 0.55;
const ACT2_OUT = 0.72;
const TEXT_FROM = 0.66;
const TEXT_TO = 1.0;
const VIEW_NAMES = ["FRONTAL", "TRES CUARTOS", "PERFIL", "TRES CUARTOS POST.", "POSTERIOR", "TRES CUARTOS POST.", "PERFIL", "TRES CUARTOS"];
const viewNameForAngle = deg => VIEW_NAMES[(Math.round(deg / 45) % 8 + 8) % 8];
function ArchetypeSection() {
  const reduced = useReducedMotion?.() || false;
  const sectionRef = useRef(null);
  const mvX = useMotionValue(0),
    mvY = useMotionValue(0);
  const spring = {
    stiffness: 70,
    damping: 18,
    mass: 0.6
  };
  const sx = useSpring(mvX, spring),
    sy = useSpring(mvY, spring);
  const glowX = useTransform(sx, [-1, 1], [-36, 36]);
  const glowY = useTransform(sy, [-1, 1], [-24, 24]);
  const backX = useTransform(sx, [-1, 1], [26, -26]);
  const textMV = useMotionValue(0);
  const headStyle = {
    opacity: useTransform(textMV, [0.0, 0.55], [0, 1]),
    y: useTransform(textMV, [0.0, 0.55], [26, 0]),
    filter: useTransform(textMV, [0.0, 0.55], ["blur(12px)", "blur(0px)"])
  };
  const subStyle = {
    opacity: useTransform(textMV, [0.3, 1.0], [0, 1]),
    y: useTransform(textMV, [0.3, 1.0], [22, 0])
  };
  useEffect(() => {
    if (reduced) return;
    const onMove = e => {
      mvX.set(e.clientX / innerWidth * 2 - 1);
      mvY.set(e.clientY / innerHeight * 2 - 1);
    };
    const onLeave = () => {
      mvX.set(0);
      mvY.set(0);
    };
    window.addEventListener("pointermove", onMove, {
      passive: true
    });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const {
      gsap,
      ScrollTrigger
    } = window;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: self => {
        const p = self.progress;
        const rot = Math.min(p / ROT_END, 1);
        window.__archetype.rotTarget = rot * Math.PI * 2 * TURNS;
        if (window.__archetype.invalidate) window.__archetype.invalidate();
        textMV.set(Math.max(0, Math.min(p / 0.32, 1)));
      }
    });
    const stage = sectionRef.current.querySelector(".sc-stage");
    let shrinkTl;
    if (stage) {
      gsap.set(stage, {
        transformOrigin: "50% 50%",
        willChange: "transform"
      });
      shrinkTl = gsap.timeline({
        defaults: {
          ease: "none"
        },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      shrinkTl.to(stage, {
        yPercent: -114,
        autoAlpha: 0,
        ease: "power2.inOut",
        duration: 0.20
      }, ACT2_OUT);
    }
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      if (shrinkTl) {
        shrinkTl.scrollTrigger && shrinkTl.scrollTrigger.kill();
        shrinkTl.kill();
      }
    };
  }, []);
  return React.createElement("section", {
    className: "sc-root",
    ref: sectionRef,
    "data-header": "dark",
    "data-screen-label": "Archetype"
  }, React.createElement("div", {
    className: "sc-stage"
  }, React.createElement(motion.div, {
    className: "sc-glow",
    style: {
      x: glowX,
      y: glowY
    }
  }), React.createElement("div", {
    className: "sc-gl"
  }), React.createElement("div", {
    className: "sc-vignette"
  }), React.createElement("div", {
    className: "sc-grain"
  }), React.createElement("div", {
    className: "sc-caption"
  }, React.createElement(motion.h2, {
    className: "sc-cap-head",
    style: headStyle
  }, "Sabidur\xEDa", React.createElement("br", null), "cl\xE1sica"), React.createElement(motion.p, {
    className: "sc-cap-sub",
    style: subStyle
  }, React.createElement("em", null, "instrumentos", React.createElement("br", null), "nuevos")))));
}
window.ArchetypeSection = ArchetypeSection;
const __mount = document.getElementById("sculpture-root");
if (__mount) ReactDOM.createRoot(__mount).render(React.createElement(ArchetypeSection, null));
})();
