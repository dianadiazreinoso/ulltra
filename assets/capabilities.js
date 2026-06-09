(function(){
const CAP_CARDS = [{
  kind: "panel",
  tone: "lime",
  title: "Data",
  items: ["Data Platforms — Lakehouse", "Data Governance", "Databricks", "Data Platforms — Data Mesh", "Pipelines & Integrations"]
}, {
  kind: "image",
  src: "assets/cap-visors.png",
  alt: "A lone figure seated by a still sea, gazing at a luminous sky of glowing screens"
}, {
  kind: "panel",
  tone: "light",
  center: true,
  title: "Strategy",
  items: ["AI Strategy", "AI Product", "Innovation & Transformation", "Data Auditing", "Prototyping"]
}, {
  kind: "image",
  src: "assets/cap-cyber.png",
  alt: "A classical painted figure wearing a sleek cyber visor"
}, {
  kind: "panel",
  tone: "magenta",
  title: "AI Engineering",
  items: ["AI & ML Model Creation", "Model Architecture", "Application Development", "LLM Development & Implementation", "Training & Fine-Tuning"]
}];
const CAP_BASE = [{
  x: -362,
  y: 66,
  rot: -22,
  scale: 0.95,
  z: 10
}, {
  x: -188,
  y: 20,
  rot: -10,
  scale: 0.98,
  z: 20
}, {
  x: 0,
  y: -16,
  rot: 0,
  scale: 1.05,
  z: 50
}, {
  x: 188,
  y: 20,
  rot: 10,
  scale: 0.98,
  z: 20
}, {
  x: 362,
  y: 66,
  rot: 22,
  scale: 0.95,
  z: 10
}];
function CapActiveBadge() {
  return React.createElement("span", {
    className: "caps-badge"
  }, React.createElement("span", {
    className: "caps-badge-dot",
    "aria-hidden": "true"
  }), "Active");
}
function CapCard({
  card,
  index,
  slotRef
}) {
  if (card.kind === "image") {
    return React.createElement("div", {
      className: "caps-slot",
      "data-index": index,
      ref: slotRef,
      "aria-hidden": "true"
    }, React.createElement("div", {
      className: "caps-tilt"
    }, React.createElement("div", {
      className: "caps-card caps-card--image"
    }, React.createElement("div", {
      className: "caps-img"
    }, React.createElement("img", {
      src: window.__asset(card.src),
      alt: card.alt,
      draggable: "false"
    })), React.createElement("div", {
      className: "caps-img-veil",
      "aria-hidden": "true"
    }))));
  }
  return React.createElement("div", {
    className: "caps-slot",
    "data-index": index,
    "data-center": card.center ? "true" : undefined,
    ref: slotRef
  }, React.createElement("div", {
    className: "caps-tilt"
  }, React.createElement("div", {
    className: `caps-card caps-card--panel caps-card--${card.tone}`
  }, React.createElement("div", {
    className: "caps-card-head"
  }, React.createElement("h3", {
    className: "caps-card-title"
  }, card.title), React.createElement(CapActiveBadge, null)), React.createElement("ul", {
    className: "caps-list"
  }, card.items.map(it => React.createElement("li", {
    className: "caps-item",
    key: it
  }, it))))));
}
function CapabilitiesSection() {
  const sectionRef = React.useRef(null);
  const deckRef = React.useRef(null);
  const particlesRef = React.useRef(null);
  const slotRefs = React.useRef([]);
  slotRefs.current = CAP_CARDS.map((_, i) => slotRefs.current[i] || React.createRef());
  React.useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const slots = slotRefs.current.map(r => r.current).filter(Boolean);
    const ctx = gsap.context(() => {
      const pField = particlesRef.current;
      if (pField) {
        const dots = Array.from(pField.querySelectorAll(".caps-particle"));
        dots.forEach(d => {
          gsap.to(d, {
            x: gsap.utils.random(-40, 40),
            y: gsap.utils.random(-60, 60),
            duration: gsap.utils.random(6, 12),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 4)
          });
        });
      }
      const mm = gsap.matchMedia();
      const buildFan = factor => {
        const base = CAP_BASE.map(b => ({
          x: b.x * factor,
          y: b.y,
          rot: b.rot * (factor < 1 ? 0.8 : 1),
          scale: b.scale,
          z: b.z
        }));
        slots.forEach((slot, i) => {
          gsap.set(slot, {
            xPercent: -50,
            yPercent: -50,
            x: base[i].x,
            y: base[i].y,
            rotation: base[i].rot,
            scale: base[i].scale,
            zIndex: base[i].z,
            transformOrigin: "50% 50%"
          });
        });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            once: true
          }
        });
        tl.from(slots, {
          opacity: 0,
          y: i => base[i].y + 120,
          scale: i => base[i].scale * 0.9,
          rotation: i => base[i].rot + (base[i].rot <= 0 ? -6 : 6),
          duration: 1.1,
          ease: "power4.out",
          stagger: {
            each: 0.12,
            from: "edges"
          }
        });
        const FRONT_Z = 120;
        const enter = i => {
          slots.forEach((slot, j) => {
            if (j === i) {
              gsap.to(slot, {
                x: base[i].x,
                y: base[i].y - 36,
                rotation: 0,
                scale: 1.18,
                zIndex: FRONT_Z,
                autoAlpha: 1,
                duration: 0.55,
                ease: "power3.out"
              });
              slot.classList.add("is-hover");
              const img = slot.querySelector(".caps-img img");
              if (img) gsap.to(img, {
                scale: 1.1,
                duration: 0.6,
                ease: "power3.out"
              });
              const items = slot.querySelectorAll(".caps-item");
              if (items.length) gsap.fromTo(items, {
                opacity: 0,
                x: -10
              }, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.055
              });
            } else {
              const dir = j < i ? -1 : 1;
              const away = j === i - 1 || j === i + 1 ? 132 : 76;
              gsap.to(slot, {
                x: base[j].x + dir * away,
                y: base[j].y + 12,
                rotation: base[j].rot + dir * 5,
                scale: base[j].scale * 0.9,
                zIndex: base[j].z,
                autoAlpha: 0.42,
                duration: 0.55,
                ease: "power3.out"
              });
            }
          });
        };
        const leave = () => {
          slots.forEach((slot, j) => {
            gsap.to(slot, {
              x: base[j].x,
              y: base[j].y,
              scale: base[j].scale,
              rotation: base[j].rot,
              zIndex: base[j].z,
              autoAlpha: 1,
              duration: 0.6,
              ease: "power3.out"
            });
            slot.classList.remove("is-hover");
            const img = slot.querySelector(".caps-img img");
            if (img) gsap.to(img, {
              scale: 1,
              duration: 0.6,
              ease: "power3.out"
            });
            const tilt = slot.querySelector(".caps-tilt");
            if (tilt) gsap.to(tilt, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.6,
              ease: "power3.out"
            });
          });
        };
        const move = (i, e) => {
          const slot = slots[i];
          const tilt = slot.querySelector(".caps-tilt");
          const r = slot.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(tilt, {
            rotateY: px * 14,
            rotateX: -py * 14,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 900
          });
        };
        const handlers = slots.map((slot, i) => {
          const onEnter = () => enter(i);
          const onLeave = leave;
          const onMove = e => move(i, e);
          slot.addEventListener("mouseenter", onEnter);
          slot.addEventListener("mouseleave", onLeave);
          slot.addEventListener("mousemove", onMove);
          return {
            slot,
            onEnter,
            onLeave,
            onMove
          };
        });
        const cards = slots.map(s => s.querySelector(".caps-card"));
        const hasQuickTo = typeof gsap.quickTo === "function";
        const pxTo = cards.map(c => hasQuickTo ? gsap.quickTo(c, "x", {
          duration: 0.7,
          ease: "power2.out"
        }) : null);
        const pyTo = cards.map(c => hasQuickTo ? gsap.quickTo(c, "y", {
          duration: 0.7,
          ease: "power2.out"
        }) : null);
        const setCard = (j, x, y) => {
          if (hasQuickTo) {
            pxTo[j](x);
            pyTo[j](y);
          } else gsap.to(cards[j], {
            x,
            y,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto"
          });
        };
        const deckEl = deckRef.current;
        const onDeckMove = e => {
          const r = deckEl.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          cards.forEach((c, j) => {
            const depth = base[j].z / 50;
            setCard(j, nx * 22 * depth, ny * 14 * depth);
          });
        };
        const onDeckLeave = () => cards.forEach((c, j) => setCard(j, 0, 0));
        if (deckEl) {
          deckEl.addEventListener("mousemove", onDeckMove);
          deckEl.addEventListener("mouseleave", onDeckLeave);
        }
        return () => {
          handlers.forEach(({
            slot,
            onEnter,
            onLeave,
            onMove
          }) => {
            slot.removeEventListener("mouseenter", onEnter);
            slot.removeEventListener("mouseleave", onLeave);
            slot.removeEventListener("mousemove", onMove);
          });
          if (deckEl) {
            deckEl.removeEventListener("mousemove", onDeckMove);
            deckEl.removeEventListener("mouseleave", onDeckLeave);
          }
        };
      };
      mm.add("(min-width: 1101px)", () => buildFan(1));
      mm.add("(min-width: 761px) and (max-width: 1100px)", () => buildFan(0.62));
      mm.add("(max-width: 760px)", () => {
        gsap.set(slots, {
          clearProps: "all"
        });
        const title = sectionRef.current.querySelector(".caps-title");
        const cards = slots.map(s => s.querySelector(".caps-card")).filter(Boolean);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true
          }
        });
        if (title) tl.from(title, {
          opacity: 0,
          y: 22,
          duration: 0.7,
          ease: "power3.out"
        });
        tl.from(cards, {
          opacity: 0,
          x: 150,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.13
        }, title ? "-=0.15" : 0);
      });
      setTimeout(() => ScrollTrigger.refresh(), 300);
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  const particles = Array.from({
    length: 14
  }, (_, i) => ({
    id: i,
    left: (i * 67 + 9) % 100,
    top: (i * 41 + 13) % 100,
    s: 2 + i % 3
  }));
  return React.createElement("section", {
    ref: sectionRef,
    id: "capabilities",
    className: "caps",
    "data-header": "light",
    "data-screen-label": "Capabilities",
    "aria-label": "Capabilities"
  }, React.createElement("div", {
    className: "caps-bg",
    "aria-hidden": "true"
  }, React.createElement("img", {
    src: window.__asset("assets/cap-bg.png"),
    alt: "",
    draggable: "false"
  }), React.createElement("div", {
    className: "caps-bg-veil"
  })), React.createElement("div", {
    className: "caps-particles",
    ref: particlesRef,
    "aria-hidden": "true"
  }, particles.map(p => React.createElement("span", {
    key: p.id,
    className: "caps-particle",
    style: {
      left: p.left + "%",
      top: p.top + "%",
      width: p.s + "px",
      height: p.s + "px"
    }
  }))), React.createElement("div", {
    className: "caps-inner"
  }, React.createElement("h2", {
    className: "caps-title"
  }, React.createElement("span", {
    className: "caps-title-a"
  }, "Discover our"), React.createElement("span", {
    className: "caps-title-b"
  }, "capabilities")), React.createElement("div", {
    className: "caps-deck",
    ref: deckRef,
    role: "list"
  }, CAP_CARDS.map((card, i) => React.createElement(CapCard, {
    key: i,
    card: card,
    index: i,
    slotRef: slotRefs.current[i]
  })))));
}
Object.assign(window, {
  CapabilitiesSection,
  CapCard
});
})();
