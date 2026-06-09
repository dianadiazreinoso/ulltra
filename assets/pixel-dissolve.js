(function(){
const {
  useEffect,
  useRef
} = React;
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
  className = "",
  style,
  maxBlock = 56,
  startAt = 0.05,
  dissolveOvershoot = 1.18,
  fadeWindow = 0.22,
  direction = "random",
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
    let st = null;
    let unsubscribeMV = null;
    if (progress && typeof progress.on === "function") {
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
      if (Math.abs(p - state.lastDrawn) < 0.002 && state.lastDrawn >= 0) return;
      state.lastDrawn = p;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (p <= startAt) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(state.img, 0, 0, W, H);
        return;
      }
      if (p >= 1) return;
      const t = (p - startAt) / (1 - startAt);
      const e = easeOutCubic(t);
      const minBs = 2;
      const maxBs = Math.max(minBs + 1, Math.round(maxBlock * state.dpr));
      const blockSize = Math.max(minBs, Math.round(minBs + e * (maxBs - minBs)));
      const cols = Math.max(1, Math.ceil(W / blockSize));
      const rows = Math.max(1, Math.ceil(H / blockSize));
      const off = state.offscreen;
      off.width = cols;
      off.height = rows;
      const offCtx = state.offCtx;
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = "high";
      offCtx.clearRect(0, 0, cols, rows);
      offCtx.drawImage(state.img, 0, 0, cols, rows);
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
      const bw = blockSize + 1;
      const bh = blockSize + 1;
      const dirBias = direction === "top" ? 0.45 : direction === "bottom" ? -0.45 : 0;
      for (let y = 0; y < rows; y++) {
        const ny = rows > 1 ? y / (rows - 1) : 0;
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const a = data[i + 3];
          if (a < 4) continue;
          const nx = cols > 1 ? x / (cols - 1) : 0;
          const n = blockHash(Math.floor(nx * 96) + 0.5, Math.floor(ny * 128) + 0.5);
          let death = n * 0.75 + 0.12;
          if (dirBias !== 0) {
            death = death * (1 - Math.abs(dirBias)) + (dirBias > 0 ? ny : 1 - ny) * Math.abs(dirBias);
          }
          let alpha;
          if (dissolveProg <= death) alpha = 1;else if (dissolveProg >= death + fadeWindow) continue;else alpha = 1 - (dissolveProg - death) / fadeWindow;
          alpha = alpha * alpha * (3 - 2 * alpha);
          const finalAlpha = a / 255 * alpha;
          if (finalAlpha < 0.01) continue;
          ctx.fillStyle = "rgba(" + data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + finalAlpha.toFixed(3) + ")";
          ctx.fillRect(x * blockSize, y * blockSize, bw, bh);
        }
      }
    }
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
  return React.createElement("div", {
    ref: wrapRef,
    className: "pd-wrap " + className,
    style: style,
    "aria-hidden": "true"
  }, React.createElement("canvas", {
    ref: canvasRef,
    className: "pd-canvas"
  }));
}
window.PixelDissolve = PixelDissolve;
})();
