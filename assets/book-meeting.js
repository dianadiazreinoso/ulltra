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
    "#bm-modal{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.62);backdrop-filter:blur(3px);}",
    "#bm-modal.is-open{display:flex;}",
    "#bm-box{position:relative;width:min(980px,95vw);height:min(760px,90vh);background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 30px 90px -20px rgba(0,0,0,.6);}",
    "#bm-close{position:absolute;top:10px;right:10px;z-index:2;width:40px;height:40px;border:none;background:rgba(0,0,0,.06);border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#111;}",
    "#bm-close:hover{background:rgba(0,0,0,.12);}",
    "#bm-box .meetings-iframe-container{width:100%;height:100%;overflow:auto;}",
    "#bm-box .meetings-iframe-container iframe{width:100%!important;height:100%!important;border:0;}"
  ].join("");
  document.head.appendChild(css);

  var modal = document.createElement("div");
  modal.id = "bm-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<div id="bm-box" role="dialog" aria-modal="true" aria-label="Book a meeting">' +
    '<button id="bm-close" type="button" aria-label="Close">\u00d7</button>' +
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

  var LABELS = ["book a meeting", "schedule a meeting", "schedule a demo", "get started"];
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
