
"use strict";

/*
  UBUNTU GOJO — EXTRACURRICULAR PREPARATION

  Recommendation integration:
  The existing discovery system can provide an array through:

  window.UbuntuGojoRecommendedActivities

  or the temporary localStorage key:

  ubuntu-gojo-recommended-activities

  This is a frontend integration contract, not a claim that
  the existing backend already uses either method.

  Preparation progress is saved locally until backend
  integration is confirmed.
*/

const RECOMMENDATION_KEY =
  "ubuntu-gojo-recommended-activities";

const PROGRESS_KEY =
  "ubuntu-gojo-extracurricular-progress-v1";

const $ = id => document.getElementById(id);

const categories = {
  volunteering: {
    title: "Volunteering",
    icon: "🤝",
    description: "Community service and meaningful social impact."
  },
  research: {
    title: "Research",
    icon: "🔬",
    description: "Research programs and academic exploration."
  },
  competitions: {
    title: "Competitions",
    icon: "🏆",
    description: "Academic, technical and creative challenges."
  },
  leadership: {
    title: "Clubs & Leadership",
    icon: "👥",
    description: "Leadership roles and student organizations."
  },
  projects: {
    title: "Projects & Innovation",
    icon: "💡",
    description: "Independent projects, innovation and entrepreneurship."
  },
  other: {
    title: "Other Activities",
    icon: "✨",
    description: "Additional extracurricular experiences."
  }
};

let activities = [];
let selectedCategory = "volunteering";
let selectedActivity = null;
let selectedTab = "understand";
let progress = loadProgress();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function safeURL(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadProgress() {
  const saved = readJSON(PROGRESS_KEY, {});
  return saved && typeof saved === "object" &&
    !Array.isArray(saved) ? saved : {};
}

function saveProgress() {
  try {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify(progress)
    );

    $("save-status").textContent = "Saved locally";
  } catch (error) {
    console.error(error);
    $("save-status").textContent = "Unable to save";
  }
}

