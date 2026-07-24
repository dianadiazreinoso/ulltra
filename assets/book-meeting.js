/* Opens the HubSpot meetings calendar in a modal when a meeting CTA is clicked.
   Wires buttons/links whose label is a meeting CTA across all pages. */
(function () {
  "use strict";

  // load the HubSpot embed script once
  if (!document.querySelector('script[src*="MeetingsEmbedCode"]')) {
    var hs = document.createElement("script");
    hs.type = "text/javascript";
    hs.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
    document.head.appendChild(hs);
  }

  var css = document.createElement("style");
  css.textContent = [
    "#bm-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(10,8,7,.72);backdrop-filter:blur(6px);padding:20px;box-sizing:border-box;}",
    "#bm-modal.is-open{display:flex;}",
    "#bm-box{position:relative;display:flex;flex-direction:column;width:min(1000px,96vw);height:min(780px,92vh);background:#0A0807;border:1px solid rgba(237,229,204,.14);border-radius:16px;overflow:hidden;box-shadow:0 40px 120px -30px rgba(0,0,0,.85);}",
    "#bm-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 14px 22px;background:#0A0807;border-bottom:1px solid rgba(237,229,204,.12);flex:0 0 auto;}",
    "#bm-title{font-family:'Archivo',system-ui,sans-serif;font-weight:600;font-size:16px;letter-spacing:.01em;color:#EDE5CC;}",
    "#bm-close{width:36px;height:36px;border:none;background:rgba(237,229,204,.08);border-radius:50%;font-size:20px;line-height:1;cursor:pointer;color:#EDE5CC;display:grid;place-items:center;transition:background .25s ease,color .25s ease;}",
    "#bm-close:hover{background:rgba(210,255,0,.16);color:#D2FF00;}",
    "#bm-box .meetings-iframe-container{flex:1 1 auto;width:100%;overflow:auto;background:#fff;}",
    "#bm-box .meetings-iframe-container iframe{width:100%!important;height:100%!important;border:0;display:block;}"
  ].join("");
  document.head.appendChild(css);

  var modal = document.createElement("div");
  modal.id = "bm-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<div id="bm-box" role="dialog" aria-modal="true" aria-label="Book a meeting">' +
    '<div id="bm-head"><span id="bm-title">Book a meeting</span>' +
    '<button id="bm-close" type="button" aria-label="Close">\u00d7</button></div>' +
    '<div class="meetings-iframe-container" data-src="https://meetings-eu1.hubspot.com/javier-thomas/general?embed=true"></div>' +
    '</div>';
  document.body.appendChild(modal);

  function open() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  modal.querySelector("#bm-close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  var LABELS = ["book a meeting", "schedule a meeting", "schedule a demo"];
  function wire() {
    var els = document.querySelectorAll("button, a");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.dataset.bmWired === "1") continue;
      var t = (el.textContent || "").trim().toLowerCase();
      if (LABELS.indexOf(t) === -1) continue;
      el.dataset.bmWired = "1";
      // capture phase + stopPropagation so it overrides any framework handler
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      }, true);
    }
  }
  var mo = new MutationObserver(wire);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  wire();
})();
