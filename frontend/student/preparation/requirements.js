
"use strict";

/* ==========================================
   UBUNTU GOJO — OTHER REQUIREMENTS
   Page Navigation + CV Builder
========================================== */

// ==========================================
// 1. PAGE NAVIGATION
// ==========================================

// Available sections
const views = [
  "overview",
  "cv",
  "portfolio",
  "recommendations",
  "supporting",
  "checklist",
  "resources"
];

// Page headings
const pageTitles = {
  overview: "Other Requirements Center",
  cv: "CV & Resume Builder",
  portfolio: "Portfolio & Projects",
  recommendations: "Recommendation Letters",
  supporting: "Supporting Requirements",
  checklist: "Requirements Checklist",
  resources: "Guidance & Resources"
};

// Display the selected section
function showRequirementsView(view) {

  if (!views.includes(view)) return;

  // Show selected section and hide the others
  views.forEach(name => {

    const section = document.getElementById(
      `requirements-${name}`
    );

    if (section) {
      section.hidden = name !== view;
    }

  });

  // Update the page heading
  const pageTitle = document.getElementById("page-title");

  if (pageTitle) {
    pageTitle.textContent = pageTitles[view];
  }

  // Highlight the selected sidebar button
  document.querySelectorAll(".nav-item").forEach(button => {

    const active = button.dataset.view === view;

    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }

  });

  // Return to the top of the page
  window.scrollTo(0, 0);
}

// Handle sidebar buttons and dashboard cards
document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-view], [data-open-view]"
  );

  if (!button) return;

  const destination =
    button.dataset.view || button.dataset.openView;

  showRequirementsView(destination);

});

// Display overview when the page loads
showRequirementsView("overview");


// ==========================================
// 2. CV & RESUME BUILDER
// ==========================================

// Find the CV form and preview container
const cvForm = document.getElementById("cv-form");
const cvPreview = document.getElementById("cv-preview");

// Continue only if both elements exist
if (cvForm && cvPreview) {

  cvForm.addEventListener("submit", function (event) {

    // Prevent page refresh when submitting the form
    event.preventDefault();

    // Get the information entered by the student
    function getValue(id) {

      const field = document.getElementById(id);

      return field ? field.value.trim() : "";

    }

    const name = getValue("cv-name");
    const email = getValue("cv-email");
    const summary = getValue("cv-summary");
    const education = getValue("cv-education");
    const experience = getValue("cv-experience");
    const skills = getValue("cv-skills");
    const projects = getValue("cv-projects");
    const awards = getValue("cv-awards");

    // Clear the previous CV preview
    cvPreview.replaceChildren();

    // Create text elements safely
    function addText(tag, content, parent = cvPreview) {

      const element = document.createElement(tag);

      element.textContent = content;

      parent.appendChild(element);

      return element;

    }

    // Create a CV section if information was entered
    function addSection(title, content) {

      if (!content) return;

      const section = document.createElement("section");

      section.className = "cv-preview-section";

      addText("h3", title, section);

      addText("p", content, section);

      cvPreview.appendChild(section);

    }

    // ======================================
    // 3. GENERATE THE CV PREVIEW
    // ======================================

    // Student name
    addText("h2", name);

    // Contact information
    if (email) {
      addText("p", email);
    }

    // Personal summary
    addSection(
      "Personal Summary",
      summary
    );

    // Academic background
    addSection(
      "Education",
      education
    );

    // Experiences and activities
    addSection(
      "Experience & Activities",
      experience
    );

    // Skills
    addSection(
      "Skills",
      skills
    );

    // Projects
    addSection(
      "Projects",
      projects
    );

    // Awards
    addSection(
      "Awards & Achievements",
      awards
    );

    // ======================================
    // 4. DISPLAY THE PREVIEW
    // ======================================

    cvPreview.hidden = false;

    // Update preparation status
    const saveStatus = document.getElementById(
      "save-status"
    );

    if (saveStatus) {
      saveStatus.textContent = "CV preview generated";
    }

    // Scroll to the generated CV
    cvPreview.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

}

/* ==========================================
   PORTFOLIO & PROJECTS
========================================== */

const portfolioForm = document.getElementById("portfolio-form");
const portfolioList = document.getElementById("portfolio-list");

if (portfolioForm && portfolioList) {

  // Projects are temporarily stored in memory.
  const projects = [];

  function getProjectValue(id) {
    return document.getElementById(id).value.trim();
  }

  function createProjectText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderProjects() {
    portfolioList.replaceChildren();

    projects.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "portfolio-project-card";

      createProjectText(card, "h3", project.title);
      createProjectText(card, "p", project.category);
      createProjectText(card, "p", project.description);

      if (project.role) {
        createProjectText(card, "h4", "My Contribution");
        createProjectText(card, "p", project.role);
      }

      if (project.skills) {
        createProjectText(card, "h4", "Skills Demonstrated");
        createProjectText(card, "p", project.skills);
      }

      if (project.outcome) {
        createProjectText(card, "h4", "Results & Achievements");
        createProjectText(card, "p", project.outcome);
      }

      if (project.link) {
        const link = document.createElement("a");
        link.href = project.link;
        link.textContent = "View Project";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "secondary-btn";
      removeButton.textContent = "Remove Project";

      removeButton.addEventListener("click", () => {
        projects.splice(index, 1);
        renderProjects();
      });

      card.appendChild(removeButton);
      portfolioList.appendChild(card);
    });
  }

  portfolioForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!portfolioForm.reportValidity()) return;

    const project = {
      title: getProjectValue("project-title"),
      category: getProjectValue("project-category"),
      description: getProjectValue("project-description"),
      role: getProjectValue("project-role"),
      skills: getProjectValue("project-skills"),
      outcome: getProjectValue("project-outcome"),
      link: getProjectValue("project-link")
    };

    projects.push(project);
    renderProjects();
    portfolioForm.reset();

    const status = document.getElementById("save-status");

    if (status) {
      status.textContent = "Project added (not saved)";
    }
  });
}

