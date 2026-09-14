/* MÓVIL (<=760px). Dos trabajos sobre las cards de la home:

   A) Igualar alturas
      - #software .ap-cards .ac : todas al alto de la más alta. Necesario para
        que el relevo por opacidad sea limpio (si una asoma por debajo de otra
        se nota el cambio).
      - #work .cl-card : todas al alto de la más alta (Solairis) + 15px. Aquí
        hay que usar setProperty(...,'important') porque el CSS móvil declara
        `.cl-card{ min-height:0 !important }` y ganaría al inline.
      Se remide tras document.fonts.ready: en iOS las fuentes terminan DESPUÉS
      de window.load y cambian el alto del texto.

   B) Relevo por opacidad de las 3 cards de #software
      El banner queda fijo a pantalla completa y las cards, superpuestas, entran
      y salen por opacidad según el progreso de scroll de la sección.

   IMPORTANTE — por qué existe la clase `sw-fade-ready`:
   el CSS oculta las cards por defecto para que el relevo empiece en negro. Si
   este archivo falta o se queda en una versión vieja, nadie pone --sw-fade y
   las cards quedan invisibles PARA SIEMPRE (ya pasó). Para que ese fallo no
   pueda repetirse, el CSS solo oculta las cards cuando este JS ha añadido la
   clase `sw-fade-ready` a #software. Sin JS, se ven. */
(function () {
  "use strict";

  var MQ = "(max-width: 760px)";
  var GROUPS = [
    { sel: "#software .ap-cards .ac", extra: 0,  important: false },
    { sel: "#work .cl-card",          extra: 15, important: true  }
  ];

  function isMobile() {
    return window.matchMedia && window.matchMedia(MQ).matches;
  }

  function setMinH(el, value, important) {
    if (important) {
      if (value) el.style.setProperty("min-height", value, "important");
      else el.style.removeProperty("min-height");
    } else {
      el.style.minHeight = value || "";
    }
  }

  /* ── A) Igualador de alturas ───────────────────────────────────────────── */
  function equalize(group) {
    var cards = document.querySelectorAll(group.sel);
    if (cards.length < 2) return false;

    if (!isMobile()) {
      for (var z = 0; z < cards.length; z++) setMinH(cards[z], "", group.important);
      return true;
    }

    // min-height:0 para medir el alto NATURAL (así un min-height de respaldo en
    // el CSS no falsea la medida ni la va inflando en cada pase)
    for (var i = 0; i < cards.length; i++) setMinH(cards[i], "0px", group.important);

    var max = 0;
    for (var j = 0; j < cards.length; j++) {
      var h = cards[j].offsetHeight;
      if (h > max) max = h;
    }
    if (max <= 0) return false;

    var target = (max + group.extra) + "px";
    for (var k = 0; k < cards.length; k++) {
      if (cards[k].offsetHeight <= 0) continue;   // ocultas: no tocar
      setMinH(cards[k], target, group.important);
    }
    return true;
  }

  function run() {
    for (var i = 0; i < GROUPS.length; i++) equalize(GROUPS[i]);
  }

  function waitAndRun(tries) {
    tries = tries || 0;
    var ready = true;
    for (var i = 0; i < GROUPS.length; i++) {
      if (document.querySelectorAll(GROUPS[i].sel).length < 2) ready = false;
    }
    if (ready) { run(); return; }
    if (tries < 150) setTimeout(function () { waitAndRun(tries + 1); }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { waitAndRun(0); });
  } else {
    waitAndRun(0);
  }
  window.addEventListener("load", run);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(run, 60); });
  }
  setTimeout(run, 1200);
  setTimeout(run, 2600);
  setTimeout(run, 5200);

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(run, 150);
  });
  window.addEventListener("orientationchange", function () { setTimeout(run, 300); });

  /* ── B) Relevo por opacidad de las cards de #software ──────────────────── */
  /* Ventanas sobre el progreso de scroll de la sección (0 = arriba, 1 = final).
     Cada card: [entra desde, entra hasta, sale desde, sale hasta]. Son
     consecutivas, no solapadas: una se va del todo y entonces entra la
     siguiente, así no se transparenta el fondo con dos cards a medias. La
     tercera no sale nunca. El primer tramo (0 -> 0.16) no tiene ninguna card:
     es donde se ve solo el banner al hacer snap. */
  var WINDOWS = [
    [0.16, 0.23, 0.38, 0.45],
    [0.45, 0.52, 0.67, 0.74],
    [0.74, 0.81, 9, 9]
  ];

  function ramp(p, a, b) {               // 0 en a, 1 en b
    if (b === a) return p >= b ? 1 : 0;
    var v = (p - a) / (b - a);
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  function initCrossfade() {
    var sec = document.querySelector("#software");
    var cards = [].slice.call(document.querySelectorAll("#software .ap-cards .ac"));
    if (!sec || cards.length < 3) return false;

    var pending = null;

    function paint() {
      pending = null;

      if (!isMobile()) {
        sec.classList.remove("sw-fade-ready");
        for (var d = 0; d < cards.length; d++) {
          cards[d].style.removeProperty("--sw-fade");
          cards[d].style.pointerEvents = "";
        }
        return;
      }

      var r = sec.getBoundingClientRect();
      var travel = r.height - window.innerHeight;   // recorrido scrolleable real
      if (travel <= 0) return;
      var p = -r.top / travel;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      for (var i = 0; i < cards.length && i < WINDOWS.length; i++) {
        var w = WINDOWS[i];
        var o = ramp(p, w[0], w[1]) * (1 - ramp(p, w[2], w[3]));
        cards[i].style.setProperty("--sw-fade", o.toFixed(3));
        cards[i].style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
      // Se activa el CSS solo cuando ya hay valores puestos: así no hay parpadeo
      // y, si este archivo faltara, las cards se seguirían viendo.
      sec.classList.add("sw-fade-ready");
    }

    function schedule() {
      if (pending === null) pending = requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", function () { setTimeout(paint, 300); });
    paint();
    return true;
  }

  function waitCrossfade(tries) {
    tries = tries || 0;
    if (initCrossfade()) return;
    if (tries < 150) setTimeout(function () { waitCrossfade(tries + 1); }, 100);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { waitCrossfade(0); });
  } else {
    waitCrossfade(0);
  }
})();
