
"use strict";

const API = "/api/preparation";

const sections = [
  {
    id: "academic",
    title: "Academic & Transcript",
    icon: "🎓",
    description: "Improve your academic readiness and organize transcripts."
  },
  {
    id: "extracurriculars",
    title: "Extracurriculars",
    icon: "🏆",
    description: "Prepare for personalized extracurricular opportunities and track your progress."
  },
  {
    id: "essays",
    title: "Essay Studio",
    icon: "✍️",
    description: "Write, save, revise and organize application essays."
  },
  {
    id: "tests",
    title: "Test Preparation",
    icon: "📚",
    description: "Organize test preparation and personal study plans."
  },
  {
    id: "requirements",
    title: "Other Requirements",
    icon: "📋",
    description: "Prepare financial aid, recommendations, CVs and portfolios."
  },
  {
    id: "documents",
    title: "Document Center",
    icon: "📁",
    description: "Keep track of important application documents."
  }
];

let workspaces = [];
let currentSection = null;
let currentWorkspace = null;
let currentTab = "tasks";

const $ = id => document.getElementById(id);

// Escape text before inserting it into HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Get the existing Ubuntu Gojo login token.
function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

// Send authenticated requests to the preparation backend.
async function request(path, options = {}) {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Please sign in to Ubuntu Gojo before using My Preparation."
    );
  }

  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

// Display messages.
function notify(message, error = false) {
  const element = $("message");

  if (!element) return;

  element.textContent = message;
  element.classList.toggle("error", error);
}

function showError(error) {
  console.error(error);
  notify(error.message || "Something went wrong.", true);
}

function sectionInfo(id) {
  return sections.find(section => section.id === id);
}

function statusLabel(status) {
  return {
    not_started: "Not Started",
    in_progress: "In Progress",
    completed: "Completed",
    draft: "Draft",
    revising: "Revising",
    final: "Final"
  }[status] || status || "Not Started";
}




function openDedicatedSection(id) {
  const dedicatedPages = {
    academic: "academic.html",
    extracurriculars: "extracurricular.html",
    essays: "essay.html",
    tests: "test.html",
    requirements: "requirements.html"
  };

  const destination = dedicatedPages[id];

  if (!destination) return false;

  window.location.href = new URL(
    destination,
    document.baseURI
  ).href;

  return true;
}



// Show the selected Dashboard view.
function showPage(page) {
  ["dashboard", "section", "workspace"].forEach(name => {
    $(`${name}-page`).hidden = name !== page;
  });

  document.querySelectorAll(".nav-btn").forEach(button => {
    const selected = page === "dashboard"
      ? "dashboard"
      : currentSection;

    button.classList.toggle(
      "active",
      button.dataset.page === selected
    );
  });
}

// Render all six preparation sections.
function renderSections() {
  $("section-grid").innerHTML = sections.map(section => `
    <button
      type="button"
      class="section-card"
      data-section="${section.id}"
    >
      <span class="section-icon">${section.icon}</span>
      <h3>${escapeHTML(section.title)}</h3>
      <p>${escapeHTML(section.description)}</p>
    </button>
  `).join("");
}

// Display one saved workspace.
function workspaceCard(workspace) {
  return `
    <button
      type="button"
      class="workspace-card"
      data-workspace="${escapeHTML(workspace.workspace_id)}"
    >
      <h3>${escapeHTML(workspace.title)}</h3>

      <p>
        ${escapeHTML(workspace.description || "No description yet.")}
      </p>

      <span class="status">
        ${escapeHTML(statusLabel(workspace.status))}
      </span>
    </button>
  `;
}

function renderWorkspaceList(elementId, items) {
  $(elementId).innerHTML = items.length
    ? items.map(workspaceCard).join("")
    : `
      <div class="empty-state">
        No workspaces yet. Create one to get started.
      </div>
    `;
}

// Load the student's saved workspaces.
async function loadWorkspaces() {
  if (!getToken()) {
    workspaces = [];

    const message = `
      <div class="empty-state">
        Sign in to Ubuntu Gojo to view your saved workspaces.
      </div>
    `;

    $("dashboard-workspaces").innerHTML = message;
    $("section-workspaces").innerHTML = message;

    return;
  }

  const result = await request("/my/workspaces");

  workspaces = result.workspaces || [];

  renderWorkspaceList(
    "dashboard-workspaces",
    workspaces
  );

  if (currentSection) {
    renderWorkspaceList(
      "section-workspaces",
      workspaces.filter(item => item.section === currentSection)
    );
  }
}

