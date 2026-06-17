/*GLUE_IIFE*/(function(){
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* =============================================================================
   SVRN · Hero Section
   -----------------------------------------------------------------------------
   Layered, scroll-aware hero. Layers (from back to front):
     0  Background image (parallax · slow translate)
     1  Vignette + gradient overlay
     2  Hero content (heading · description)
     3  Info cards
     4  Header
   Each layer is an independent <motion> wrapper so reveal timing, easing, and
   scroll-driven transforms compose cleanly.
   ========================================================================== */

const {
  useEffect,
  useRef,
  useState,
  useMemo
} = React;
const FM = window.Motion || window.framerMotion || window["framer-motion"] || {};
const {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  useInView
} = FM;
if (!motion) {
  console.warn("[SVRN] framer-motion global not found", Object.keys(window).filter(k => /motion/i.test(k)));
}

/* ─── Tweakable defaults ──────────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#D95BFF",
  "heading": "Don't worry.\nWe are *early.*",
  "description": "Ulltra helps companies and future leaders achieve the extraordinary in the agentic AI era.",
  "showSystemOverlay": false,
  "motionIntensity": "cinematic",
  "parallax": true
} /*EDITMODE-END*/;

/* =============================================================================
   Motion primitives
   ========================================================================== */
const EASE_CINE = [0.19, 1, 0.22, 1];
const EASE_EDIT = [0.16, 0.84, 0.30, 1];
const motionPresets = {
  fadeUp: (delay = 0, y = 24, dur = 1.1) => ({
    initial: {
      opacity: 0,
      y
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: dur,
      delay,
      ease: EASE_CINE
    }
  }),
  fadeIn: (delay = 0, dur = 1.2) => ({
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    transition: {
      duration: dur,
      delay,
      ease: EASE_CINE
    }
  }),
  scaleIn: (delay = 0, from = 1.06, dur = 1.6) => ({
    initial: {
      opacity: 0,
      scale: from
    },
    animate: {
      opacity: 1,
      scale: 1
    },
    transition: {
      duration: dur,
      delay,
      ease: EASE_CINE
    }
  })
};

/* Reveal text word-by-word using a wrapping mask so the lift feels filmic. */
function RichHeading({
  text,
  delay = 0.6
}) {
  // text supports *italic* runs (wrapped in asterisks) and \n line breaks
  const tokens = useMemo(() => {
    const out = [];
    let k = 0;
    text.split("\n").forEach((line, lineIdx) => {
      if (lineIdx > 0) out.push({
        id: `br-${k++}`,
        isBreak: true
      });
      const parts = line.split(/(\*[^*]+\*)/g).filter(Boolean);
      parts.forEach(part => {
        const isItalic = /^\*.*\*$/.test(part);
        const clean = isItalic ? part.slice(1, -1) : part;
        clean.split(/(\s+)/).forEach(w => {
          if (w === "") return;
          out.push({
            id: `tok-${k++}`,
            text: w,
            isItalic,
            isSpace: /^\s+$/.test(w)
          });
        });
      });
    });
    return out;
  }, [text]);
  let wordIdx = 0;
  return /*#__PURE__*/React.createElement("h1", {
    className: "hero-h1"
  }, tokens.map(tok => {
    if (tok.isBreak) return /*#__PURE__*/React.createElement("br", {
      key: tok.id
    });
    if (tok.isSpace) return /*#__PURE__*/React.createElement("span", {
      key: tok.id
    }, " ");
    const i = wordIdx++;
    return /*#__PURE__*/React.createElement("span", {
      key: tok.id,
      className: "word-wrap"
    }, /*#__PURE__*/React.createElement(motion.span, {
      initial: {
        y: "108%",
        opacity: 0
      },
      animate: {
        y: "0%",
        opacity: 1
      },
      transition: {
        duration: 1.05,
        delay: delay + i * 0.055,
        ease: EASE_CINE
      },
      className: tok.isItalic ? "italic-accent" : "",
      style: {
        fontFamily: "Archivo"
      }
    }, tok.text));
  }));
}

/* =============================================================================
   Header — logo · nav · CTA · separator
   ========================================================================== */
const NAV_ITEMS = [{
  n: "01",
  label: "Positioning"
}, {
  n: "02",
  label: "Software"
}, {
  n: "03",
  label: "Consultancy"
}, {
  n: "04",
  label: "Capabilities"
}, {
  n: "05",
  label: "Stack"
}, {
  n: "06",
  label: "Work"
}, {
  n: "07",
  label: "Clients"
}, {
  n: "08",
  label: "Contact"
}];
function Header({
  accent
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Re-tint over light sections (positioning · consultancy · capabilities).
  const [light, setLight] = useState(false);
  useEffect(() => {
    let ticking = false;
    const LIGHT_IDS = ["positioning", "consultancy", "capabilities", "work", "footer"];
    const LINE = 54; // header optical centre, px from viewport top
    const update = () => {
      ticking = false;
      // Is a light section crossing the header line right now?
      let isLight = false;
      for (const id of LIGHT_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= LINE && r.bottom >= LINE) {
          isLight = true;
          break;
        }
      }
      setLight(isLight);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll, {
      passive: true
    });
    const warm = setTimeout(update, 120); // resolve initial state after layout
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(warm);
    };
  }, []);

  // Opening one surface always closes the other — they're independent panels.
  const openMenu = () => {
    setDrawerOpen(false);
    setMenuOpen(true);
  };
  const openDrawer = () => {
    setMenuOpen(false);
    setDrawerOpen(true);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(motion.header, {
    className: "hdr" + (light ? " hdr--light" : ""),
    initial: {
      opacity: 0,
      y: -8
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.55,
      ease: EASE_CINE
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hdr-inner"
  }, /*#__PURE__*/React.createElement(motion.a, {
    href: "#",
    className: "hdr-logo",
    "aria-label": "Ulltra home",
    whileHover: {
      opacity: 0.7
    },
    transition: {
      duration: 0.3,
      ease: EASE_EDIT
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hdr-logo-mark",
    role: "img",
    "aria-label": "Ulltra"
  })), /*#__PURE__*/React.createElement("div", {
    className: "hdr-actions"
  }, /*#__PURE__*/React.createElement(motion.button, {
    type: "button",
    className: "btn-getstarted",
    onClick: openDrawer,
    "aria-haspopup": "dialog",
    "aria-expanded": drawerOpen,
    initial: {
      opacity: 0,
      y: -6
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.7,
      delay: 0.4,
      ease: EASE_CINE
    }
  }, "Get Started"), /*#__PURE__*/React.createElement(motion.button, {
    type: "button",
    className: "btn-menu",
    onClick: openMenu,
    "aria-haspopup": "dialog",
    "aria-expanded": menuOpen,
    "aria-label": "Open menu",
    initial: {
      opacity: 0,
      y: -6
    },
    animate: {
      opacity: 1,
      y: 0
    },
    transition: {
      duration: 0.7,
      delay: 0.5,
      ease: EASE_CINE
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "btn-menu-icon",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null)))))), /*#__PURE__*/React.createElement(MenuPanel, {
    open: menuOpen,
    onClose: () => setMenuOpen(false),
    onGetStarted: openDrawer
  }), /*#__PURE__*/React.createElement(GetStartedDrawer, {
    open: drawerOpen,
    onClose: () => setDrawerOpen(false)
  }));
}

/* =============================================================================
   MenuPanel — right-side navigation drawer (GSAP slide · transform + opacity)
   ========================================================================== */
function MenuPanel({
  open,
  onClose,
  onGetStarted
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [lang, setLang] = useState("EN");
  const [activeId, setActiveId] = useState(null);
  const langs = ["EN", "ES"];

  // Lock the offscreen / hidden state on mount (no first-paint flash).
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    gsap.set(panelRef.current, {
      xPercent: 100,
      visibility: "visible"
    });
    gsap.set(overlayRef.current, {
      autoAlpha: 0
    });
  }, []);

  // Open / close — hardware-accelerated transforms only.
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const items = panel.querySelectorAll(".menu-link");
    gsap.killTweensOf([panel, overlay, ...items]);
    if (open) {
      gsap.to(overlay, {
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to(panel, {
        xPercent: 0,
        duration: 0.62,
        ease: "power3.out"
      });
      gsap.fromTo(items, {
        x: 40,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.05,
        delay: 0.12,
        ease: "power3.out"
      });
    } else {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.in"
      });
      gsap.to(panel, {
        xPercent: 100,
        duration: 0.5,
        ease: "power3.in"
      });
    }
  }, [open]);

  // ESC · scroll-lock · focus the close button on open.
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const el = panelRef.current && panelRef.current.querySelector(".menu-close");
      if (el) el.focus();
    }, 140);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Lightweight scroll-spy → highlight the section currently in view.
  // Read-only: observes existing sections, never mutates them.
  useEffect(() => {
    const ids = NAV_ITEMS.map(it => it.label.toLowerCase());
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) setActiveId(en.target.id);
      });
    }, {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  const go = (e, id) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      onClose();
      setTimeout(() => {
        const top = el.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({
          top,
          behavior: "smooth"
        });
      }, 380);
    } else {
      onClose();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "nav-portal",
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-overlay",
    ref: overlayRef,
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "menu-panel",
    ref: panelRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Site navigation",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement("div", {
    className: "menu-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "menu-eyebrow"
  }, "Index"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-close",
    onClick: onClose,
    "aria-label": "Close menu"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 2L14 14M14 2L2 14",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("nav", {
    className: "menu-nav",
    "aria-label": "Primary"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "menu-list"
  }, NAV_ITEMS.map(item => {
    const id = item.label.toLowerCase();
    const isActive = activeId === id;
    return /*#__PURE__*/React.createElement("li", {
      key: item.n
    }, /*#__PURE__*/React.createElement("a", {
      className: "menu-link" + (isActive ? " is-active" : ""),
      href: "#" + id,
      "aria-current": isActive ? "true" : undefined,
      onClick: e => go(e, id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "menu-num"
    }, item.n), /*#__PURE__*/React.createElement("span", {
      className: "menu-label"
    }, item.label), /*#__PURE__*/React.createElement("span", {
      className: "menu-arrow",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("svg", {
      width: "22",
      height: "14",
      viewBox: "0 0 22 14",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M1 7h18M14 1l6 6-6 6",
      stroke: "currentColor",
      strokeWidth: "1.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    })))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "menu-foot"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "menu-cta",
    onClick: () => {
      onClose();
      setTimeout(onGetStarted, 240);
    }
  }, "Get Started"), /*#__PURE__*/React.createElement("div", {
    className: "menu-social",
    "aria-label": "Social links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "menu-soc",
    "aria-label": "X"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "menu-soc",
    "aria-label": "Instagram"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
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
    className: "menu-soc",
    "aria-label": "LinkedIn"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4.98 3.5a2.5 2.5 0 11-.02 5.001A2.5 2.5 0 014.98 3.5zM3 8.98h4v12.02H3V8.98zM9.5 8.98h3.83v1.64h.05c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12v6.32h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96v5.7h-4V8.98z"
  })))))));
}

/* =============================================================================
   GetStartedDrawer — independent right-side enterprise contact drawer
   ========================================================================== */
