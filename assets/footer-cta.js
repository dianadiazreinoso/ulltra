(function(){
const fcR = React;
const FCFM = window.Motion || window.framerMotion || {};
const fcMotion = FCFM.motion;
const fcUseInView = FCFM.useInView;
const fcUseReduced = FCFM.useReducedMotion;
const fcUseScroll = FCFM.useScroll;
const fcUseTransform = FCFM.useTransform;
const FC_EASE = [0.62, 0, 0.2, 1];
const FC_EASE_OUT = [0.22, 0.61, 0.36, 1];
function FooterCTA() {
  const ref = fcR.useRef(null);
  const reduced = fcUseReduced ? fcUseReduced() : false;
  const [phase, setPhase] = fcR.useState(0);
  const [scrollSeen, setScrollSeen] = fcR.useState(false);
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
    setPhase(2);
    ts.push(setTimeout(() => setPhase(3), 1100));
    ts.push(setTimeout(() => setPhase(4), 1300));
    ts.push(setTimeout(() => setPhase(5), 2400));
    ts.push(setTimeout(() => setPhase(6), 2500));
    return () => ts.forEach(clearTimeout);
  }, [started, reduced]);
  const dur = t => reduced ? 0 : t;
  const M = fcMotion;
  const {
    scrollYProgress
  } = fcUseScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const bgY = fcUseTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const armY = fcUseTransform(scrollYProgress, [0, 1], ["3.5%", "-3.5%"]);
  const parallax = reduced ? {} : {
    bg: {
      y: bgY
    },
    arm: {
      y: armY
    }
  };
  return React.createElement("section", {
    className: "fc",
    id: "footer",
    ref: ref,
    "data-header": "light",
    "data-screen-label": "Footer"
  }, React.createElement(M.div, {
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
  }, React.createElement(M.div, {
    className: "fc-bg",
    "aria-hidden": "true",
    style: parallax.bg
  }), React.createElement("div", {
    className: "fc-vignette",
    "aria-hidden": "true"
  }), React.createElement(M.div, {
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
  }, React.createElement("h2", {
    className: "fc-headline"
  }, React.createElement("span", {
    className: "fc-h-a"
  }, "Do not worry"), React.createElement("span", {
    className: "fc-h-b"
  }, "we are still early"))), React.createElement(M.div, {
    className: "fc-top",
    style: parallax.arm
  }, React.createElement(M.img, {
    className: "fc-arm fc-arm--human",
    src: window.__asset("assets/arm-human.png"),
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
  }), React.createElement(M.img, {
    className: "fc-arm fc-arm--robot",
    src: window.__asset("assets/arm-robot.png"),
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
  }), React.createElement("div", {
    className: "fc-glow" + (phase >= 5 ? " is-on" : ""),
    "aria-hidden": "true"
  })), React.createElement("div", {
    className: "fc-scrim",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "fc-bottom"
  }, React.createElement(M.p, {
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
  }, "We reply in person, within 48 hours.", React.createElement("br", null), "Engagements begin at six weeks."), React.createElement(M.button, {
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
  }, "Get Started"))));
}
Object.assign(window, {
  FooterCTA
});
})();
