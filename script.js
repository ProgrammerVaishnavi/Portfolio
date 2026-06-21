/* ============================================================
   Vaishnavi Gupta — Portfolio
   Plain JS. No dependencies.
   - Scroll progress bar
   - Fixed nav: scrolled state + active-section underline
   - Smooth-scroll for in-page anchors
   - Intersection Observer section reveal + staggered children
   - Working contact form: client-side validation → mailto:
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. Year stamp in footer
     ------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------
      2. Typing effect — tagline auto-types on load
     ------------------------------------------------------------ */
  var TYPED_TEXT = "an aspiring Software Development Engineer focused on AI-driven backend systems and problem solving.";
  var typedEl = document.getElementById("typed-text");

  function typeTagline() {
    if (!typedEl) return;
    typedEl.textContent = "";
    var charIndex = 0;
    var typeInterval = setInterval(function () {
      if (charIndex < TYPED_TEXT.length) {
        typedEl.textContent += TYPED_TEXT.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(typeTagline, 3000);
      }
    }, 35);
  }

  typeTagline();

  /* ------------------------------------------------------------
      3. Scroll progress bar (slim 2px, fixed top, accent)
     ------------------------------------------------------------ */
  var progressEl = document.getElementById("scrollProgress");
  var navEl = document.querySelector(".nav");

  function updateScrollState() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var maxScroll = (doc.scrollHeight - doc.clientHeight) || 0;
    var pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    if (progressEl) {
      progressEl.style.width = pct.toFixed(2) + "%";
    }
    if (navEl) {
      navEl.classList.toggle("is-scrolled", scrollTop > 8);
    }
  }

  // Throttled via rAF
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateScrollState();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateScrollState();

  /* ------------------------------------------------------------
      4. Smooth-scroll for in-page anchor links
        (CSS scroll-behavior handles most of it; this ensures
         nav links work even if CSS is overridden, and brings
         focus to the target for accessibility.)
     ------------------------------------------------------------ */
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Move focus for a11y without re-triggering scroll jump
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------
      5. Section reveal on scroll (Intersection Observer, once)
        + staggered children via CSS delays
     ------------------------------------------------------------ */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // trigger once
          }
        });
      },
      {
        // Trigger when section's top passes ~85% of viewport
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------
      6. Active nav link based on section in view
        Uses IntersectionObserver to highlight current section.
     ------------------------------------------------------------ */
  var navLinkMap = {};
  document.querySelectorAll(".nav-links a[data-nav]").forEach(function (a) {
    var id = a.getAttribute("data-nav");
    navLinkMap[id] = a;
  });

  var sections = ["about", "skills", "projects", "education", "contact"]
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var activeSection = null;

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (activeSection) {
              var prevLink = navLinkMap[activeSection];
              if (prevLink) prevLink.classList.remove("is-active");
            }
            activeSection = entry.target.id;
            var nextLink = navLinkMap[activeSection];
            if (nextLink) nextLink.classList.add("is-active");
          }
        });
      },
      {
        // Section considered "active" when its middle is in the viewport
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sections.forEach(function (sec) {
      sectionObserver.observe(sec);
    });
  }

  /* ------------------------------------------------------------
      7. Contact form: validation + mailto: handoff
        Collects values, basic validation, and opens a prefilled
        mailto: with subject and body.
     ------------------------------------------------------------ */
  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.classList.remove("is-error", "is-success");
    if (kind) statusEl.classList.add("is-" + kind);
  }

  function clearErrors(formEl) {
    formEl.querySelectorAll(".has-error").forEach(function (el) {
      el.classList.remove("has-error");
    });
  }

  function isEmail(value) {
    // Practical email check — not RFC-perfect but good enough for client-side
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors(form);

      var name = form.name ? form.name.value.trim() : "";
      var email = form.email ? form.email.value.trim() : "";
      var message = form.message ? form.message.value.trim() : "";

      var errors = [];

      if (!name) {
        if (form.name) form.name.classList.add("has-error");
        errors.push("name");
      }
      if (!email || !isEmail(email)) {
        if (form.email) form.email.classList.add("has-error");
        errors.push("email");
      }
      if (!message) {
        if (form.message) form.message.classList.add("has-error");
        errors.push("message");
      }

      if (errors.length) {
        setStatus(
          "Please fill in " + errors.join(", ") + " before sending.",
          "error"
        );
        return;
      }

      // Build mailto: with prefilled subject and body
      var recipient = "programmer.vaishnavi@gmail.com";
      var subject = "Portfolio contact — from " + name;
      var body = [
        "Name: " + name,
        "Email: " + email,
        "",
        "Message:",
        message,
        "",
        "— Sent from your portfolio website",
      ].join("\n");

      var mailtoUrl =
        "mailto:" +
        encodeURIComponent(recipient).replace(/%40/g, "@") +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      // Open the user's mail client
      window.location.href = mailtoUrl;

      // Reset + status
      setStatus(
        "Opening your email client… If nothing happens, write to programmer.vaishnavi@gmail.com.",
        "success"
      );
      form.reset();
    });

    // Clear error styling on input
    form.addEventListener("input", function (e) {
      if (e.target && e.target.classList.contains("has-error")) {
        e.target.classList.remove("has-error");
      }
      if (statusEl && statusEl.classList.contains("is-error")) {
        setStatus("");
      }
    });
  }
})();