function GetStartedDrawer({
  open,
  onClose
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    gsap.set(panelRef.current, {
      xPercent: 100,
      visibility: "visible"
    });
    gsap.set(overlayRef.current, {
      autoAlpha: 0
    });
  }, []);
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap) return;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    const rows = panel.querySelectorAll(".gs-anim");
    gsap.killTweensOf([panel, overlay, ...rows]);
    if (open) {
      gsap.to(overlay, {
        autoAlpha: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to(panel, {
        xPercent: 0,
        duration: 0.62,
        ease: "power3.out"
      });
      gsap.fromTo(rows, {
        y: 22,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.04,
        delay: 0.16,
        ease: "power3.out"
      });
    } else {
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.in"
      });
      gsap.to(panel, {
        xPercent: 100,
        duration: 0.5,
        ease: "power3.in"
      });
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const el = panelRef.current && panelRef.current.querySelector(".gs-close");
      if (el) el.focus();
    }, 140);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);
  const submit = async e => {
    e.preventDefault();
    if (sending) return;
    const f = e.currentTarget;
    const val = n => (f.elements[n] && f.elements[n].value || "").trim();
    const name = val("name"),
      company = val("company");
    const payload = {
      name,
      company,
      email: val("email"),
      phone: val("phone"),
      message: val("message"),
      _subject: "New enquiry from " + (name || "website") + (company ? " \u00b7 " + company : ""),
      _template: "table",
      _captcha: "false"
    };
    setError(false);
    setSending(true);
    try {
      const res = await fetch("https://formsubmit.co/ajax/hello@ulltra.ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setSent(true);
      f.reset();
    } catch (err) {
      setError(true);
    } finally {
      setSending(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "nav-portal",
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-overlay",
    ref: overlayRef,
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: "gs-drawer",
    ref: panelRef,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Get started",
    tabIndex: -1
  }, /*#__PURE__*/React.createElement("div", {
    className: "gs-scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gs-top gs-anim"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "gs-close",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 2L14 14M14 2L2 14",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("h2", {
    className: "gs-title gs-anim"
  }, "Let's build your AI advantage"), /*#__PURE__*/React.createElement("p", {
    className: "gs-sub gs-anim"
  }, "Tell us about your company and goals."), /*#__PURE__*/React.createElement("form", {
    className: "gs-form",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("label", {
    className: "gs-field gs-anim"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-label"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "name",
    autoComplete: "name",
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "gs-field gs-anim"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-label"
  }, "Company"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "company",
    autoComplete: "organization"
  })), /*#__PURE__*/React.createElement("label", {
    className: "gs-field gs-anim"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-label"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    name: "email",
    autoComplete: "email",
    required: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "gs-field gs-anim"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-label"
  }, "Phone"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    name: "phone",
    autoComplete: "tel"
  })), /*#__PURE__*/React.createElement("label", {
    className: "gs-field gs-anim"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gs-label"
  }, "Tell us about your project, a bit of context will allow us to connect you to the right team faster:"), /*#__PURE__*/React.createElement("textarea", {
    name: "message",
    rows: "4"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "gs-submit gs-anim",
    disabled: sending
  }, sent ? "Thank you — we'll be in touch" : sending ? "Sending\u2026" : error ? "Something went wrong — try again" : "Submit")))));
}

/* =============================================================================
   Info cards — glassmorphic, fade-up with stagger
   ========================================================================== */
function InfoCard({
  kicker,
  children,
  delay,
  statusDot
}) {
  return /*#__PURE__*/React.createElement(motion.div, _extends({
    className: "ic"
  }, motionPresets.fadeUp(delay, 22, 1.0), {
    whileHover: {
      y: -3,
      transition: {
        duration: 0.4,
        ease: EASE_EDIT
      }
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ic-kicker"
  }, kicker), /*#__PURE__*/React.createElement("div", {
    className: "ic-body"
  }, statusDot && /*#__PURE__*/React.createElement("span", {
    className: "ic-dot",
    "aria-hidden": "true"
  }), children));
}
function InfoCards({
  baseDelay = 1.7
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "cards"
  }, /*#__PURE__*/React.createElement(InfoCard, {
    kicker: "Origin",
    delay: baseDelay
  }, /*#__PURE__*/React.createElement("span", null, "European AI & Data Engineering \u2014"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", null, "Established for sovereign systems.")), /*#__PURE__*/React.createElement(InfoCard, {
    kicker: "Status",
    delay: baseDelay + 0.12,
    statusDot: true
  }, /*#__PURE__*/React.createElement("span", null, "Operating\xA0\xA024\u2009/\u20097\u2009/\u2009365")));
}

/* =============================================================================
   Background system — scroll-scrubbed <video> (Apple-style scroll scrubbing)
   -----------------------------------------------------------------------------
   A single full-bleed, muted, controls-less <video> (object-fit: cover) covers
   the sticky hero. Instead of *playing*, we map the scroll progress within the
   tall hero section onto the video's currentTime: scrolling down advances the
   footage frame-by-frame, scrolling up rewinds it. The target time is lerped
   toward each rAF tick so the seek feels like a smooth glide rather than a
   stutter. `sectionRef` should be the tall hero section element (the sticky
   parent of the video) — progress is computed from its top edge.
   ========================================================================== */
const HERO_VIDEO_SRC = "assets/hero-scroll-video-1920.mp4";
function HeroScrubVideo({
  sectionRef
}) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    let duration = 0;
    let objectUrl = null;
    let disposed = false;
    const state = {
      current: 0,
      target: 0,
      raf: 0
    };
    const LERP = 0.12; // higher = snappier, lower = more cinematic glide

    const seek = t => {
      const clamped = Math.max(0, Math.min(Math.max(0, duration - 0.04), t));
      if (typeof video.fastSeek === "function") {
        try {
          video.fastSeek(clamped);
          return;
        } catch (e) {/* fall through */}
      }
      try {
        video.currentTime = clamped;
      } catch (e) {/* not seekable yet */}
    };
    const tick = () => {
      state.raf = 0;
      const diff = state.target - state.current;
      if (Math.abs(diff) < 0.0006) {
        state.current = state.target;
      } else {
        state.current += diff * LERP;
        schedule();
      }
      if (duration > 0) seek(state.current * duration);
    };
    const schedule = () => {
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      // -rect.top is how far we've scrolled past the section's top edge.
      const scrolled = Math.max(0, Math.min(scrollable, -rect.top));
      state.target = scrolled / scrollable; // 0 → 1 across the runway
      schedule();
    };
    const onMeta = () => {
      duration = video.duration || 0;
      onScroll();
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);

    // ─── Source ──────────────────────────────────────────────────────────
    // Progressive HTTP delivery is often served WITHOUT byte-range support, so
    // the browser marks the video non-seekable (`seekable` = [0,0]) and every
    // scrubbed currentTime snaps back to 0. Loading the file into an in-memory
    // Blob makes the whole timeline seekable. A blob:/data: URL (e.g. from the
    // standalone-export inliner) is already in memory — use it directly.
    const resolved = window.__asset(HERO_VIDEO_SRC, "heroVideo");
    if (/^(blob:|data:)/.test(resolved)) {
      video.src = resolved;
    } else {
      fetch(resolved).then(r => r.blob()).then(blob => {
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
      }).catch(() => {
        if (!disposed) {
          video.src = resolved;
        }
      });
    }
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    video.addEventListener("canplay", onScroll);
    video.addEventListener("loadeddata", onScroll);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("canplay", onScroll);
      video.removeEventListener("loadeddata", onScroll);
      if (state.raf) cancelAnimationFrame(state.raf);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sectionRef]);
  return /*#__PURE__*/React.createElement("div", {
    className: "bg",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("video", {
    className: "hero-video",
    ref: videoRef,
    muted: true,
    playsInline: true,
    preload: "auto",
    disablePictureInPicture: true,
    tabIndex: -1
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-grad"
  }), /*#__PURE__*/React.createElement("div", {
    className: "bg-vignette"
  }));
}

/* =============================================================================
   Hero section — composition
   -----------------------------------------------------------------------------
   Outer <section> is 400vh tall — that vertical runway is what feeds the
   canvas frame sequence below. A position:sticky inner stage pins to the
   viewport so the visible composition stays in place while the section is
   "playing". Content opacity & y are driven by the section's own progress so
   text fades out cleanly into the next section seam.
   ========================================================================== */
