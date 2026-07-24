/* Shared "Get Started" form drawer (right side) — recreates the home's gs-drawer
   for the internal pages. Wires any button/link labelled "Get Started" to open it. */
(function () {
  "use strict";

  var css = document.createElement("style");
  css.textContent = [
    "#gsf-modal{position:fixed;inset:0;z-index:99998;display:none;justify-content:flex-end;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);}",
    "#gsf-modal.is-open{display:flex;}",
    "#gsf-drawer{width:min(540px,92vw);height:100%;background:var(--bg,#0A0807);color:var(--ink,#EDE5CC);display:flex;flex-direction:column;overflow-y:auto;overscroll-behavior:contain;padding:clamp(24px,4vw,44px);box-sizing:border-box;transform:translateX(30px);transition:transform .5s cubic-bezier(.19,1,.22,1);box-shadow:-24px 0 60px rgba(0,0,0,.5);}",
    "#gsf-modal.is-open #gsf-drawer{transform:translateX(0);}",
    "#gsf-close{align-self:flex-end;width:40px;height:40px;border:1px solid rgba(237,229,204,.3);background:none;border-radius:50%;color:var(--ink,#EDE5CC);cursor:pointer;display:grid;place-items:center;font-size:20px;line-height:1;transition:border-color .25s,color .25s;}",
    "#gsf-close:hover{border-color:var(--lime,#D2FF00);color:var(--lime,#D2FF00);}",
    ".gsf-title{font-family:var(--ff-display,'Archivo',ui-sans-serif,sans-serif);font-weight:700;font-size:clamp(1.7rem,3vw,2.3rem);line-height:1.06;letter-spacing:-.01em;margin:16px 0 8px;}",
    ".gsf-sub{color:var(--ink-2,#9a927f);margin:0 0 22px;font-family:'Archivo',ui-sans-serif,sans-serif;font-size:1rem;}",
    ".gsf-form{display:flex;flex-direction:column;gap:13px;}",
    ".gsf-field{display:flex;flex-direction:column;gap:6px;}",
    ".gsf-field>span{font-size:12.5px;letter-spacing:.03em;text-transform:uppercase;color:var(--ink-2,#9a927f);font-family:'JetBrains Mono',ui-monospace,monospace;}",
    ".gsf-field input,.gsf-field textarea{background:rgba(237,229,204,.04);border:1px solid rgba(237,229,204,.18);border-radius:0;color:var(--ink,#EDE5CC);font-family:'Archivo',ui-sans-serif,sans-serif;font-size:15px;padding:12px 14px;outline:none;width:100%;box-sizing:border-box;transition:border-color .25s;}",
    ".gsf-field input:focus,.gsf-field textarea:focus{border-color:var(--lime,#D2FF00);}",
    ".gsf-field textarea{resize:vertical;}",
    ".gsf-submit{margin-top:8px;height:52px;background:var(--lime,#D2FF00);color:#0A0807;border:none;border-radius:0;font-family:'Archivo',ui-sans-serif,sans-serif;font-weight:600;font-size:15px;letter-spacing:.01em;cursor:pointer;transition:opacity .3s,background-color .3s;}",
    ".gsf-submit:disabled{opacity:.65;cursor:default;}",
    "@media(max-width:600px){#gsf-drawer{width:100%;box-shadow:none;transform:none;}}"
  ].join("");
  document.head.appendChild(css);

  var modal = document.createElement("div");
  modal.id = "gsf-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML =
    '<aside id="gsf-drawer" role="dialog" aria-modal="true" aria-label="Get started">' +
    '<button id="gsf-close" type="button" aria-label="Close">\u00d7</button>' +
    '<h2 class="gsf-title">Let\u2019s build your AI advantage</h2>' +
    '<p class="gsf-sub">Tell us about your company and goals.</p>' +
    '<form class="gsf-form" novalidate>' +
    '<label class="gsf-field"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>' +
    '<label class="gsf-field"><span>Company</span><input type="text" name="company" autocomplete="organization"></label>' +
    '<label class="gsf-field"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>' +
    '<label class="gsf-field"><span>Phone</span><input type="tel" name="phone" autocomplete="tel"></label>' +
    '<label class="gsf-field"><span>Tell us about your project</span><textarea name="message" rows="4"></textarea></label>' +
    '<button type="submit" class="gsf-submit">Submit</button>' +
    '</form></aside>';
  document.body.appendChild(modal);

  var form = modal.querySelector(".gsf-form");
  var submitBtn = modal.querySelector(".gsf-submit");

  function open() { modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; if (window.__lenis && window.__lenis.stop) window.__lenis.stop(); }
  function close() { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (window.__lenis && window.__lenis.start) window.__lenis.start(); }
  modal.querySelector("#gsf-close").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  var sending = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    sending = true; submitBtn.disabled = true; submitBtn.textContent = "Sending\u2026";
    var v = function (n) { return (form.elements[n] && form.elements[n].value || "").trim(); };
    var data = { name: v("name"), company: v("company"), email: v("email"), phone: v("phone"), message: v("message"), _subject: "New enquiry from " + (v("name") || "website") + (v("company") ? " \u00b7 " + v("company") : ""), _template: "table", _captcha: "false" };
    fetch("https://formsubmit.co/ajax/hello@ulltra.ai", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); submitBtn.textContent = "Thank you \u2014 we'll be in touch"; form.reset(); })
      .catch(function () { submitBtn.textContent = "Something went wrong \u2014 try again"; submitBtn.disabled = false; })
      .then(function () { sending = false; });
  });

  function wire() {
    var els = document.querySelectorAll("button, a");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.dataset.gsfWired === "1") continue;
      if ((el.textContent || "").trim().toLowerCase() !== "get started") continue;
      el.dataset.gsfWired = "1";
      el.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); open(); }, true);
    }
  }
  var mo = new MutationObserver(wire);
  mo.observe(document.documentElement, { childList: true, subtree: true });
  wire();
})();
