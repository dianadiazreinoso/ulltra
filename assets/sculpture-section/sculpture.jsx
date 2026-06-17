/*GLUE_IIFE*/(function(){
/* ARCHETYPE · sculpture.jsx — now the mechanical-heart beat */
const {
  useEffect,
  useRef,
  useState
} = React;
const FM = window.Motion || window.framerMotion || {};
const {
  motion,
  useMotionValue,
  useTransform
} = FM;
const HEART_FRAME_COUNT = 26;
const heartFrameSrc = i => "assets/heart-seq/ezgif-frame-" + String(i + 1).padStart(3, "0") + ".webp";
const ROT_DONE = 0.70;
const ACT2_OUT = 0.72;
const EASE_CINE = [0.19, 1, 0.22, 1];
function ArchetypeSection() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const resizeRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [mobile, setMobile] = useState(false);
  const textMV = useMotionValue(0);
  const subStyle = {
    opacity: useTransform(textMV, [0.18, 0.5], [0, 1]),
    y: useTransform(textMV, [0.18, 0.5], [22, 0]),
    whiteSpace: "nowrap",
    fontSize: mobile ? "clamp(34px, 10vw, 54px)" : "100px",
    lineHeight: 0.78,
    color: "#FFFFFF"
  };
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);else mq.removeListener(update);
    };
  }, []);
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const {
      gsap,
      ScrollTrigger
    } = window;
    gsap.registerPlugin(ScrollTrigger);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const asset = window.__asset || (p => p);
    let targetFrame = 0,
      curFrame = 0,
      raf = 0;
    let cw = 0,
      ch = 0,
      shownFrame = -1;
    const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
    const images = new Array(HEART_FRAME_COUNT);
    for (let i = 0; i < HEART_FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        if (i === 0) draw(0);
      };
      img.src = asset(heartFrameSrc(i));
      images[i] = img;
    }
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
      canvas.width = cw;
      canvas.height = ch;
      shownFrame = -1;
      draw((Math.round(curFrame) % HEART_FRAME_COUNT + HEART_FRAME_COUNT) % HEART_FRAME_COUNT);
    };
    resizeRef.current = resize;
    const draw = idx => {
      const img = images[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, cw, ch);
      const fit = isMobile() ? 0.95 : 0.774;
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * fit;
      const dw = img.naturalWidth * scale,
        dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      shownFrame = idx;
    };
    const tick = () => {
      curFrame += (targetFrame - curFrame) * 0.35;
      const idx = (Math.round(curFrame) % HEART_FRAME_COUNT + HEART_FRAME_COUNT) % HEART_FRAME_COUNT;
      if (idx !== shownFrame) draw(idx);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: self => {
        const p = self.progress;
        targetFrame = Math.min(p / ROT_DONE, 1) * HEART_FRAME_COUNT;
        setEntered(true);
        textMV.set(Math.max(0, Math.min(p / 0.60, 1)));
      }
    });
    const enterST = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 85%",
      once: true,
      onEnter: () => setEntered(true)
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
    window.addEventListener("resize", resize);
    resize();
    ScrollTrigger.refresh();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      st.kill();
      enterST.kill();
      if (shrinkTl) {
        shrinkTl.scrollTrigger && shrinkTl.scrollTrigger.kill();
        shrinkTl.kill();
      }
    };
  }, []);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (resizeRef.current) resizeRef.current();
    });
    return () => cancelAnimationFrame(id);
  }, [mobile]);
  return /*#__PURE__*/React.createElement("section", {
    className: "sc-root",
    ref: sectionRef,
    "data-header": "dark",
    "data-screen-label": "Archetype"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sc-stage"
  }, /*#__PURE__*/React.createElement("canvas", {
    className: "sc-heart",
    ref: canvasRef,
    "aria-hidden": "true",
    style: {
      position: "absolute",
      top: mobile ? "18%" : 0,
      left: mobile ? 0 : "40%",
      width: mobile ? "100%" : "60%",
      height: mobile ? "82%" : "100%",
      zIndex: 3,
      display: "block",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sc-vignette"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sc-grain"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sc-caption",
    style: {
      width: mobile ? "min(88vw, 380px)" : "min(80vw, 860px)",
      gap: "clamp(1px, 0.25vw, 4px)",
      marginTop: mobile ? "15px" : 0
    }
  }, /*#__PURE__*/React.createElement(motion.h2, {
    className: "sc-cap-head",
    initial: {
      opacity: 0,
      y: 26,
      filter: "blur(12px)"
    },
    animate: entered ? {
      opacity: 1,
      y: 0,
      filter: "blur(0px)"
    } : {
      opacity: 0,
      y: 26,
      filter: "blur(12px)"
    },
    transition: {
      duration: 0.9,
      ease: EASE_CINE
    },
    style: {
      whiteSpace: "nowrap",
      fontSize: mobile ? "clamp(40px, 12vw, 62px)" : "100px",
      lineHeight: 0.95
    }
  }, "Old", /*#__PURE__*/React.createElement("br", null), "wisdom"), /*#__PURE__*/React.createElement(motion.p, {
    className: "sc-cap-sub",
    style: subStyle
  }, /*#__PURE__*/React.createElement("em", null, "new", /*#__PURE__*/React.createElement("br", null), "instruments")))));
}
window.ArchetypeSection = ArchetypeSection;
const __mount = document.getElementById("sculpture-root");
if (__mount) ReactDOM.createRoot(__mount).render(/*#__PURE__*/React.createElement(ArchetypeSection, null));
})();