function Hero({
  tweaks
}) {
  const sectionRef = useRef(null);
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  // Content lifts and fades as the sequence advances. Text stays fully
  // legible through the first ~60% of the runway, then dissolves in the
  // final third so the frame animation can carry the moment alone.
  // On mobile the painting's final frame cover-crops to a near-black wall, so
  // an early fade left an empty dark stretch before the next section. There we
  // hold the content almost to the very end instead — no empty black gap.
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
  const contentY = useTransform(scrollYProgress, [0, 0.85], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, isMobile ? [0, 0.9, 0.99] : [0, 0.6, 0.82], [1, 1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.25], [0.6, 0]);
  return /*#__PURE__*/React.createElement("section", {
    ref: sectionRef,
    className: "hero",
    "data-header": "dark",
    "data-screen-label": "Hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-sticky"
  }, /*#__PURE__*/React.createElement(HeroScrubVideo, {
    sectionRef: sectionRef
  }), /*#__PURE__*/React.createElement(motion.div, {
    className: "hero-stage container",
    style: {
      y: contentY,
      opacity: contentOpacity
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-content",
    style: {
      width: 982
    }
  }, /*#__PURE__*/React.createElement(RichHeading, {
    text: tweaks.heading,
    delay: 0.75
  }), /*#__PURE__*/React.createElement(motion.p, _extends({
    className: "hero-desc"
  }, motionPresets.fadeUp(1.5, 18, 1.0), {
    style: {
      fontWeight: "400"
    }
  }), tweaks.description)))));
}
function PositioningField({
  sectionRef
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MODE = "lines"; // "lines" = contornos anidados · "fill" = blobs/relieve relleno
    const INK = "#b7ae9f";
    const BALLS = 7,
      LEVELS = 6,
      RADIUS = 14,
      RADIUS_MIN = 8,
      SPEED = 60,
      WEIGHT = 1.4,
      OPACITY = 0.55;
    const MIN_RING = 175; // px: nunca dibujar un contorno cuyo lado mayor sea menor que esto
    const FADE = 50; // px: los anillos se desvanecen en esta banda por encima de MIN_RING
    const LO = 0.32,
      HI = 1.65;
    let W = 0,
      H = 0,
      DPR = 1,
      cols = 0,
      rows = 0,
      cellW = 0,
      cellH = 0;
    let lastW = 0,
      lastH = 0,
      resizeTimer = 0;
    let field = new Float32Array(0);
    const balls = [];
    for (let i = 0; i < BALLS; i++) balls.push({
      bx: Math.random(),
      by: Math.random(),
      ax: 0.12 + Math.random() * 0.22,
      ay: 0.12 + Math.random() * 0.22,
      fx: 0.06 + Math.random() * 0.10,
      fy: 0.06 + Math.random() * 0.10,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      rr: 0.8 + Math.random() * 0.5
    });
    const n = balls.length;
    const cxA = new Float32Array(n),
      cyA = new Float32Array(n),
      r2A = new Float32Array(n);
    function resize() {
      const w = cv.clientWidth,
        h = cv.clientHeight;
      if (!w || !h) return;
      if (w === lastW && Math.abs(h - lastH) < 140) return;
      lastW = w;
      lastH = h;
      W = w;
      H = h;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * DPR);
      cv.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const R = RADIUS / 100 * Math.min(W, H);
      const cell = Math.max(5, Math.min(16, R / 7));
      cols = Math.max(24, Math.min(220, Math.round(W / cell)));
      rows = Math.max(16, Math.round(cols * H / W));
      cellW = W / cols;
      cellH = H / rows;
      field = new Float32Array((cols + 1) * (rows + 1));
    }
    function computeField(t) {
      const R = RADIUS / 100 * Math.min(W, H);
      const Rmin = RADIUS_MIN / 100 * Math.min(W, H); // ninguna bola baja de aquí
      for (let i = 0; i < n; i++) {
        const b = balls[i];
        cxA[i] = (b.bx + b.ax * Math.sin(t * b.fx + b.px)) * W;
        cyA[i] = (b.by + b.ay * Math.cos(t * b.fy + b.py)) * H;
        const ri = Math.max(R * b.rr, Rmin);
        r2A[i] = ri * ri;
      }
      let k = 0;
      for (let gy = 0; gy <= rows; gy++) {
        const y = gy * cellH;
        for (let gx = 0; gx <= cols; gx++, k++) {
          const x = gx * cellW;
          let f = 0;
          for (let i = 0; i < n; i++) {
            const dx = x - cxA[i],
              dy = y - cyA[i];
            f += r2A[i] / (dx * dx + dy * dy + r2A[i]);
          }
          field[k] = f;
        }
      }
    }
    const lerp = (a, b, th) => {
      const d = b - a;
      return Math.abs(d) < 1e-6 ? 0.5 : (th - a) / d;
    };
    function strokeIso(th) {
      const stride = cols + 1;
      ctx.beginPath();
      for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
        const i = gy * stride + gx;
        const tl = field[i],
          tr = field[i + 1],
          br = field[i + 1 + stride],
          bl = field[i + stride];
        let s = 0;
        if (tl > th) s |= 8;
        if (tr > th) s |= 4;
        if (br > th) s |= 2;
        if (bl > th) s |= 1;
        if (s === 0 || s === 15) continue;
        const x0 = gx * cellW,
          y0 = gy * cellH,
          x1 = x0 + cellW,
          y1 = y0 + cellH;
        const top = () => [x0 + lerp(tl, tr, th) * cellW, y0],
          bot = () => [x0 + lerp(bl, br, th) * cellW, y1];
        const lft = () => [x0, y0 + lerp(tl, bl, th) * cellH],
          rgt = () => [x1, y0 + lerp(tr, br, th) * cellH];
        const seg = (a, b) => {
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
        };
        switch (s) {
          case 1:
            seg(lft(), bot());
            break;
          case 2:
            seg(bot(), rgt());
            break;
          case 3:
            seg(lft(), rgt());
            break;
          case 4:
            seg(top(), rgt());
            break;
          case 5:
            seg(top(), lft());
            seg(bot(), rgt());
            break;
          case 6:
            seg(top(), bot());
            break;
          case 7:
            seg(top(), lft());
            break;
          case 8:
            seg(top(), lft());
            break;
          case 9:
            seg(top(), bot());
            break;
          case 10:
            seg(top(), rgt());
            seg(lft(), bot());
            break;
          case 11:
            seg(top(), rgt());
            break;
          case 12:
            seg(lft(), rgt());
            break;
          case 13:
            seg(bot(), rgt());
            break;
          case 14:
            seg(lft(), bot());
            break;
        }
      }
      ctx.stroke();
    }
    function fillIso(th) {
      const stride = cols + 1;
      ctx.beginPath();
      for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
        const i = gy * stride + gx;
        const tl = field[i],
          tr = field[i + 1],
          br = field[i + 1 + stride],
          bl = field[i + stride];
        let s = 0;
        if (tl > th) s |= 8;
        if (tr > th) s |= 4;
        if (br > th) s |= 2;
        if (bl > th) s |= 1;
        if (s === 0) continue;
        const x0 = gx * cellW,
          y0 = gy * cellH,
          x1 = x0 + cellW,
          y1 = y0 + cellH;
        const TL = [x0, y0],
          TR = [x1, y0],
          BR = [x1, y1],
          BL = [x0, y1];
        const top = () => [x0 + lerp(tl, tr, th) * cellW, y0],
          bot = () => [x0 + lerp(bl, br, th) * cellW, y1];
        const lft = () => [x0, y0 + lerp(tl, bl, th) * cellH],
          rgt = () => [x1, y0 + lerp(tr, br, th) * cellH];
        const poly = p => {
          ctx.moveTo(p[0][0], p[0][1]);
          for (let q = 1; q < p.length; q++) ctx.lineTo(p[q][0], p[q][1]);
          ctx.closePath();
        };
        switch (s) {
          case 1:
            poly([lft(), BL, bot()]);
            break;
          case 2:
            poly([bot(), BR, rgt()]);
            break;
          case 3:
            poly([lft(), BL, BR, rgt()]);
            break;
          case 4:
            poly([top(), TR, rgt()]);
            break;
          case 5:
            poly([top(), TR, rgt()]);
            poly([lft(), BL, bot()]);
            break;
          case 6:
            poly([top(), TR, BR, bot()]);
            break;
          case 7:
            poly([top(), TR, BR, BL, lft()]);
            break;
          case 8:
            poly([TL, top(), lft()]);
            break;
          case 9:
            poly([TL, top(), bot(), BL]);
            break;
          case 10:
            poly([TL, top(), lft()]);
            poly([bot(), BR, rgt()]);
            break;
          case 11:
            poly([TL, top(), rgt(), BR, BL]);
            break;
          case 12:
            poly([TL, TR, rgt(), lft()]);
            break;
          case 13:
            poly([TL, TR, rgt(), bot(), BL]);
            break;
          case 14:
            poly([TL, TR, BR, bot(), lft()]);
            break;
          case 15:
            poly([TL, TR, BR, BL]);
            break;
        }
      }
      ctx.fill();
    }
    function traceContours(th) {
      const HBASE = cols * (rows + 1);
      const pts = new Map(),
        adj = new Map();
      const link = (a, b) => {
        if (!adj.has(a)) adj.set(a, []);
        if (!adj.has(b)) adj.set(b, []);
        adj.get(a).push(b);
        adj.get(b).push(a);
      };
      for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
        const i = gy * (cols + 1) + gx;
        const tl = field[i],
          tr = field[i + 1],
          br = field[i + 1 + (cols + 1)],
          bl = field[i + (cols + 1)];
        let s = 0;
        if (tl > th) s |= 8;
        if (tr > th) s |= 4;
        if (br > th) s |= 2;
        if (bl > th) s |= 1;
        if (s === 0 || s === 15) continue;
        const x0 = gx * cellW,
          y0 = gy * cellH,
          x1 = x0 + cellW,
          y1 = y0 + cellH;
        const eTop = gy * cols + gx,
          eBot = (gy + 1) * cols + gx,
          eLft = HBASE + gy * (cols + 1) + gx,
          eRgt = HBASE + gy * (cols + 1) + (gx + 1);
        const sTop = () => {
          if (!pts.has(eTop)) pts.set(eTop, [x0 + lerp(tl, tr, th) * cellW, y0]);
          return eTop;
        };
        const sBot = () => {
          if (!pts.has(eBot)) pts.set(eBot, [x0 + lerp(bl, br, th) * cellW, y1]);
          return eBot;
        };
        const sLft = () => {
          if (!pts.has(eLft)) pts.set(eLft, [x0, y0 + lerp(tl, bl, th) * cellH]);
          return eLft;
        };
        const sRgt = () => {
          if (!pts.has(eRgt)) pts.set(eRgt, [x1, y0 + lerp(tr, br, th) * cellH]);
          return eRgt;
        };
        const L = (a, b) => link(a(), b());
        switch (s) {
          case 1:
            L(sLft, sBot);
            break;
          case 2:
            L(sBot, sRgt);
            break;
          case 3:
            L(sLft, sRgt);
            break;
          case 4:
            L(sTop, sRgt);
            break;
          case 5:
            L(sTop, sLft);
            L(sBot, sRgt);
            break;
          case 6:
            L(sTop, sBot);
            break;
          case 7:
            L(sTop, sLft);
            break;
          case 8:
            L(sTop, sLft);
            break;
          case 9:
            L(sTop, sBot);
            break;
          case 10:
            L(sTop, sRgt);
            L(sLft, sBot);
            break;
          case 11:
            L(sTop, sRgt);
            break;
          case 12:
            L(sLft, sRgt);
            break;
          case 13:
            L(sBot, sRgt);
            break;
          case 14:
            L(sLft, sBot);
            break;
        }
      }
      const visited = new Set(),
        lines = [];
      const walk = (start, closed) => {
        const pl = [];
        let prev = -1,
          cur = start;
        while (cur !== undefined && !visited.has(cur)) {
          visited.add(cur);
          pl.push(pts.get(cur));
          const nb = adj.get(cur) || [];
          let nx;
          for (const e of nb) {
            if (e !== prev && !visited.has(e)) {
              nx = e;
              break;
            }
          }
          prev = cur;
          cur = nx;
        }
        return {
          points: pl,
          closed
        };
      };
      for (const [id, nb] of adj) {
        if (nb.length === 1 && !visited.has(id)) lines.push(walk(id, false));
      }
      for (const [id, nb] of adj) {
        if (!visited.has(id)) lines.push(walk(id, true));
      }
      return lines;
    }
    function chaikin(p, closed, iters) {
      for (let it = 0; it < iters; it++) {
        const N = p.length;
        if (N < 3) break;
        const np = [];
        if (!closed) np.push(p[0]);
        const end = closed ? N : N - 1;
        for (let i = 0; i < end; i++) {
          const a = p[i],
            b = p[(i + 1) % N];
          np.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
          np.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
        }
        if (!closed) np.push(p[N - 1]);
        p = np;
      }
      return p;
    }
    function paint(t) {
      computeField(t);
      ctx.clearRect(0, 0, W, H);
      if (MODE === "fill") {
        ctx.fillStyle = INK;
        for (let l = 0; l < LEVELS; l++) {
          const th = LO + (HI - LO) * (LEVELS === 1 ? 0.5 : l / (LEVELS - 1));
          ctx.globalAlpha = OPACITY * 0.32;
          fillIso(th);
        }
      } else {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = INK;
        ctx.lineWidth = WEIGHT;
        for (let l = 0; l < LEVELS; l++) {
          const th = LO + (HI - LO) * (LEVELS === 1 ? 0.5 : l / (LEVELS - 1));
          const rings = traceContours(th);
          const baseA = OPACITY * (0.7 + 0.3 * (l / Math.max(1, LEVELS - 1)));
          for (const r of rings) {
            let minx = Infinity,
              miny = Infinity,
              maxx = -Infinity,
              maxy = -Infinity;
            for (const pt of r.points) {
              if (pt[0] < minx) minx = pt[0];
              if (pt[0] > maxx) maxx = pt[0];
              if (pt[1] < miny) miny = pt[1];
              if (pt[1] > maxy) maxy = pt[1];
            }
            const size = Math.max(maxx - minx, maxy - miny);
            const fade = (size - MIN_RING) / FADE; // 0 por debajo, sube a 1 por encima
            if (fade <= 0) continue;
            ctx.globalAlpha = baseA * Math.min(1, fade);
            const sm = chaikin(r.points, r.closed, 2);
            ctx.beginPath();
            ctx.moveTo(sm[0][0], sm[0][1]);
            for (let q = 1; q < sm.length; q++) ctx.lineTo(sm[q][0], sm[q][1]);
            if (r.closed) ctx.closePath();
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    let raf = 0,
      visible = true;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (!W || !H) {
        resize();
        if (!W || !H) return;
      }
      paint(ts * 0.001 * (SPEED / 60));
    }
    resize();
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener("resize", onResize);
    let io = null;
    const target = sectionRef && sectionRef.current || cv;
    if ("IntersectionObserver" in window && target) {
      io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        if (visible && (!W || !H)) resize();
      }, {
        threshold: 0
      });
      io.observe(target);
    }
    if (prefersReduced) {
      if (!W || !H) resize();
      if (W && H) paint(0);
    } else {
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (io) io.disconnect();
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "ps-contours",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      display: "block"
    }
  }));
}

/* =============================================================================
   Positioning · Background contours
   -----------------------------------------------------------------------------
   Topographic-style sweeping curves drawn in SVG. Multiple layers drift at
   different speeds (parallax depth), and each layer has its own ultra-slow
   transform loop + opacity breathing. The effect is editorial rather than
   technical — large sweeping arcs, low-contrast warm ink on the cream paper.
   ========================================================================== */
