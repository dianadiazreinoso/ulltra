/* =============================================================================
   Ulltra — Section Navigator (capsule-stretch rail)
   -----------------------------------------------------------------------------
   A persistent, architectural section rail on the right edge (desktop only).
   • One travelling lime blob; the active state MORPHS between slots with a
     transform-only capsule-stretch (no bounce, ~420ms, easeInOut).
   • Active section = the dominant chapter in the viewport (the major section
     whose top has crossed the viewport centre), not raw top order.
   • Tints light/dark to stay legible over each section (reads data-header
     behind the rail), exactly like the header.
   • Hidden during the loader and while the mobile menu drawer is open.
   Vanilla + self-contained (injects its own CSS); independent of React so it
   can observe sections rendered across many files.
   ========================================================================== */
(function () {
  "use strict";

  // Labels + selectors — must match the MENU sections (NAV_ITEMS), in real
  // document order (numbers are assigned from that order at boot). Hero and
  // Archetype are NOT menu entries, so they are intentionally absent.
  var SECTIONS = [
    { sel: ".hero",        label: "Hero" },
    { sel: "#positioning", label: "Positioning" },
    { sel: "#software",    label: "Software" },
    { sel: "#consultancy", label: "Consultancy" },
    { sel: "#capabilities", label: "Capabilities" },
    { sel: ".stk",         label: "Stack" },
    { sel: "#work",        label: "Work" },
    { sel: "#clients",     label: "Clients" },
    { sel: "#footer",      label: "Contact" }
  ];
  function num(i) { return ("0" + (i + 1)).slice(-2); }

  var REDUCED = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Styles ────────────────────────────────────────────────────────────────
  var css = `
  .secnav{
    position: fixed;
    right: clamp(16px, 2vw, 30px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 90;                 /* below loader (1000) + mobile menu (96) */
    display: none;
    opacity: 0;
    pointer-events: none;
    color: #EDE5CC;              /* default tint (over dark sections) */
    transition: opacity .6s var(--ease-out-cine, cubic-bezier(.19,1,.22,1)),
                color .5s ease;
  }
  .secnav.is-onlight{ color: #1A1612; }
  @media (min-width: 900px){
    .secnav.is-ready{ display: block; }
    .secnav.is-ready.is-shown{ opacity: 1; pointer-events: auto; }
  }
  .secnav-inner{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 7px;
    border-radius: 999px;                       /* navigation capsule */
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    background: color-mix(in srgb, currentColor 5%, transparent);
    -webkit-backdrop-filter: blur(5px);
    backdrop-filter: blur(5px);
  }
  .secnav-slot{
    position: relative;
    width: 14px; height: 14px;
    display: grid; place-items: center;
    background: none; border: 0; padding: 0; margin: 0;
    color: inherit; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .secnav-dot{
    width: 7px; height: 7px;
    box-sizing: border-box;
    aspect-ratio: 1 / 1;                          /* guarantee a true circle */
    border-radius: 50%;
    border: 1px solid currentColor;
    opacity: .30;                                 /* very subtle */
    transition: opacity .3s ease, transform .3s ease;
  }
  .secnav-slot:hover .secnav-dot{ opacity: .8; transform: scale(1.15); }
  .secnav-slot.is-active .secnav-dot{ opacity: 0; }     /* blob replaces it */
  .secnav-slot:focus-visible{ outline: none; }
  .secnav-slot:focus-visible .secnav-dot{
    opacity: .9; box-shadow: 0 0 0 3px rgba(208,255,0,.35);
  }
  .secnav-blob{
    position: absolute;
    left: 50%; top: 0;
    width: 9px; height: 9px;
    margin-left: -4.5px;
    border-radius: 999px;          /* caps = width/2 → always a true capsule, never an egg */
    background: #D0FF00;
    box-shadow: none;
    transform-origin: 50% 0;
    will-change: transform, height;
    pointer-events: none;
  }
  /* Stretch by GROWING HEIGHT (width stays fixed), so the blob reads as a
     rounded-rectangle capsule bridging the two slots, then settles — the round
     caps never distort the way a scaleY'd circle would. */
  @keyframes secnav-travel{
    0%   { transform: translateY(var(--from-top)); height: var(--h0); }
    50%  { transform: translateY(var(--mid-top));  height: var(--h-mid); }
    100% { transform: translateY(var(--to-top));   height: var(--h0); }
  }
  /* Over light sections the active blob inverts to dark ink for contrast. */
  .secnav.is-onlight .secnav-blob{
    background: #1D1A17;
    box-shadow: none;
  }
  .secnav-label{
    position: absolute;
    right: 24px; top: 50%;
    transform: translateY(-50%) translateX(6px);
    white-space: nowrap;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
    color: inherit; opacity: 0; pointer-events: none;
    transition: opacity .28s ease, transform .32s var(--ease-out-cine, cubic-bezier(.19,1,.22,1));
  }
  .secnav-label .secnav-num{ opacity: .5; margin-right: .7em; }
  .secnav-slot:hover .secnav-label,
  .secnav-slot:focus-visible .secnav-label{
    opacity: .92; transform: translateY(-50%) translateX(0);
  }
  /* Scroll-down hint — attached BELOW the anchor bar, centred on its axis,
     20px gap. Absolutely positioned so it never shifts the capsule's vertical
     centring. Shows only while the Hero section is active; lime like the dots. */
  .secnav-scroll{
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 20px;
    display: flex;
    justify-content: center;
    color: #D0FF00;
    opacity: 0;
    pointer-events: none;
    transition: opacity .5s var(--ease-out-cine, cubic-bezier(.19,1,.22,1));
  }
  .secnav.is-hero .secnav-scroll{ opacity: .9; }
  .secnav-mouse{
    position: relative;
    display: block;
    width: 26px; height: 42px;
    border: 2px solid currentColor;
    border-radius: 16px;
  }
  .secnav-mouse-wheel{
    position: absolute;
    left: 50%; top: 7px;
    width: 4px; height: 8px;
    margin-left: -2px;
    border-radius: 4px;
    background: currentColor;
    animation: secnav-wheel 1.8s cubic-bezier(.15,.41,.69,.94) infinite;
  }
  @keyframes secnav-wheel{
    0%   { opacity: 0; transform: translateY(0); }
    12%  { opacity: 1; }
    100% { opacity: 0; transform: translateY(16px); }
  }
  @media (prefers-reduced-motion: reduce){
    .secnav, .secnav-label{ transition: opacity .3s ease; }
    .secnav-mouse-wheel{ animation: none; }
  }`;

  function injectCSS() {
    var s = document.createElement("style");
    s.id = "secnav-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ── Build ───────────────────────────────────────────────────────────────
  var nav, inner, blob, slots = [], slotY = [], els = [];
  var activeIdx = -1, currentY = 0;

  function build() {
    nav = document.createElement("nav");
    nav.className = "secnav";
    nav.setAttribute("aria-label", "Section navigation");

    inner = document.createElement("div");
    inner.className = "secnav-inner";

    SECTIONS.forEach(function (s, i) {
      var nn = num(i);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "secnav-slot";
      btn.setAttribute("aria-label", nn + " " + s.label);

      var dot = document.createElement("span");
      dot.className = "secnav-dot";
      dot.setAttribute("aria-hidden", "true");
      btn.appendChild(dot);

      btn.addEventListener("click", function () { scrollToSection(i); });
      inner.appendChild(btn);
      slots.push(btn);
    });

    blob = document.createElement("span");
    blob.className = "secnav-blob";
    blob.setAttribute("aria-hidden", "true");
    inner.appendChild(blob);

    nav.appendChild(inner);

    // Scroll-down hint attached below the bar (shown only on the Hero section).
    var scroll = document.createElement("div");
    scroll.className = "secnav-scroll";
    scroll.setAttribute("aria-hidden", "true");
    scroll.innerHTML = '<span class="secnav-mouse"><span class="secnav-mouse-wheel"></span></span>';
    nav.appendChild(scroll);

    document.body.appendChild(nav);
    blob.addEventListener("animationend", onAnimEnd);

    nav.classList.add("is-ready");
    void inner.offsetWidth;     // reflow so slot rects are real before measuring
    measureSlots();
  }

  function measureSlots() {
    var innerTop = inner.getBoundingClientRect().top;
    slotY = slots.map(function (b) {
      var r = b.getBoundingClientRect();
      return (r.top - innerTop) + r.height / 2;
    });
  }

  // ── Section geometry / active resolution ──────────────────────────────────
  function sectionTops() {
    var y = window.scrollY || window.pageYOffset;
    return SECTIONS.map(function (s, i) {
      var el = (els && els[i]) || document.querySelector(s.sel);
      if (!el) return Infinity;
      return el.getBoundingClientRect().top + y;
    });
  }

  // Dominant chapter = the last major section whose TOP has crossed the
  // viewport centre. Software becomes active exactly when its hero composition
  // takes the upper half of the viewport, and stays the marked chapter through
  // its minor sub-sections until the next major chapter takes over.
  function computeActive() {
    var mid = (window.scrollY || window.pageYOffset) + window.innerHeight * 0.5;
    var tops = sectionTops();
    var idx = 0;
    for (var i = 0; i < tops.length; i++) {
      if (tops[i] - 4 <= mid) idx = i;     // small tolerance
    }
    return idx;
  }

  // ── Adaptive tint — read data-header of whatever sits behind the rail ──────
  function updateTint() {
    var x = Math.max(8, window.innerWidth - 96);
    var el = document.elementFromPoint(x, window.innerHeight * 0.5);
    var mode = null;
    while (el && el !== document.body) {
      if (el.hasAttribute && el.hasAttribute("data-header")) {
        mode = el.getAttribute("data-header"); break;
      }
      el = el.parentElement;
    }
    // light section → dark rail; dark section → light rail
    nav.classList.toggle("is-onlight", mode === "light");
  }

  // ── Capsule-stretch travel — CSS keyframe (height-bridge, no distortion) ───
  // The blob keeps a fixed width and grows in HEIGHT to bridge the two slots at
  // mid-travel, then settles — a magnetic capsule with perfectly round caps, no
  // egg-shaped scaling. Driven by a CSS animation (not rAF) so it stays smooth
  // even under main-thread load.
  var BLOB = 9;

  function restBlob(y) {
    blob.style.animation = "none";
    blob.style.height = BLOB + "px";
    blob.style.transform = "translateY(" + (y - BLOB / 2).toFixed(2) + "px)";
    currentY = y;
  }

  function setActive(idx, animate) {
    if (idx === activeIdx) return;
    var prev = activeIdx;
    activeIdx = idx;
    nav.classList.toggle("is-hero", idx === 0);   // scroll hint only on Hero
    slots.forEach(function (b, i) { b.classList.toggle("is-active", i === idx); });

    var toY = slotY[idx] || 0;
    if (!animate || prev < 0 || REDUCED) { restBlob(toY); return; }

    var fromY = currentY;                          // slot centres
    var dist = Math.abs(toY - fromY);
    var midH = dist + BLOB;                         // capsule spans both slots at mid-travel
    var topFrom = fromY - BLOB / 2;
    var topTo   = toY   - BLOB / 2;
    var topMid  = Math.min(fromY, toY) - BLOB / 2;  // capsule top edge while stretched
    var dur = Math.round(360 + Math.min(dist, 70) * 1.2); // ~360–450ms

    blob.style.setProperty("--from-top", topFrom.toFixed(2) + "px");
    blob.style.setProperty("--to-top",   topTo.toFixed(2) + "px");
    blob.style.setProperty("--mid-top",  topMid.toFixed(2) + "px");
    blob.style.setProperty("--h0",    BLOB + "px");
    blob.style.setProperty("--h-mid", midH.toFixed(2) + "px");
    // restart the animation
    blob.style.animation = "none";
    void blob.offsetWidth;                 // reflow → allow restart
    blob.style.animation = "secnav-travel " + dur + "ms cubic-bezier(.4,0,.2,1) both";
    currentY = toY;
  }

  function onAnimEnd() { restBlob(currentY); }

  // ── Smooth scroll to a section ─────────────────────────────────────────────
  function scrollToSection(i) {
    var el = els[i] || document.querySelector(SECTIONS[i].sel);
    if (!el) return;
    var y = el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
    window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: REDUCED ? "auto" : "smooth" });
  }

  // ── Visibility ─────────────────────────────────────────────────────────────
  function menuOpen() {
    return !!document.querySelector('.nav-portal[aria-hidden="false"]');
  }
  function loaderDone() {
    if (window.__ullRevealDone) return true;
    var l = document.getElementById("ull-loader");
    if (!l) return true;                 // no loader on this page
    return l.classList.contains("is-done");
  }
  function updateVisibility() {
    var show = loaderDone() && !menuOpen();
    nav.classList.toggle("is-shown", show);
    // Re-measure once the rail is actually visible (slot rects are 0 while
    // display:none), so the blob travels between real slot positions.
    if (show && (!slotY.length || !slotY[slotY.length - 1])) {
      measureSlots();
      restBlob(slotY[activeIdx] || 0);
    }
  }

  // ── Scroll handling ───────────────────────────────────────────────────────
  // Active detection is SYNCHRONOUS on scroll (cheap: cached rects) so it never
  // depends on rAF (which is throttled in background tabs). Tint + visibility
  // are time-throttled since they're less critical.
  var lastAux = 0;
  function onScroll() {
    setActive(computeActive(), true);
    var now = performance.now();
    if (now - lastAux > 110) { lastAux = now; updateTint(); updateVisibility(); }
  }

  function start() {
    injectCSS();
    // Resolve real document order (positions are known once sections exist) and
    // sort so the rail is monotonic with scroll regardless of render order.
    var tops0 = sectionTops();
    SECTIONS = SECTIONS
      .map(function (s, i) { return { s: s, top: tops0[i] }; })
      .sort(function (a, b) { return a.top - b.top; })
      .map(function (o) { return o.s; });
    els = SECTIONS.map(function (s) { return document.querySelector(s.sel); });
    build();
    setActive(computeActive(), false);
    updateTint();
    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      measureSlots();
      restBlob(slotY[activeIdx] || 0);
      updateTint();
    }, { passive: true });
    window.addEventListener("ull-reveal-done", updateVisibility);
    // Poll visibility briefly so the rail fades in cleanly once the loader ends
    // and reacts to the mobile menu opening/closing.
    setInterval(updateVisibility, 400);
  }

  // ── Boot: wait until the sections exist (React mounts async) ───────────────
  function ready() {
    return document.querySelector("#footer") &&
           document.querySelector(".hero") &&
           document.querySelector("#software");
  }
  if (ready()) {
    start();
  } else {
    var tries = 0;
    var poll = setInterval(function () {
      tries++;
      if (ready()) { clearInterval(poll); start(); }
      else if (tries > 140) { clearInterval(poll); }   // ~21s safety
    }, 150);
  }
})();
