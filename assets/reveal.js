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
      gsap.set(classicInnerRef.current, {
        scale: 1.14,
        transformOrigin: "50% 45%"
      });
      gsap.set(cyberInnerRef.current, {
        scale: 1.0,
        transformOrigin: "50% 45%"
      });
      gsap.set(classicWrapRef.current, {
        clipPath: "inset(0% 0% 0% 0%)"
      });
      gsap.set(seamRef.current, {
        left: "0%",
        autoAlpha: 0
      });
      gsap.set(frameRef.current, {
        scale: 1,
        borderRadius: 0,
        transformOrigin: "50% 50%"
      });
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
      tl.fromTo(classicWrapRef.current, {
        clipPath: "inset(0% 0% 0% 0%)"
      }, {
        clipPath: "inset(0% 0% 0% 100%)",
        ease: "power1.inOut",
        duration: WIPE
      }, 0);
      tl.fromTo(seamRef.current, {
        left: "0%"
      }, {
        left: "100%",
        ease: "power1.inOut",
        duration: WIPE
      }, 0);
      tl.fromTo(seamRef.current, {
        autoAlpha: 0
      }, {
        autoAlpha: 1,
        duration: 0.05
      }, 0.01);
      tl.to(seamRef.current, {
        autoAlpha: 0,
        duration: 0.08
      }, WIPE - 0.1);
      tl.fromTo(classicInnerRef.current, {
        scale: 1.14
      }, {
        scale: 1.0,
        duration: WIPE
      }, 0);
      tl.fromTo(cyberInnerRef.current, {
        scale: 1.0
      }, {
        scale: 1.16,
        duration: WIPE
      }, 0);
      const S = WIPE,
        SD = 1 - WIPE;
      const SHRINK = SD * 0.28;
      const EXIT = SD - SHRINK;
      tl.to(frameRef.current, {
        scale: 0.84,
        borderRadius: 44,
        ease: "power2.inOut",
        duration: SHRINK
      }, S);
      tl.to(cyberInnerRef.current, {
        scale: 1.22,
        ease: "power1.out",
        duration: SD
      }, S);
      tl.to(frameRef.current, {
        autoAlpha: 0,
        yPercent: -120,
        ease: "power2.out",
        duration: EXIT
      }, S + SHRINK);
      tl.set(pinRef.current, {
        pointerEvents: "none"
      }, S + SHRINK);
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
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true
            }
          });
        }
      }
      gsap.to(vignetteRef.current, {
        opacity: 0.85,
        duration: 7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
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
    }, sectionRef);
    return () => ctx.revert();
  }, []);
  return React.createElement("section", {
    ref: sectionRef,
    id: "reveal",
    className: "reveal",
    "data-header": "dark",
    "data-screen-label": "Reveal",
    "aria-label": "Transformation reveal"
  }, React.createElement("div", {
    className: "reveal-pin",
    ref: pinRef
  }, React.createElement("div", {
    className: "reveal-frame",
    ref: frameRef
  }, React.createElement("div", {
    className: "reveal-layer reveal-layer--cyber"
  }, React.createElement("div", {
    className: "reveal-img",
    ref: cyberInnerRef
  }, React.createElement("img", {
    src: window.__asset("assets/reveal-cyber.png", "revealCyber"),
    alt: "",
    draggable: "false"
  }))), React.createElement("div", {
    className: "reveal-layer reveal-layer--classic",
    ref: classicWrapRef
  }, React.createElement("div", {
    className: "reveal-img",
    ref: classicInnerRef
  }, React.createElement("img", {
    src: window.__asset("assets/reveal-classic.png", "revealClassic"),
    alt: "",
    draggable: "false"
  }))), React.createElement("div", {
    className: "reveal-seam",
    ref: seamRef,
    "aria-hidden": "true"
  }, React.createElement("span", {
    className: "reveal-seam-core"
  }), React.createElement("span", {
    className: "reveal-seam-glow"
  })), React.createElement("div", {
    className: "reveal-vignette",
    ref: vignetteRef,
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "reveal-grain",
    "aria-hidden": "true"
  }))));
}
Object.assign(window, {
  RevealSection
});