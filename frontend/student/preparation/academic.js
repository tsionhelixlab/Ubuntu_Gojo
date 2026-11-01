"use strict";

const STORAGE_KEY = "ubuntu-gojo-academic-v1";

const $ = id => document.getElementById(id);

const escapeHTML = value =>
  String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ==========================================
// ACADEMIC WORKSPACES
// ==========================================

const topics = {
  performance: {
    title: "Academic Performance",
    icon: "📊",
    category: "GRADES & SUBJECTS",
    description:
      "Record your actual results by subject, grade level and term. See patterns without confusing your average with scholarship eligibility.",
    tabs: [
      ["overview", "Understand"],
      ["grades", "Grade Tracker"],
      ["plan", "Preparation Plan"],
      ["records", "My Notes"]
    ],
    steps: [
      "Collect official report cards",
      "Enter subjects and term results",
      "Check results against your school's grading scale",
      "Identify subjects to review",
      "Update results after the next term"
    ],
    advice: [
      "Use the grade exactly as your school reports it.",
      "Compare results from the same grading scale only.",
      "A recorded grade is not an automatic eligibility decision."
    ],
    prompt:
      "Add a reflection, teacher feedback or explanation of a result."
  },

  transcript: {
    title: "Transcript Preparation",
    icon: "📄",
    category: "SCHOOL DOCUMENTS",
    description:
      "Understand official school records, track requests and check what each application actually requires.",
    tabs: [
      ["overview", "Understand"],
      ["documents", "Document Tracker"],
      ["plan", "Request Checklist"],
      ["records", "Request Notes"]
    ],
    steps: [
      "Ask the school who issues transcripts",
      "Confirm required grade levels and terms",
      "Check name, subjects and dates",
      "Check translation or certification rules for each application",
      "Confirm the required submission method"
    ],
    advice: [
      "A transcript is an official record of academic results issued or verified by your school.",
      "A report card and a transcript may not be interchangeable; follow the recipient's instructions.",
      "Do not mark a document as officially submitted just because you uploaded it to your own device."
    ],
    prompt:
      "Record who you contacted, the request date and the next follow-up."
  },

  achievements: {
    title: "Academic Achievements",
    icon: "🏆",
    category: "RECOGNITION & EVIDENCE",
    description:
      "Build a factual portfolio of academic awards, distinctions and competitions with supporting evidence.",
    tabs: [
      ["overview", "Understand"],
      ["portfolio", "Achievement Portfolio"],
      ["plan", "Evidence Checklist"],
      ["records", "Reflection Notes"]
    ],
    steps: [
      "List relevant academic recognition",
      "Verify exact titles and organizers",
      "Record the year and level",
      "Check available evidence",
      "Select relevant achievements for each application"
    ],
    advice: [
      "State your actual result and contribution, not a stronger version of it.",
      "An award can be school, regional, national or international; label its level accurately.",
      "A certificate is useful evidence, but only claim one if it exists."
    ],
    prompt:
      "Explain what you learned or how an achievement connects to your goals."
  },

  improvement: {
    title: "Academic Improvement",
    icon: "🎯",
    category: "GOALS & PRACTICE",
    description:
      "Turn a specific learning difficulty into manageable actions, then review what you completed.",
    tabs: [
      ["overview", "Understand"],
      ["goals", "Goal Planner"],
      ["plan", "Study Checklist"],
      ["records", "Reflection Journal"]
    ],
    steps: [
      "Choose one subject or skill",
      "Describe the exact learning gap",
      "Choose realistic practice actions",
      "Ask for feedback or check solutions",
      "Review progress and adjust the goal"
    ],
    advice: [
      "Choose a concrete topic rather than a vague goal like 'be better at everything'.",
      "Track completed practice, not just planned study hours.",
      "Review mistakes and adjust your approach when a plan is not helping."
    ],
    prompt:
      "What worked, what was difficult, and what will you try next?"
  }
};

// ==========================================
// STORAGE
// ==========================================

function fresh() {
  return Object.fromEntries(
    Object.keys(topics).map(id => [
      id,
      {
        checks: [],
        notes: "",
        records: [],
        items: []
      }
    ])
  );
}

