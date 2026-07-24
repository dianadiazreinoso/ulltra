/* Adds the "Work" dropdown (expand chevron + project sub-items) to the HOME
   index menu, which is rendered by the compiled hero.js and lacks it. This
   enhancer injects into the rendered DOM without touching hero.js. The menu is
   re-created by React each time it opens, so a MutationObserver re-applies. */
(function () {
  "use strict";

  var SUBS = [
    { n: "AOS",            href: "aos.html" },
    { n: "DataLab",        href: "datalab.html" },
    { n: "Lista Robinson", href: "lista-robinson.html" },
    { n: "Solairis",       href: "solairis.html" }
  ];
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  var css = document.createElement("style");
  css.id = "home-work-style";
  css.textContent = [
    /* hide the default right-arrow on the Work row */
    ".menu-link[href='#work'] .menu-arrow{ display:none !important; }",
    /* expand chevron — sits on the right of the Work row */
    ".menu-work-chev{ position:absolute; right:0; transform:translateY(-50%); width:46px; height:46px; display:grid; place-items:center; background:none; border:none; padding:0; cursor:pointer; color:var(--ink,#EDE5CC); transition:transform .35s ease, color .3s ease; z-index:3; }",
    ".menu-work-chev svg{ width:28px; height:28px; display:block; }",
    "li.menu-work-open .menu-work-chev{ color:var(--lime,#D2FF00); }",
    "li.menu-work-open .menu-work-chev svg{ transform:rotate(180deg); }",
    /* the project sub-list */
    ".menu-work-sub{ list-style:none; margin:0; padding:0; max-height:0; overflow:hidden; transition:max-height .45s cubic-bezier(.19,1,.22,1); }",
    "li.menu-work-open .menu-work-sub{ max-height:460px; }",
    ".menu-work-sub a{ display:block; padding:10px 0 10px clamp(44px,7vw,86px); text-decoration:none; color:var(--ink-2,#9a927f); font-family:'Archivo', ui-sans-serif, system-ui, sans-serif; font-weight:500; font-size:clamp(18px,2.4vw,26px); letter-spacing:-0.01em; }",
    ".menu-work-sub a:hover{ color:var(--lime,#D2FF00); }"
  ].join("\n");
  document.head.appendChild(css);

  function enhance() {
    var link = document.querySelector(".menu-link[href='#work']");
    if (!link) return;
    var li = link.closest("li");
    if (!li || li.dataset.workEnh === "1") return;
    li.dataset.workEnh = "1";
    li.style.position = "relative";

    // expand chevron (separate button so it doesn't trigger the link's navigation)
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "menu-work-chev";
    btn.setAttribute("aria-label", "Show Work items");
    btn.innerHTML = CHEV;
    li.appendChild(btn);
    // position after layout (offsetHeight is reliable once painted)
    requestAnimationFrame(function () {
      btn.style.top = ((link.offsetHeight || 64) / 2) + "px";
    });

    // project sub-items
    var sub = document.createElement("ul");
    sub.className = "menu-work-sub";
    SUBS.forEach(function (s) {
      var sli = document.createElement("li");
      var a = document.createElement("a");
      a.href = s.href;
      a.textContent = s.n;
      sli.appendChild(a);
      sub.appendChild(sli);
    });
    li.appendChild(sub);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      li.classList.toggle("menu-work-open");
    });

    // Also expand when clicking the "Work" word / the whole row (not just the chevron).
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      li.classList.toggle("menu-work-open");
    });
  }

  var mo = new MutationObserver(function () { enhance(); });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