function PositioningContours({
  sectionRef,
  goo = false,
  flow = false
}) {
  const reduced = useReducedMotion?.() ?? false;

  // Scroll-linked parallax across the section
  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Three depth planes. Back is biggest + slowest, front is smaller + faster.
  // Parallax ranges are intentionally small — the motion is atmospheric, not
  // sliding-by. Y values are in user-space units of the SVG viewBox.
  const yBack = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -60, reduced ? 0 : 60]);
  const yMid = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -120, reduced ? 0 : 120]);
  const yFront = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -180, reduced ? 0 : 180]);

  // Each plane carries its own ambient drift loop — multi-keyframe organic
  // trajectory + tiny rotation + gentle scale breathing. Mirror-repeat so the
  // loop never lands on a hard reset. Per-plane delay so they never sync.
  const drift = ({
    dur,
    delay = 0,
    x,
    y,
    rot,
    scale
  }) => ({
    animate: reduced ? {} : {
      x,
      y,
      rotate: rot,
      scale
    },
    transition: reduced ? {} : {
      duration: dur,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
      delay
    }
  });

  // 14 flowing contour lines grouped by depth, sourced from fondolineas.svg.
  const PATHS_BACK = ["M0.459229 437.925C12.8552 433.676 24.9069 427.935 37.6472 425.524C54.2899 422.424 71.3918 421.506 88.3789 420.817C110.301 419.783 132.453 420.817 154.261 419.209C181.693 417.257 207.862 410.483 228.522 390.274C242.755 376.381 251.248 358.814 258.594 340.672C265.596 323.334 272.023 305.767 279.713 288.773C284.878 277.291 292.224 266.843 303.013 259.494C313.113 252.72 323.788 251.686 335.266 255.705C351.564 261.446 363.96 272.928 376.356 284.41C390.244 297.27 403.443 310.934 417.791 323.219C453.831 353.991 494.692 360.421 539.57 346.757C567.116 338.376 592.597 325.401 618.651 313.345C647.92 299.796 677.762 288.773 709.785 283.377C764.534 274.191 820.316 299.452 848.436 347.217C866.456 377.759 873.343 410.712 870.244 445.847C866.801 486.838 855.897 525.877 835.581 561.931C822.267 585.584 803.673 604.185 779.914 616.7C756.614 628.986 732.855 640.238 708.752 650.802C658.938 672.618 608.895 694.089 558.508 714.757C529.354 726.698 498.938 735.195 467.719 739.673C416.184 747.021 369.584 734.85 328.494 702.471C302.898 682.377 282.009 657.691 262.267 632.086C249.068 614.978 235.868 597.87 221.865 581.565C212.453 570.657 200.631 562.16 185.825 559.634C162.41 555.501 144.735 574.561 150.588 597.64C155.065 615.322 165.969 629.215 178.365 641.846C196.729 660.561 216.012 678.359 233.917 697.419C254.577 719.464 271.449 744.151 281.205 773.2C289.354 797.542 285.337 818.899 267.547 837.729C250.674 855.526 230.244 868.616 210.273 882.509C176.987 905.588 143.128 927.978 110.875 952.32C69.3258 983.666 33.1708 1020.75 1.83656 1062.55C1.49223 1063.01 1.03312 1063.35 0.688784 1063.81", "M1919.54 876.538C1894.06 861.382 1876.96 838.877 1865.6 812.124C1855.04 786.978 1846.54 761.029 1836.21 735.769C1812.8 678.129 1770.44 642.649 1709.61 629.904C1684.94 624.737 1660.03 620.719 1635.24 616.241C1594.26 609.007 1568.32 584.665 1555.47 545.741C1548.58 525.073 1542.73 504.061 1536.07 483.279C1519.54 432.643 1484.07 401.756 1434.03 386.37C1396.5 374.774 1358.16 371.214 1319.14 373.281C1283.44 375.118 1248.55 380.744 1214.92 393.145C1186.57 403.593 1160.98 418.405 1141.12 441.943C1121.61 465.137 1110.7 492.12 1107.03 522.088C1103.59 549.3 1106 576.054 1117.47 601.314C1125.97 619.915 1138.59 634.842 1159.71 638.171C1172.11 640.123 1185.31 639.779 1197.82 638.057C1232.25 633.349 1266.34 626 1301.35 627.378C1339 628.871 1374.81 636.794 1406.48 658.495C1428.75 673.766 1443.9 694.778 1455.61 718.66C1471.56 751.269 1481.78 785.83 1486.71 821.769C1489.35 841.174 1491.19 860.923 1491.19 880.557C1491.19 927.059 1474.55 967.361 1442.18 1001.12C1424.05 1020.06 1406.14 1039.12 1388.58 1058.53C1382.96 1064.84 1378.94 1072.65 1374.23 1079.77", "M737.331 1079.77C740.086 1065.42 744.103 1051.07 745.251 1036.6C748.465 998.133 736.987 963.458 715.753 931.652C693.486 898.24 662.726 874.931 627.489 856.904C615.782 850.934 603.845 845.193 592.597 838.418C587.547 835.433 582.956 830.725 579.971 825.673C574.692 816.487 578.135 807.532 583.644 799.379C593.859 784.223 608.092 773.085 622.669 762.637C656.758 738.295 693.946 719.694 733.314 705.686C768.321 693.17 803.902 682.148 839.369 671.01C870.244 661.25 899.053 648.391 920.976 623.36C938.881 603.037 951.851 579.843 961.722 554.812C975.38 520.021 982.611 484.083 980.43 446.766C977.676 399.23 962.181 355.713 936.471 315.871C906.973 270.287 868.407 234.463 820.545 208.973C782.095 188.535 741.004 179.235 697.389 182.22C669.727 184.172 643.558 192.209 617.733 202.199C598.795 209.547 579.397 215.518 558.967 216.551C513.63 218.733 479.311 198.869 454.519 161.897C438.565 138.129 430.646 111.376 427.317 83.13C423.989 55.2286 426.399 27.9014 433.286 0.688965", "M1919.54 148.577C1887.75 154.318 1856.3 161.208 1825.77 172.116C1790.76 184.631 1758.51 203.002 1726.14 220.914C1692.4 239.63 1658.08 257.083 1620.43 267.187C1588.75 275.569 1556.61 281.539 1523.9 281.654C1475.12 281.884 1426.46 280.621 1377.68 279.932C1355.52 279.587 1333.37 279.013 1311.1 278.324C1274.61 277.176 1238.11 276.372 1201.95 270.631C1151.79 262.594 1106.57 242.96 1067.43 210.81C1030.47 180.498 994.778 148.692 958.967 117.117C920.287 82.7854 881.951 48.2245 843.615 13.7784C838.91 9.64486 834.778 4.93722 830.301 0.459229", "M966.887 0.459229C1011.99 62.2326 1067.09 111.605 1139.97 138.358C1169.81 149.381 1200.92 153.974 1232.6 155.122C1268.18 156.385 1303.64 153.515 1339 149.955C1408.55 142.951 1478.11 135.947 1547.78 128.943C1585.77 125.154 1623.87 122.169 1661.29 113.787C1713.97 102.075 1757.47 74.8628 1793.97 35.7091C1804.53 24.4567 1814.18 12.2857 1824.16 0.459229"];
  const PATHS_MID = ["M794.72 1079.77C798.967 1063.58 804.247 1047.51 807.116 1030.97C812.855 998.248 809.297 965.639 800.803 933.833C795.294 913.166 787.834 893.072 781.291 872.749C776.585 857.937 772.224 843.125 773.716 827.28C776.011 802.364 789.211 784.567 809.986 772.052C829.842 759.996 851.994 755.058 874.835 752.532C924.189 747.136 972.511 753.91 1020.26 765.737C1056.76 774.807 1079.02 798.92 1090.04 834.284C1100.26 866.893 1100.83 900.191 1097.27 933.719C1094.06 964.72 1089.47 995.607 1087.63 1026.61C1086.6 1044.18 1089.7 1061.97 1090.96 1079.77", "M1919.54 1016.62C1916.67 1013.63 1913.69 1010.76 1910.93 1007.66C1891.99 986.077 1868.01 971.839 1842.53 959.439C1827.26 951.975 1812.22 943.938 1798.22 934.408C1778.36 920.859 1764.94 901.454 1754.26 880.098C1745.31 862.186 1737.16 843.815 1727.75 826.132C1723.73 818.439 1718.11 811.321 1712.02 805.12C1688.72 781.467 1656.7 780.893 1631.91 803.168C1612.97 820.162 1604.02 842.322 1600.8 866.664C1598.85 881.591 1598.62 896.747 1598.97 911.788C1599.66 948.875 1598.05 985.618 1585.42 1020.98C1578.54 1040.5 1568.55 1058.18 1555.93 1074.49C1554.66 1076.1 1553.51 1077.93 1552.25 1079.54", "M1919.54 707.753C1910.24 696.959 1899.8 686.97 1891.76 675.373C1883.16 662.858 1876.5 648.965 1869.27 635.531C1848.49 596.147 1816.47 570.887 1773.89 558.601C1766.77 556.534 1759.77 553.779 1753.11 550.564C1727.17 538.393 1714.55 517.151 1713.06 489.135C1711.22 456.066 1723.96 427.935 1744.05 402.675C1770.9 368.918 1806.37 347.446 1846.2 332.405C1867.66 324.253 1889.81 318.512 1912.65 315.526C1914.95 315.182 1917.25 315.297 1919.43 315.182", "M994.433 1079.77C995.351 1064.15 996.614 1048.54 997.303 1032.81C998.91 997.444 999.598 962.08 989.842 927.519C985.71 912.707 979.397 898.814 969.412 886.872C961.377 877.227 951.621 869.994 939.569 866.319C916.27 859.201 894.577 872.06 886.542 897.436C881.951 911.903 881.836 926.715 881.951 941.756C882.41 976.317 882.984 1010.99 882.869 1045.55C882.869 1056.92 880.803 1068.4 879.656 1079.77", "M0.459229 566.523C13.1995 582.943 25.1364 600.166 39.0245 615.552C59.2254 638.056 80.8036 659.183 101.808 680.884C115.926 695.467 129.699 710.278 140.373 727.731C158.164 756.896 157.245 786.06 140.373 815.224C126.37 839.451 107.202 859.086 86.1981 877.112C58.7663 900.651 30.7605 923.385 2.86956 946.464C2.18089 947.038 1.26267 947.382 0.459229 947.727"];
  const PATHS_FRONT = ["M0.459229 315.067C44.3043 317.249 87.0016 311.508 128.436 296.925C164.247 284.18 187.891 258.575 202.353 224.014C213.027 198.639 218.996 172.23 221.98 145.018C225.653 111.49 227.948 77.6185 240.459 45.8133C246.657 30.3125 254.806 15.6155 262.152 0.459229", "M386.112 1079.77C416.528 1020.18 462.209 979.073 528.78 964.491C564.361 956.683 598.221 961.965 627.145 985.618C656.298 1009.62 665.94 1040.73 657.561 1077.47C657.446 1078.16 657.217 1078.97 657.102 1079.77", "M110.646 0.459229C101.004 24.227 89.2971 46.7318 73.6873 67.2847C55.0934 91.7414 32.7117 111.376 3.21389 121.595C2.29567 121.939 1.37745 121.939 0.459229 122.054", "M471.277 617.044C477.245 616.356 488.723 615.667 499.971 613.829C540.258 607.17 578.02 592.932 614.175 574.216C648.838 556.304 681.09 534.948 707.948 506.243C718.967 494.416 728.608 481.786 734.232 466.285C742.496 443.436 733.199 424.72 710.014 418.061C693.486 413.238 676.729 414.272 659.971 416.568C630.129 420.702 601.779 430.806 573.544 440.68C528.78 456.296 483.328 460.889 436.499 451.933C418.479 448.488 400.459 445.388 382.209 443.206C356.04 440.106 336.987 455.148 332.166 480.982C326.657 510.147 334.806 536.096 351.334 559.519C379.11 599.018 418.135 616.815 471.277 617.044Z"];

  // Per-plane stroke styles (warm ink, near-paper opacity).
  const STROKE = "#C4BCB1";
  const ALL_PATHS = [...PATHS_BACK, ...PATHS_MID, ...PATHS_FRONT];
  const mkPlanes = () => /*#__PURE__*/React.createElement(motion.g, _extends({
    style: {
      y: yMid
    }
  }, drift({
    dur: 60,
    x: [0, 14, -10, 12, 0],
    y: [0, -8, 11, -7, 0],
    rot: [0, 0.12, -0.08, 0.1, 0],
    scale: [1, 1.006, 0.997, 1.006, 1]
  })), ALL_PATHS.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: `p-${i}`,
    d: d,
    fill: "none",
    stroke: STROKE,
    strokeMiterlimit: "10",
    strokeWidth: goo ? 10 : flow ? 1.6 : 1.5,
    strokeOpacity: goo ? 1 : flow ? 0.6 : 0.08,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: goo || flow ? undefined : "non-scaling-stroke"
  })));
  return /*#__PURE__*/React.createElement("div", {
    className: "ps-contours",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(motion.svg, {
    className: "ps-contours-svg",
    viewBox: flow ? "240 0 1300 1080" : "0 0 1920 1080",
    preserveAspectRatio: "xMidYMid slice",
    xmlns: "http://www.w3.org/2000/svg",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    transition: {
      duration: 2.4,
      ease: EASE_CINE
    }
  }, goo && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "ps-goo",
    x: "-15%",
    y: "-15%",
    width: "130%",
    height: "130%",
    colorInterpolationFilters: "sRGB"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: "5",
    result: "b"
  }), /*#__PURE__*/React.createElement("feColorMatrix", {
    in: "b",
    type: "matrix",
    values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"
  }))), flow && /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: "ps-flow",
    x: "-25%",
    y: "-25%",
    width: "150%",
    height: "150%",
    colorInterpolationFilters: "sRGB"
  }, /*#__PURE__*/React.createElement("feTurbulence", {
    type: "fractalNoise",
    baseFrequency: "0.0022 0.0032",
    numOctaves: "1",
    seed: "7",
    result: "noise"
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "baseFrequency",
    dur: "22s",
    repeatCount: "indefinite",
    calcMode: "spline",
    keyTimes: "0;0.5;1",
    keySplines: "0.45 0 0.55 1;0.45 0 0.55 1",
    values: "0.0022 0.0032;0.0030 0.0042;0.0022 0.0032"
  })), /*#__PURE__*/React.createElement("feDisplacementMap", {
    in: "SourceGraphic",
    in2: "noise",
    scale: "22",
    xChannelSelector: "R",
    yChannelSelector: "G"
  }))), /*#__PURE__*/React.createElement("g", {
    filter: goo ? "url(#ps-goo)" : undefined
  }, /*#__PURE__*/React.createElement("g", {
    filter: flow ? "url(#ps-flow)" : undefined
  }, mkPlanes()))));
}

