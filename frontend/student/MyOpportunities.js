
"use strict";

// Get the existing login token
const token = localStorage.getItem("token");

const $ = id => document.getElementById(id);

// Escape HTML to protect displayed data
const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

// Eligibility labels
const eligibilityLabels = {
  ELIGIBLE: "Eligible",
  POTENTIALLY_ELIGIBLE: "Potentially eligible",
  REQUIREMENTS_NOT_MET: "Requirements not met"
};

// Opportunity tracking statuses
const statusLabels = {
  RESEARCHING: "Researching",
  CONSIDERING: "Considering",
  PLANNING_TO_APPLY: "Planning to apply",
  APPLIED: "Applied"
};

// Redirect users who are not signed in
if (!token) {
  location.href = "../auth/signin.html";
}

// API request helper
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("token");
    location.href = "../auth/signin.html";
    throw new Error("Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

// Display eligibility status
function pill(status) {
  const className =
    status === "ELIGIBLE"
      ? "eligible"
      : status === "REQUIREMENTS_NOT_MET"
        ? "notmet"
        : "potential";

  return `
    <span class="pill ${className}">
      ${esc(eligibilityLabels[status] || "Needs assessment")}
    </span>
  `;
}

// Load saved opportunities
async function load() {
  try {
    const data = await api("/matching/saved");
    const list = data.opportunities || [];

    $("savedCount").textContent = `${list.length} saved`;

    const root = $("savedResults");
    root.replaceChildren();

    if (!list.length) {
      root.innerHTML = `
        <div class="empty">
          <h3>Your tracker is ready</h3>
          <p>
            Save opportunities from Explore and they will appear here.
          </p>
          <a class="official" href="Explore.html">
            Explore opportunities →
          </a>
        </div>
      `;

      return;
    }

    // Display each saved opportunity
    for (const item of list) {
      const opportunity = item.opportunity;

      if (!opportunity) continue;

      const opportunityId = opportunity.opportunity_id;

      const card = document.createElement("article");
      card.className = "op-card";

      card.innerHTML = `
        <div class="card-top">
          <div>
            <h3>${esc(opportunity.title)}</h3>

            <div class="provider">
              ${esc(opportunity.provider || "Provider not specified")}
            </div>
          </div>
        </div>

        <div class="pills">
          ${pill(item.eligibility?.status)}

          <span class="pill">
            ${esc(
              opportunity.subtype_name ||
              opportunity.category ||
              "Opportunity"
            )}
          </span>
        </div>

        <p class="summary">
          ${esc(
            (opportunity.description || "Description not provided.")
              .slice(0, 180)
          )}
        </p>

        <div class="meta">
          <span>
            <i class="fa-regular fa-calendar"></i>
            ${esc(item.deadline?.label || "Deadline not provided")}
          </span>
        </div>

        <label
          class="tracker-label"
          style="display:block;font-size:12px;color:#626a74;font-weight:700"
        >
          MY STATUS

          <select
            data-status="${esc(opportunityId)}"
            style="display:block;margin-top:7px;width:100%;padding:11px;border:1px solid #ddd7ce;border-radius:9px;background:#fff"
          >
            ${Object.entries(statusLabels).map(([value, label]) => `
              <option
                value="${value}"
                ${item.savedStatus === value ? "selected" : ""}
              >
                ${label}
              </option>
            `).join("")}
          </select>
        </label>

        <div class="card-actions">

          <button
            class="details"
            type="button"
            data-details="${esc(opportunityId)}"
          >
            View details
          </button>

          <button
            class="prepare-opportunity"
            type="button"
            data-prepare="${esc(opportunityId)}"
          >
            Prepare for this opportunity
          </button>

          <button
            type="button"
            data-remove="${esc(opportunityId)}"
          >
            Remove from list
          </button>

        </div>
      `;

      // Update opportunity tracking status
      card.querySelector("[data-status]").addEventListener(
        "change",
        async event => {
          const select = event.currentTarget;
          select.disabled = true;

          try {
            await api(
              `/matching/saved/${encodeURIComponent(opportunityId)}`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  status: select.value
                })
              }
            );

          } catch (error) {
            alert(error.message);
            await load();

          } finally {
            select.disabled = false;
          }
        }
      );

      // Remove opportunity from saved list
      card.querySelector("[data-remove]").addEventListener(
        "click",
        async () => {
          if (
            !confirm(
              "Remove this opportunity from My Opportunities?"
            )
          ) {
            return;
          }

          try {
            await api(
              `/matching/saved/${encodeURIComponent(opportunityId)}`,
              {
                method: "DELETE"
              }
            );

            await load();

          } catch (error) {
            alert(error.message);
          }
        }
      );

      // Open opportunity details
      card.querySelector("[data-details]").addEventListener(
        "click",
        () => details(opportunityId)
      );

      // Create Preparation workspace
      card.querySelector("[data-prepare]").addEventListener(
        "click",
        async event => {
          const button = event.currentTarget;

          if (
            !confirm(
              `Create a preparation workspace for "${opportunity.title}"?`
            )
          ) {
            return;
          }

          button.disabled = true;
          button.textContent = "Creating...";

          try {
            await api("/preparation/workspaces", {
              method: "POST",

              body: JSON.stringify({
                opportunity_id: opportunityId,
                title: opportunity.title,
                description: opportunity.description || ""
              })
            });

            alert(
              "Preparation workspace created successfully!"
            );

            // Open the Preparation dashboard
            window.location.href = "preparation/index.html";

          } catch (error) {
            alert(error.message);

            button.disabled = false;
            button.textContent = "Prepare for this opportunity";
          }
        }
      );

      root.appendChild(card);
    }

  } catch (error) {
    $("savedResults").innerHTML = `
      <div class="empty">
        <h3>Could not load saved opportunities</h3>
        <p>
          ${esc(error.message)}.
          Check that the Explore database migration has been applied.
        </p>
      </div>
    `;
  }
}