// Open the main Dashboard.
async function openDashboard() {
  currentWorkspace = null;
  currentSection = null;

  $("page-title").textContent = "My Preparation";

  showPage("dashboard");
  notify("");

  try {
    await loadWorkspaces();
  } catch (error) {
    showError(error);
  }
}

// Open a preparation section.
async function openSection(id) {

  // Academic and Extracurriculars have dedicated pages.
  if (openDedicatedSection(id)) {
    return;
  }

  const section = sectionInfo(id);

  if (!section) return;

  currentSection = id;
  currentWorkspace = null;

  $("page-title").textContent = section.title;
  $("section-title").textContent = section.title;
  $("section-description").textContent = section.description;

  $("section-options").innerHTML = `
    <div class="empty-state">
      Loading preparation options...
    </div>
  `;

  showPage("section");
  notify("");

  // Load public preparation options.
  try {
    const response = await fetch(
      `${API}/${encodeURIComponent(id)}/workspaces`
    );

    if (!response.ok) {
      throw new Error("Could not load preparation options.");
    }

    const result = await response.json();

    const options = Array.isArray(result.workspaces)
      ? result.workspaces
      : [];

    $("section-options").innerHTML = options.length
      ? options.map(option => {
          const title = typeof option === "string"
            ? option
            : option.title || option.name || "Preparation Area";

          return `
            <div class="option-card">
              <h3>${escapeHTML(title)}</h3>
            </div>
          `;
        }).join("")
      : `
        <div class="empty-state">
          No preparation options available yet.
        </div>
      `;

  } catch (error) {
    console.error(error);

    $("section-options").innerHTML = `
      <div class="empty-state">
        Preparation options could not load.
        Check whether the backend is running on port 3002.
      </div>
    `;
  }

  // Load private workspaces separately.
  try {
    await loadWorkspaces();
  } catch (error) {
    $("section-workspaces").innerHTML = `
      <div class="empty-state">
        Saved workspaces could not load.
        Check your login and backend connection.
      </div>
    `;

    showError(error);
  }
}

// Open an existing workspace.
async function openWorkspace(id) {
  const workspace = workspaces.find(
    item => String(item.workspace_id) === String(id)
  );

  if (!workspace) return;

  currentWorkspace = workspace;
  currentSection = workspace.section;
  currentTab = "tasks";

  $("page-title").textContent = workspace.title;
  $("workspace-title").textContent = workspace.title;

  $("workspace-description").textContent =
    workspace.description || "";

  $("workspace-section").textContent =
    sectionInfo(workspace.section)?.title || "";

  $("workspace-status").value = workspace.status;

  showPage("workspace");
  activateTab("tasks");
}

// Switch between workspace tabs.
function activateTab(tab) {
  currentTab = tab;

  document.querySelectorAll(".tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === tab
    );
  });

  loadTab();
}

// Load tasks, drafts, plans or resources.
async function loadTab() {
  if (!currentWorkspace) return;

  const container = $("workspace-content");

  container.textContent = "Loading...";

  try {
    const id = encodeURIComponent(
      currentWorkspace.workspace_id
    );

    const path = currentTab === "resources"
      ? `/resources?section=${encodeURIComponent(currentSection)}&workspace_id=${id}`
      : `/workspaces/${id}/${currentTab}`;

    const result = await request(path);

    const items = Array.isArray(result[currentTab])
      ? result[currentTab]
      : [];

    renderTab(items);

  } catch (error) {
    container.textContent = "";
    showError(error);
  }
}

// Render the selected workspace tab.
function renderTab(items) {
  const titles = {
    tasks: "New Task",
    drafts: "New Essay Draft",
    plans: "New Study Plan",
    resources: "Learning Resources"
  };

  const form = currentTab === "resources"
    ? ""
    : `
      <div class="content-card">
        <h3>${titles[currentTab]}</h3>
        ${formHTML(currentTab)}
      </div>
    `;

  $("workspace-content").innerHTML = `
    ${form}

    <h3>
      ${currentTab === "resources"
        ? "Available Resources"
        : "Saved Items"}
    </h3>

    ${
      items.length
        ? items.map(item => itemHTML(currentTab, item)).join("")
        : '<div class="empty-state">Nothing here yet.</div>'
    }
  `;
}

