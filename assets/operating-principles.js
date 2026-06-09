(function(){
const opR = React;
const OP_FRAME_COUNT = 26;
const opFrameSrc = i => "assets/heart-seq/ezgif-frame-" + String(i + 1).padStart(3, "0") + ".png";
const OP_STATES = [{
  n: "01",
  title: "Execution over experimentation",
  desc: "We ship systems, not pilots. Value is created only in production — the rest is research."
}, {
  n: "02",
  title: "Sovereignty over convenience",
  desc: "Infrastructure you own and govern. No rented intelligence, no borrowed control, no silent dependencies."
}, {
  n: "03",
  title: "Systems over services",
  desc: "We build operations that compound, not tickets that recur. Durable by design, owned end to end."
}];
function OperatingPrinciplesSection() {
  const sectionRef = opR.useRef(null);
  const stageRef = opR.useRef(null);
  const canvasRef = opR.useRef(null);
  const stateRefs = opR.useRef(OP_STATES.map(() => opR.createRef()));
  opR.useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const states = stateRefs.current.map(r => r.current);
    const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
    const band = (p, a, b) => clamp((p - a) / (b - a));
    const smooth = t => t * t * (3 - 2 * t);
    const WIN = [[-1, -1, 0.24, 0.32], [0.26, 0.34, 0.60, 0.68], [0.64, 0.72, 2, 2]];
    const RISE = 28;
    const dots = Array.from(section.querySelectorAll(".op-progress-dot"));
    const applyStates = p => {
      let active = 0;
      states.forEach((el, i) => {
        if (!el) return;
        const [i0, i1, o0, o1] = WIN[i];
        let o, y;
        if (p < i0) {
          o = 0;
          y = RISE;
        } else if (p < i1) {
          const t = smooth(band(p, i0, i1));
          o = t;
          y = RISE * (1 - t);
        } else if (p < o0) {
          o = 1;
          y = 0;
        } else if (p < o1) {
          const t = smooth(band(p, o0, o1));
          o = 1 - t;
          y = -RISE * t;
        } else {
          o = 0;
          y = -RISE;
        }
        el.style.opacity = o.toFixed(3);
        el.style.transform = "translateY(" + y.toFixed(1) + "px)";
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        if (o > 0.5) active = i;
      });
      dots.forEach((d, k) => {
        d.classList.toggle("is-active", k === active);
      });
    };
    const images = new Array(OP_FRAME_COUNT);
    let loaded = 0;
    for (let i = 0; i < OP_FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (i === 0) draw(0);
      };
      img.src = window.__asset(opFrameSrc(i));
      images[i] = img;
    }
    let cw = 0,
      ch = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.round(r.width * dpr));
      ch = Math.max(1, Math.round(r.height * dpr));
      canvas.width = cw;
      canvas.height = ch;
      draw(shownFrame);
    };
    let shownFrame = 0;
    const draw = idx => {
      const img = images[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, cw, ch);
      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale,
        dh = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      shownFrame = idx;
    };
    let targetFrame = 0;
    let curFrame = 0;
    let raf = 0;
    const tick = () => {
      curFrame += (targetFrame - curFrame) * 0.35;
      const idx = Math.round(curFrame);
      if (idx !== shownFrame) draw(idx);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    applyStates(0);
    const ctxGsap = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: isMobile ? "+=200%" : "+=300%",
        pin: stage,
        pinSpacing: true,
        scrub: isMobile ? 0.6 : 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: resize,
        onUpdate: self => {
          targetFrame = self.progress * (OP_FRAME_COUNT - 1);
          applyStates(self.progress);
        }
      });
      resize();
      ScrollTrigger.refresh();
    }, sectionRef);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctxGsap.revert();
    };
  }, []);
  return React.createElement("section", {
    ref: sectionRef,
    id: "principles",
    className: "op",
    "data-header": "dark",
    "data-screen-label": "Operating principles",
    "aria-label": "Operating principles"
  }, React.createElement("div", {
    className: "op-stage",
    ref: stageRef
  }, React.createElement("div", {
    className: "op-grain",
    "aria-hidden": "true"
  }), React.createElement("canvas", {
    ref: canvasRef,
    className: "op-canvas",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "op-veil",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "op-content"
  }, React.createElement("h2", {
    className: "op-title"
  }, React.createElement("span", {
    className: "op-title-a"
  }, "Operating"), React.createElement("span", {
    className: "op-title-b"
  }, "principles")), React.createElement("div", {
    className: "op-states"
  }, OP_STATES.map((s, i) => React.createElement("article", {
    className: "op-state",
    key: i,
    ref: stateRefs.current[i]
  }, React.createElement("span", {
    className: "op-state-n",
    "aria-hidden": "true"
  }, s.n), React.createElement("h3", {
    className: "op-state-title"
  }, s.title), React.createElement("p", {
    className: "op-state-desc"
  }, s.desc)))), React.createElement("div", {
    className: "op-progress",
    "aria-hidden": "true"
  }, OP_STATES.map((_, i) => React.createElement("span", {
    className: "op-progress-dot",
    key: i,
    "data-i": i
  }))))));
}
Object.assign(window, {
  OperatingPrinciplesSection
});
})();
