/* Shared "INDEX" menu overlay for the internal pages (DataLab, Solairis, AOS,
   Lista Robinson). Injects the overlay + wires the existing .btn-menu hamburger.
   Section links point back to the home; Work expands to the project pages. */
(function () {
  "use strict";
  if (document.getElementById("inav")) return;

  var SECTIONS = [
    { n: "Positioning", href: "index.html#positioning" },
    { n: "Software",    href: "index.html#software" },
    { n: "Consultancy", href: "index.html#consultancy" },
    { n: "Capabilities",href: "index.html#capabilities" },
    { n: "Stack",       href: "index.html#stack" },
    { n: "Work",        href: "index.html#work", sub: [
        { n: "AOS",            href: "aos.html" },
        { n: "DataLab",        href: "datalab.html" },
        { n: "Lista Robinson", href: "lista-robinson.html" },
        { n: "Solairis",       href: "solairis.html" }
      ] },
    { n: "Clients",     href: "index.html#clients" },
    { n: "Contact",     href: "index.html#footer" }
  ];

  /* ---- styles ---- */
  var css = document.createElement("style");
  css.id = "inav-style";
  css.textContent = [
    ".inav{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.55);",
    "  display:flex;justify-content:flex-end;box-sizing:border-box;",
    "  opacity:0;visibility:hidden;pointer-events:none;transition:opacity .45s cubic-bezier(.19,1,.22,1),visibility .45s;}",
    ".inav.is-open{opacity:1;visibility:visible;pointer-events:auto;}",
    ".inav-panel{width:min(460px,92vw);height:100%;background:var(--bg,#0A0807);color:var(--ink,#EDE5CC);display:flex;flex-direction:column;padding:clamp(20px,4vw,40px);box-sizing:border-box;overflow-y:auto;transform:translateX(30px);transition:transform .45s cubic-bezier(.19,1,.22,1);box-shadow:-24px 0 60px rgba(0,0,0,.5);}",
    ".inav.is-open .inav-panel{transform:translateX(0);}",
    "@media(max-width:760px){.inav{background:var(--bg,#0A0807);}.inav-panel{width:100%;box-shadow:none;transform:none;}}",
    ".inav-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(18px,3vw,34px);}",
    ".inav-eyebrow{font-family:\"JetBrains Mono\",ui-monospace,monospace;font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--ink-2,#B8AD93);}",
    ".inav-close{width:44px;height:44px;display:grid;place-items:center;background:none;border:1px solid rgba(237,229,204,.32);color:var(--ink,#EDE5CC);cursor:pointer;border-radius:0;font-size:22px;line-height:1;}",
    ".inav-close:hover{border-color:var(--ink,#EDE5CC);}",
    ".inav-list{list-style:none;margin:0;padding:0;flex:1 1 auto;}",
    ".inav-row{border-top:1px solid rgba(237,229,204,.18);}",
    ".inav-link{display:flex;align-items:center;gap:clamp(14px,2vw,28px);padding:clamp(12px,1.6vw,18px) 0;text-decoration:none;color:var(--ink,#EDE5CC);}",
    ".inav-num{font-family:\"JetBrains Mono\",ui-monospace,monospace;font-size:12px;letter-spacing:.1em;color:var(--ink-2,#B8AD93);min-width:26px;}",
    ".inav-name{font-family:var(--ff-display,\"Archivo\",sans-serif);font-weight:700;font-size:clamp(30px,5vw,52px);line-height:1;letter-spacing:-0.02em;}",
    ".inav-link:hover .inav-name{color:var(--lime,#D2FF00);}",
    ".inav-toggle{margin-left:auto;width:40px;height:40px;flex:0 0 auto;display:grid;place-items:center;background:none;border:1px solid rgba(237,229,204,.3);color:var(--ink,#EDE5CC);cursor:pointer;border-radius:50%;transition:transform .35s ease,border-color .3s ease;}",
    ".inav-row.is-expanded .inav-toggle{transform:rotate(180deg);border-color:var(--lime,#D2FF00);color:var(--lime,#D2FF00);}",
    ".inav-sub{list-style:none;margin:0;padding:0;max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.19,1,.22,1);}",
    ".inav-row.is-expanded .inav-sub{max-height:420px;}",
    ".inav-sub a{display:block;padding:8px 0 8px clamp(40px,6vw,66px);text-decoration:none;color:var(--ink-2,#B8AD93);font-family:var(--ff-display,\"Archivo\",sans-serif);font-weight:500;font-size:clamp(17px,2.4vw,24px);}",
    ".inav-sub a:hover{color:var(--lime,#D2FF00);}",
    ".inav-sub li:last-child a{padding-bottom:14px;}",
    "body.inav-open{overflow:hidden;}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---- overlay markup ---- */
  var pad2 = function (i) { return ("0" + (i + 1)).slice(-2); };
  var ov = document.createElement("nav");
  ov.className = "inav";
  ov.id = "inav";
  ov.setAttribute("aria-label", "Index");
  ov.setAttribute("aria-hidden", "true");

  var html = '<div class="inav-panel"><div class="inav-head"><span class="inav-eyebrow">Index</span>'
    + '<button class="inav-close" type="button" aria-label="Close menu">\u00d7</button></div>'
    + '<ul class="inav-list">';
  SECTIONS.forEach(function (s, i) {
    html += '<li class="inav-row">'
      + '<a class="inav-link" href="' + s.href + '">'
      + '<span class="inav-num">' + pad2(i) + '</span>'
      + '<span class="inav-name">' + s.n + '</span>'
      + (s.sub ? '<button class="inav-toggle" type="button" aria-label="Show ' + s.n + ' items">\u2304</button>' : '')
      + '</a>';
    if (s.sub) {
      html += '<ul class="inav-sub">';
      s.sub.forEach(function (c) { html += '<li><a href="' + c.href + '">' + c.n + '</a></li>'; });
      html += '</ul>';
    }
    html += '</li>';
  });
  html += '</ul>';
  html += '</div>';
  ov.innerHTML = html;
  document.body.appendChild(ov);

  /* ---- behaviour ---- */
  function open() { ov.classList.add("is-open"); ov.setAttribute("aria-hidden", "false"); document.body.classList.add("inav-open"); }
  function close() { ov.classList.remove("is-open"); ov.setAttribute("aria-hidden", "true"); document.body.classList.remove("inav-open"); }

  // Work (and any section with sub-items) expands instead of navigating on the toggle
  ov.querySelectorAll(".inav-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      btn.closest(".inav-row").classList.toggle("is-expanded");
    });
  });

  ov.querySelector(".inav-close").addEventListener("click", close);
  ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  // wire the existing hamburger(s)
  function wire() {
    var burgers = document.querySelectorAll(".btn-menu");
    if (!burgers.length) return false;
    burgers.forEach(function (b) {
      if (b.dataset.inav === "1") return;
      b.dataset.inav = "1";
      b.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    return true;
  }
  if (!wire()) {
    var tries = 0, iv = setInterval(function () { if (wire() || ++tries > 40) clearInterval(iv); }, 150);
  }
})();