// Forms for creating preparation items.
function formHTML(kind) {

  if (kind === "tasks") {
    return `
      <form id="item-form" data-kind="tasks">

        <label>Task title</label>
        <input name="title" maxlength="250" required>

        <label>Description</label>
        <textarea name="description"></textarea>

        <label>Priority</label>
        <select name="priority">
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="high">High</option>
        </select>

        <label>Due date (optional)</label>
        <input name="due_date" type="date">

        <button class="primary-btn" type="submit">
          Save Task
        </button>

      </form>
    `;
  }

  if (kind === "drafts") {
    return `
      <form id="item-form" data-kind="drafts">

        <label>Essay title</label>
        <input name="title" maxlength="250" required>

        <label>Essay type</label>
        <input
          name="essay_type"
          maxlength="80"
          placeholder="Personal statement"
        >

        <label>Essay prompt</label>
        <textarea name="prompt"></textarea>

        <label>Your writing</label>
        <textarea name="content" rows="8"></textarea>

        <button class="primary-btn" type="submit">
          Save Draft
        </button>

      </form>
    `;
  }

  if (kind === "plans") {
    return `
      <form id="item-form" data-kind="plans">

        <label>Subject</label>
        <input name="subject" maxlength="160" required>

        <label>Study goal</label>
        <textarea name="goal" required></textarea>

        <label>Study strategy</label>
        <textarea name="study_strategy"></textarea>

        <label>Start date</label>
        <input name="start_date" type="date">

        <label>Target date</label>
        <input name="target_date" type="date">

        <button class="primary-btn" type="submit">
          Save Plan
        </button>

      </form>
    `;
  }

  return "";
}

// Display saved tasks, drafts, plans and resources.
function itemHTML(kind, item) {

  if (kind === "resources") {
    let safeURL = "";

    try {
      const url = new URL(item.resource_url);

      if (["https:", "http:"].includes(url.protocol)) {
        safeURL = url.href;
      }
    } catch {
      safeURL = "";
    }

    return `
      <article class="content-card">

        <h3>${escapeHTML(item.title)}</h3>

        <p>${escapeHTML(item.description || "")}</p>

        <p>
          Type: ${escapeHTML(item.resource_type)}
        </p>

        <p>${escapeHTML(item.content || "")}</p>

        ${
          safeURL
            ? `
              <a
                href="${escapeHTML(safeURL)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Resource
              </a>
            `
            : ""
        }

      </article>
    `;
  }

  const idKey = {
    tasks: "task_id",
    drafts: "draft_id",
    plans: "plan_id"
  }[kind];

  const title = kind === "plans"
    ? item.subject
    : item.title;

  const description = kind === "tasks"
    ? item.description
    : kind === "drafts"
      ? item.prompt
      : item.goal;

  const extra = kind === "drafts"
    ? `
      <label>Essay content</label>

      <textarea
        class="draft-content"
        rows="7"
        maxlength="100000"
      >${escapeHTML(item.content || "")}</textarea>
    `
    : kind === "plans"
      ? `
        <p>
          Strategy:
          ${escapeHTML(item.study_strategy || "Not added")}
        </p>

        <p>
          Progress:
          ${escapeHTML(item.progress_notes || "Not added")}
        </p>
      `
      : `
        <p>
          Priority: ${escapeHTML(item.priority)}
        </p>
      `;

  const statusOptions = kind === "drafts"
    ? ["draft", "revising", "final"]
    : ["not_started", "in_progress", "completed"];

  return `
    <article
      class="content-card"
      data-kind="${kind}"
      data-item-id="${escapeHTML(item[idKey])}"
    >

      <h3>${escapeHTML(title)}</h3>

      <p>${escapeHTML(description || "")}</p>

      ${extra}

      <label>Status</label>

      <select class="item-status">
        ${statusOptions.map(status => `
          <option
            value="${status}"
            ${item.status === status ? "selected" : ""}
          >
            ${statusLabel(status)}
          </option>
        `).join("")}
      </select>

      <div class="item-actions">

        <button
          class="primary-btn save-item"
          type="button"
        >
          Save Changes
        </button>

        <button
          class="secondary-btn delete-item"
          type="button"
        >
          Delete
        </button>

      </div>

    </article>
  `;
}

