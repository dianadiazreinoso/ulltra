/* Adds a lime "Clients" label above the client-logos section (.oc), which is
   rendered by client-logos.js. Re-applies via observer in case of re-render. */
(function () {
  "use strict";
  var css = document.createElement("style");
  css.textContent =
    ".oc-clients-label{position:relative;z-index:3;text-align:center;" +
    "font-family:'JetBrains Mono',ui-monospace,monospace;" +
    "font-size:clamp(12px,1vw,14px);font-weight:600;letter-spacing:.26em;" +
    "text-transform:uppercase;color:#D2FF00;margin:0 0 22px;}";
  document.head.appendChild(css);

  function add() {
    var oc = document.querySelector(".oc");
    if (!oc || oc.dataset.clientsLabel === "1") return;
    oc.dataset.clientsLabel = "1";
    var el = document.createElement("div");
    el.className = "oc-clients-label";
    el.textContent = "Clients";
    oc.insertBefore(el, oc.firstChild);
  }

  var mo = new MutationObserver(add);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  add();
})();
