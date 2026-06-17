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
const FC_EASE = [0.62, 0, 0.2, 1]; // cinematic easeInOut
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
      const el = ref.current;
      if (!el) return;
      const card = el.querySelector(".fc-card") || el;
      const r = card.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.top < vh * 0.92 && r.bottom > vh * 0.08) setScrollSeen(true);
    };
    check();
    window.addEventListener("scroll", check, {
      passive: true
    });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [scrollSeen]);
  const started = scrollSeen;
  fcR.useEffect(() => {
    if (!started) return;
    if (reduced) {
      setPhase(6);
      return;
    }
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
  const dur = t => reduced ? 0 : t;
  const M = fcMotion;

  // Subtle scroll parallax — gives the card depth as the footer travels through
  // the viewport. Transform-only (GPU); fully neutralised under reduced-motion.
  const {
    scrollYProgress
  } = fcUseScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const bgY = fcUseTransform(scrollYProgress, [0, 1], ["-7%", "7%"]); // background drifts (slow)
  const armY = fcUseTransform(scrollYProgress, [0, 1], ["3.5%", "-3.5%"]); // arms counter-drift (faster → depth)
  const parallax = reduced ? {} : {
    bg: {
      y: bgY
    },
    arm: {
      y: armY
    }
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "fc",
    id: "footer",
    ref: ref,
    "data-header": "light",
    "data-screen-label": "Footer"
  }, /*#__PURE__*/React.createElement("style", null, `
  .fc-foot{
    position:absolute; left:0; right:0; bottom:0; z-index:6;
    display:flex; align-items:center; justify-content:center;
    gap:16px;
    padding: 0 clamp(20px,4vw,60px) calc(clamp(18px,2.8vh,30px) + 50px);
  }
  .fc-addr{
    font-family:"Archivo", ui-sans-serif, system-ui, sans-serif;
    font-weight:400; font-size:clamp(15px, 1.25vw, 20px);
    letter-spacing:.01em; line-height:1.55; text-align:center;
    color:rgba(246,242,234,.82);
    text-shadow:0 2px 24px rgba(0,0,0,.55);
  }
  .fc-social{ position:absolute; top:calc(clamp(18px,2.8vh,30px) + 15px); right:clamp(20px,4vw,60px); z-index:6; display:flex; align-items:center; gap:clamp(14px,1.4vw,20px); }
  .fc-soc{
    display:inline-flex; color:rgba(246,242,234,.66);
    transition:color .25s ease, transform .25s ease;
  }
  .fc-soc:hover{ color:#D0FF00; transform:translateY(-2px); }
  .fc-addr-link{ color:inherit; text-decoration:underline; text-underline-offset:2px; transition:color .25s ease; }
  .fc-addr-link:hover{ color:#D0FF00; }
  .fc-soc svg{ width:26px; height:26px; }
  @media (max-width:680px){
    .fc-foot{ flex-direction:column; gap:12px; text-align:center; padding-bottom:18px; }
  }
`), /*#__PURE__*/React.createElement(M.div, {
    className: "fc-card",
    initial: {
      opacity: 0,
      scale: 0.96
    },
    animate: phase >= 1 ? {
      opacity: 1,
      scale: 1
    } : {
      opacity: 0,
      scale: 0.96
    },
    transition: {
      duration: dur(0.4),
      ease: FC_EASE_OUT
    }
  }, /*#__PURE__*/React.createElement(M.div, {
    className: "fc-bg",
    "aria-hidden": "true",
    style: parallax.bg
  }), /*#__PURE__*/React.createElement("div", {
    className: "fc-vignette",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(M.div, {
    className: "fc-intro",
    initial: {
      opacity: 0,
      y: 20
    },
    animate: phase === 2 ? {
      opacity: 1,
      y: 0
    } : phase < 2 ? {
      opacity: 0,
      y: 20
    } : {
      opacity: 0,
      y: -16
    },
    transition: {
      duration: dur(0.5),
      ease: FC_EASE_OUT
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "fc-headline"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fc-h-a"
  }, "Do not worry"), /*#__PURE__*/React.createElement("span", {
    className: "fc-h-b"
  }, "we are still early"))), /*#__PURE__*/React.createElement(M.div, {
    className: "fc-top",
    style: parallax.arm
  }, /*#__PURE__*/React.createElement(M.img, {
    className: "fc-arm fc-arm--human",
    src: window.__asset("assets/arm-human.webp"),
    alt: "",
    "aria-hidden": "true",
    draggable: "false",
    initial: {
      x: -520,
      opacity: 0
    },
    animate: phase >= 4 ? {
      x: 0,
      opacity: 1
    } : {
      x: -520,
      opacity: 0
    },
    transition: reduced ? {
      duration: 0
    } : {
      x: {
        type: "spring",
        stiffness: 120,
        damping: 18
      },
      opacity: {
        duration: 0.45,
        ease: FC_EASE_OUT
      }
    }
  }), /*#__PURE__*/React.createElement(M.img, {
    className: "fc-arm fc-arm--robot",
    src: window.__asset("assets/arm-robot.webp"),
    alt: "",
    "aria-hidden": "true",
    draggable: "false",
    initial: {
      x: 520,
      opacity: 0
    },
    animate: phase >= 4 ? {
      x: 0,
      opacity: 1
    } : {
      x: 520,
      opacity: 0
    },
    transition: reduced ? {
      duration: 0
    } : {
      x: {
        type: "spring",
        stiffness: 120,
        damping: 18
      },
      opacity: {
        duration: 0.45,
        ease: FC_EASE_OUT
      }
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "fc-glow" + (phase >= 5 ? " is-on" : ""),
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", {
    className: "fc-scrim",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "fc-bottom",
    style: {
      paddingBottom: "clamp(120px, 20vh, 200px)"
    }
  }, /*#__PURE__*/React.createElement(M.p, {
    className: "fc-sub",
    initial: {
      opacity: 0,
      y: 20
    },
    animate: phase >= 6 ? {
      opacity: 1,
      y: 0
    } : {
      opacity: 0,
      y: 20
    },
    transition: {
      duration: dur(0.6),
      ease: FC_EASE_OUT
    }
  }, "We reply in person, within 48 hours.", /*#__PURE__*/React.createElement("br", null), "Engagements begin at six weeks."), /*#__PURE__*/React.createElement(M.button, {
    type: "button",
    className: "fc-btn",
    initial: {
      opacity: 0,
      y: 20
    },
    animate: phase >= 6 ? {
      opacity: 1,
      y: 0
    } : {
      opacity: 0,
      y: 20
    },
    transition: {
      duration: dur(0.6),
      delay: dur(0.1),
      ease: FC_EASE_OUT
    },
    whileHover: {
      scale: 1.03
    },
    whileTap: {
      scale: 0.98
    }
  }, "Get Started")), /*#__PURE__*/React.createElement(M.div, {
    className: "fc-foot",
    initial: {
      opacity: 0
    },
    animate: phase >= 6 ? {
      opacity: 1
    } : {
      opacity: 0
    },
    transition: {
      duration: dur(0.6),
      delay: dur(0.25),
      ease: FC_EASE_OUT
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fc-addr"
  }, "Main Office: Plaza de Compostela 23, Vigo, (Spain)", /*#__PURE__*/React.createElement("br", null), "Tel: ", /*#__PURE__*/React.createElement("a", {
    href: "tel:+34886312825",
    className: "fc-addr-link"
  }, "+34 886 31 28 25"), " \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:hello@ulltra.ai",
    className: "fc-addr-link"
  }, "hello@ulltra.ai"))), /*#__PURE__*/React.createElement(M.div, {
    className: "fc-social",
    initial: {
      opacity: 0
    },
    animate: phase >= 6 ? {
      opacity: 1
    } : {
      opacity: 0
    },
    transition: {
      duration: dur(0.6),
      delay: dur(0.25),
      ease: FC_EASE_OUT
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "fc-soc",
    "aria-label": "X"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "fc-soc",
    "aria-label": "Instagram"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "18",
    height: "18",
    rx: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17.5",
    cy: "6.5",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "fc-soc",
    "aria-label": "LinkedIn"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4.98 3.5a2.5 2.5 0 11-.02 5.001A2.5 2.5 0 014.98 3.5zM3 8.98h4v12.02H3V8.98zM9.5 8.98h3.83v1.64h.05c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12v6.32h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96v5.7h-4V8.98z"
  }))))));
}
Object.assign(window, {
  FooterCTA
});