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
   este archivo falta o se queda en una versión vieja, nadie enciende las cards
   y quedan invisibles PARA SIEMPRE (ya pasó). Para que ese fallo no pueda
   repetirse, el CSS solo las oculta cuando este JS ha añadido la clase
   `sw-fade-ready` a #software. Sin JS, se ven. */
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

  /* ── B) Entrada de las cards de #software ──────────────────────────────
     Mismo mecanismo que las cards de Consultancy, que es lo que se pidió:
     el progreso de scroll NO se usa tal cual, se pasa antes por un muelle
     (los mismos valores que usa Framer allí: stiffness 90, damping 28,
     mass .35) y de ese valor amortiguado salen la opacidad y el
     desplazamiento, con la misma curva cubic-bezier(.65,0,.35,1).

     La clave de la fluidez es que el muelle se integra en CADA fotograma,
     no cuando llega un evento de scroll. En iOS esos eventos llegan a
     trompicones durante la inercia, y por eso una animación atada
     directamente a la posición se ve a tirones.

     Cada card tiene su ventana de progreso. Como están superpuestas con
     z-index creciente, la 2 al entrar tapa a la 1 y la 3 tapa a la 2: no hay
     que apagar la de debajo y el relevo queda limpio. Marcha atrás igual. */
  var VENTANAS = [            // [empieza, termina] sobre el progreso de la sección
    [0.08, 0.28],
    [0.36, 0.56],
    [0.64, 0.84]
  ];
  var DESPL = 80;             // px que sube la card al entrar (como Consultancy)
  var MUELLE = { k: 90, c: 28, m: 0.35 };

  /* cubic-bezier(.65,0,.35,1) resuelto por Newton, igual que el `d` de allí */
  function bezier(x1, y1, x2, y2) {
    function A(a, b) { return 1 - 3 * b + 3 * a; }
    function B(a, b) { return 3 * b - 6 * a; }
    function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 6; i++) {
        var d = slope(t, x1, x2);
        if (d === 0) break;
        t -= (calc(t, x1, x2) - x) / d;
      }
      return calc(t, y1, y2);
    };
  }
  var EASE = bezier(0.65, 0, 0.35, 1);

  function initCrossfade() {
    var sec = document.querySelector("#software");
    var cards = [].slice.call(document.querySelectorAll("#software .ap-cards .ac"));
    if (!sec || cards.length < 3) return false;

    var x = 0, v = 0;          // posición y velocidad del muelle
    var ultimo = 0;
    var corriendo = false;
    var cerca = false;

    function objetivo() {
      var r = sec.getBoundingClientRect();
      var travel = r.height - window.innerHeight;
      if (travel <= 0) return 0;
      var p = -r.top / travel;
      return p < 0 ? 0 : (p > 1 ? 1 : p);
    }

    function pintar() {
      var arriba = -1;
      for (var i = 0; i < cards.length && i < VENTANAS.length; i++) {
        var w = VENTANAS[i];
        var t = (x - w[0]) / (w[1] - w[0]);
        if (t < 0) t = 0; else if (t > 1) t = 1;
        var e = EASE(t);
        cards[i].style.setProperty("--sw-fade", e.toFixed(3));
        cards[i].style.setProperty("--sw-y", ((1 - e) * DESPL).toFixed(1) + "px");
        if (e > 0.5) arriba = i;
      }
      for (var j = 0; j < cards.length; j++) {
        cards[j].style.pointerEvents = (j === arriba) ? "auto" : "none";
      }
    }

    function frame(now) {
      if (!corriendo) return;
      var dt = ultimo ? (now - ultimo) / 1000 : 1 / 60;
      ultimo = now;
      if (dt > 0.05) dt = 0.05;          // tras un parón, no pegar un salto

      var destino = objetivo();
      // muelle: a = (-k(x-destino) - c·v) / m
      var a = (-MUELLE.k * (x - destino) - MUELLE.c * v) / MUELLE.m;
      v += a * dt;
      x += v * dt;

      if (Math.abs(x - destino) < 0.0002 && Math.abs(v) < 0.002) {
        x = destino; v = 0;
        pintar();
        corriendo = false; ultimo = 0;
        return;
      }
      pintar();
      requestAnimationFrame(frame);
    }

    function arrancar() {
      if (corriendo || !cerca) return;
      corriendo = true; ultimo = 0;
      requestAnimationFrame(frame);
    }

    function desactivar() {
      sec.classList.remove("sw-fade-ready");
      for (var d = 0; d < cards.length; d++) {
        cards[d].style.removeProperty("--sw-fade");
        cards[d].style.removeProperty("--sw-y");
        cards[d].style.pointerEvents = "";
      }
    }

    function revisar() {
      if (!isMobile()) { corriendo = false; desactivar(); return; }
      sec.classList.add("sw-fade-ready");
      arrancar();
    }

    // El bucle solo corre con la sección cerca: no gasta batería el resto del rato.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        cerca = entries[0].isIntersecting;
        if (cerca) revisar();
      }, { rootMargin: "150% 0px 150% 0px" }).observe(sec);
    } else {
      cerca = true;
    }

    window.addEventListener("scroll", function () { if (isMobile()) arrancar(); }, { passive: true });
    window.addEventListener("resize", function () { x = objetivo(); v = 0; revisar(); });
    window.addEventListener("orientationchange", function () { setTimeout(function () { x = objetivo(); v = 0; revisar(); }, 300); });

    if (isMobile()) {
      x = objetivo(); v = 0;
      sec.classList.add("sw-fade-ready");
      pintar();
    }
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