// Display opportunity details
async function details(id) {
  $("detailBackdrop").hidden = false;
  $("detailContent").innerHTML = "<p>Loading…</p>";

  try {
    const data = await api(
      `/matching/opportunities/${encodeURIComponent(id)}`
    );

    const result = data.result;
    const opportunity = result.opportunity;

    const checks = (result.eligibility?.checks || [])
      .map(check => `
        <div class="check-row">
          <strong>${esc(check.requirement)}</strong>

          <span class="state ${esc(check.state)}">
            ${esc(check.state)}
          </span>

          <p>${esc(check.explanation)}</p>
        </div>
      `)
      .join("") || `
        <p>
          No confirmed mandatory requirements are recorded yet.
        </p>
      `;

    $("detailContent").innerHTML = `
      <h2>${esc(opportunity.title)}</h2>

      <p class="provider">
        ${esc(opportunity.provider || "Provider not specified")}
      </p>

      <div class="pills">
        ${pill(result.eligibility?.status)}

        <span class="pill">
          ${esc(result.classification?.label || "Unclassified")}
        </span>
      </div>

      <div class="detail-section">
        <h3>About</h3>

        <p>
          ${esc(opportunity.description || "Description not provided.")}
        </p>

        <p>
          Deadline: ${esc(result.deadline?.label || "Not provided")}
        </p>

        ${
          opportunity.application_url
            ? `
              <a
                class="official"
                href="${esc(opportunity.application_url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Official page ↗️
              </a>
            `
            : ""
        }
      </div>

      <div class="detail-section">
        <h3>Eligibility breakdown</h3>

        ${checks}
      </div>

      <div class="detail-section">
        <h3>Goal fit</h3>

        <p>
          ${esc(result.goalFit?.explanation || "Goal-fit information is unavailable.")}
        </p>
      </div>

      <div class="detail-section">
        <h3>Information to verify</h3>

        <ul>
          ${(result.dataQuality?.warnings || [])
            .map(warning => `<li>${esc(warning)}</li>`)
            .join("")}
        </ul>
      </div>
    `;

  } catch (error) {
    $("detailContent").innerHTML = `
      <p>${esc(error.message)}</p>
    `;
  }
}

// Close opportunity details
$("closeDetails").onclick = () => {
  $("detailBackdrop").hidden = true;
};

$("detailBackdrop").onclick = event => {
  if (event.target === $("detailBackdrop")) {
    $("detailBackdrop").hidden = true;
  }
};

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $("detailBackdrop").hidden = true;
  }
});

// Initialize page
load();