function newID() {
  return globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeCategory(value) {
  const name = String(value || "")
    .trim()
    .toLowerCase();

  const aliases = {
    volunteer: "volunteering",
    community_service: "volunteering",
    competition: "competitions",
    hackathon: "competitions",
    club: "leadership",
    clubs: "leadership",
    clubs_and_leadership: "leadership",
    project: "projects",
    innovation: "projects"
  };

  const category = aliases[name] || name;

  return categories[category] ? category : "other";
}

/*
  Only actual recommendation records are displayed.

  Supported example fields:
  id, title, category, description, organizer,
  deadline, official_url, eligibility, requirements,
  preparation_steps, benefits, format, reason.

  Missing official information remains unavailable.
*/

function normalizeActivity(item) {
  if (!item || typeof item !== "object") return null;

  const id = item.id ??
    item.activity_id ??
    item.opportunity_id;

  const title = item.title ?? item.name;

  if (id === undefined || id === null || !String(id).trim()) {
    return null;
  }

  if (!title || !String(title).trim()) {
    return null;
  }

  const list = value =>
    Array.isArray(value)
      ? value.map(String).filter(Boolean)
      : [];

  return {
    id: String(id),
    title: String(title),
    category: normalizeCategory(item.category),
    description: String(item.description || ""),
    organizer: String(item.organizer || ""),
    deadline: String(item.deadline || ""),
    official_url: safeURL(
      item.official_url || item.official_website || ""
    ),
    eligibility: list(item.eligibility),
    requirements: list(item.requirements),
    preparation_steps: list(item.preparation_steps),
    benefits: list(item.benefits),
    format: String(item.format || ""),
    reason: String(item.reason || item.match_reason || "")
  };
}

function loadRecommendations() {
  const provided = window.UbuntuGojoRecommendedActivities;

  const raw = Array.isArray(provided)
    ? provided
    : readJSON(RECOMMENDATION_KEY, []);

  if (!Array.isArray(raw)) return [];

  const seen = new Set();

  return raw
    .map(normalizeActivity)
    .filter(activity => {
      if (!activity || seen.has(activity.id)) return false;

      seen.add(activity.id);
      return true;
    });
}

function activityState(id) {
  if (!progress[id] || typeof progress[id] !== "object") {
    progress[id] = {
      status: "not_started",
      completed: [],
      records: [],
      notes: ""
    };
  }

  const state = progress[id];

  if (!Array.isArray(state.completed)) state.completed = [];
  if (!Array.isArray(state.records)) state.records = [];
  if (typeof state.notes !== "string") state.notes = "";

  return state;
}

function statusText(status) {
  return {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
    applied: "Applied"
  }[status] || "Not Started";
}

function activityTasks(activity) {
  return [
    "Read the official activity information",
    "Review the eligibility requirements",
    "Identify the required application documents",
    ...activity.preparation_steps,
    "Review the official application deadline",
    "Check the application before submission",
    "Record your application or participation outcome"
  ];
}

function completion(activity) {
  const tasks = activityTasks(activity);
  const state = activityState(activity.id);

  if (!tasks.length) return 0;

  const completed = tasks.filter((task, index) =>
    state.completed.includes(index)
  ).length;

  return Math.round(completed / tasks.length * 100);
}

function emptyState(message) {
  return `
    <div class="empty-state">
      ${escapeHTML(message)}
    </div>
  `;
}

function summaryCard(label, value, detail) {
  return `
    <article class="summary-card">
      <span class="summary-label">${escapeHTML(label)}</span>
      <strong class="summary-value">${escapeHTML(value)}</strong>
      <span class="summary-detail">${escapeHTML(detail)}</span>
    </article>
  `;
}

function showView(view) {
  document.querySelectorAll(".view").forEach(element => {
    element.classList.toggle(
      "active",
      element.id === `${view}-view`
    );
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  const titles = {
    overview: "Extracurricular Preparation",
    documents: "Documents & Records",
    progress: "Progress Tracker",
    activity: selectedActivity?.title || "Activity Preparation"
  };

  $("page-title").textContent =
    titles[view] || categories[view]?.title || "Extracurriculars";
}

function activityCard(activity) {
  const category = categories[activity.category];
  const state = activityState(activity.id);

  return `
    <article class="activity-card">

      <span class="eyebrow">
        ${category.icon} ${escapeHTML(category.title)}
      </span>

      <h3>${escapeHTML(activity.title)}</h3>

      <p>
        ${escapeHTML(
          activity.description || "Description not provided."
        )}
      </p>

      <div class="activity-meta">
        <span class="meta-tag">
          ${escapeHTML(activity.organizer || "Organizer not provided")}
        </span>

        <span class="meta-tag">
          ${escapeHTML(statusText(state.status))}
        </span>

        <span class="meta-tag">
          ${escapeHTML(
            activity.deadline
              ? `Deadline: ${activity.deadline}`
              : "Deadline not provided"
          )}
        </span>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          style="width:${completion(activity)}%"
        ></div>
      </div>

      <p>${completion(activity)}% of preparation tasks completed</p>

      <button
        class="primary-btn"
        type="button"
        data-open-activity="${escapeHTML(activity.id)}"
      >
        Open Preparation Workspace
      </button>

    </article>
  `;
}

function renderOverview() {
  const started = activities.filter(activity =>
    activityState(activity.id).status !== "not_started"
  ).length;

  const completed = activities.filter(activity =>
    activityState(activity.id).status === "completed"
  ).length;

  const records = activities.reduce(
    (total, activity) =>
      total + activityState(activity.id).records.length,
    0
  );

  $("summary-grid").innerHTML = [
    summaryCard("Recommended Activities", activities.length, "From discovery"),
    summaryCard("Activities Started", started, "Preparation underway"),
    summaryCard("Completed Activities", completed, "Marked completed"),
    summaryCard("Saved Records", records, "Across all activities")
  ].join("");

  Object.keys(categories).forEach(category => {
    const count = activities.filter(
      activity => activity.category === category
    ).length;

    const element = document.querySelector(
      `[data-count="${category}"]`
    );

    if (element) {
      element.textContent = `${count} recommended activities`;
    }
  });

  $("recommended-list").innerHTML = activities.length
    ? activities.map(activityCard).join("")
    : emptyState(
      "No recommended activities have been received yet. " +
      "Complete the opportunity discovery stage first. " +
      "Your recommendations will appear here once connected."
    );
}

function openOverview() {
  selectedActivity = null;
  showView("overview");
  renderOverview();
}

function openCategory(category) {
  if (!categories[category]) return;

  selectedCategory = category;
  selectedActivity = null;

  const info = categories[category];

  $("category-title").textContent =
    `${info.icon} ${info.title}`;

  $("category-description").textContent =
    info.description;

  const items = activities.filter(
    activity => activity.category === category
  );

  $("category-activities").innerHTML = items.length
    ? items.map(activityCard).join("")
    : emptyState(
      "No recommended activities are available in this category yet."
    );

  showView("category");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === category
    );
  });
}