/* =============================================================================
   SectionTransition — cinematic seam between dark and cream sections.
   -----------------------------------------------------------------------------
   Lives at the top of a section. As the section enters the viewport, it plays:
     1. A dark gradient bleed that fades into the section (sensation of the
        prior dark surface casting a shadow onto this cream paper).
     2. A 1px hairline that draws horizontally outward from centre.
     3. A small chapter label that lifts in beneath the hairline.
     4. A warm flare pulse along the seam.
   The host section also clip-path reveals its top edge to amplify the unveil.
   ========================================================================== */
function SectionTransition({
  inView,
  chapter = "§",
  label = "Positioning"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sx",
    "aria-hidden": "false"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "sx-line",
    initial: {
      scaleX: 0
    },
    animate: inView ? {
      scaleX: 1
    } : {},
    transition: {
      duration: 1.6,
      ease: EASE_CINE
    }
  }), /*#__PURE__*/React.createElement(motion.div, {
    className: "sx-flare",
    initial: {
      opacity: 0
    },
    animate: inView ? {
      opacity: [0, 0.55, 0]
    } : {},
    transition: {
      duration: 2.4,
      delay: 0.15,
      ease: EASE_CINE
    }
  }));
}

/* =============================================================================
   Positioning Section — first editorial beat after the hero.
   -----------------------------------------------------------------------------
   Cream paper surface. Large italic Cormorant statement with a single muted
   accent phrase, followed by a small sans-serif paragraph. Words slide & fade
   on enter. Subtle scroll-linked drift sustains the cinematic pace.
   ========================================================================== */
function PositioningSection({
  headSentence = "Ulltra designs, builds and operates AI-based systems that automate and transform business processes.",
  headTail = "It is the ",
  headAccent = "operating layer.",
  body = "These systems are developed on controlled, sovereign infrastructure — ensuring full ownership of data, compliance with European regulation, and independence from external vendors."
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-15% 0px -15% 0px"
  });

  // Scroll-linked drift across the section's own progress
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const driftY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  // Cinematic clip-path unveil for the top edge of the section. Animates
  // from a top-clipped state to fully revealed when the section enters view.
  // Combined with the SectionTransition seam, the cream paper feels like it
  // rises into place over the dark hero above.
  const clipPath = inView ? "inset(0% 0% 0% 0%)" : "inset(14% 0% 0% 0%)";

  // Split into ordered token groups — the <br/> between groups forces the
  // line that begins "It is the …" onto a fresh row regardless of width.
  const sentenceWords = useMemo(() => headSentence.split(/(\s+)/), [headSentence]);
  const tailWords = useMemo(() => headTail.split(/(\s+)/), [headTail]);
  const accentWords = useMemo(() => headAccent.split(/(\s+)/), [headAccent]);
  let i = 0;
  const renderWord = (w, k, prefix, extraCls) => {
    if (/^\s+$/.test(w)) return /*#__PURE__*/React.createElement("span", {
      key: `${prefix}s-${k}`
    }, " ");
    const idx = i++;
    return /*#__PURE__*/React.createElement("span", {
      key: `${prefix}w-${k}`,
      className: "ps-word"
    }, /*#__PURE__*/React.createElement(motion.span, {
      className: extraCls,
      initial: {
        y: "110%",
        opacity: 0
      },
      animate: inView ? {
        y: "0%",
        opacity: 1
      } : {},
      transition: {
        duration: 1.0,
        delay: 0.15 + idx * 0.04,
        ease: EASE_CINE
      }
    }, w));
  };
  return /*#__PURE__*/React.createElement(motion.section, {
    ref: ref,
    id: "positioning",
    className: "ps",
    "data-header": "light",
    "data-screen-label": "Positioning",
    "aria-label": "Positioning",
    style: {
      clipPath,
      WebkitClipPath: clipPath,
      transition: "clip-path 1.4s var(--ease-out-cine), -webkit-clip-path 1.4s var(--ease-out-cine)",
      backgroundColor: "rgb(244, 240, 229)"
    }
  }, /*#__PURE__*/React.createElement(SectionTransition, {
    inView: inView,
    chapter: "\xA7 02",
    label: "Positioning"
  }), /*#__PURE__*/React.createElement(PositioningField, {
    sectionRef: ref
  }), /*#__PURE__*/React.createElement("div", {
    className: "ps-inner container"
  }, /*#__PURE__*/React.createElement(motion.h3, {
    className: "ps-eyebrow",
    initial: {
      opacity: 0,
      y: 18
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 0.9,
      ease: EASE_CINE
    },
    style: {
      fontSize: "80px",
      letterSpacing: "-2.3px"
    }
  }, "Positioning"), /*#__PURE__*/React.createElement(motion.h2, {
    className: "ps-head",
    style: {
      y: driftY,
      lineHeight: "0.9",
      fontWeight: "800",
      padding: "0px"
    }
  }, sentenceWords.map((w, k) => renderWord(w, k, "h", "")), /*#__PURE__*/React.createElement("br", null), tailWords.map((w, k) => renderWord(w, k, "t", "")), accentWords.map((w, k) => renderWord(w, k, "a", "ps-accent"))), /*#__PURE__*/React.createElement(motion.p, {
    className: "ps-body",
    initial: {
      opacity: 0,
      y: 16
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 1.1,
      delay: 0.55 + i * 0.015,
      ease: EASE_CINE
    },
    style: {
      padding: "0px"
    }
  }, body)));
}

/* —— Reveal text ————————————————————————————————————————————————————————
   Per-character reveal — lift + settle, transform & opacity ONLY (no filter
   blur). Used for the "Consultancy" wordmark.                            */
function BlurRevealText({
  text,
  inView,
  baseDelay = 0.15,
  stagger = 0.05
}) {
  const chars = Array.from(text);
  return /*#__PURE__*/React.createElement("span", {
    className: "cs-word-blur",
    "aria-label": text
  }, chars.map((ch, i) => /*#__PURE__*/React.createElement(motion.span, {
    key: i,
    className: "cs-word-blur-char",
    "aria-hidden": "true",
    initial: {
      opacity: 0,
      y: "0.5em"
    },
    animate: inView ? {
      opacity: 1,
      y: "0em"
    } : {},
    transition: {
      duration: 0.9,
      delay: baseDelay + i * stagger,
      ease: EASE_CINE
    }
  }, ch === " " ? "\u00A0" : ch)));
}

/* =============================================================================
   Consultancy Section — editorial cream beat with twin statues facing each
   other and the wordmark between them. Reuses the same animated contour
   background as Positioning for visual continuity.
   ----------------------------------------------------------------------------
   Scroll-pinned 3-phase timeline (300vh runway, sticky inner):
     · Phase 1 (0   → 0.20)  — Wordmark blur-reveals
     · Phase 2 (0.18 → 0.42) — Statues slide in from the sides
     · Phase 3 (0.50 → 0.85) — Statues pixel-dissolve · cards fade up
   ========================================================================== */
/* —— Consultancy · mobile static composition ————————————————————————————
   On narrow screens the desktop pinned scroll timeline is replaced by a
   sticky, scroll-driven storytelling sequence: an intro where the twin statues
   dominate the viewport (with the "Consultancy" wordmark overlaid), then the
   three service cards presented strictly one-at-a-time. The outer <section> is
   the tall (380vh) scroll runway; this stage is sticky inside it. */

/* Single storytelling card — reuses the desktop .cs-card visual frame, but
   renders its content statically (visibility is driven by the parent wrapper's
   scroll-mapped opacity/transform, not by inView). */
