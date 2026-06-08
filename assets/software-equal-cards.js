(function () {
  "use strict";
  var SEL = "#software .ap-cards .ac";
  var MQ = "(max-width: 760px)";
  function run() {
    var cards = document.querySelectorAll(SEL);
    if (cards.length < 2) return;
    cards.forEach(function (c) { c.style.minHeight = ""; });
    if (!window.matchMedia(MQ).matches) return;
    var max = 0;
    cards.forEach(function (c) { if (c.offsetHeight > max) max = c.offsetHeight; });
    if (max > 0) cards.forEach(function (c) { c.style.minHeight = max + "px"; });
  }
  function wait(n) {
    n = n || 0;
    if (document.querySelectorAll(SEL).length >= 2) { run(); }
    else if (n < 150) { setTimeout(function () { wait(n + 1); }, 100); }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { wait(0); });
  } else { wait(0); }
  window.addEventListener("load", run);
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(run, 150); });
})();
