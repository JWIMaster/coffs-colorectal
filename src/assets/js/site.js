/* ==========================================================================
   Coffs Colorectal Surgery — site behaviour
   No dependencies. Everything degrades gracefully without JavaScript:
   the menu is a plain hidden element, details/summary handles the FAQ,
   and the theme falls back to the system preference.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ----------------------------------------------------------------------
     1. Appearance
     The stored choice wins; otherwise follow the operating system.
     ---------------------------------------------------------------------- */
  var root = document.documentElement;
  var stored = null;
  try {
    stored = localStorage.getItem("ccs-theme");
  } catch (e) {
    /* private browsing — ignore */
  }

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  } else {
    root.setAttribute("data-theme", systemTheme());
  }

  var themeButtons = document.querySelectorAll("[data-theme-toggle]");
  Array.prototype.forEach.call(themeButtons, function (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ccs-theme", next);
      } catch (e) {
        /* ignore */
      }
      // Keep the theme-color meta in step with the chosen appearance.
      var metas = document.querySelectorAll('meta[name="theme-color"]');
      Array.prototype.forEach.call(metas, function (m) {
        if (m.getAttribute("media")) return;
        m.setAttribute("content", next === "dark" ? "#0e181d" : "#fdfcfa");
      });
    });
  });

  // If the user has not chosen explicitly, follow the system as it changes.
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemChange = function () {
    if (!stored) root.setAttribute("data-theme", systemTheme());
  };
  if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
  else if (mq.addListener) mq.addListener(onSystemChange);

  /* ----------------------------------------------------------------------
     2. Header scroll edge effect
     A shadow appears only once content is actually passing underneath.
     ---------------------------------------------------------------------- */
  var header = document.getElementById("site-header");
  if (header) {
    var ticking = false;
    var updateHeader = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateHeader);
        }
      },
      { passive: true },
    );
    updateHeader();
  }

  /* ----------------------------------------------------------------------
     3. Menu sheet
     Opens on press, tracks the finger 1:1 while dragging, inherits the
     release velocity, and can be grabbed again at any time.
     ---------------------------------------------------------------------- */
  var sheet = document.getElementById("nav-sheet");
  var openBtn = document.querySelector("[data-menu-open]");

  if (sheet && openBtn) {
    var panel = sheet.querySelector(".nav-sheet__panel");
    var scrim = sheet.querySelector(".nav-sheet__scrim");
    var closers = sheet.querySelectorAll("[data-menu-close]");
    var lastFocus = null;

    var isOpen = function () {
      return sheet.getAttribute("data-open") === "true";
    };

    // Everything outside the sheet is made inert while it is open, so keyboard
    // and screen-reader users cannot wander into the page behind it.
    function setBackground(inert) {
      document.querySelectorAll("main, .footer").forEach(function (el) {
        if (inert) el.setAttribute("inert", "");
        else el.removeAttribute("inert");
      });
    }

    function openSheet() {
      lastFocus = document.activeElement;
      sheet.hidden = false;
      // Force a reflow so the transition runs from the closed position.
      void sheet.offsetWidth;
      sheet.setAttribute("data-open", "true");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setBackground(true);
      var first = panel.querySelector("a, button");
      if (first) first.focus({ preventScroll: true });
    }

    function closeSheet() {
      if (!isOpen()) return;
      panel.style.transform = "";
      if (scrim) scrim.style.opacity = "";
      sheet.removeAttribute("data-dragging");
      sheet.setAttribute("data-open", "false");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      setBackground(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      window.setTimeout(function () {
        if (!isOpen()) sheet.hidden = true;
      }, reduceMotion.matches ? 140 : 300);
    }

    openBtn.addEventListener("click", function () {
      isOpen() ? closeSheet() : openSheet();
    });

    Array.prototype.forEach.call(closers, function (el) {
      el.addEventListener("click", closeSheet);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) closeSheet();
    });

    // Keep focus inside the sheet while it is open.
    sheet.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !isOpen()) return;
      var focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* ---- drag to dismiss -------------------------------------------------
       Straight from Designing Fluid Interfaces: track 1:1 from the grab
       point, keep a short history so we know the release velocity, and
       decide by the *sign of the velocity* as well as the position.        */

    var dragging = false;
    var startX = 0;
    var startY = 0;
    var currentX = 0;
    var panelWidth = 1;
    var history = [];
    var pointerId = null;
    var decided = null; // "x" once we commit to horizontal
    var THRESHOLD = 10; // hysteresis before committing to a direction

    function velocity() {
      if (history.length < 2) return 0;
      var a = history[0];
      var b = history[history.length - 1];
      var dt = (b.t - a.t) / 1000;
      if (dt <= 0) return 0;
      return (b.x - a.x) / dt; // px per second
    }

    function applyDrag(dx) {
      currentX = Math.max(0, dx);
      // Rubber-band: the further past the closed position, the less it follows.
      var overshoot = dx < 0 ? -dx : 0;
      var resisted =
        (overshoot * panelWidth * 0.55) / (panelWidth + 0.55 * overshoot);
      var x = Math.max(0, dx) + resisted;
      panel.style.transform = "translate3d(" + x + "px,0,0)";
      var progress = 1 - Math.min(1, Math.max(0, dx) / panelWidth);
      if (scrim) scrim.style.opacity = String(Math.max(0, progress));
    }

    if (panel) {
      panel.addEventListener("pointerdown", function (e) {
        if (!isOpen()) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragging = true;
        decided = null;
        startX = e.clientX;
        startY = e.clientY;
        currentX = 0;
        history = [{ x: e.clientX, t: e.timeStamp }];
        panelWidth = panel.getBoundingClientRect().width || 1;
        pointerId = e.pointerId;
      });

      panel.addEventListener("pointermove", function (e) {
        if (!dragging || e.pointerId !== pointerId) return;

        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        // Detect the plausible gesture before committing to one.
        if (decided === null) {
          if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
          decided = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (decided === "x") {
            panel.setPointerCapture(pointerId);
            sheet.setAttribute("data-dragging", "true");
          } else {
            // Vertical intent: this is a scroll, so abandon the drag.
            dragging = false;
            return;
          }
        }

        history.push({ x: e.clientX, t: e.timeStamp });
        if (history.length > 6) history.shift();
        applyDrag(dx);

        if (dx > 0 && e.cancelable) e.preventDefault();
      });

      function endDrag(e) {
        if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
        dragging = false;
        sheet.removeAttribute("data-dragging");
        if (decided !== "x") return;

        var v = velocity(); // px/s, negative = leftwards = dismissing
        var projected = currentX + (v / 1000) * 0.998 / (1 - 0.998);
        // Dismiss if the projection lands past halfway, or if it was flicked.
        var shouldClose =
          projected > panelWidth * 0.5 || (v < -500 && currentX > 12);

        panel.style.transform = "";

        if (shouldClose) {
          if (scrim) scrim.style.opacity = "";
          closeSheet();
        } else {
          // Snap back. A spring would be ideal; a short ease-out from the
          // current position keeps it continuous without a library.
          panel.style.transition =
            "transform 260ms cubic-bezier(0.22,1,0.36,1)";
          panel.style.transform = "translate3d(0,0,0)";
          if (scrim) scrim.style.opacity = "";
          window.setTimeout(function () {
            panel.style.transition = "";
            panel.style.transform = "";
          }, 280);
        }
        decided = null;
        pointerId = null;
      }

      panel.addEventListener("pointerup", endDrag);
      panel.addEventListener("pointercancel", endDrag);
    }
  }

  /* ----------------------------------------------------------------------
     4. Scroll reveal
     Only where motion is welcome, and only once per element.
     ---------------------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(reveals, function (el) {
        el.setAttribute("data-visible", "true");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-visible", "true");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      Array.prototype.forEach.call(reveals, function (el) {
        io.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------------------
     5. Current section in the header nav
     Highlights the section you are reading, for pages inside a section.
     ---------------------------------------------------------------------- */
  var path = window.location.pathname;
  var navLinks = document.querySelectorAll(".nav__link, .nav-sheet__link");
  Array.prototype.forEach.call(navLinks, function (link) {
    if (link.hasAttribute("aria-current")) return;
    var href = link.getAttribute("href");
    if (!href || href === "/") return;
    if (path !== href && path.indexOf(href) === 0) {
      link.setAttribute("data-section-active", "true");
    }
  });
})();