/* ==========================================
   5. RECOMMENDATION LETTER TRACKER
========================================== */

const recommendationForm = document.getElementById(
  "recommendation-form"
);

const recommendationsList = document.getElementById(
  "recommendations-list"
);

if (recommendationForm && recommendationsList) {

  // Temporary frontend storage
  const recommendations = [];

  // Read a form field safely
  function getRecommendationValue(id) {
    const field = document.getElementById(id);
    return field ? field.value.trim() : "";
  }

  // Create a text element
  function addRecommendationText(parent, tag, content) {
    const element = document.createElement(tag);
    element.textContent = content;
    parent.appendChild(element);
    return element;
  }

  // Display all recommendation records
  function renderRecommendations() {

    recommendationsList.replaceChildren();

    recommendations.forEach((recommendation, index) => {

      const card = document.createElement("article");
      card.className = "recommendation-card";

      addRecommendationText(
        card,
        "h3",
        recommendation.name
      );

      addRecommendationText(
        card,
        "p",
        `Role: ${recommendation.role}`
      );

      if (recommendation.organization) {
        addRecommendationText(
          card,
          "p",
          `Organization: ${recommendation.organization}`
        );
      }

      if (recommendation.email) {
        addRecommendationText(
          card,
          "p",
          `Email: ${recommendation.email}`
        );
      }

      if (recommendation.target) {
        addRecommendationText(
          card,
          "p",
          `Application: ${recommendation.target}`
        );
      }

      if (recommendation.requestDate) {
        addRecommendationText(
          card,
          "p",
          `Request Date: ${recommendation.requestDate}`
        );
      }

      if (recommendation.deadline) {
        addRecommendationText(
          card,
          "p",
          `Deadline: ${recommendation.deadline}`
        );
      }

      // Status selector
      const statusLabel = addRecommendationText(
        card,
        "label",
        "Recommendation Status"
      );

      const statusSelect = document.createElement("select");

      statusSelect.id = `recommendation-status-${index}`;
      statusLabel.htmlFor = statusSelect.id;

      const statuses = [
        "Not Requested",
        "Requested",
        "Accepted",
        "Submitted"
      ];

      statuses.forEach(status => {

        const option = document.createElement("option");

        option.value = status;
        option.textContent = status;

        statusSelect.appendChild(option);

      });

      statusSelect.value = recommendation.status;

      // Allow students to update progress
      statusSelect.addEventListener("change", () => {

        recommendation.status = statusSelect.value;

        const saveStatus = document.getElementById(
          "save-status"
        );

        if (saveStatus) {
          saveStatus.textContent =
            "Recommendation status updated (not saved)";
        }

      });

      card.appendChild(statusSelect);

      if (recommendation.notes) {
        addRecommendationText(
          card,
          "h4",
          "Additional Notes"
        );

        addRecommendationText(
          card,
          "p",
          recommendation.notes
        );
      }

      // Remove a recommendation record
      const removeButton = document.createElement("button");

      removeButton.type = "button";
      removeButton.className = "secondary-btn";
      removeButton.textContent = "Remove Recommendation";

      removeButton.addEventListener("click", () => {

        recommendations.splice(index, 1);

        renderRecommendations();

      });

      card.appendChild(removeButton);

      recommendationsList.appendChild(card);

    });

  }

  // Handle form submission
  recommendationForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!recommendationForm.reportValidity()) return;

    const recommendation = {

      name: getRecommendationValue("recommender-name"),

      role: getRecommendationValue("recommender-role"),

      organization: getRecommendationValue(
        "recommender-organization"
      ),

      email: getRecommendationValue("recommender-email"),

      target: getRecommendationValue("recommendation-target"),

      requestDate: getRecommendationValue(
        "recommendation-request-date"
      ),

      deadline: getRecommendationValue(
        "recommendation-deadline"
      ),

      status: getRecommendationValue("recommendation-status"),

      notes: getRecommendationValue("recommendation-notes")

    };

    // Check that the deadline is not before the request date
    if (
      recommendation.requestDate &&
      recommendation.deadline &&
      recommendation.deadline < recommendation.requestDate
    ) {
      alert("The deadline cannot be before the request date.");
      return;
    }

    recommendations.push(recommendation);

    renderRecommendations();

    recommendationForm.reset();

    const saveStatus = document.getElementById("save-status");

    if (saveStatus) {
      saveStatus.textContent =
        "Recommendation added (not saved)";
    }

  });

}
/* 6. SUPPORTING DOCUMENTS TRACKER */