function infoCard(label, value) {
  return `
    <div class="info-card">
      <span>${escapeHTML(label)}</span>
      <strong>${escapeHTML(value || "Not provided")}</strong>
    </div>
  `;
}

function openActivity(id) {
  const activity = activities.find(item => item.id === String(id));

  if (!activity) return;

  selectedActivity = activity;
  selectedCategory = activity.category;
  selectedTab = "understand";

  const state = activityState(activity.id);

  $("activity-category").textContent =
    categories[activity.category].title;

  $("activity-title").textContent = activity.title;

  $("activity-description").textContent =
    activity.description || "Description not provided.";

  $("activity-status").textContent = statusText(state.status);

  $("activity-information").innerHTML = [
    infoCard("Organizer", activity.organizer),
    infoCard("Official Deadline", activity.deadline),
    infoCard("Participation Format", activity.format)
  ].join("");

  showView("activity");
  activateTab("understand");
}

function activateTab(tab) {
  selectedTab = tab;

  document.querySelectorAll(".workspace-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === tab
    );
  });

  renderActivityTab();
}

function renderUnderstand(activity) {
  return `
    <article class="panel">
      <h3>About This Activity</h3>

      <p>
        ${escapeHTML(
          activity.description || "Description not provided."
        )}
      </p>

      <h3>Why It Was Recommended</h3>

      <p>
        ${escapeHTML(
          activity.reason ||
          "The recommendation explanation has not been provided."
        )}
      </p>

      <h3>Benefits & Learning Opportunities</h3>

      ${
        activity.benefits.length
          ? `<ul>${activity.benefits.map(item =>
              `<li>${escapeHTML(item)}</li>`
            ).join("")}</ul>`
          : "<p>Benefits have not been provided.</p>"
      }

      <h3>Official Information</h3>

      ${
        activity.official_url
          ? `
            <a
              href="${escapeHTML(activity.official_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Official Website ↗
            </a>
          `
          : "<p>Official website has not been provided.</p>"
      }
    </article>
  `;
}

function renderRequirements(activity) {
  function list(items, fallback) {
    return items.length
      ? `<ul>${items.map(item =>
          `<li>${escapeHTML(item)}</li>`
        ).join("")}</ul>`
      : `<p>${escapeHTML(fallback)}</p>`;
  }

  return `
    <article class="panel">

      <h3>Eligibility Requirements</h3>

      ${list(
        activity.eligibility,
        "Official eligibility information has not been provided."
      )}

      <h3>Application Requirements</h3>

      ${list(
        activity.requirements,
        "Official application requirements have not been provided."
      )}

      <h3>Before Applying</h3>

      <p>
        Check the organizer's official website for the latest
        eligibility rules, documents and deadline.
      </p>

      ${
        activity.official_url
          ? `
            <a
              href="${escapeHTML(activity.official_url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Review Official Requirements ↗
            </a>
          `
          : ""
      }

    </article>
  `;
}

function renderRoadmap(activity) {
  const state = activityState(activity.id);
  const tasks = activityTasks(activity);

  return `
    <article class="panel">

      <h3>Your Preparation Roadmap</h3>

      <p>
        Complete each step as you prepare.
        The activity-specific steps come from its recommendation record.
      </p>

      <div class="progress-row">
        <span>Preparation completed</span>
        <strong>${completion(activity)}%</strong>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          style="width:${completion(activity)}%"
        ></div>
      </div>

      ${tasks.map((task, index) => `
        <div class="task-item">

          <input
            type="checkbox"
            id="activity-task-${index}"
            data-task-index="${index}"
            ${state.completed.includes(index) ? "checked" : ""}
          >

          <label for="activity-task-${index}">
            ${escapeHTML(task)}
          </label>

        </div>
      `).join("")}

      <div class="field">
        <label for="preparation-notes">
          My Preparation Notes
        </label>

        <textarea
          id="preparation-notes"
          placeholder="Write your questions, reflections and next steps..."
        >${escapeHTML(state.notes)}</textarea>
      </div>

      <button
        class="primary-btn"
        type="button"
        data-action="save-notes"
      >
        Save Notes
      </button>

    </article>
  `;
}