// Create a new workspace.
async function createWorkspace(event) {
  event.preventDefault();

  const payload = {
    section: $("form-section").value,
    title: $("form-title").value.trim(),
    description: $("form-description").value.trim()
  };

  try {
    await request("/workspaces", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    $("workspace-dialog").close();
    $("workspace-form").reset();

    if (currentSection) {
      await openSection(currentSection);
    } else {
      await openDashboard();
    }

    notify("Workspace created successfully.");

  } catch (error) {
    showError(error);
  }
}

// Create a task, draft or study plan.
async function createItem(form) {
  const kind = form.dataset.kind;
  const payload = {};

  new FormData(form).forEach((value, key) => {
    if (String(value).trim()) {
      payload[key] = String(value).trim();
    }
  });

  try {
    await request(
      `/workspaces/${encodeURIComponent(currentWorkspace.workspace_id)}/${kind}`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );

    await loadTab();

    notify("Item saved successfully.");

  } catch (error) {
    showError(error);
  }
}

// Update a saved item.
async function updateItem(card) {
  const kind = card.dataset.kind;

  const payload = {
    status: card.querySelector(".item-status").value
  };

  if (kind === "drafts") {
    payload.content = card.querySelector(".draft-content").value;
  }

  try {
    await request(
      `/${kind}/${encodeURIComponent(card.dataset.itemId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );

    await loadTab();

    notify("Changes saved successfully.");

  } catch (error) {
    showError(error);
  }
}

// Delete a saved item.
async function deleteItem(card) {
  if (!confirm("Delete this item permanently?")) return;

  try {
    await request(
      `/${card.dataset.kind}/${encodeURIComponent(card.dataset.itemId)}`,
      {
        method: "DELETE"
      }
    );

    await loadTab();

    notify("Item deleted.");

  } catch (error) {
    showError(error);
  }
}

// Open the create-workspace dialog.
function openWorkspaceDialog() {
  $("form-section").value = currentSection || "academic";
  $("workspace-dialog").showModal();
}

// Connect buttons and forms to their actions.
function setupEvents() {

  // Sidebar navigation.
  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      if (page === "dashboard") {
        openDashboard();
      } else {
        openSection(page);
      }
    });
  });

  // Dashboard section cards.
  $("section-grid").addEventListener("click", event => {
    const card = event.target.closest("[data-section]");

    if (!card) return;

    openSection(card.dataset.section);
  });

  // Saved workspace cards.
  document.addEventListener("click", event => {
    const card = event.target.closest("[data-workspace]");

    if (card) {
      openWorkspace(card.dataset.workspace);
    }
  });

  // Refresh.
  $("refresh-btn").addEventListener("click", async () => {
    try {
      if (currentWorkspace) {
        await loadTab();

      } else if (currentSection) {
        await openSection(currentSection);

      } else {
        await openDashboard();
      }

      notify("Refreshed.");

    } catch (error) {
      showError(error);
    }
  });

  // Create-workspace buttons.
  $("new-workspace-btn").addEventListener(
    "click",
    openWorkspaceDialog
  );

  $("section-create-btn").addEventListener(
    "click",
    openWorkspaceDialog
  );

  $("cancel-workspace").addEventListener("click", () => {
    $("workspace-dialog").close();
  });

  $("workspace-form").addEventListener(
    "submit",
    createWorkspace
  );

  // Back buttons.
  $("back-btn").addEventListener(
    "click",
    openDashboard
  );

  $("workspace-back-btn").addEventListener("click", () => {
    openSection(currentSection);
  });

  // Update workspace status.
  $("workspace-status").addEventListener(
    "change",
    async event => {
      if (!currentWorkspace) return;

      const previousStatus = currentWorkspace.status;

      try {
        const result = await request(
          `/workspaces/${encodeURIComponent(currentWorkspace.workspace_id)}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status: event.target.value
            })
          }
        );

        currentWorkspace = result.workspace || {
          ...currentWorkspace,
          status: event.target.value
        };

        await loadWorkspaces();

        notify("Workspace status updated.");

      } catch (error) {
        event.target.value = previousStatus;
        showError(error);
      }
    }
  );

  // Workspace tabs.
  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tab);
    });
  });

  // Save tasks, drafts and plans.
  $("workspace-content").addEventListener(
    "submit",
    event => {
      if (event.target.id !== "item-form") return;

      event.preventDefault();
      createItem(event.target);
    }
  );

  // Save changes or delete items.
  $("workspace-content").addEventListener(
    "click",
    event => {
      const card = event.target.closest("[data-item-id]");

      if (!card) return;

      if (event.target.closest(".save-item")) {
        updateItem(card);
      }

      if (event.target.closest(".delete-item")) {
        deleteItem(card);
      }
    }
  );
}

// Initialize the Dashboard.
function initialize() {
  renderSections();
  setupEvents();
  openDashboard();
}

initialize();