function load() {
  const result = fresh();

  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (saved && typeof saved === "object") {
      for (const id of Object.keys(result)) {
        const old = saved[id];

        if (!old || typeof old !== "object") continue;

        result[id].checks = Array.isArray(old.checks)
          ? old.checks.filter(Number.isInteger)
          : [];

        result[id].notes =
          typeof old.notes === "string" ? old.notes : "";

        result[id].records = Array.isArray(old.records)
          ? old.records
          : [];

        result[id].items = Array.isArray(old.items)
          ? old.items
          : [];
      }
    }
  } catch (error) {
    console.warn("Academic data could not be loaded", error);
  }

  return result;
}

let data = load();

let current = "performance";
let tab = "overview";

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    $("save-status").textContent =
      "✓ Saved in this browser";

    return true;
  } catch (error) {
    console.error(error);

    $("save-status").textContent =
      "Could not save — check browser storage";

    return false;
  }
}

// ==========================================
// NEW ACADEMIC DASHBOARD
// ==========================================

function renderDashboard() {
  const summary = [
    [
      "Subject results",
      data.performance.items.length,
      "Recorded grade entries"
    ],
    [
      "Documents ready",
      data.transcript.items.filter(
        x => x.status === "Ready"
      ).length,
      "Marked ready by you"
    ],
    [
      "Achievements",
      data.achievements.items.length,
      "Portfolio entries"
    ],
    [
      "Goals completed",
      data.improvement.items.filter(
        x => x.status === "Completed"
      ).length,
      "Marked completed by you"
    ]
  ];

  $("academic-dashboard-summary").innerHTML = summary
    .map(([label, value, detail]) => `
      <article class="summary-card">
        <span class="summary-label">
          ${escapeHTML(label)}
        </span>

        <strong class="summary-value">
          ${escapeHTML(value)}
        </strong>

        <span class="summary-detail">
          ${escapeHTML(detail)}
        </span>
      </article>
    `)
    .join("");

  $("academic-overall-progress").innerHTML =
    Object.entries(topics)
      .map(([id, topic]) => {
        const completed = topic.steps.filter(
          (_, i) => data[id].checks.includes(i)
        ).length;

        const total = topic.steps.length;

        const percentage = total
          ? Math.round((completed / total) * 100)
          : 0;

        return `
          <article class="progress-item">

            <div class="progress-item-header">
              <strong>
                ${escapeHTML(topic.icon)}
                ${escapeHTML(topic.title)}
              </strong>

              <span>
                ${completed}/${total} · ${percentage}%
              </span>
            </div>

            <div
              class="progress-track"
              role="progressbar"
              aria-label="${escapeHTML(topic.title)} checklist completion"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${percentage}"
            >
              <div
                class="progress-fill"
                style="width:${percentage}%"
              ></div>
            </div>

          </article>
        `;
      })
      .join("");
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================

function showScreen(next, workspace) {
  if (next === "workspace" && !topics[workspace]) {
    return;
  }

  if (next === "workspace") {
    current = workspace;
    tab = "overview";
  }

  $("academic-overview").hidden = next !== "overview";
  $("academic-workspace").hidden = next !== "workspace";

  $("page-title").textContent =
    next === "overview"
      ? "Academic Preparation Center"
      : topics[current].title;

  document.querySelectorAll(".nav-item").forEach(button => {
    const selected =
      next === "overview" ? "overview" : current;

    const active =
      button.dataset.workspace === selected;

    button.classList.toggle("active", active);

    button.setAttribute(
      "aria-current",
      active ? "page" : "false"
    );
  });

  if (next === "overview") {
    renderDashboard();
  } else {
    render();
  }
}

// ==========================================
// WORKSPACE STATISTICS
// ==========================================

function stats() {
  const s = data[current];

  const done = topics[current].steps.filter(
    (_, i) => s.checks.includes(i)
  ).length;

  if (current === "performance") {
    const nums = s.items
      .filter(x => x.score !== "" && x.score != null)
      .map(x => Number(x.score))
      .filter(Number.isFinite);

    return [
      ["Subject results", s.items.length, "Entries added"],
      [
        "Average recorded",
        nums.length
          ? (
              nums.reduce((a, b) => a + b, 0) /
              nums.length
            ).toFixed(1) + "%"
          : "—",
        "Only entered percentage results"
      ],
      ["Checklist", `${done}/5`, "Preparation actions"]
    ];
  }

  if (current === "transcript") {
    return [
      ["Documents", s.items.length, "Items tracked"],
      [
        "Ready",
        s.items.filter(x => x.status === "Ready").length,
        "Marked ready by you"
      ],
      ["Checklist", `${done}/5`, "Preparation actions"]
    ];
  }

  if (current === "achievements") {
    return [
      ["Achievements", s.items.length, "Portfolio entries"],
      [
        "Evidence available",
        s.items.filter(
          x => x.evidence === "Available"
        ).length,
        "Self-reported"
      ],
      ["Checklist", `${done}/5`, "Preparation actions"]
    ];
  }

  return [
    ["Goals", s.items.length, "Learning goals"],
    [
      "Completed",
      s.items.filter(
        x => x.status === "Completed"
      ).length,
      "Goals marked completed"
    ],
    ["Checklist", `${done}/5`, "Preparation actions"]
  ];
}

// ==========================================
// RENDER WORKSPACE
// ==========================================

function render() {
  const t = topics[current];

  $("workspace-category").textContent = t.category;
  $("workspace-title").textContent = t.title;
  $("workspace-description").textContent = t.description;
  $("workspace-icon").textContent = t.icon;

  $("summary-grid").innerHTML = stats()
    .map(([label, value, detail]) => `
      <article class="summary-card">
        <span class="summary-label">
          ${escapeHTML(label)}
        </span>

        <strong class="summary-value">
          ${escapeHTML(value)}
        </strong>

        <span class="summary-detail">
          ${escapeHTML(detail)}
        </span>
      </article>
    `)
    .join("");

  $("workspace-tabs").innerHTML = t.tabs
    .map(([id, label]) => `
      <button
        type="button"
        role="tab"
        class="tab ${tab === id ? "active" : ""}"
        data-tab="${id}"
        aria-selected="${tab === id}"
      >
        ${escapeHTML(label)}
      </button>
    `)
    .join("");

  if (tab === "overview") {
    renderOverview();
  } else if (tab === "plan") {
    renderPlan();
  } else if (tab === "records") {
    renderRecords();
  } else {
    renderItems();
  }
}

// ==========================================
// UNDERSTAND
// ==========================================

function renderOverview() {
  const t = topics[current];

  const explain = {
    performance: [
      "What belongs here?",
      "Subject names, grade level, term and percentage results, where your school uses percentages."
    ],
    transcript: [
      "What is a transcript?",
      "An official school-issued or school-verified record of courses and results. Application rules differ by institution."
    ],
    achievements: [
      "What counts as an achievement?",
      "Academic recognition such as a school distinction, subject award or competition result that you can describe accurately."
    ],
    improvement: [
      "What is an improvement goal?",
      "A specific skill to strengthen, with an action you can practice and a way to review your progress."
    ]
  }[current];

  $("tab-content").innerHTML = `
    <article class="panel">

      <h3>${escapeHTML(explain[0])}</h3>
      <p>${escapeHTML(explain[1])}</p>

      <p class="hint">
        This workspace helps you organize preparation.
        It does not certify documents or decide admission eligibility.
      </p>

    </article>

    <article class="panel">

      <h3>Practical guidance</h3>

      <div class="feature-grid">
        ${t.advice.map((x, i) => `
          <div class="feature-card">
            <h3>
              0${i + 1} ·
              ${
                [
                  "Record accurately",
                  "Check requirements",
                  "Take the next step"
                ][i]
              }
            </h3>

            <p>${escapeHTML(x)}</p>
          </div>
        `).join("")}
      </div>

    </article>

    <article class="panel">

      <h3>Start here</h3>

      <p>
        Use <strong>${escapeHTML(t.tabs[1][1])}</strong>
        to add your information, then open the checklist
        to plan what remains.
      </p>

      <button
        type="button"
        class="primary"
        data-go="${t.tabs[1][0]}"
      >
        Open ${escapeHTML(t.tabs[1][1])}
      </button>

    </article>
  `;
}

// ==========================================
// PREPARATION CHECKLIST
// ==========================================

function renderPlan() {
  const t = topics[current];
  const s = data[current];

  const done = t.steps.filter(
    (_, i) => s.checks.includes(i)
  ).length;

  const percent = Math.round(
    (done / t.steps.length) * 100
  );

  $("tab-content").innerHTML = `
    <article class="panel">

      <h3>
        Your preparation checklist ·
        ${done}/${t.steps.length}
      </h3>

      <div
        class="progress-track"
        role="progressbar"
        aria-label="Checklist progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${percent}"
      >
        <div
          class="progress-fill"
          style="width:${percent}%"
        ></div>
      </div>

      <p class="hint">
        This is task completion, not an academic score.
      </p>

      ${t.steps.map((x, i) => `
        <div class="task ${
          s.checks.includes(i) ? "done" : ""
        }">

          <input
            type="checkbox"
            id="check-${i}"
            data-step="${i}"
            ${s.checks.includes(i) ? "checked" : ""}
          >

          <label for="check-${i}">
            ${escapeHTML(x)}
          </label>

        </div>
      `).join("")}

    </article>

    <article class="panel">

      <h3>My next actions</h3>

      <div class="field">
        <label for="plan-notes">
          Personal notes
        </label>

        <textarea
          id="plan-notes"
          placeholder="Who will help? What is your next action?"
        >${escapeHTML(s.notes)}</textarea>
      </div>

      <button
        type="button"
        class="primary"
        id="save-notes"
      >
        Save notes
      </button>

    </article>
  `;
}

