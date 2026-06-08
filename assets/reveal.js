/* =============================================================================
   SVRN · Reveal Section — "Old wisdom, new instruments"
   -----------------------------------------------------------------------------
   A pinned, cinematic image transformation. As the viewer scrolls, a classical
   painted portrait wipes away through a moving luminous seam to reveal its
   cyber-future self beneath. Choreography (GSAP ScrollTrigger, scrubbed):
     · classic image  — slow zoom-OUT  (1.14 → 1.00)
     · cyber image     — slow zoom-IN   (1.00 → 1.16)
     · wipe            — clip-path inset sweeps left→right, tracked by a
                         warm glowing seam line
     · captions        — "Old wisdom" dissolves out, "New instruments" rises in
   Grain + a slow breathing vignette add atmosphere. Built to feel like an
   Apple / Formula-1 launch reveal.
   ========================================================================== */

function RevealSection() {
  const sectionRef = React.useRef(null);
  const pinRef = React.useRef(null);
  const classicWrapRef = React.useRef(null);
  const classicInnerRef = React.useRef(null);
  const cyberInnerRef = React.useRef(null);
  const seamRef = React.useRef(null);
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
      // Initial state
      gsap.set(classicInnerRef.current, { scale: 1.14, transformOrigin: "50% 45%" });
      gsap.set(cyberInnerRef.current, { scale: 1.0, transformOrigin: "50% 45%" });
      gsap.set(classicWrapRef.current, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(seamRef.current, { left: "0%", autoAlpha: 0 });
      gsap.set(frameRef.current, { scale: 1, borderRadius: 0, transformOrigin: "50% 50%" });

      // The single pin runs in two acts:
      //   0.00 → 0.60  ACT I  · the cinematic wipe (classic → cyber)
      //   0.60 → 1.00  ACT II · the card shrinks into a rounded, dimmed floating
      //                         card on the dark stage. Capabilities is NOT pulled
      //                         up here — it stays a normal full-height section in
      //                         flow BELOW the pin, and takes over once the pin
      //                         releases (sequential handoff, no negative margin).
      const WIPE = 0.5;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
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

      /* ───────── ACT I · wipe ───────── */
      tl.fromTo(classicWrapRef.current,
        { clipPath: "inset(0% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 100%)", ease: "power1.inOut", duration: WIPE }, 0);
      tl.fromTo(seamRef.current,
        { left: "0%" },
        { left: "100%", ease: "power1.inOut", duration: WIPE }, 0);
      tl.fromTo(seamRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.01);
      tl.to(seamRef.current, { autoAlpha: 0, duration: 0.08 }, WIPE - 0.1);
      tl.fromTo(classicInnerRef.current, { scale: 1.14 }, { scale: 1.0, duration: WIPE }, 0);
      tl.fromTo(cyberInnerRef.current, { scale: 1.0 }, { scale: 1.16, duration: WIPE }, 0);

      /* ───────── ACT II · shrink, then EXIT — sequential handoff ─────────
         Transforms/opacity only (60fps). Capabilities is NOT animated here and is
         NOT stacked behind the reveal — it is a normal, fully-opaque section in
         flow BELOW the pin. The reveal card shrinks into a floating card, then
         slides COMPLETELY out of the viewport (off the top) and fades, dropping
         pointer-events. By pin release the reveal is 100% gone; the pin releases
         and Capabilities scrolls in as the next section. No layering, no
         transparency, no content showing through, no long overlap. */
      const S = WIPE, SD = 1 - WIPE;     // ACT II spans 0.50 → 1.00
      // Capabilities (pulled up by -100vh) starts entering the viewport bottom over
      // the FINAL 100vh of pin scroll — i.e. the last ~0.30 of the timeline. So the
      // card's EXIT must begin right there, not later, or Capabilities peeks in
      // behind the still-shrinking card. Start exit at ~progress 0.68 so the card is
      // already sliding up + fading the instant Capabilities appears: out = in.
      const SHRINK = SD * 0.28;          // 0.50 → ~0.64  card shrinks into a card
      const EXIT   = SD - SHRINK;        // ~0.68 → 1.00  card slides fully off & fades

      // Card shrinks into a rounded floating card on the dark stage — fully opaque.
      tl.to(frameRef.current, {
        scale: 0.84, borderRadius: 44,
        ease: "power2.inOut", duration: SHRINK
      }, S);
      tl.to(cyberInnerRef.current, { scale: 1.22, ease: "power1.out", duration: SD }, S);

      // EXIT — the card lifts entirely out of frame (yPercent -120 clears the top
      // edge even at scale 0.84) and dissolves; the pin layer is disabled so the
      // instant it releases, Capabilities — directly below in flow — is the live
      // section. Reveal is fully gone BEFORE release: zero overlap, nothing shows.
      tl.to(frameRef.current, {
        autoAlpha: 0, yPercent: -120,
        ease: "power2.out", duration: EXIT
      }, S + SHRINK);
      tl.set(pinRef.current, { pointerEvents: "none" }, S + SHRINK);

      // Capabilities is an ordinary section that follows the pin — it only needs its
      // own in-section title parallax. No overlap counter-scroll, no fade-through.
      const caps = document.getElementById("capabilities");
      if (caps) {
        const capsTitle = caps.querySelector(".caps-title");
        if (capsTitle) {
          gsap.fromTo(capsTitle, { yPercent: 7 }, {
            yPercent: -5, ease: "none",
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
      gsap.to(vignetteRef.current, {
        opacity: 0.85,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      // Refresh once the hero imagery / fonts settle so pin math is correct.
      const refresh = () => ScrollTrigger.refresh();
      const imgs = sectionRef.current.querySelectorAll("img");
      let pending = imgs.length;
      if (pending === 0) refresh();
      imgs.forEach((img) => {
        if (img.complete) {
          if (--pending === 0) refresh();
        } else {
          img.addEventListener("load", () => { if (--pending === 0) refresh(); }, { once: true });
          img.addEventListener("error", () => { if (--pending === 0) refresh(); }, { once: true });
        }
      });
      setTimeout(refresh, 400);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reveal"
      className="reveal"
      data-header="dark"
      data-screen-label="Reveal"
      aria-label="Transformation reveal">

      <div className="reveal-pin" ref={pinRef}>
        <div className="reveal-frame" ref={frameRef}>
          {/* Base layer — cyber future (revealed beneath) */}
          <div className="reveal-layer reveal-layer--cyber">
            <div className="reveal-img" ref={cyberInnerRef}>
              <img src={window.__asset("assets/reveal-cyber.png", "revealCyber")} alt="" draggable="false" />
            </div>
          </div>

          {/* Top layer — classical portrait, clipped away on scroll */}
          <div className="reveal-layer reveal-layer--classic" ref={classicWrapRef}>
            <div className="reveal-img" ref={classicInnerRef}>
              <img src={window.__asset("assets/reveal-classic.png", "revealClassic")} alt="" draggable="false" />
            </div>
          </div>

          {/* Moving luminous seam */}
          <div className="reveal-seam" ref={seamRef} aria-hidden="true">
            <span className="reveal-seam-core"></span>
            <span className="reveal-seam-glow"></span>
          </div>

          {/* Atmosphere */}
          <div className="reveal-vignette" ref={vignetteRef} aria-hidden="true"></div>
          <div className="reveal-grain" aria-hidden="true"></div>
        </div>
      </div>
    </section>);

}

Object.assign(window, { RevealSection });
