/* Applies the internal-pages "scramble / decode" effect to the home hero <h1>.
   Waits until the green intro loader starts clearing so the effect is actually
   seen (otherwise it plays behind the loader). */
(function () {
  "use strict";
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/#@$%&";

  function scramble(el) {
    var target = el.getAttribute("data-scr");
    if (target == null) return;
    var len = target.length, frame = 0, SPEED = 1.6, CHURN = 10;
    (function tick() {
      var out = "", done = 0;
      for (var i = 0; i < len; i++) {
        var start = i * CHURN * 0.35;
        if (frame >= start + CHURN) { out += target[i]; done++; }
        else if (frame >= start) { out += target[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        else { out += target[i] === " " ? " " : ""; }
      }
      el.textContent = out; frame += SPEED;
      if (done < len) requestAnimationFrame(tick);
      else el.textContent = target;
    })();
  }

  function apply() {
    var h1 = document.querySelector(".hero-h1");
    if (!h1) return false;
    var words = h1.querySelectorAll(".word-wrap > span");
    if (!words.length) return false;
    var any = false;
    words.forEach(function (sp, i) {
      if (sp.dataset.scrInit) return;
      var txt = sp.textContent;
      if (!txt || !txt.trim()) return;
      sp.dataset.scrInit = "1";
      sp.setAttribute("data-scr", txt);
      any = true;
      setTimeout(function () { scramble(sp); }, 260 + i * 55);
    });
    return any;
  }

  function start() {
    if (start._did) return;
    start._did = true;
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (apply() || tries > 120) clearInterval(iv);
    }, 60);
  }

  function loaderGone(el) {
    return el.classList.contains("is-revealing") || el.classList.contains("is-done");
  }

  function ready() {
    var loader = document.getElementById("ull-loader");
    if (!loader || loaderGone(loader)) { start(); return; }
    var mo = new MutationObserver(function () {
      if (loaderGone(loader)) { mo.disconnect(); start(); }
    });
    mo.observe(loader, { attributes: true, attributeFilter: ["class"] });
    setTimeout(function () { mo.disconnect(); start(); }, 12000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