function ConsultancyStoryCard({
  card
}) {
  const cardPath = "M 18 0 H 382 A 18 18 0 0 1 400 18 V 288 A 22 22 0 0 1 378 310 " + "H 338 A 22 22 0 0 0 316 332 V 342 A 18 18 0 0 1 298 360 H 18 " + "A 18 18 0 0 1 0 342 V 18 A 18 18 0 0 1 18 0 Z";
  const clipId = `csm-clip-${card.n}`;
  return /*#__PURE__*/React.createElement("article", {
    className: "cs-card csm-card"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "cs-card-frame",
    viewBox: "0 0 400 360",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
    id: clipId,
    clipPathUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("path", {
    d: cardPath
  }))), /*#__PURE__*/React.createElement("g", {
    clipPath: `url(#${clipId})`
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "400",
    height: "76",
    fill: "#0E0B08"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "76",
    width: "400",
    height: "284",
    fill: "#FFFCF0"
  })), /*#__PURE__*/React.createElement("path", {
    d: cardPath,
    fill: "none",
    stroke: "#0E0B08",
    strokeWidth: "3",
    vectorEffect: "non-scaling-stroke"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cs-card-head"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "cs-card-title"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cs-card-title-wrap"
  }, /*#__PURE__*/React.createElement("span", null, card.title)))), /*#__PURE__*/React.createElement("div", {
    className: "cs-card-body"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "cs-card-list"
  }, card.items.map(item => /*#__PURE__*/React.createElement("li", {
    key: item
  }, item))), /*#__PURE__*/React.createElement("span", {
    className: "cs-card-code",
    "aria-hidden": "true"
  }, "C \u2014 ", card.n)));
}
function ConsultancyMobile({
  sectionRef
}) {
  const progress = useMotionValue(0);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      const p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
      progress.set(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionRef, progress]);
  const scrollYProgress = progress;

  // Título: aparece primero y SE QUEDA toda la sección
  const wordOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const wordY = useTransform(scrollYProgress, [0, 0.05], [-24, 0]);

  // Caras: entran desde los lados, descansan a cada lado con hueco, y salen
  const csEnterEase = FM.cubicBezier(0.22, 1, 0.36, 1); // desacelera al llegar
  const csExitEase = FM.cubicBezier(0.64, 0, 0.78, 0); // acelera al salir
  const csHoldEase = v => v; // sin movimiento en la pausa
  const figLeftX = useTransform(scrollYProgress, [0.08, 0.18, 0.30, 0.40], ["-130%", "0%", "0%", "-130%"], {
    ease: [csEnterEase, csHoldEase, csExitEase]
  });
  const figRightX = useTransform(scrollYProgress, [0.08, 0.18, 0.30, 0.40], ["130%", "0%", "0%", "130%"], {
    ease: [csEnterEase, csHoldEase, csExitEase]
  });
  const figuresOpacity = useTransform(scrollYProgress, [0.06, 0.11, 0.34, 0.42], [0, 1, 1, 0]);

  // Cards: secuenciales, empiezan cuando las caras ya se han ido (~0.42)
  const c1o = useTransform(scrollYProgress, [0.42, 0.50, 0.56, 0.61], [0, 1, 1, 0]);
  const c1y = useTransform(scrollYProgress, [0.42, 0.50, 0.56, 0.61], [46, 0, 0, -46]);
  const c1s = useTransform(scrollYProgress, [0.42, 0.50, 0.56, 0.61], [0.96, 1, 1, 0.96]);
  const c2o = useTransform(scrollYProgress, [0.63, 0.71, 0.77, 0.82], [0, 1, 1, 0]);
  const c2y = useTransform(scrollYProgress, [0.63, 0.71, 0.77, 0.82], [46, 0, 0, -46]);
  const c2s = useTransform(scrollYProgress, [0.63, 0.71, 0.77, 0.82], [0.96, 1, 1, 0.96]);
  const c3o = useTransform(scrollYProgress, [0.84, 0.92, 1], [0, 1, 1]);
  const c3y = useTransform(scrollYProgress, [0.84, 0.92], [46, 0]);
  const c3s = useTransform(scrollYProgress, [0.84, 0.92], [0.96, 1]);
  const cardMotion = [{
    o: c1o,
    y: c1y,
    s: c1s
  }, {
    o: c2o,
    y: c2y,
    s: c2s
  }, {
    o: c3o,
    y: c3y,
    s: c3s
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "csm-stage"
  }, /*#__PURE__*/React.createElement(PositioningField, {
    sectionRef: sectionRef
  }), /*#__PURE__*/React.createElement(motion.h2, {
    className: "cs-word csm-word",
    style: {
      opacity: wordOpacity,
      y: wordY
    }
  }, "Consultancy"), /*#__PURE__*/React.createElement(motion.div, {
    className: "csm-figures",
    style: {
      opacity: figuresOpacity
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(motion.img, {
    className: "csm-fig csm-fig--l",
    src: window.__asset("assets/consultancy-left.webp", "consultLeft"),
    alt: "",
    style: {
      x: figLeftX
    }
  }), /*#__PURE__*/React.createElement(motion.img, {
    className: "csm-fig csm-fig--r",
    src: window.__asset("assets/consultancy-right.webp", "consultRight"),
    alt: "",
    style: {
      x: figRightX
    }
  })), CONSULTANCY_CARDS.map((card, i) => /*#__PURE__*/React.createElement(motion.div, {
    key: card.n,
    className: "csm-card-slot",
    style: {
      opacity: cardMotion[i].o,
      y: cardMotion[i].y,
      scale: cardMotion[i].s
    }
  }, /*#__PURE__*/React.createElement(ConsultancyStoryCard, {
    card: card
  }))));
}
function ConsultancySection() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-15% 0px -15% 0px"
  });
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });
  // Smoothed progress for the scroll-driven sculpture beats (premium glide).
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35
  });

  /* Clearly-separated 4-beat order, all scroll-driven, with generous gaps so the
     sequence reads unambiguously (runway ≈ 1594px, so 0.1 ≈ 160px of scroll):
       Beat 1 (0.04 → 0.20) — the two figures slide in + fade to full.
       Beat 2 (0.20 → 0.32) — figures HOLD alone (figures-only beat, no text yet).
       Beat 3 (0.34 → ...)  — the "Consultancy" wordmark blur-reveals; figures STAY.
       Beat 4 (0.56 → 0.80) — figures pixel-dissolve + fade out while the cards
                               rise below the title. */

  // Beat 1+2 — figures fade in early and HOLD full through 0.54, then fade out in beat 4.
  const csGlide = FM.cubicBezier(0.65, 0, 0.35, 1); // accel + decel suave
  const csHold = v => v; // identidad para la pausa
  const statueOpacity = useTransform(smoothProgress, [0.04, 0.20, 0.54, 0.70], [0, 1, 1, 0], {
    ease: [csGlide, csHold, csGlide]
  });
  const leftX = useTransform(smoothProgress, [0.04, 0.20], [-140, 0], {
    ease: csGlide
  });
  const rightX = useTransform(smoothProgress, [0.04, 0.20], [140, 0], {
    ease: csGlide
  });
  const statueScale = useTransform(smoothProgress, [0.04, 0.20], [0.94, 1], {
    ease: csGlide
  });

  // Beat 4 — figures pixel-dissolve away (starts well after the text has landed).
  const dissolveProgress = useTransform(smoothProgress, [0.56, 0.80], [0, 1], {
    ease: csGlide
  });

  // Beat 4 — cards rise below the title as the figures dissolve.
  const cardsOpacity = useTransform(smoothProgress, [0.58, 0.82], [0, 1], {
    ease: csGlide
  });
  const cardsY = useTransform(smoothProgress, [0.58, 0.82], [80, 0], {
    ease: csGlide
  });

  // Soft wordmark drift across the whole timeline
  const wordY = useTransform(smoothProgress, [0, 1], [10, -50]);

  // Scroll-gated reveal flags: text appears in beat 3 (after the figures-only
  // hold), cards stagger in during beat 4 — never on first sight of the section.
  const [wordIn, setWordIn] = useState(false);
  const [cardsIn, setCardsIn] = useState(false);
  useEffect(() => {
    const check = v => {
      if (v >= 0.34) setWordIn(true);
      if (v >= 0.60) setCardsIn(true);
    };
    check(scrollYProgress.get());
    const unsub = scrollYProgress.on("change", check);
    return () => unsub && unsub();
  }, [scrollYProgress]);

  // Mobile switches to a static, flowing composition (headline → statues →
  // cards) instead of the desktop pinned scroll timeline — the scroll-driven
  // opacity/dissolve would otherwise hide everything on a short screen.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setIsMobile(mq.matches);
    on();
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on);
    };
  }, []);
  if (isMobile) {
    return /*#__PURE__*/React.createElement("section", {
      ref: ref,
      id: "consultancy",
      className: "cs cs--mobile-story",
      "data-header": "light",
      "data-screen-label": "Consultancy",
      "aria-label": "Consultancy",
      style: {
        backgroundColor: "rgb(242, 235, 212)"
      }
    }, /*#__PURE__*/React.createElement(ConsultancyMobile, {
      sectionRef: ref
    }));
  }
  return /*#__PURE__*/React.createElement(motion.section, {
    ref: ref,
    id: "consultancy",
    className: "cs",
    "data-header": "light",
    "data-screen-label": "Consultancy",
    "aria-label": "Consultancy",
    style: {
      backgroundColor: "rgb(242, 235, 212)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cs-sticky"
  }, /*#__PURE__*/React.createElement(PositioningField, {
    sectionRef: ref
  }), /*#__PURE__*/React.createElement(motion.div, {
    className: "cs-figure cs-figure--left",
    style: {
      opacity: statueOpacity,
      x: leftX,
      scale: statueScale
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(window.PixelDissolve, {
    src: window.__asset("assets/consultancy-left.webp", "consultLeft"),
    progress: dissolveProgress,
    direction: "top"
  })), /*#__PURE__*/React.createElement(motion.div, {
    className: "cs-figure cs-figure--right",
    style: {
      opacity: statueOpacity,
      x: rightX,
      scale: statueScale
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(window.PixelDissolve, {
    src: window.__asset("assets/consultancy-right.webp", "consultRight"),
    progress: dissolveProgress,
    direction: "top"
  })), /*#__PURE__*/React.createElement(motion.h2, {
    className: "cs-word",
    style: {
      y: wordY
    },
    "aria-label": "Consultancy"
  }, /*#__PURE__*/React.createElement(BlurRevealText, {
    text: "Consultancy",
    inView: wordIn
  })), /*#__PURE__*/React.createElement(motion.div, {
    className: "cs-cards-wrap",
    style: {
      opacity: cardsOpacity,
      y: cardsY
    }
  }, /*#__PURE__*/React.createElement(ConsultancyCards, {
    inView: cardsIn
  }))));
}

/* —— Consultancy cards data + component ———————————————————————————————— */
const CONSULTANCY_CARDS = [{
  n: "01",
  title: "AI & Innovation",
  items: ["AI maturity & opportunity mapping", "Data audits and readiness", "Prototyping & product framing", "Transformation roadmaps"]
}, {
  n: "02",
  title: "Data Architecture & Platforms",
  items: ["Lakehouse / Data Mesh", "Governance & lineage", "Pipelines and integrations", "Data Strategy Implementation"]
}, {
  n: "03",
  title: "AI System & Applications",
  items: ["ML & LLM development", "Model architecture & fine-tuning", "Application development", "MLOps & lifecycle"]
}];
function ConsultancyCards({
  inView
}) {
  // Shared path for the outer card outline — rounded top corners,
  // notched bottom-right, rounded bottom-left. viewBox 400×360.
  const cardPath = "M 18 0 H 382 A 18 18 0 0 1 400 18 V 288 A 22 22 0 0 1 378 310 " + "H 338 A 22 22 0 0 0 316 332 V 342 A 18 18 0 0 1 298 360 H 18 " + "A 18 18 0 0 1 0 342 V 18 A 18 18 0 0 1 18 0 Z";
  return /*#__PURE__*/React.createElement("div", {
    className: "cs-cards",
    "aria-label": "Consultancy services"
  }, CONSULTANCY_CARDS.map((card, idx) => {
    const baseDelay = 0.15 + idx * 0.08;
    const clipId = `cs-clip-${idx}`;
    return /*#__PURE__*/React.createElement(motion.article, {
      key: card.n,
      className: "cs-card",
      initial: {
        opacity: 0,
        y: 60
      },
      animate: inView ? {
        opacity: 1,
        y: 0
      } : {},
      transition: {
        duration: 1.3,
        delay: baseDelay,
        ease: EASE_CINE
      }
    }, /*#__PURE__*/React.createElement("svg", {
      className: "cs-card-frame",
      viewBox: "0 0 400 360",
      preserveAspectRatio: "none",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("clipPath", {
      id: clipId,
      clipPathUnits: "userSpaceOnUse"
    }, /*#__PURE__*/React.createElement("path", {
      d: cardPath
    }))), /*#__PURE__*/React.createElement("g", {
      clipPath: `url(#${clipId})`
    }, /*#__PURE__*/React.createElement("rect", {
      x: "0",
      y: "0",
      width: "400",
      height: "76",
      fill: "#0E0B08"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "0",
      y: "76",
      width: "400",
      height: "284",
      fill: "#FFFCF0"
    })), /*#__PURE__*/React.createElement("path", {
      d: cardPath,
      fill: "none",
      stroke: "#0E0B08",
      strokeWidth: "3",
      vectorEffect: "non-scaling-stroke"
    })), /*#__PURE__*/React.createElement("div", {
      className: "cs-card-head"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "cs-card-title"
    }, /*#__PURE__*/React.createElement("span", {
      className: "cs-card-title-wrap"
    }, /*#__PURE__*/React.createElement(motion.span, {
      initial: {
        y: "108%"
      },
      animate: inView ? {
        y: "0%"
      } : {},
      transition: {
        duration: 1.3,
        delay: baseDelay + 0.12,
        ease: EASE_CINE
      }
    }, card.title)))), /*#__PURE__*/React.createElement("div", {
      className: "cs-card-body"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "cs-card-list"
    }, card.items.map((item, i) => /*#__PURE__*/React.createElement(motion.li, {
      key: item,
      initial: {
        opacity: 0,
        y: 14
      },
      animate: inView ? {
        opacity: 1,
        y: 0
      } : {},
      transition: {
        duration: 0.9,
        delay: baseDelay + 0.35 + i * 0.07,
        ease: EASE_CINE
      }
    }, item))), /*#__PURE__*/React.createElement(motion.span, {
      className: "cs-card-code",
      initial: {
        opacity: 0
      },
      animate: inView ? {
        opacity: 1
      } : {},
      transition: {
        duration: 0.9,
        delay: baseDelay + 0.75,
        ease: EASE_CINE
      },
      "aria-hidden": "true"
    }, "C \u2014 ", card.n)));
  }));
}

/* =============================================================================
   Approach Section
   -----------------------------------------------------------------------------
   Layers (back → front):
     0  Painting (parallax — slow vertical translate)
     1  Atmospheric gradient veil
     2  Massive "Software" wordmark (faster reveal)
     3  Card row (highest stagger, hover-lifting glass panels)
   ========================================================================== */
/* Shared icon set for every Software card (icons recoloured per card via
   --ac-icon). Order is row-major across the 2-column grid. */
const CARD_ICONS = [{
  icon: "agent-orchestration",
  label: "Agent Orchestration"
}, {
  icon: "guardrails",
  label: "Guardrails"
}, {
  icon: "multimodel",
  label: "Multi-model"
}, {
  icon: "puzzle",
  label: "Integrations"
}, {
  icon: "user",
  label: "Human-in-the-loop"
}, {
  icon: "lens",
  label: "Audit & observability"
}, {
  icon: "locker",
  label: "Secure execution"
}, {
  icon: "governance",
  label: "Governance"
}];

/* DataSpaces (card 2) capability set */
const CARD2_ICONS = [{
  icon: "database",
  label: "Domain-bound data"
}, {
  icon: "governance-contracts",
  label: "Governance & contracts"
}, {
  icon: "multimodel",
  label: "Semantic layer"
}, {
  icon: "ai-stores",
  label: "AI ready stores"
}, {
  icon: "agent-orchestration",
  label: "Lineage & policy"
}, {
  icon: "interop",
  label: "Interop (Gaia-X / IDS)"
}, {
  icon: "locker",
  label: "PLL Isolation"
}, {
  icon: "client",
  label: "Client infrastructure"
}];

/* Portal (card 3) capability set */
const CARD3_ICONS = [{
  icon: "guardrails",
  label: "Unified gateway"
}, {
  icon: "output",
  label: "Output validation"
}, {
  icon: "agent-orchestration",
  label: "Routing & latency"
}, {
  icon: "cost",
  label: "Cost optimisation"
}, {
  icon: "compliance",
  label: "Compliance"
}, {
  icon: "ai-stores",
  label: "Smart model selection"
}, {
  icon: "governance",
  label: "Governance & audit"
}, {
  icon: "production",
  label: "Production-grade"
}];
const APPROACH_CARDS = [{
  title: "AOS",
  bg: "assets/card-1-bg.webp",
  bgId: "card1bg",
  ink: "#1a1612",
  sub: "#5a5446",
  accent: "#2c2620",
  groups: [{
    label: "Capabilities",
    items: [{
      icon: "agent-orchestration",
      label: "Agent Orchestration"
    }, {
      icon: "guardrails",
      label: "Guardrails"
    }, {
      icon: "multimodel",
      label: "Multi-model"
    }, {
      icon: "puzzle",
      label: "Integrations"
    }, {
      icon: "user",
      label: "Human-in-the-loop"
    }, {
      icon: "lens",
      label: "Audit & observability"
    }, {
      icon: "locker",
      label: "Secure execution"
    }, {
      icon: "governance",
      label: "Governance"
    }]
  }]
}, {
  title: "DataSpaces",
  solid: "#D2FF00",
  ink: "#070902",
  sub: "rgba(7,9,2,.66)",
  accent: "#596C01",
  groups: [{
    label: "Capabilities",
    items: [{
      icon: "database",
      label: "Domain-bound data"
    }, {
      icon: "governance-contracts",
      label: "Governance & contracts"
    }, {
      icon: "multimodel",
      label: "Semantic layer"
    }, {
      icon: "ai-stores",
      label: "AI ready stores"
    }, {
      icon: "agent-orchestration",
      label: "Lineage & policy"
    }, {
      icon: "interop",
      label: "Interop (Gaia-X / IDS)"
    }, {
      icon: "locker",
      label: "PLL Isolation"
    }, {
      icon: "client",
      label: "Client infrastructure"
    }]
  }]
}, {
  title: "Portal",
  solid: "#2F3A0A",
  ink: "#F1EEDC",
  sub: "rgba(241,238,220,.72)",
  accent: "#CBE84A",
  groups: [{
    label: "Capabilities",
    items: [{
      icon: "guardrails",
      label: "Unified gateway"
    }, {
      icon: "output",
      label: "Output validation"
    }, {
      icon: "agent-orchestration",
      label: "Routing & latency"
    }, {
      icon: "cost",
      label: "Cost optimisation"
    }, {
      icon: "compliance",
      label: "Compliance"
    }, {
      icon: "ai-stores",
      label: "Smart model selection"
    }, {
      icon: "governance",
      label: "Governance & audit"
    }, {
      icon: "production",
      label: "Production-grade"
    }]
  }]
}];
function ApproachCard({
  card,
  idx,
  inView
}) {
  const solid = card.solid;
  return /*#__PURE__*/React.createElement(motion.article, {
    className: `ac ac--detailed ac--groups${solid ? " ac--solid" : ""}`,
    style: {
      "--ac-ink": card.ink,
      "--ac-sub": card.sub,
      "--ac-icon": card.accent || card.ink,
      ...(solid ? {
        background: solid
      } : {})
    },
    initial: {
      opacity: 0,
      y: 72
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 1.2,
      delay: 0.55 + idx * 0.13,
      ease: EASE_CINE
    },
    whileHover: "hover"
  }, !solid && /*#__PURE__*/React.createElement(motion.div, {
    className: "ac-bg",
    style: {
      backgroundImage: `url(${window.__asset(card.bg, card.bgId)})`
    },
    variants: {
      hover: {
        scale: 1.04,
        transition: {
          duration: 1.4,
          ease: EASE_CINE
        }
      }
    }
  }), !solid && /*#__PURE__*/React.createElement(motion.div, {
    className: "ac-veil",
    variants: {
      hover: {
        opacity: 0.18,
        transition: {
          duration: 0.8,
          ease: EASE_EDIT
        }
      }
    },
    initial: {
      opacity: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ac-detail"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ac-detail-title"
  }, card.title), /*#__PURE__*/React.createElement("div", {
    className: "ac-groups"
  }, card.groups.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: `g-${gi}`,
    className: "ac-group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ac-group-label"
  }, g.label), /*#__PURE__*/React.createElement("ul", {
    className: "ac-group-items"
  }, g.items.map((it, k) => /*#__PURE__*/React.createElement("li", {
    key: `gi-${k}`,
    className: "ac-group-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ac-ic",
    style: {
      WebkitMaskImage: `url("${(window.__SW_ICONS || {})[it.icon] || ""}")`,
      maskImage: `url("${(window.__SW_ICONS || {})[it.icon] || ""}")`
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ac-gi-label"
  }, it.label)))))))));
}
function ApproachSection() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-12% 0px -12% 0px"
  });

  // Parallax for the painting and the wordmark — they move at different rates
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const paintingYRaw = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const paintingY = useSpring(paintingYRaw, {
    stiffness: 80,
    damping: 22,
    mass: 0.6
  });
  const paintingScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  // Foreground figure — larger, faster parallax range than the painting so the
  // two planes visibly separate as the section scrolls past.
  const figureYRaw = useTransform(scrollYProgress, [0, 1], [110, -170]);
  const figureY = useSpring(figureYRaw, {
    stiffness: 70,
    damping: 20,
    mass: 0.7
  });
  const figureScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08]);
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.78, 0.5, 0.78]);

  // Wordmark reveal — split into letters for slow filmic entrance
  const word = "Software";
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    id: "software",
    className: "ap",
    "data-header": "light",
    "data-screen-label": "Software",
    style: {
      backgroundColor: "#F2ECD5"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-banner"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "ap-bg",
    style: {
      y: paintingY,
      scale: paintingScale
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-bg-img"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ap-figure",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "ap-figure-px",
    style: {
      y: figureY,
      scale: figureScale
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-figure-img"
  }))), /*#__PURE__*/React.createElement(motion.div, {
    className: "ap-veil",
    style: {
      opacity: veilOpacity
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(motion.h2, {
    className: "ap-word",
    style: {
      y: wordmarkY,
      fontFamily: "Archivo",
      letterSpacing: "-0.045em"
    },
    "aria-label": word
  }, word.split("").map((ch, i) => /*#__PURE__*/React.createElement("span", {
    key: `ch-${i}`,
    className: "ap-word-wrap"
  }, /*#__PURE__*/React.createElement(motion.span, {
    initial: {
      y: "108%",
      opacity: 0
    },
    animate: inView ? {
      y: "0%",
      opacity: 1
    } : {},
    transition: {
      duration: 1.4,
      delay: 0.1 + i * 0.06,
      ease: EASE_CINE
    },
    style: {
      fontFamily: "Archivo"
    }
  }, ch)))), /*#__PURE__*/React.createElement(motion.p, {
    className: "ap-subtitle",
    initial: {
      opacity: 0,
      y: 16
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 1.1,
      delay: 0.7,
      ease: EASE_CINE
    },
    style: {
      width: "1121px",
      lineHeight: "1.1",
      fontWeight: "200",
      fontSize: "20px"
    }
  }, "Three product verticals, built on a decade of operating critical systems in regulated European industries. Designed to be owned, audited and extended by the organisations that run them.")), /*#__PURE__*/React.createElement("div", {
    className: "ap-cards container"
  }, APPROACH_CARDS.map((card, i) => /*#__PURE__*/React.createElement(ApproachCard, {
    key: card.title,
    card: card,
    idx: i,
    inView: inView
  }))));
}