const supportingForm = document.getElementById("supporting-form");
const supportingList = document.getElementById("supporting-documents-list");

if (supportingForm && supportingList) {
    const supportingDocuments = [];

    function getSupportingValue(id) {
        return document.getElementById(id).value.trim();
    }

    function renderSupportingDocuments() {
        supportingList.replaceChildren();

        supportingDocuments.forEach((documentItem, index) => {
            const card = document.createElement("article");
            card.className = "supporting-document-card";

            const title = document.createElement("h3");
            title.textContent = documentItem.name;

            const category = document.createElement("p");
            category.textContent = `Category: ${documentItem.category}`;

            const purpose = document.createElement("p");
            purpose.textContent = `Required for: ${documentItem.purpose || "Not specified"}`;

            const deadline = document.createElement("p");
            deadline.textContent = `Deadline: ${documentItem.deadline || "Not specified"}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${documentItem.status}`;

            const notes = document.createElement("p");
            notes.textContent = `Notes: ${documentItem.notes || "None"}`;

            const statusLabel = document.createElement("label");
            statusLabel.textContent = "Update status: ";

            const statusSelect = document.createElement("select");

            ["Not Started", "In Progress", "Ready", "Submitted"].forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                statusSelect.appendChild(option);
            });

            statusSelect.value = documentItem.status;

            statusSelect.addEventListener("change", () => {
                documentItem.status = statusSelect.value;
                renderSupportingDocuments();

                const saveStatus = document.getElementById("save-status");
                if (saveStatus) {
                    saveStatus.textContent = "Document status updated (not saved permanently).";
                }
            });

            statusLabel.appendChild(statusSelect);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "secondary-btn";
            removeButton.textContent = "Remove Document";

            removeButton.addEventListener("click", () => {
                supportingDocuments.splice(index, 1);
                renderSupportingDocuments();
            });

            card.append(
                title,
                category,
                purpose,
                deadline,
                status,
                notes,
                statusLabel,
                removeButton
            );

            supportingList.appendChild(card);
        });
    }

    supportingForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!supportingForm.reportValidity()) return;

        const documentItem = {
            name: getSupportingValue("supporting-document-name"),
            category: getSupportingValue("supporting-document-type"),
            purpose: getSupportingValue("supporting-document-purpose"),
            deadline: getSupportingValue("supporting-document-deadline"),
            status: getSupportingValue("supporting-document-status"),
            notes: getSupportingValue("supporting-document-notes")
        };

        supportingDocuments.push(documentItem);

        renderSupportingDocuments();
        supportingForm.reset();

        const saveStatus = document.getElementById("save-status");
        if (saveStatus) {
            saveStatus.textContent = "Document added (not saved permanently).";
        }
    });
}