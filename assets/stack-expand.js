(function () {
  var mq = window.matchMedia("(min-width: 761px)");

  function setup() {
    var wrap = document.querySelector("#stack .ap-cards");
    if (!wrap) return false;
    var cards = wrap.querySelectorAll(".ac");
    if (cards.length < 3) return false;
    if (wrap.dataset.expandReady === "1") return true;
    wrap.dataset.expandReady = "1";

    var longCard = cards[0];
    var others = [];
    for (var i = 1; i < cards.length; i++) others.push(cards[i]);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ac-more";
    btn.innerHTML = 'Read more';
    longCard.appendChild(btn);

    var expanded = false;

    function clearHeights() {
      wrap.style.alignItems = "start";
      longCard.style.height = "";
      others.forEach(function (c) { c.style.height = ""; });
    }

    // Reset everything the mobile branch may have set (height/overflow/minHeight)
    function resetMobileStyles() {
      cards.forEach(function (c) {
        c.style.minHeight = "";
        c.style.height = "";
        c.style.overflow = "";
      });
    }

    function apply() {
      if (!mq.matches) {
        // MOBILE: give EVERY card the same height so they stack cleanly, cover
        // each other and leave together. The shared height is one screen (or the
        // tallest short card, whichever is bigger, so short cards are never
        // clipped). The long first card (Agentic AI) is the only one that
        // exceeds it, so it gets clamped to the shared height with the fade +
        // Read more toggle instead of forcing every card up to its huge size.
        resetMobileStyles();
        var vis = Math.max(320, window.innerHeight - 360);
        var tallestOther = 0;
        others.forEach(function (c) { if (c.offsetHeight > tallestOther) tallestOther = c.offsetHeight; });
        var h = Math.max(vis, tallestOther);
        cards.forEach(function (c) {
          c.style.minHeight = h + "px";
          c.style.height = h + "px";
          c.style.overflow = "hidden";
        });
        wrap.style.alignItems = "start";

        var overflows = longCard.scrollHeight > h + 8;
        if (expanded) {
          longCard.classList.add("ac--collapsible", "is-expanded");
          longCard.style.height = "";     // expand to show all of its content
          longCard.style.overflow = "";
          btn.style.display = "";
          btn.innerHTML = "Read less";
        } else if (overflows) {
          longCard.classList.add("ac--collapsible");
          longCard.classList.remove("is-expanded");
          btn.style.display = "";
          btn.innerHTML = "Read more";
        } else {
          longCard.classList.remove("ac--collapsible", "is-expanded");
          btn.style.display = "none";
        }
        return;
      }
      btn.style.display = "";

      // desktop: undo everything the mobile branch may have set before measuring
      resetMobileStyles();

      // measure natural heights with nothing forced
      clearHeights();
      var h = 0;
      others.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
      var longNatural = longCard.offsetHeight;

      if (longNatural <= h + 8) {
        // nothing to collapse — heights already match closely
        longCard.classList.remove("ac--collapsible", "is-expanded");
        btn.style.display = "none";
        wrap.style.alignItems = "stretch";
        return;
      }

      longCard.classList.add("ac--collapsible");

      if (expanded) {
        longCard.classList.add("is-expanded");
        longCard.style.height = "";            // grow to full content
        others.forEach(function (c) { c.style.height = h + "px"; });
        wrap.style.alignItems = "start";       // don't stretch the short ones
        btn.innerHTML = 'Read less';
      } else {
        longCard.classList.remove("is-expanded");
        longCard.style.height = h + "px";      // clamp to the shared height
        others.forEach(function (c) { c.style.height = ""; });
        wrap.style.alignItems = "stretch";     // short ones stretch to match
        btn.innerHTML = 'Read more';
      }
    }

    btn.addEventListener("click", function () {
      expanded = !expanded;
      apply();
    });

    // let fonts/layout settle before first measure
    setTimeout(apply, 350);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(apply, 50); });
    }

    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(apply, 150);
    });
    if (mq.addEventListener) mq.addEventListener("change", apply);

    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (setup() || tries > 60) clearInterval(iv);
  }, 200);
  if (document.readyState !== "loading") setup();
  else document.addEventListener("DOMContentLoaded", setup);
})();