function renderRecords(activity) {
  const state = activityState(activity.id);

  return `
    <article class="panel">

      <h3>Add a Document or Activity Record</h3>

      <p>
        Record certificates, application documents,
        participation evidence and achievements.
        This version saves record details, not uploaded files.
      </p>

      <form id="record-form">

        <div class="field">
          <label for="record-title">Record Title</label>
          <input
            id="record-title"
            name="title"
            maxlength="160"
            required
          >
        </div>

        <div class="field">
          <label for="record-type">Record Type</label>

          <select id="record-type" name="type">
            <option value="Certificate">Certificate</option>
            <option value="Application Document">Application Document</option>
            <option value="Participation Evidence">Participation Evidence</option>
            <option value="Achievement">Achievement</option>
            <option value="Reflection">Reflection</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="field">
          <label for="record-description">Notes</label>

          <textarea
            id="record-description"
            name="description"
            placeholder="Describe this record..."
          ></textarea>
        </div>

        <button class="primary-btn" type="submit">
          Save Record
        </button>

      </form>

    </article>

    <article class="panel">

      <h3>Saved Records (${state.records.length})</h3>

      ${
        state.records.length
          ? state.records.map(record => `
              <div class="record-item">

                <div>
                  <strong>${escapeHTML(record.title)}</strong>

                  <p>${escapeHTML(record.type)}</p>

                  <p>${escapeHTML(record.description)}</p>
                </div>

                <button
                  class="secondary-btn"
                  type="button"
                  data-delete-record="${escapeHTML(record.id)}"
                >
                  Delete
                </button>

              </div>
            `).join("")
          : emptyState("No records saved for this activity yet.")
      }

    </article>
  `;
}

function renderTracking(activity) {
  const state = activityState(activity.id);

  const statuses = [
    "not_started",
    "in_progress",
    "applied",
    "completed"
  ];

  return `
    <article class="panel">

      <h3>Activity Progress</h3>

      <div class="progress-row">
        <span>Preparation checklist</span>
        <strong>${completion(activity)}%</strong>
      </div>

      <div class="progress-track">
        <div
          class="progress-fill"
          style="width:${completion(activity)}%"
        ></div>
      </div>

      <div class="field">
        <label for="activity-status-select">
          Current Activity Status
        </label>

        <select id="activity-status-select">
          ${statuses.map(status => `
            <option
              value="${status}"
              ${state.status === status ? "selected" : ""}
            >
              ${statusText(status)}
            </option>
          `).join("")}
        </select>
      </div>

      <button
        class="primary-btn"
        type="button"
        data-action="save-activity-status"
      >
        Save Status
      </button>

      <p>
        ${state.records.length} saved document or activity records.
      </p>

      <p>
        Official deadline:
        <strong>
          ${escapeHTML(activity.deadline || "Not provided")}
        </strong>
      </p>

    </article>
  `;
}

function renderActivityTab() {
  if (!selectedActivity) return;

  const activity = selectedActivity;

  const views = {
    understand: renderUnderstand,
    requirements: renderRequirements,
    roadmap: renderRoadmap,
    records: renderRecords,
    tracking: renderTracking
  };

  const renderer = views[selectedTab];

  $("activity-tab-content").innerHTML = renderer
    ? renderer(activity)
    : emptyState("This workspace tab is unavailable.");
}

function renderDocuments() {
  const allRecords = activities.flatMap(activity =>
    activityState(activity.id).records.map(record => ({
      ...record,
      activityTitle: activity.title
    }))
  );

  $("document-summary").innerHTML = [
    summaryCard("Total Records", allRecords.length, "Saved locally"),
    summaryCard(
      "Activities With Records",
      activities.filter(activity =>
        activityState(activity.id).records.length > 0
      ).length,
      "Across your recommendations"
    )
  ].join("");

  $("documents-content").innerHTML = allRecords.length
    ? allRecords.map(record => `
        <article class="content-card">

          <span class="eyebrow">
            ${escapeHTML(record.activityTitle)}
          </span>

          <h3>${escapeHTML(record.title)}</h3>

          <p>${escapeHTML(record.type)}</p>

          <p>${escapeHTML(record.description)}</p>

        </article>
      `).join("")
    : emptyState(
      "No activity records yet. Open an activity workspace " +
      "and select My Records to add your first record."
    );

  showView("documents");
}

