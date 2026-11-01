
"use strict";

// Ubuntu Gojo — Essay Studio Navigation

const views = [
  "overview",
  "workspace",
  "planning",
  "review",
  "resources"
];

const titles = {
  overview: "Essay Studio",
  workspace: "My Essay Workspace",
  planning: "Planning & Brainstorming",
  review: "Revision & Self-Review",
  resources: "Writing Resources"
};

// Display the selected section.
function showEssayView(view) {
  if (!views.includes(view)) return;

  views.forEach(name => {
    const section = document.getElementById(`essay-${name}`);

    if (section) {
      section.hidden = name !== view;
    }
  });

  // Update the page heading.
  document.getElementById("page-title").textContent =
    titles[view];

  // Highlight the active sidebar button.
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

// Sidebar and dashboard card navigation.
document.addEventListener("click", event => {
  const button = event.target.closest(
    "[data-view], [data-open-view]"
  );

  if (!button) return;

  const destination =
    button.dataset.view || button.dataset.openView;

  showEssayView(destination);
});

// Display the overview when the page opens.
showEssayView("overview");
