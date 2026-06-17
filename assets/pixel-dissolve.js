/* =============================================================================
   PixelDissolve — scroll-driven canvas pixel dissolve.
   -----------------------------------------------------------------------------
   Renders an image to a <canvas> and, as the host section scrolls through the
   viewport, progressively (1) increases the pixel block size and (2) extinguishes
   individual blocks on their own staggered death-times sampled from a hashed
   noise field. Two effects compounded — not a fade, not a blur — give that
   cinematic, agency-grade dissolve.

   • Driver:    GSAP ScrollTrigger (scrub) on the supplied sectionRef.
   • Renderer:  HTMLCanvasElement / 2d ctx. No external graphics dep needed —
                drawImage scale-down + imageSmoothingEnabled=false handles the
                blockification GPU-cheaply; per-block fillRect is used only in
                the dissolve phase, when block counts are already low.
   • Easing:    cubic-out on block growth, eased noise threshold on dropout.
   • Mobile:    DPR capped, block growth ceiling clamped, ScrollTrigger handles
                touch scrolling for free.
   ========================================================================== */
const {
  useEffect,
  useRef
} = React;

/* Deterministic 2D hash → [0, 1). Stable across renders so each block keeps
   the same death-time regardless of how often we redraw. */
function blockHash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function easeOutCubic(t) {
  const u = 1 - t;
  return 1 - u * u * u;
}
function PixelDissolve({
  src,
  sectionRef,
  progress,
  // optional MotionValue (0..1) — overrides ScrollTrigger
  className = "",
  style,
  /* tuning */
  maxBlock = 56,
  // largest block size at end of scroll (px, at 1x dpr)
  startAt = 0.05,
  // scroll progress before dissolve begins
  dissolveOvershoot = 1.18,
  // > 1 ensures every block reaches alpha 0
  fadeWindow = 0.22,
  // per-block fade duration (in dissolve-progress units)
  direction = "random",
  // "random" | "top" | "bottom"
  /* ScrollTrigger range — defaults: sharp until the section's bottom reaches
     the viewport bottom (i.e. fully revealed), then dissolves through to
     the section leaving the top of the viewport. */
  scrollStart = "bottom bottom",
  scrollEnd = "bottom top"
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    img: null,
    imgLoaded: false,
    progress: 0,
    lastDrawn: -1,
    cssW: 0,
    cssH: 0,
    dpr: 1,
    raf: 0,
    scrollTrigger: null,
    offscreen: null,
    offCtx: null
  });
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", {
      alpha: true
    });
    const state = stateRef.current;
    state.offscreen = document.createElement("canvas");
    state.offCtx = state.offscreen.getContext("2d", {
      alpha: true,
      willReadFrequently: true
    });
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // ── Load source image ────────────────────────────────────────────────
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      state.img = img;
      state.imgLoaded = true;
      resize();
      state.lastDrawn = -1;
      schedule();
    };
    img.src = src;

    // ── Resize the canvas to the natural aspect of the image, scaled to
    //    fit the wrapper's height (matches the original <img>'s layout). ──
    function resize() {
      if (!state.img) return;
      const rect = wrap.getBoundingClientRect();
      const aspect = state.img.naturalWidth / state.img.naturalHeight;
      const cssH = rect.height;
      const cssW = cssH * aspect;
      state.cssW = cssW;
      state.cssH = cssH;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * state.dpr);
      canvas.height = Math.round(cssH * state.dpr);
      state.lastDrawn = -1;
    }
    const ro = new ResizeObserver(() => {
      resize();
      schedule();
    });
    ro.observe(wrap);

    // ── Progress driver: either an external MotionValue, or ScrollTrigger ──
    let st = null;
    let unsubscribeMV = null;
    if (progress && typeof progress.on === "function") {
      // External MotionValue — keeps state in sync with whatever drives it
      const apply = v => {
        state.progress = Math.max(0, Math.min(1, v || 0));
        schedule();
      };
      apply(typeof progress.get === "function" ? progress.get() : 0);
      unsubscribeMV = progress.on("change", apply);
    } else if (window.gsap && window.ScrollTrigger && sectionRef?.current) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      st = window.ScrollTrigger.create({
        trigger: sectionRef.current,
        start: scrollStart,
        end: scrollEnd,
        scrub: 0.6,
        onUpdate: self => {
          state.progress = self.progress;
          schedule();
        }
      });
      state.scrollTrigger = st;
    }

    // ── Throttled redraw via rAF ─────────────────────────────────────────
    function schedule() {
      if (state.raf) return;
      state.raf = requestAnimationFrame(() => {
        state.raf = 0;
        draw();
      });
    }
    function draw() {
      if (!state.imgLoaded) return;
      const p = state.progress;
      // Avoid redraw if progress hasn't moved enough (1/512 of range)
      if (Math.abs(p - state.lastDrawn) < 0.002 && state.lastDrawn >= 0) return;
      state.lastDrawn = p;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Phase 1 — untouched image until startAt
      if (p <= startAt) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(state.img, 0, 0, W, H);
        return;
      }
      // Phase out — fully empty
      if (p >= 1) return;

      // Map remaining range to local t ∈ [0, 1]
      const t = (p - startAt) / (1 - startAt);
      const e = easeOutCubic(t);

      // Block size in device pixels — grows from 2 → maxBlock*dpr
      const minBs = 2;
      const maxBs = Math.max(minBs + 1, Math.round(maxBlock * state.dpr));
      const blockSize = Math.max(minBs, Math.round(minBs + e * (maxBs - minBs)));
      const cols = Math.max(1, Math.ceil(W / blockSize));
      const rows = Math.max(1, Math.ceil(H / blockSize));

      // Down-sample to offscreen at cols×rows so each pixel is a block color
      const off = state.offscreen;
      off.width = cols;
      off.height = rows;
      const offCtx = state.offCtx;
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = "high";
      offCtx.clearRect(0, 0, cols, rows);
      offCtx.drawImage(state.img, 0, 0, cols, rows);

      // If pixelation is still subtle, use scale-up drawImage (GPU path).
      // Once blocks are large enough to host a dissolve, switch to per-block
      // fillRect with hashed death-time alpha.
      const dissolveProg = t * dissolveOvershoot;
      const inDissolve = blockSize >= 8 || t > 0.18;
      if (!inDissolve) {
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = 1;
        ctx.drawImage(off, 0, 0, cols, rows, 0, 0, cols * blockSize, rows * blockSize);
        return;
      }
      const data = offCtx.getImageData(0, 0, cols, rows).data;
      ctx.imageSmoothingEnabled = false;
      // Overdraw by 1px on right/bottom to avoid hairline seams between blocks
      const bw = blockSize + 1;
      const bh = blockSize + 1;

      // Direction bias for noise threshold
      const dirBias = direction === "top" ? 0.45 : direction === "bottom" ? -0.45 : 0;
      for (let y = 0; y < rows; y++) {
        const ny = rows > 1 ? y / (rows - 1) : 0;
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const a = data[i + 3];
          if (a < 4) continue;
          const nx = cols > 1 ? x / (cols - 1) : 0;
          // Block dies at this dissolve-progress value
          const n = blockHash(Math.floor(nx * 96) + 0.5, Math.floor(ny * 128) + 0.5);
          let death = n * 0.75 + 0.12;
          // Optional directional bias (top dies first / bottom dies first)
          if (dirBias !== 0) {
            death = death * (1 - Math.abs(dirBias)) + (dirBias > 0 ? ny : 1 - ny) * Math.abs(dirBias);
          }
          let alpha;
          if (dissolveProg <= death) alpha = 1;else if (dissolveProg >= death + fadeWindow) continue;else alpha = 1 - (dissolveProg - death) / fadeWindow;

          // Eased local alpha
          alpha = alpha * alpha * (3 - 2 * alpha);
          const finalAlpha = a / 255 * alpha;
          if (finalAlpha < 0.01) continue;
          ctx.fillStyle = "rgba(" + data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + finalAlpha.toFixed(3) + ")";
          ctx.fillRect(x * blockSize, y * blockSize, bw, bh);
        }
      }
    }

    // Initial paint once layout settles
    schedule();
    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      ro.disconnect();
      if (unsubscribeMV) unsubscribeMV();
      if (state.scrollTrigger) state.scrollTrigger.kill();
      state.img = null;
      state.imgLoaded = false;
    };
  }, [src, sectionRef, progress, maxBlock, startAt, dissolveOvershoot, fadeWindow, direction, scrollStart, scrollEnd]);
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    className: "pd-wrap " + className,
    style: style,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "pd-canvas"
  }));
}
window.PixelDissolve = PixelDissolve;