function renderProgress() {
  const started = activities.filter(activity =>
    activityState(activity.id).status !== "not_started"
  ).length;

  const completed = activities.filter(activity =>
    activityState(activity.id).status === "completed"
  ).length;

  const average = activities.length
    ? Math.round(
        activities.reduce(
          (sum, activity) => sum + completion(activity),
          0
        ) / activities.length
      )
    : 0;

  $("progress-summary").innerHTML = [
    summaryCard("Total Activities", activities.length, "Recommended"),
    summaryCard("Started", started, "Preparation or application"),
    summaryCard("Completed", completed, "Marked completed"),
    summaryCard("Average Preparation", `${average}%`, "Checklist progress")
  ].join("");

  $("progress-content").innerHTML = activities.length
    ? activities.map(activity => `
        <article class="content-card">

          <div class="progress-row">
            <strong>${escapeHTML(activity.title)}</strong>

            <span>
              ${escapeHTML(statusText(activityState(activity.id).status))}
            </span>
          </div>

          <div class="progress-track">
            <div
              class="progress-fill"
              style="width:${completion(activity)}%"
            ></div>
          </div>

          <div class="progress-row">
            <span>Preparation progress</span>
            <strong>${completion(activity)}%</strong>
          </div>

          <button
            class="secondary-btn"
            type="button"
            data-open-activity="${escapeHTML(activity.id)}"
          >
            Open Workspace
          </button>

        </article>
      `).join("")
    : emptyState(
      "Your recommended activities will appear here once connected."
    );

  showView("progress");
}

function handleRecordSubmit(form) {
  if (!selectedActivity) return;

  const data = new FormData(form);

  const title = String(data.get("title") || "").trim();

  if (!title) return;

  const state = activityState(selectedActivity.id);

  state.records.push({
    id: newID(),
    title,
    type: String(data.get("type") || "Other"),
    description: String(data.get("description") || "").trim()
  });

  saveProgress();
  renderActivityTab();
}

function handleAction(action) {
  if (action === "view-activities") {
    $("recommended-list").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  if (action === "back-overview") {
    openOverview();
    return;
  }

  if (action === "back-category") {
    openCategory(selectedCategory);
    return;
  }

  if (!selectedActivity) return;

  const state = activityState(selectedActivity.id);

  if (action === "save-notes") {
    state.notes = $("preparation-notes").value;
    saveProgress();
  }

  if (action === "save-activity-status") {
    state.status = $("activity-status-select").value;

    saveProgress();

    $("activity-status").textContent =
      statusText(state.status);

    renderActivityTab();
  }
}

function setupEvents() {
  document.addEventListener("click", event => {
    const navigation = event.target.closest("[data-view]");

    if (navigation) {
      const view = navigation.dataset.view;

      if (view === "overview") {
        openOverview();
      } else if (view === "documents") {
        renderDocuments();
      } else if (view === "progress") {
        renderProgress();
      } else {
        openCategory(view);
      }

      return;
    }

    const category = event.target.closest("[data-category]");

    if (category) {
      openCategory(category.dataset.category);
      return;
    }

    const activity = event.target.closest("[data-open-activity]");

    if (activity) {
      openActivity(activity.dataset.openActivity);
      return;
    }

    const tab = event.target.closest("[data-tab]");

    if (tab) {
      activateTab(tab.dataset.tab);
      return;
    }

    const action = event.target.closest("[data-action]");

    if (action) {
      handleAction(action.dataset.action);
      return;
    }

    const deleteButton = event.target.closest(
      "[data-delete-record]"
    );

    if (deleteButton && selectedActivity) {
      const state = activityState(selectedActivity.id);

      const id = deleteButton.dataset.deleteRecord;

      if (!confirm("Delete this record?")) return;

      state.records = state.records.filter(
        record => record.id !== id
      );

      saveProgress();
      renderActivityTab();
    }
  });

  document.addEventListener("change", event => {
    if (!event.target.matches("[data-task-index]")) return;
    if (!selectedActivity) return;

    const state = activityState(selectedActivity.id);
    const index = Number(event.target.dataset.taskIndex);

    if (event.target.checked) {
      if (!state.completed.includes(index)) {
        state.completed.push(index);
      }
    } else {
      state.completed = state.completed.filter(
        item => item !== index
      );
    }

    saveProgress();
    renderActivityTab();
  });

  document.addEventListener("submit", event => {
    if (event.target.id !== "record-form") return;

    event.preventDefault();
    handleRecordSubmit(event.target);
  });
}

function initialize() {
  activities = loadRecommendations();

  setupEvents();
  openOverview();
}

initialize();