// ==========================================
// DIFFERENT FORMS FOR EACH WORKSPACE
// ==========================================

const forms = {
  performance: {
    heading: "Add a subject result",
    fields: [
      ["subject", "Subject", "text", true],
      ["level", "Grade level / year", "text", true],
      ["term", "Term or semester", "text", true],
      ["score", "Result (%)", "number", true]
    ]
  },

  transcript: {
    heading: "Track a school document",
    fields: [
      ["name", "Document name", "text", true],
      ["office", "School office / contact", "text", false],
      ["deadline", "Needed by", "date", false],
      [
        "status",
        "Status",
        "select",
        true,
        [
          "Not requested",
          "Requested",
          "In progress",
          "Ready",
          "Submitted"
        ]
      ]
    ]
  },

  achievements: {
    heading: "Add an achievement",
    fields: [
      ["name", "Achievement / award title", "text", true],
      ["organizer", "Organizer", "text", true],
      ["year", "Year", "text", true],
      [
        "level",
        "Level",
        "select",
        true,
        [
          "School",
          "Local",
          "Regional",
          "National",
          "International",
          "Other"
        ]
      ],
      [
        "evidence",
        "Evidence",
        "select",
        true,
        [
          "Not yet checked",
          "Available",
          "Need to request",
          "Not available"
        ]
      ]
    ]
  },

  improvement: {
    heading: "Create a learning goal",
    fields: [
      ["subject", "Subject / skill", "text", true],
      ["gap", "Specific topic to improve", "text", true],
      ["action", "Practice action", "textarea", true],
      ["review", "Review date", "date", false],
      [
        "status",
        "Status",
        "select",
        true,
        [
          "Not started",
          "In progress",
          "Completed"
        ]
      ]
    ]
  }
};

