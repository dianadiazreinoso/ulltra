/* Igualador de alturas de cards en MÓVIL (<=760px).
   Dos grupos:
     1) #software .ap-cards .ac  -> todas al alto de la más alta.
        Necesario para que el stack sticky (todas con top:360px) se apile al
        100%: si una card es más alta que la que se le monta encima, asoma una
        franja por debajo.
     2) #work .cl-card           -> todas al alto de la más alta (Solairis) + 15px.
        Aquí hay que usar setProperty(...,'important') porque el CSS móvil
        declara `.cl-card{ min-height:0 !important }` y ganaría al inline.
   Se remide tras las fuentes web (document.fonts.ready): en iOS las fuentes
   suelen terminar DESPUÉS de window.load y cambian el alto del texto, lo que
   dejaba las alturas calculadas obsoletas (era el motivo de que en el móvil
   real siguieran desiguales aunque en escritorio cuadrasen). */
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

  function equalize(group) {
    var cards = document.querySelectorAll(group.sel);
    if (cards.length < 2) return false;

    if (!isMobile()) { // en escritorio se queda limpio
      for (var z = 0; z < cards.length; z++) setMinH(cards[z], "", group.important);
      return true;
    }

    // 1) forzar min-height:0 para medir el alto NATURAL (así un min-height de
    //    respaldo en el CSS no falsea la medida ni la va inflando en cada pase)
    for (var i = 0; i < cards.length; i++) setMinH(cards[i], "0px", group.important);

    // 2) medir el más alto (ignorando los que estén ocultos, p.ej. .cl-card--art)
    var max = 0;
    for (var j = 0; j < cards.length; j++) {
      var h = cards[j].offsetHeight;
      if (h > max) max = h;
    }
    if (max <= 0) return false;

    // 3) aplicar a todas
    var target = (max + group.extra) + "px";
    for (var k = 0; k < cards.length; k++) {
      if (cards[k].offsetHeight <= 0) continue; // ocultas: no tocar
      setMinH(cards[k], target, group.important);
    }
    return true;
  }

  function run() {
    for (var i = 0; i < GROUPS.length; i++) equalize(GROUPS[i]);
  }

  // Las cards de Selected work las pinta React, así que se sondea hasta que existan.
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

  // Clave en iOS: remedir cuando las fuentes web ya están aplicadas.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(run, 60); });
  }
  // Red de seguridad por si algo se monta tarde.
  setTimeout(run, 1200);
  setTimeout(run, 2600);
  setTimeout(run, 5200);

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(run, 150);
  });
  window.addEventListener("orientationchange", function () { setTimeout(run, 300); });
})();