/* =============================================================================
   Tech & AI Stack — clones the Software banner (parallax painting + giant
   wordmark + subtitle + overlapping cards) but the cards list grouped tools.
   ========================================================================== */
const STACK_CARDS = [{
  title: "LLM & AI",
  groups: [{
    label: "Models",
    items: [{
      icon: "output",
      label: "Open AI"
    }, {
      icon: "puzzle",
      label: "Open source LLMs"
    }, {
      icon: "multimodel",
      label: "Multi-model orchestration"
    }]
  }, {
    label: "Pipelines",
    items: [{
      icon: "agent-orchestration",
      label: "Custom LLM pipelines"
    }, {
      icon: "ai-stores",
      label: "Prompt orchestration"
    }, {
      icon: "lens",
      label: "Evaluation"
    }]
  }, {
    label: "Agentic frameworks",
    items: [{
      icon: "interop",
      label: "OpenClaw"
    }]
  }],
  bg: "assets/card-1-bg.webp",
  bgId: "card1bg",
  ink: "#1a1612",
  sub: "#5a5446",
  accent: "#2c2620"
}, {
  title: "Data & AI",
  groups: [{
    label: "Platforms",
    items: [{
      icon: "multimodel",
      label: "Databricks"
    }, {
      icon: "puzzle",
      label: "MLFlow"
    }, {
      icon: "ai-stores",
      label: "Spark"
    }]
  }, {
    label: "Architectures",
    items: [{
      icon: "database",
      label: "Lakehouse"
    }, {
      icon: "agent-orchestration",
      label: "Data Mesh"
    }, {
      icon: "governance",
      label: "Governance"
    }]
  }],
  solid: "#D2FF00",
  ink: "#070902",
  sub: "rgba(7,9,2,.66)",
  accent: "#596C01"
}, {
  title: "Engineering",
  groups: [{
    label: "Frontend",
    items: [{
      icon: "react",
      label: "React"
    }, {
      icon: "native",
      label: "React Native"
    }, {
      icon: "three",
      label: "Three.js"
    }, {
      icon: "js",
      label: "JavaScript"
    }]
  }, {
    label: "Backend",
    items: [{
      icon: "java",
      label: "Java"
    }, {
      icon: "node",
      label: "Node.js"
    }, {
      icon: "python",
      label: "Python"
    }, {
      icon: "php",
      label: "PHP"
    }]
  }, {
    label: "DevOps",
    items: [{
      icon: "aws",
      label: "AWS"
    }, {
      icon: "production",
      label: "Google Cloud"
    }, {
      icon: "docker",
      label: "Docker"
    }]
  }],
  solid: "#2F3A0A",
  ink: "#F1EEDC",
  sub: "rgba(241,238,220,.72)",
  accent: "#CBE84A"
}];
function StackCard({
  card,
  idx,
  inView
}) {
  const solid = card.solid;
  return /*#__PURE__*/React.createElement(motion.article, {
    className: `ac ac--detailed ac--groups${solid ? " ac--solid" : ""}`,
    style: {
      "--ac-ink": card.ink,
      "--ac-sub": card.sub,
      "--ac-icon": card.accent || card.ink,
      ...(solid ? {
        background: solid
      } : {})
    },
    initial: {
      opacity: 0,
      y: 72
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 1.2,
      delay: 0.55 + idx * 0.13,
      ease: EASE_CINE
    },
    whileHover: "hover"
  }, !solid && /*#__PURE__*/React.createElement(motion.div, {
    className: "ac-bg",
    style: {
      backgroundImage: `url(${window.__asset(card.bg, card.bgId)})`
    },
    variants: {
      hover: {
        scale: 1.04,
        transition: {
          duration: 1.4,
          ease: EASE_CINE
        }
      }
    }
  }), !solid && /*#__PURE__*/React.createElement(motion.div, {
    className: "ac-veil",
    variants: {
      hover: {
        opacity: 0.18,
        transition: {
          duration: 0.8,
          ease: EASE_EDIT
        }
      }
    },
    initial: {
      opacity: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ac-detail"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ac-detail-title"
  }, card.title), /*#__PURE__*/React.createElement("div", {
    className: "ac-groups"
  }, card.groups.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: `g-${gi}`,
    className: "ac-group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ac-group-label"
  }, g.label), /*#__PURE__*/React.createElement("ul", {
    className: "ac-group-items"
  }, g.items.map((it, k) => /*#__PURE__*/React.createElement("li", {
    key: `gi-${k}`,
    className: "ac-group-item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ac-ic",
    style: {
      WebkitMaskImage: `url("${(window.__SW_ICONS || {})[it.icon] || ""}")`,
      maskImage: `url("${(window.__SW_ICONS || {})[it.icon] || ""}")`
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", {
    className: "ac-gi-label"
  }, it.label)))))))));
}
function StackSection() {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-12% 0px -12% 0px"
  });
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const paintingYRaw = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const paintingY = useSpring(paintingYRaw, {
    stiffness: 80,
    damping: 22,
    mass: 0.6
  });
  const paintingScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  // Gentle wordmark drift (±40) — keeps the title essentially centered in the
  // hero band when the section is active and never lets it collide with the
  // static subtitle (the old ±120 pushed it well below centre on entry).
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const veilOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.78, 0.5, 0.78]);
  const word = "Tech & AI Stack";
  return /*#__PURE__*/React.createElement("section", {
    ref: ref,
    id: "stack",
    className: "ap stk",
    "data-header": "light",
    "data-screen-label": "Stack",
    style: {
      backgroundColor: "rgb(237, 230, 208)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-banner"
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "ap-bg",
    style: {
      y: paintingY,
      scale: paintingScale
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ap-bg-img"
  })), /*#__PURE__*/React.createElement(motion.div, {
    className: "ap-veil",
    style: {
      opacity: veilOpacity
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(motion.h2, {
    className: "ap-word",
    style: {
      y: wordmarkY,
      fontFamily: "Archivo",
      letterSpacing: "-0.045em"
    },
    "aria-label": word
  }, word.split("").map((ch, i) => /*#__PURE__*/React.createElement("span", {
    key: `ch-${i}`,
    className: "ap-word-wrap"
  }, /*#__PURE__*/React.createElement(motion.span, {
    initial: {
      y: "108%",
      opacity: 0
    },
    animate: inView ? {
      y: "0%",
      opacity: 1
    } : {},
    transition: {
      duration: 1.4,
      delay: 0.1 + i * 0.05,
      ease: EASE_CINE
    },
    style: {
      fontFamily: "Archivo"
    }
  }, ch === " " ? "\u00A0" : ch)))), /*#__PURE__*/React.createElement(motion.p, {
    className: "ap-subtitle",
    initial: {
      opacity: 0,
      y: 16
    },
    animate: inView ? {
      opacity: 1,
      y: 0
    } : {},
    transition: {
      duration: 1.1,
      delay: 0.7,
      ease: EASE_CINE
    },
    style: {
      maxWidth: "760px",
      lineHeight: "1.5",
      fontWeight: "300",
      fontSize: "20px"
    }
  }, "A deliberately small set of tools, operated in depth. We favour stability and long-term ownership over novelty.")), /*#__PURE__*/React.createElement("div", {
    className: "ap-cards container"
  }, STACK_CARDS.map((card, i) => /*#__PURE__*/React.createElement(StackCard, {
    key: card.title,
    card: card,
    idx: i,
    inView: inView
  }))));
}

/* =============================================================================
   Design-system inspector overlay
   ========================================================================== */
function SystemOverlay({
  open,
  onClose
}) {
  return /*#__PURE__*/React.createElement(AnimatePresence, null, open && /*#__PURE__*/React.createElement(motion.div, {
    key: "sys-overlay",
    className: "sys-overlay",
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    transition: {
      duration: 0.4,
      ease: EASE_EDIT
    }
  }, /*#__PURE__*/React.createElement(motion.div, {
    className: "sys-sheet",
    initial: {
      y: 30,
      opacity: 0
    },
    animate: {
      y: 0,
      opacity: 1
    },
    exit: {
      y: 20,
      opacity: 0
    },
    transition: {
      duration: 0.55,
      ease: EASE_CINE
    }
  }, /*#__PURE__*/React.createElement("header", {
    className: "sys-hd"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sys-eyebrow"
  }, "SVRN \xB7 DESIGN SYSTEM"), /*#__PURE__*/React.createElement("button", {
    className: "sys-close",
    onClick: onClose,
    "aria-label": "Close"
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "sys-grid"
  }, /*#__PURE__*/React.createElement(SysBlock, {
    title: "Typography"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sys-type-row",
    style: {
      fontFamily: "var(--ff-display)",
      fontWeight: 800,
      fontSize: "var(--fs-h2)",
      lineHeight: 1
    }
  }, "Display 800", /*#__PURE__*/React.createElement("em", {
    className: "sys-meta"
  }, "Bricolage Grotesque \xB7 clamp 60\u219292px")), /*#__PURE__*/React.createElement("div", {
    className: "sys-type-row",
    style: {
      fontFamily: "var(--ff-editor)",
      fontStyle: "italic",
      fontSize: "var(--fs-h3)",
      lineHeight: 1.05
    }
  }, "Editorial italic", /*#__PURE__*/React.createElement("em", {
    className: "sys-meta"
  }, "Instrument Serif \xB7 accent runs")), /*#__PURE__*/React.createElement("div", {
    className: "sys-type-row",
    style: {
      fontFamily: "var(--ff-mono)",
      fontSize: "var(--fs-nav)",
      letterSpacing: ".14em",
      textTransform: "uppercase"
    }
  }, "Mono \xB7 0.14em tracking", /*#__PURE__*/React.createElement("em", {
    className: "sys-meta"
  }, "JetBrains Mono \xB7 nav \xB7 kickers"))), /*#__PURE__*/React.createElement(SysBlock, {
    title: "Color tokens"
  }, /*#__PURE__*/React.createElement("div", {
    className: "swatches"
  }, [["#0A0807", "--c-bg"], ["#1A1612", "--c-bg-2"], ["#EDE5CC", "--c-ink"], ["#B8AD93", "--c-ink-sub"], ["#6E6857", "--c-ink-mute"], ["#D95BFF", "--c-accent"], ["#E5DC4D", "--c-status"]].map(([hex, tok]) => /*#__PURE__*/React.createElement("div", {
    key: tok,
    className: "sw"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sw-chip",
    style: {
      background: hex
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "sw-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sw-tok"
  }, tok), /*#__PURE__*/React.createElement("span", {
    className: "sw-hex"
  }, hex)))))), /*#__PURE__*/React.createElement(SysBlock, {
    title: "Spacing \xB7 4px base"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-stack"
  }, [4, 8, 12, 16, 24, 32, 56, 96].map(px => /*#__PURE__*/React.createElement("div", {
    key: px,
    className: "space-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "space-bar",
    style: {
      width: px
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "space-lbl"
  }, px, "px"))))), /*#__PURE__*/React.createElement(SysBlock, {
    title: "Motion timing"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "motion-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "instant"), /*#__PURE__*/React.createElement("em", null, "120ms")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "fast"), /*#__PURE__*/React.createElement("em", null, "220ms \xB7 hover")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "base"), /*#__PURE__*/React.createElement("em", null, "420ms \xB7 UI state")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "slow"), /*#__PURE__*/React.createElement("em", null, "720ms \xB7 section reveals")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "grand"), /*#__PURE__*/React.createElement("em", null, "1200ms \xB7 hero entrance")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "ease-cine"), /*#__PURE__*/React.createElement("em", null, "cubic-bezier(.19,1,.22,1)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "ease-edit"), /*#__PURE__*/React.createElement("em", null, "cubic-bezier(.16,.84,.30,1)")))), /*#__PURE__*/React.createElement(SysBlock, {
    title: "Containers / breakpoints"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "motion-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "container"), /*#__PURE__*/React.createElement("em", null, "min(1760px, 100vw \u2212 64px)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "narrow"), /*#__PURE__*/React.createElement("em", null, "min(1280px, 100vw \u2212 48px)")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "sm \xB7 md \xB7 lg \xB7 xl"), /*#__PURE__*/React.createElement("em", null, "640 \xB7 768 \xB7 1024 \xB7 1280")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "2xl \xB7 3xl"), /*#__PURE__*/React.createElement("em", null, "1536 \xB7 1760")))), /*#__PURE__*/React.createElement(SysBlock, {
    title: "Z-index architecture"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "motion-list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "bg / glow"), /*#__PURE__*/React.createElement("em", null, "0 \xB7 5")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "content"), /*#__PURE__*/React.createElement("em", null, "10")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "header"), /*#__PURE__*/React.createElement("em", null, "40")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "overlay \xB7 grain"), /*#__PURE__*/React.createElement("em", null, "60")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "tweaks panel"), /*#__PURE__*/React.createElement("em", null, "80"))))))));
}
function SysBlock({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "sys-block"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "sys-block-h"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "sys-block-body"
  }, children));
}