// ==========================================
// GENERATE FORM FIELDS
// ==========================================

function fieldHTML([
  key,
  label,
  type,
  required,
  options
]) {
  const req = required ? "required" : "";

  let control;

  if (type === "select") {
    control = `
      <select
        name="${key}"
        id="item-${key}"
        ${req}
      >
        ${options.map(o => `
          <option value="${escapeHTML(o)}">
            ${escapeHTML(o)}
          </option>
        `).join("")}
      </select>
    `;
  } else if (type === "textarea") {
    control = `
      <textarea
        name="${key}"
        id="item-${key}"
        ${req}
        maxlength="1500"
      ></textarea>
    `;
  } else {
    control = `
      <input
        name="${key}"
        id="item-${key}"
        type="${type}"
        ${req}
        ${
          type === "number"
            ? 'min="0" max="100" step="0.01"'
            : ""
        }
        maxlength="160"
      >
    `;
  }

  return `
    <div class="field">
      <label for="item-${key}">
        ${escapeHTML(label)}
        ${required ? " *" : ""}
      </label>

      ${control}
    </div>
  `;
}

// ==========================================
// GRADE / DOCUMENT / ACHIEVEMENT / GOAL TOOL
// ==========================================

function renderItems() {
  const config = forms[current];
  const items = data[current].items;

  $("tab-content").innerHTML = `
    <article class="panel">

      <h3>${escapeHTML(config.heading)}</h3>

      <form id="item-form">

        ${config.fields.map(fieldHTML).join("")}

        <div class="actions">

          <button
            type="submit"
            class="primary"
            id="item-submit"
          >
            Save entry
          </button>

          <button
            type="button"
            class="secondary"
            id="cancel-item"
            hidden
          >
            Cancel editing
          </button>

        </div>

      </form>

    </article>

    <article class="panel">

      <h3>Saved entries (${items.length})</h3>

      ${
        items.length
          ? items.map(item => `
            <article class="record">

              <h4>
                ${escapeHTML(
                  item.subject || item.name || "Entry"
                )}
              </h4>

              ${config.fields
                .filter(f =>
                  f[0] !== "subject" &&
                  f[0] !== "name"
                )
                .map(([key, label]) => `
                  <p>
                    <strong>${escapeHTML(label)}:</strong>
                    ${escapeHTML(item[key] || "Not added")}
                  </p>
                `).join("")}

              <div class="actions">

                <button
                  type="button"
                  class="secondary"
                  data-item-edit="${escapeHTML(item.id)}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="danger"
                  data-item-delete="${escapeHTML(item.id)}"
                >
                  Delete
                </button>

              </div>

            </article>
          `).join("")
          : `
            <p class="empty">
              No entries yet.
              Use the form above to begin.
            </p>
          `
      }

    </article>
  `;
}

