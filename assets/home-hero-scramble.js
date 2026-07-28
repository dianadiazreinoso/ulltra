/* Applies the internal-pages "scramble / decode" effect to the home hero <h1>.
   Runs once, per word, roughly in sync with the existing word rise-up. */
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

  function run() {
    var h1 = document.querySelector(".hero-h1");
    if (!h1) return false;
    var words = h1.querySelectorAll(".word-wrap > span");
    if (!words.length) return false;
    var any = false;
    words.forEach(function (sp, i) {
      if (sp.dataset.scrInit) return;
      var txt = sp.textContent;
      if (!txt || !txt.trim()) return;      // skip empty / space-only spans
      sp.dataset.scrInit = "1";
      sp.setAttribute("data-scr", txt);
      any = true;
      // ~match the hero's rise-up: base delay 0.78s + per-word stagger
      setTimeout(function () { scramble(sp); }, 780 + i * 55);
    });
    return any;
  }

  // The hero is rendered by React; poll briefly until the words exist.
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (run() || tries > 80) clearInterval(iv);
  }, 80);
})();
