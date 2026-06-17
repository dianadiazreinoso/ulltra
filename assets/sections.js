/*GLUE_IIFE*/(function(){
/* =============================================================================
   SVRN · Sections — Transition + Approach
   -----------------------------------------------------------------------------
   All motion is scroll-progress driven (no IntersectionObserver), which gives:
     · deterministic timing tied to viewport position
     · cinematic scroll-linked choreography
     · works regardless of host environment IO support
   Builds on the cinematic vocabulary established in the hero (EASE_CINE,
   layered z-index, atmospheric depth).
   ========================================================================== */

const SX_FM = window.Motion || window.framerMotion || window["framer-motion"] || {};
const {
  motion,
  useScroll,
  useTransform
} = SX_FM;
const SX_EASE_CINE = [0.19, 1, 0.22, 1];

/* ─── revealRange — map a [progress 0..1] window to [from..to] cleanly.
   Used to choreograph stagger across siblings inside one scroll range. */
const revealRange = (mv, start, end, from, to) => useTransform(mv, [start, end], [from, to], {
  clamp: true
});

/* =============================================================================
   Transition Section — narrative pacing beat between dark hero & cream stage.
   ========================================================================== */
function TransitionSection() {
  const ref = React.useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Reveal window: 0.15..0.45 of section scroll range
  const eyebrowOpacity = revealRange(scrollYProgress, 0.15, 0.42, 0, 1);
  const eyebrowY = revealRange(scrollYProgress, 0.15, 0.42, 24, 0);
  const letterOpacity = revealRange(scrollYProgress, 0.20, 0.52, 0, 1);
  const letterY = revealRange(scrollYProgress, 0.20, 0.52, 36, 0);

  // Gentle upward drift across whole section for editorial pacing
  const driftY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const paragraph = "VRN designs, builds and operates AI systems that automate business processes. We do it on sovereign infrastructure — owned, governed in Europe, independent of external vendors. Old wisdom, new instruments.";
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    className: "trans",
    "data-screen-label": "Transition"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "trans-inner container",
    style: {
      y: driftY
    }
  }, /*#__PURE__*/React.createElement(motion.span, {
    className: "trans-eyebrow",
    style: {
      opacity: eyebrowOpacity,
      y: eyebrowY
    }
  }, "\u2014 A Letter from the editor"), /*#__PURE__*/React.createElement(motion.p, {
    className: "trans-letter",
    style: {
      opacity: letterOpacity,
      y: letterY
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "trans-dropcap"
  }, "S"), paragraph)));
}

/* =============================================================================
   Approach Section — wordmark + 3 editorial cards over atmospheric image.
   ========================================================================== */