/* =============================================================================
   Root App
   ========================================================================== */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Header, {
    accent: t.accent
  }), /*#__PURE__*/React.createElement(Hero, {
    tweaks: t
  }), /*#__PURE__*/React.createElement(PositioningSection, null), /*#__PURE__*/React.createElement(ApproachSection, null), /*#__PURE__*/React.createElement(ConsultancySection, null), /*#__PURE__*/React.createElement(window.RevealSection, null), /*#__PURE__*/React.createElement(window.CapabilitiesSection, null), /*#__PURE__*/React.createElement(window.ArchetypeSection, null), /*#__PURE__*/React.createElement(StackSection, null), /*#__PURE__*/React.createElement(window.ClientsSection, null), /*#__PURE__*/React.createElement(window.ClientLogosGrid, null), /*#__PURE__*/React.createElement(window.FooterCTA, null), /*#__PURE__*/React.createElement(SystemOverlay, {
    open: t.showSystemOverlay,
    onClose: () => setTweak("showSystemOverlay", false)
  }), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "Tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Brand"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent",
    value: t.accent,
    options: ["#D95BFF", "#E5DC4D", "#7CE3A6", "#F26B3A", "#5DA8FF"],
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Hero copy"
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Heading (wrap *italics*)",
    value: t.heading,
    onChange: v => setTweak("heading", v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Description",
    value: t.description,
    onChange: v => setTweak("description", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Motion"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Scroll parallax",
    value: t.parallax,
    onChange: v => setTweak("parallax", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "System"
  }), /*#__PURE__*/React.createElement(TweakButton, {
    label: "Open design-system reference",
    onClick: () => setTweak("showSystemOverlay", true)
  })));
}
ReactDOM.createRoot(document.getElementById("app")).render(/*#__PURE__*/React.createElement(App, null));
})();