// ==========================================
// PERSONAL NOTES / JOURNAL
// ==========================================

function renderRecords() {
  const s = data[current];
  const t = topics[current];

  const label = t.tabs.find(
    x => x[0] === "records"
  )[1];

  $("tab-content").innerHTML = `
    <article class="panel">

      <h3>My ${escapeHTML(label)}</h3>

      <p class="muted">
        ${escapeHTML(t.prompt)}
      </p>

      <form id="record-form">

        <div class="field">
          <label for="record-title">
            Title *
          </label>

          <input
            id="record-title"
            name="title"
            maxlength="150"
            required
          >
        </div>

        <div class="field">
          <label for="record-date">
            Date (optional)
          </label>

          <input
            id="record-date"
            name="date"
            type="date"
          >
        </div>

        <div class="field">
          <label for="record-details">
            Details *
          </label>

          <textarea
            id="record-details"
            name="details"
            maxlength="5000"
            required
          ></textarea>
        </div>

        <div class="actions">

          <button
            class="primary"
            type="submit"
          >
            Save note
          </button>

          <button
            type="button"
            class="secondary"
            id="cancel-record"
            hidden
          >
            Cancel editing
          </button>

        </div>

      </form>

    </article>

    <article class="panel">

      <h3>Saved notes (${s.records.length})</h3>

      ${
        s.records.length
          ? s.records.map(r => `
            <article class="record">

              <h4>${escapeHTML(r.title)}</h4>

              <p class="muted">
                ${escapeHTML(r.date || "No date")}
              </p>

              <p>${escapeHTML(r.details)}</p>

              <div class="actions">

                <button
                  type="button"
                  class="secondary"
                  data-record-edit="${escapeHTML(r.id)}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="danger"
                  data-record-delete="${escapeHTML(r.id)}"
                >
                  Delete
                </button>

              </div>

            </article>
          `).join("")
          : `
            <p class="empty">
              No notes saved yet.
            </p>
          `
      }

    </article>
  `;
}

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.workspace;

    if (id === "overview") {
      showScreen("overview");
    } else {
      showScreen("workspace", id);
    }
  });
});

// ==========================================
// DASHBOARD CARD NAVIGATION
// ==========================================

$("academic-overview").addEventListener("click", event => {
  const button = event.target.closest(
    "[data-open-workspace]"
  );

  if (!button) return;

  showScreen("workspace", button.dataset.openWorkspace);
});

