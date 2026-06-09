(function(){
const {
  useRef: clUseRef,
  useEffect: clUseEffect
} = React;
const CL_ITEMS = [{
  kind: "project",
  tone: "lime",
  name: "DataLab",
  type: "Platform",
  year: "2024",
  desc: "Internal data platform unifying ingestion, governance and AI model operations for a retail group.",
  left: "27%",
  top: "50%",
  speed: 0.8
}, {
  kind: "project",
  tone: "dark",
  name: "Securitas Hub",
  type: "System",
  year: "2024",
  desc: "Operational control surface integrating live telemetry, incident flow and field coordination.",
  left: "70%",
  top: "46%",
  speed: 1.0
}, {
  kind: "art",
  src: "assets/cap-cyber.png",
  alt: "A classical painted figure wearing a sleek cyber visor",
  left: "46%",
  top: "53%",
  speed: 0.6
}, {
  kind: "project",
  tone: "magenta",
  name: "Lista Robinson",
  type: "System",
  year: "2023",
  desc: "National opt-out registry modernisation — identity, compliance and high-availability operations.",
  left: "30%",
  top: "54%",
  speed: 1.25
}, {
  kind: "project",
  tone: "lime",
  name: "Solairis",
  type: "AI · Data",
  year: "2025",
  desc: "Energy-sector analytics product with forecasting models and a governed data layer for operators.",
  left: "69%",
  top: "50%",
  speed: 0.9
}, {
  kind: "art",
  src: "assets/work-portrait.png",
  alt: "A classical painted portrait of a woman with an electric scooter",
  left: "51%",
  top: "47%",
  speed: 0.6
}, {
  kind: "project",
  tone: "magenta",
  name: "Heva",
  type: "Data · Regulated",
  year: "2025",
  desc: "Healthcare data environment enabling regulated research on sovereign, auditable infrastructure.",
  left: "41%",
  top: "52%",
  speed: 1.4
}];
function ClPlus() {
  return React.createElement("span", {
    className: "cl-plus",
    "aria-hidden": "true"
  }, React.createElement("span", null), React.createElement("span", null));
}
function ClCard({
  item
}) {
  if (item.kind === "art") {
    return React.createElement("div", {
      className: "cl-card cl-card--art",
      "aria-hidden": "true"
    }, React.createElement("img", {
      src: window.__asset(item.src),
      alt: item.alt,
      draggable: "false"
    }));
  }
  return React.createElement("article", {
    className: `cl-card cl-card--${item.tone}`,
    role: "listitem"
  }, React.createElement("div", {
    className: "cl-card-top"
  }, React.createElement("div", {
    className: "cl-card-id"
  }, React.createElement("h3", {
    className: "cl-card-name"
  }, item.name), React.createElement("p", {
    className: "cl-card-type"
  }, item.type)), React.createElement(ClPlus, null)), React.createElement("p", {
    className: "cl-card-desc"
  }, item.desc), React.createElement("span", {
    className: "cl-card-year",
    "aria-hidden": "true"
  }, item.year));
}
function ClientsSection() {
  const sectionRef = clUseRef(null);
  const slotRefs = clUseRef(CL_ITEMS.map(() => React.createRef()));
  const animRefs = clUseRef(CL_ITEMS.map(() => React.createRef()));
  const [activeIndex, setActiveIndex] = React.useState(null);
  clUseEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const slots = slotRefs.current.map(r => r.current);
    const anims = animRefs.current.map(r => r.current);
    const ctx = gsap.context(() => {
      const N = CL_ITEMS.length;
      gsap.set(anims, {
        autoAlpha: 0,
        y: 150,
        scale: 0.92
      });
      const master = gsap.timeline({
        defaults: {
          ease: "none"
        },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
      const ENTER_GAP = 11;
      const LIFE = 42;
      const FADE = 11;
      const FIRST = 2;
      slots.forEach((slot, i) => {
        const item = CL_ITEMS[i];
        const anim = anims[i];
        if (!slot || !anim) return;
        gsap.set(slot, {
          xPercent: -50,
          yPercent: -50
        });
        const at = FIRST + i * ENTER_GAP;
        const enterY = window.innerHeight * 0.62 * item.speed;
        const exitY = -window.innerHeight * 0.62 * item.speed;
        master.fromTo(slot, {
          y: enterY
        }, {
          y: exitY,
          duration: LIFE
        }, at);
        master.fromTo(anim, {
          autoAlpha: 0,
          scale: 0.92
        }, {
          autoAlpha: 1,
          scale: 1,
          duration: FADE,
          ease: "power2.out"
        }, at);
        master.to(anim, {
          autoAlpha: 0,
          scale: 0.95,
          duration: FADE,
          ease: "power2.in"
        }, at + LIFE - FADE);
      });
      ScrollTrigger.refresh();
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  return React.createElement(React.Fragment, null, React.createElement("section", {
    ref: sectionRef,
    id: "work",
    className: "clients",
    "data-header": "light",
    "data-screen-label": "Selected work",
    "aria-label": "Clients \u2014 selected work"
  }, React.createElement("div", {
    className: "clients-stage"
  }, React.createElement("div", {
    className: "clients-bg",
    "aria-hidden": "true"
  }, React.createElement("img", {
    src: window.__asset("assets/clients-bg.png"),
    alt: "",
    draggable: "false"
  })), React.createElement("div", {
    className: "clients-bg-veil",
    "aria-hidden": "true"
  }), React.createElement("h2", {
    className: "cl-title"
  }, React.createElement("span", {
    className: "cl-title-a"
  }, "Selected"), React.createElement("span", {
    className: "cl-title-b"
  }, "work")), React.createElement("div", {
    className: "cl-canvas",
    role: "list"
  }, CL_ITEMS.map((item, i) => React.createElement("div", {
    key: i,
    ref: slotRefs.current[i],
    className: "cl-slot" + (activeIndex === i ? " is-active" : ""),
    onClick: item.kind === "art" ? undefined : () => {
      if (window.matchMedia && window.matchMedia("(max-width:760px)").matches) setActiveIndex(activeIndex === i ? null : i);
    },
    style: {
      left: item.left,
      top: item.top,
      zIndex: i + 1
    }
  }, React.createElement("div", {
    ref: animRefs.current[i],
    className: "cl-slot-anim"
  }, React.createElement(ClCard, {
    item: item
  }))))))));
}
Object.assign(window, {
  ClientsSection
});
})();
