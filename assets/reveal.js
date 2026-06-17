/* =============================================================================
   SVRN · Reveal Section — day → night transition
   -----------------------------------------------------------------------------
   A pinned, cinematic scene transformation. Two images share the same frame
   (object-fit: cover): a sepia DAY shot underneath, and a dark NIGHT shot on
   top. As the viewer scrolls through the pinned section, the night layer is
   REVEALED by a horizontal clip-path wipe — it starts fully clipped (0% wide)
   and sweeps left→right to fully visible (100%), so night wipes over day on
   the way down, and retreats back to day on the way up. Choreography (GSAP
   ScrollTrigger, scrubbed):
     · night image  — clip-path inset sweeps the reveal left→right
     · both images   — a gentle counter-zoom for cinematic life
   Grain + a slow breathing vignette add atmosphere; ACT II then shrinks the
   frame into a floating card and hands off to Capabilities below.
   ========================================================================== */

function RevealSection() {
  const sectionRef = React.useRef(null);
  const pinRef = React.useRef(null);
  const nightWrapRef = React.useRef(null); // top layer (night) — opacity driven
  const nightInnerRef = React.useRef(null);
  const dayInnerRef = React.useRef(null); // base layer (day)
  const vignetteRef = React.useRef(null);
  const frameRef = React.useRef(null);
  React.useEffect(() => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) {
      console.warn("[SVRN] gsap/ScrollTrigger not found for RevealSection");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Initial state — night fully clipped (we start on the day scene); the
      // wipe will sweep it open left→right. Each layer holds a slight scale for
      // a gentle counter-zoom.
      gsap.set(nightInnerRef.current, {
        scale: 1.08,
        transformOrigin: "50% 45%"
      });
      gsap.set(dayInnerRef.current, {
        scale: 1.0,
        transformOrigin: "50% 45%"
      });
      gsap.set(nightWrapRef.current, {
        autoAlpha: 1,
        clipPath: "inset(0% 100% 0% 0%)"
      });
      gsap.set(frameRef.current, {
        scale: 1,
        borderRadius: 0,
        transformOrigin: "50% 50%"
      });

      // The single pin runs in two acts:
      //   0.00 → 0.60  ACT I  · the cinematic wipe (classic → cyber)
      //   0.60 → 1.00  ACT II · the card shrinks into a rounded, dimmed floating
      //                         card on the dark stage. Capabilities is NOT pulled
      //                         up here — it stays a normal full-height section in
      //                         flow BELOW the pin, and takes over once the pin
      //                         releases (sequential handoff, no negative margin).
      // Atmospheric vignette breathing — scroll-independent, runs at all sizes.
      gsap.to(vignetteRef.current, {
        opacity: 0.85,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
      const mm = gsap.matchMedia();

      /* ════════ DESKTOP (≥761px) — original GSAP-pinned scrubbed timeline ═══════
         Pinning + scrub is reliable on desktop. Mobile uses a CSS-sticky +
         manual rAF scrub instead (see the mobile branch below): GSAP pinning is
         unreliable on mobile browsers whose viewport changes as the URL bar
         shows/hides, which left the wipe frozen on a single frame. */
      mm.add("(min-width: 761px)", () => {
        const WIPE = 0.5;
        const tl = gsap.timeline({
          defaults: {
            ease: "none"
          },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=330%",
            scrub: 0.4,
            pin: pinRef.current,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        /* ───────── ACT I · day → night horizontal wipe ─────────
           The night layer's clip-path is mapped straight onto the scroll progress
           of the wipe window (scrub:0.4 on the timeline). Scrolling down sweeps
           night open left→right (inset right 100%→0%); scrolling up closes it. */
        tl.fromTo(nightWrapRef.current, {
          clipPath: "inset(0% 100% 0% 0%)"
        }, {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "power1.inOut",
          duration: WIPE
        }, 0);
        tl.fromTo(nightInnerRef.current, {
          scale: 1.08
        }, {
          scale: 1.0,
          duration: WIPE
        }, 0);
        tl.fromTo(dayInnerRef.current, {
          scale: 1.0
        }, {
          scale: 1.06,
          duration: WIPE
        }, 0);

        /* ───────── ACT II · shrink, then EXIT — sequential handoff ─────────
           Transforms/opacity only (60fps). Capabilities is NOT animated here and is
           NOT stacked behind the reveal — it is a normal, fully-opaque section in
           flow BELOW the pin. The reveal card shrinks into a floating card, then
           slides COMPLETELY out of the viewport (off the top) and fades, dropping
           pointer-events. By pin release the reveal is 100% gone; the pin releases
           and Capabilities scrolls in as the next section. No layering, no
           transparency, no content showing through, no long overlap. */
        const S = WIPE,
          SD = 1 - WIPE; // ACT II spans 0.50 → 1.00
        // Capabilities (pulled up by -100vh) starts entering the viewport bottom over
        // the FINAL 100vh of pin scroll — i.e. the last ~0.30 of the timeline. So the
        // card's EXIT must begin right there, not later, or Capabilities peeks in
        // behind the still-shrinking card. Start exit at ~progress 0.68 so the card is
        // already sliding up + fading the instant Capabilities appears: out = in.
        const SHRINK = SD * 0.28; // 0.50 → ~0.64  card shrinks into a card
        const EXIT = SD - SHRINK; // ~0.68 → 1.00  card slides fully off & fades

        // Card shrinks into a rounded floating card on the dark stage — fully opaque.
        tl.to(frameRef.current, {
          scale: 0.84,
          borderRadius: 44,
          ease: "power2.inOut",
          duration: SHRINK
        }, S);
        tl.to(nightInnerRef.current, {
          scale: 1.12,
          ease: "power1.out",
          duration: SD
        }, S);

        // EXIT — the card lifts entirely out of frame (yPercent -120 clears the top
        // edge even at scale 0.84) and dissolves; the pin layer is disabled so the
        // instant it releases, Capabilities — directly below in flow — is the live
        // section. Reveal is fully gone BEFORE release: zero overlap, nothing shows.
        tl.to(frameRef.current, {
          autoAlpha: 0,
          yPercent: -120,
          ease: "power2.out",
          duration: EXIT
        }, S + SHRINK);
        tl.set(pinRef.current, {
          pointerEvents: "none"
        }, S + SHRINK);

        // Capabilities is an ordinary section that follows the pin — it only needs its
        // own in-section title parallax. No overlap counter-scroll, no fade-through.
        const caps = document.getElementById("capabilities");
        if (caps) {
          const capsTitle = caps.querySelector(".caps-title");
          if (capsTitle) {
            gsap.fromTo(capsTitle, {
              yPercent: 7
            }, {
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: caps,
                // START AT PIN-RELEASE: the Reveal section is pinned + scrubbed up
                // to capsTop. Starting this title scrub at "top top" (caps top hits
                // the viewport top = exactly when the reveal pin releases) means no
                // two scrubbed triggers are ever active in the same frame during the
                // handoff — eliminates the competing-trigger jank entering Capabilities.
                start: "top top",
                // Final section rests at the document bottom, so its bottom never
                // passes the viewport TOP — anchor to "bottom bottom" so the parallax
                // resolves to progress 1 exactly as its scroll ends (no trailing void).
                // Amplitude kept SMALL on purpose: a big title parallax made the
                // title drift ~3.5× the scroll rate, so there was no scroll position
                // where title + cards framed together. Gentle drift lets the snap
                // centre the whole block with both fully visible.
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true
              }
            });
          }
        }

        // — Atmospheric: slow continuous vignette breathing (scroll-independent) —
        // (Shared breathing tween now lives before the matchMedia split.)

        // Refresh once the hero imagery / fonts settle so pin math is correct.
        const refresh = () => ScrollTrigger.refresh();
        const imgs = sectionRef.current.querySelectorAll("img");
        let pending = imgs.length;
        if (pending === 0) refresh();
        imgs.forEach(img => {
          if (img.complete) {
            if (--pending === 0) refresh();
          } else {
            img.addEventListener("load", () => {
              if (--pending === 0) refresh();
            }, {
              once: true
            });
            img.addEventListener("error", () => {
              if (--pending === 0) refresh();
            }, {
              once: true
            });
          }
        });
        setTimeout(refresh, 400);
      }); // ── end DESKTOP matchMedia ──

      /* ════════ MOBILE (≤760px) — CSS position:sticky + manual rAF scrub ═══════
         .reveal is a tall runway (height:300svh in CSS) and .reveal-pin sticks to
         the viewport. We recompute scroll progress through the section on every
         scroll / resize / orientationchange (rAF-throttled, passive listeners)
         and drive the night layer's clip-path wipe from it — so touch scrolling
         sweeps the reveal exactly like the desktop pin. Using -getBoundingClientRect
         + offsetHeight (and 100svh for the sticky) keeps it stable as the mobile
         URL bar shows/hides. Both image layers share one object-position (CSS), so
         they stay aligned through the wipe. */
      mm.add("(max-width: 760px)", () => {
        const section = sectionRef.current;
        const night = nightWrapRef.current;
        const WIPE_END = 0.78; // wipe completes over the first 78% of the runway
        let raf = 0;
        const apply = () => {
          raf = 0;
          const scrollable = section.offsetHeight - window.innerHeight;
          if (scrollable <= 0) return;
          const scrolled = Math.min(Math.max(-section.getBoundingClientRect().top, 0), scrollable);
          const p = scrolled / scrollable; // 0 → 1 through the section
          const wipe = Math.max(0, Math.min(1, p / WIPE_END)); // wipe over first WIPE_END, then hold
          gsap.set(night, {
            clipPath: `inset(0% ${(1 - wipe) * 100}% 0% 0%)`
          });
          gsap.set(nightInnerRef.current, {
            scale: 1.08 - 0.08 * wipe
          });
          gsap.set(dayInnerRef.current, {
            scale: 1 + 0.06 * wipe
          });
        };
        const onScroll = () => {
          if (!raf) raf = requestAnimationFrame(apply);
        };
        apply();
        window.addEventListener("scroll", onScroll, {
          passive: true
        });
        window.addEventListener("resize", onScroll);
        window.addEventListener("orientationchange", onScroll);
        return () => {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
          window.removeEventListener("orientationchange", onScroll);
          if (raf) cancelAnimationFrame(raf);
        };
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    ref: sectionRef,
    id: "reveal",
    className: "reveal",
    "data-header": "dark",
    "data-screen-label": "Reveal",
    "aria-label": "Transformation reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal-pin",
    ref: pinRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal-frame",
    ref: frameRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal-layer reveal-layer--cyber"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal-img",
    ref: dayInnerRef
  }, /*#__PURE__*/React.createElement("picture", null, /*#__PURE__*/React.createElement("source", {
    media: "(max-width: 768px)",
    srcSet: window.__asset("assets/reveal-dia-movil.webp", "revealDayMobile")
  }), /*#__PURE__*/React.createElement("img", {
    src: window.__asset("assets/reveal-dia.webp", "revealDay"),
    alt: "",
    draggable: "false"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "reveal-layer reveal-layer--classic",
    ref: nightWrapRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal-img",
    ref: nightInnerRef
  }, /*#__PURE__*/React.createElement("picture", null, /*#__PURE__*/React.createElement("source", {
    media: "(max-width: 768px)",
    srcSet: window.__asset("assets/reveal-noche-movil.webp", "revealNightMobile")
  }), /*#__PURE__*/React.createElement("img", {
    src: window.__asset("assets/reveal-noche.webp", "revealNight"),
    alt: "",
    draggable: "false"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "reveal-vignette",
    ref: vignetteRef,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "reveal-grain",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "reveal-headline",
    "aria-label": "Future has ancient roots"
  }, /*#__PURE__*/React.createElement("span", {
    className: "reveal-h-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "reveal-h-archivo"
  }, "Future has")), /*#__PURE__*/React.createElement("span", {
    className: "reveal-h-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "reveal-h-ancient"
  }, "ancient"), /*#__PURE__*/React.createElement("span", {
    className: "reveal-h-archivo"
  }, " roots"))))));
}
Object.assign(window, {
  RevealSection
});