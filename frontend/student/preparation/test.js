
"use strict";

/* ==========================================
   UBUNTU GOJO — TEST PREPARATION
   Navigation
========================================== */

const views = [
  "overview",
  "requirements",
  "preparation",
  "progress",
  "resources"
];

const pageTitles = {
  overview: "Test Preparation Center",
  requirements: "Test Requirements",
  preparation: "My Test Preparation",
  progress: "Study Plan & Progress Tracker",
  resources: "Learning Resources"
};

// Display one section and hide the others.
function showTestView(view) {
  if (!views.includes(view)) return;

  views.forEach(name => {
    const section = document.getElementById(`test-${name}`);

    if (section) {
      section.hidden = name !== view;
    }
  });

  // Update the heading.
  const pageTitle = document.getElementById("page-title");

  if (pageTitle) {
    pageTitle.textContent = pageTitles[view];
  }

  // Highlight the selected sidebar button.
  document.querySelectorAll(".nav-item").forEach(button => {
    const active = button.dataset.view === view;

    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);
}

// Handle sidebar buttons and dashboard cards.
document.addEventListener("click", event => {
  const button = event.target.closest(
    "[data-view], [data-open-view]"
  );

  if (!button) return;

  const destination =
    button.dataset.view || button.dataset.openView;

  showTestView(destination);
});

// Start with the Test Overview.
showTestView("overview");