// ==========================================
// BACK TO OVERVIEW
// ==========================================

$("academic-back-btn").addEventListener("click", () => {
  showScreen("overview");
});

// ==========================================
// TAB NAVIGATION
// ==========================================

$("workspace-tabs").addEventListener("click", e => {
  const b = e.target.closest("[data-tab]");

  if (!b) return;

  tab = b.dataset.tab;

  render();
});

// ==========================================
// CHECKLIST INTERACTION
// ==========================================

$("tab-content").addEventListener("change", e => {
  if (!e.target.matches("[data-step]")) return;

  const i = Number(e.target.dataset.step);
  const s = data[current];

  s.checks = e.target.checked
    ? [...new Set([...s.checks, i])]
    : s.checks.filter(n => n !== i);

  save();
  render();
});

// ==========================================
// BUTTON INTERACTIONS
// ==========================================

$("tab-content").addEventListener("click", e => {
  const b = e.target.closest("button");

  if (!b) return;

  const s = data[current];

  if (b.dataset.go) {
    tab = b.dataset.go;
    render();
    return;
  }

  if (b.id === "save-notes") {
    s.notes = $("plan-notes").value;
    save();
    return;
  }

  if (
    b.id === "cancel-item" ||
    b.id === "cancel-record"
  ) {
    render();
    return;
  }

  if (b.dataset.itemEdit) {
    const item = s.items.find(
      x => x.id === b.dataset.itemEdit
    );

    if (!item) return;

    const form = $("item-form");

    form.dataset.editId = item.id;

    for (const [key] of forms[current].fields) {
      form.elements[key].value = item[key] ?? "";
    }

    $("item-submit").textContent = "Update entry";
    $("cancel-item").hidden = false;

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  if (b.dataset.itemDelete) {
    if (!confirm("Delete this entry?")) return;

    s.items = s.items.filter(
      x => x.id !== b.dataset.itemDelete
    );

    if (save()) render();

    return;
  }

  if (b.dataset.recordEdit) {
    const item = s.records.find(
      x => x.id === b.dataset.recordEdit
    );

    if (!item) return;

    const form = $("record-form");

    form.dataset.editId = item.id;

    form.elements.title.value = item.title || "";
    form.elements.date.value = item.date || "";
    form.elements.details.value = item.details || "";

    $("cancel-record").hidden = false;

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return;
  }

  if (b.dataset.recordDelete) {
    if (!confirm("Delete this note?")) return;

    s.records = s.records.filter(
      x => x.id !== b.dataset.recordDelete
    );

    if (save()) render();
  }
});

// ==========================================
// SAVE NEW OR EDITED ENTRIES
// ==========================================

$("tab-content").addEventListener("submit", e => {
  const form = e.target;

  if (
    form.id !== "item-form" &&
    form.id !== "record-form"
  ) {
    return;
  }

  e.preventDefault();

  const s = data[current];
  const editId = form.dataset.editId;

  if (form.id === "item-form") {
    const item = {};

    for (const [key] of forms[current].fields) {
      item[key] = String(
        form.elements[key].value
      ).trim();
    }

    if (
      current === "performance" &&
      (
        !Number.isFinite(Number(item.score)) ||
        item.score === "" ||
        Number(item.score) < 0 ||
        Number(item.score) > 100
      )
    ) {
      alert("Enter a percentage from 0 to 100.");
      return;
    }

    const old = s.items.find(
      x => x.id === editId
    );

    if (old) {
      Object.assign(old, item);
    } else {
      s.items.unshift({
        id: uid(),
        ...item
      });
    }

  } else {
    const item = {
      title: form.elements.title.value.trim(),
      date: form.elements.date.value,
      details: form.elements.details.value.trim()
    };

    if (!item.title || !item.details) return;

    const old = s.records.find(
      x => x.id === editId
    );

    if (old) {
      Object.assign(old, item);
    } else {
      s.records.unshift({
        id: uid(),
        ...item
      });
    }
  }

  if (save()) {
    render();
  }
});

// ==========================================
// INITIALIZE ACADEMIC DASHBOARD
// ==========================================

showScreen("overview");