function ApproachSection() {
  const ref = React.useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // BACKGROUND IMAGE — slow parallax + breathing scale
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.10, 1.04, 1.00]);

  // TITLE — long cinematic reveal: opacity in (0.15..0.45), then drifts up
  // across the whole section so it feels like the camera is moving past it.
  const titleOpacity = revealRange(scrollYProgress, 0.12, 0.40, 0, 1);
  const titleY = useTransform(scrollYProgress, [0.10, 0.60, 1], [80, 0, -60]);
  const titleLetter = useTransform(scrollYProgress, [0.10, 0.45], ["-0.02em", "-0.05em"]);

  // CARDS — staggered scroll-driven entrance.  Each card has its own
  // 0..1 reveal sliced from the parent progress.  Stagger ≈ 0.05 of the
  // section scroll range per card.
  const c1Op = revealRange(scrollYProgress, 0.35, 0.60, 0, 1);
  const c1Y = revealRange(scrollYProgress, 0.35, 0.60, 80, 0);
  const c2Op = revealRange(scrollYProgress, 0.40, 0.65, 0, 1);
  const c2Y = revealRange(scrollYProgress, 0.40, 0.65, 80, 0);
  const c3Op = revealRange(scrollYProgress, 0.45, 0.70, 0, 1);
  const c3Y = revealRange(scrollYProgress, 0.45, 0.70, 80, 0);
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    className: "approach",
    "data-screen-label": "Approach"
  }, /*#__PURE__*/React.createElement("div", {
    className: "approach-bg-wrap"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "approach-bg",
    style: {
      y: bgY,
      scale: bgScale
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "approach-bg-vignette"
  })), /*#__PURE__*/React.createElement(motion.h2, {
    className: "approach-title",
    style: {
      opacity: titleOpacity,
      y: titleY,
      letterSpacing: titleLetter
    }
  }, "Approach"), /*#__PURE__*/React.createElement("div", {
    className: "approach-cards container"
  }, /*#__PURE__*/React.createElement(ApproachCard, {
    n: "A \xB7 01",
    title: "Diagnose & map",
    desc: "Audit current systems, find friction, mark sovereign boundaries.",
    bgSrc: "assets/card-1-bg.webp",
    assetSrc: "assets/card-1-asset.png",
    variant: "cream",
    opacity: c1Op,
    y: c1Y
  }), /*#__PURE__*/React.createElement(ApproachCard, {
    n: "A \xB7 02",
    title: "Compose, don't assemble",
    desc: "Custom systems, not stitched-together SaaS.\nOwned end-to-end.",
    bgSrc: "assets/card-2-bg.webp",
    assetSrc: "assets/card-2-asset.png",
    variant: "teal",
    opacity: c2Op,
    y: c2Y
  }), /*#__PURE__*/React.createElement(ApproachCard, {
    n: "A \xB7 03",
    title: "Operate, ship, hold",
    desc: "We don't hand it back at launch.\nWe run the system through its life.",
    bgSrc: "assets/card-3-bg.webp",
    assetSrc: null,
    variant: "rouge",
    opacity: c3Op,
    y: c3Y
  })));
}

/* ─── Editorial card — premium glass floating panel.
   Receives its reveal opacity/y as MotionValues from the parent so the
   stagger choreography lives in one place. Hover handled locally. */
function ApproachCard({
  n,
  title,
  desc,
  bgSrc,
  assetSrc,
  variant,
  opacity,
  y
}) {
  const cardRef = React.useRef(null);
  const [hovered, setHovered] = React.useState(false);

  // Pointer-driven micro-parallax — extremely subtle
  const onPointerMove = e => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--px", px.toFixed(3));
    card.style.setProperty("--py", py.toFixed(3));
  };
  const onPointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--px", "0");
    card.style.setProperty("--py", "0");
    setHovered(false);
  };
  return /*#__PURE__*/React.createElement(motion.article, {
    ref: cardRef,
    className: `acard acard--${variant}`,
    onPointerMove: onPointerMove,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: onPointerLeave,
    style: {
      opacity,
      y
    },
    whileHover: {
      y: -10,
      transition: {
        duration: 0.7,
        ease: SX_EASE_CINE
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "acard-media"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "acard-bg",
    style: {
      backgroundImage: `url("${bgSrc}")`
    },
    animate: {
      scale: hovered ? 1.04 : 1.0
    },
    transition: {
      duration: 1.4,
      ease: SX_EASE_CINE
    }
  }), assetSrc && /*#__PURE__*/React.createElement(motion.img, {
    className: "acard-asset",
    src: assetSrc,
    alt: "",
    draggable: false,
    animate: {
      y: hovered ? -8 : 0
    },
    transition: {
      duration: 1.0,
      ease: SX_EASE_CINE
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "acard-floor"
  })), /*#__PURE__*/React.createElement("div", {
    className: "acard-body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "acard-n"
  }, n), /*#__PURE__*/React.createElement("h3", {
    className: "acard-t"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "acard-d"
  }, desc.split("\n").map((line, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "acard-d-line"
  }, line)))));
}

/* ─── Expose to global scope for app.jsx ──────────────────────────────────── */
Object.assign(window, {
  TransitionSection,
  ApproachSection
});
})();
