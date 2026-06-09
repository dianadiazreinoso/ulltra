const SX_FM = window.Motion || window.framerMotion || window["framer-motion"] || {};
const {
  motion,
  useScroll,
  useTransform
} = SX_FM;
const SX_EASE_CINE = [0.19, 1, 0.22, 1];
const revealRange = (mv, start, end, from, to) => useTransform(mv, [start, end], [from, to], {
  clamp: true
});
function TransitionSection() {
  const ref = React.useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const eyebrowOpacity = revealRange(scrollYProgress, 0.15, 0.42, 0, 1);
  const eyebrowY = revealRange(scrollYProgress, 0.15, 0.42, 24, 0);
  const letterOpacity = revealRange(scrollYProgress, 0.20, 0.52, 0, 1);
  const letterY = revealRange(scrollYProgress, 0.20, 0.52, 36, 0);
  const driftY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const paragraph = "VRN designs, builds and operates AI systems that automate business processes. We do it on sovereign infrastructure — owned, governed in Europe, independent of external vendors. Old wisdom, new instruments.";
  return React.createElement("section", {
    ref: ref,
    className: "trans",
    "data-screen-label": "Transition"
  }, React.createElement(motion.div, {
    className: "trans-inner container",
    style: {
      y: driftY
    }
  }, React.createElement(motion.span, {
    className: "trans-eyebrow",
    style: {
      opacity: eyebrowOpacity,
      y: eyebrowY
    }
  }, "\u2014 A Letter from the editor"), React.createElement(motion.p, {
    className: "trans-letter",
    style: {
      opacity: letterOpacity,
      y: letterY
    }
  }, React.createElement("span", {
    className: "trans-dropcap"
  }, "S"), paragraph)));
}
function ApproachSection() {
  const ref = React.useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.10, 1.04, 1.00]);
  const titleOpacity = revealRange(scrollYProgress, 0.12, 0.40, 0, 1);
  const titleY = useTransform(scrollYProgress, [0.10, 0.60, 1], [80, 0, -60]);
  const titleLetter = useTransform(scrollYProgress, [0.10, 0.45], ["-0.02em", "-0.05em"]);
  const c1Op = revealRange(scrollYProgress, 0.35, 0.60, 0, 1);
  const c1Y = revealRange(scrollYProgress, 0.35, 0.60, 80, 0);
  const c2Op = revealRange(scrollYProgress, 0.40, 0.65, 0, 1);
  const c2Y = revealRange(scrollYProgress, 0.40, 0.65, 80, 0);
  const c3Op = revealRange(scrollYProgress, 0.45, 0.70, 0, 1);
  const c3Y = revealRange(scrollYProgress, 0.45, 0.70, 80, 0);
  return React.createElement("section", {
    ref: ref,
    className: "approach",
    "data-screen-label": "Approach"
  }, React.createElement("div", {
    className: "approach-bg-wrap"
  }, React.createElement(motion.div, {
    className: "approach-bg",
    style: {
      y: bgY,
      scale: bgScale
    }
  }), React.createElement("div", {
    className: "approach-bg-vignette"
  })), React.createElement(motion.h2, {
    className: "approach-title",
    style: {
      opacity: titleOpacity,
      y: titleY,
      letterSpacing: titleLetter
    }
  }, "Approach"), React.createElement("div", {
    className: "approach-cards container"
  }, React.createElement(ApproachCard, {
    n: "A \xB7 01",
    title: "Diagnose & map",
    desc: "Audit current systems, find friction, mark sovereign boundaries.",
    bgSrc: "assets/card-1-bg.png",
    assetSrc: "assets/card-1-asset.png",
    variant: "cream",
    opacity: c1Op,
    y: c1Y
  }), React.createElement(ApproachCard, {
    n: "A \xB7 02",
    title: "Compose, don't assemble",
    desc: "Custom systems, not stitched-together SaaS.\nOwned end-to-end.",
    bgSrc: "assets/card-2-bg.png",
    assetSrc: "assets/card-2-asset.png",
    variant: "teal",
    opacity: c2Op,
    y: c2Y
  }), React.createElement(ApproachCard, {
    n: "A \xB7 03",
    title: "Operate, ship, hold",
    desc: "We don't hand it back at launch.\nWe run the system through its life.",
    bgSrc: "assets/card-3-bg.png",
    assetSrc: null,
    variant: "rouge",
    opacity: c3Op,
    y: c3Y
  })));
}
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
  return React.createElement(motion.article, {
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
  }, React.createElement("div", {
    className: "acard-media"
  }, React.createElement(motion.div, {
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
  }), assetSrc && React.createElement(motion.img, {
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
  }), React.createElement("div", {
    className: "acard-floor"
  })), React.createElement("div", {
    className: "acard-body"
  }, React.createElement("span", {
    className: "acard-n"
  }, n), React.createElement("h3", {
    className: "acard-t"
  }, title), React.createElement("p", {
    className: "acard-d"
  }, desc.split("\n").map((line, i) => React.createElement("span", {
    key: i,
    className: "acard-d-line"
  }, line)))));
}
Object.assign(window, {
  TransitionSection,
  ApproachSection
});