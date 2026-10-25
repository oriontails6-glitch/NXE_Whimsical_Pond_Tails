/* ============================================================
   SCRIPT.JS — builds the page from characters.js
   You should NOT need to edit this file when adding characters.
   Just edit characters.js instead.
============================================================= */

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cardHTML(person) {
  const backName = person.backName || person.name;
  return `
      <div class="card" tabindex="0" role="button" aria-expanded="false" aria-label="${escapeHTML(person.name)} card">
        <div class="card-inner">
          <div class="card-front">
            <img src="${escapeHTML(person.img)}" alt="${escapeHTML(person.name)}" loading="lazy">
            <div class="card-label">
              <span class="card-name">${escapeHTML(person.name)}</span>
              <span class="card-role">${escapeHTML(person.role)}</span>
            </div>
            <span class="flip-hint">tap ↻</span>
          </div>
          <div class="card-back">
            <span class="card-name back-name">${escapeHTML(backName)}</span>
            <p class="card-bio">${escapeHTML(person.bio)}</p>
            <span class="flip-hint">tap ↩</span>
          </div>
        </div>
      </div>`;
}

function sectionHTML(section) {
  const cards = (section.data || []).map(cardHTML).join("\n");
  return `
    <section class="pond-section" id="sec-${escapeHTML(section.id)}">
      <h2 class="section-title">${escapeHTML(section.label)}</h2>
      <div class="card-grid">
        ${cards}
      </div>
    </section>`;
}

// Ensure SECTIONS exists
if (typeof SECTIONS !== "undefined" && Array.isArray(SECTIONS)) {
  // Render all sections
  const mainContent = document.getElementById("mainContent");
  if (mainContent) {
    mainContent.innerHTML = SECTIONS.map(sectionHTML).join("\n");
  }

  // Render nav buttons
  const navBar = document.getElementById("navBar");
  if (navBar) {
    navBar.innerHTML = SECTIONS.map(
      s => `<button class="nav-btn" data-target="sec-${escapeHTML(s.id)}">${escapeHTML(s.label)}</button>`
    ).join("\n");
  }

  // Flip interaction
  document.querySelectorAll(".card").forEach(function (card) {
    function toggle() {
      const isFlipped = card.classList.toggle("flipped");
      card.setAttribute("aria-expanded", isFlipped ? "true" : "false");
    }
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Nav scrolling and active state tracking
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".pond-section");
  let isClickScrolling = false;
  let clickScrollTimer = null;

  function setActiveNav(targetId) {
    navBtns.forEach(function (b) {
      if (b.dataset.target === targetId) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  // Set initial active state to the first section
  if (sections.length > 0) {
    setActiveNav(sections[0].id);
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        setActiveNav(btn.dataset.target);
        isClickScrolling = true;
        clearTimeout(clickScrollTimer);
        clickScrollTimer = setTimeout(function () {
          isClickScrolling = false;
        }, 1000);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Highlight active nav section on manual scroll
  let ticking = false;
  function updateActiveOnScroll() {
    if (isClickScrolling) {
      ticking = false;
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Scrolled near the bottom of the page -> highlight the last section
    if (scrollY + windowHeight >= docHeight - 50) {
      if (sections.length > 0) {
        setActiveNav(sections[sections.length - 1].id);
      }
      ticking = false;
      return;
    }

    // Find the section currently positioned near the sticky navbar
    let currentId = sections[0]?.id;
    sections.forEach(function (sec) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 140) {
        currentId = sec.id;
      }
    });

    if (currentId) {
      setActiveNav(currentId);
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveOnScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
} else {
  console.error("SECTIONS is not defined in characters.js");
}
