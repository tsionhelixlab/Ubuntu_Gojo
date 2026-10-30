document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token');

    // User is not logged in
    if (!token) {
        window.location.href = '../auth/signin.html';
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`
    };


    try {

        /*
        ==========================================
        1. LOAD CURRENT USER
        ==========================================
        */

        const me = await api('/auth/me', {
            headers
        });

        displayUser(me.user);


        /*
        ==========================================
        2. LOAD PROFILE
        ==========================================
        */

        const profileResponse = await api(
            '/profile',
            { headers },
            true
        );

        const profile = profileResponse?.profile || null;

        renderProfileState(profile);


        /*
        ==========================================
        3. LOAD GOALS
        ==========================================
        */

        const goalsResponse = await api(
            '/goals',
            { headers },
            true
        );

        const goals = goalsResponse?.goals || [];

        renderGoals(goals);


        /*
        ==========================================
        4. LOAD REAL MATCHING RESULTS
        ==========================================
        */

        const matchingResponse = await api(
            '/matching',
            { headers },
            true
        );

        const matches = (matchingResponse?.matches || []).map(normalizeDashboardMatch);

        renderMatches(matches);

        renderTopMatches(matches);

        renderJourney(profile, goals, matches);

        renderDashboardSummary(profile, goals, matches);


    } catch (error) {

        console.error('Dashboard error:', error);

        if (error.status === 401) {

            localStorage.clear();

            alert('Your session expired. Please sign in again.');

            window.location.href = '../auth/signin.html';

            return;
        }

        showDashboardError();

    }


    /*
    ==========================================
    PROFILE DROPDOWN
    ==========================================
    */

    const profileToggle =
        document.getElementById('profileMenuToggle');

    const dropdown =
        document.getElementById('profileDropdown');


    if (profileToggle && dropdown) {

        profileToggle.addEventListener('click', event => {

            event.stopPropagation();

            dropdown.classList.toggle('open');

        });


        window.addEventListener('click', () => {

            dropdown.classList.remove('open');

        });

    }


    /*
    ==========================================
    SIGN OUT
    ==========================================
    */

    document
        .getElementById('signOutBtn')
        ?.addEventListener('click', async event => {

            event.preventDefault();

            try {

                await api('/auth/logout', {
                    method: 'POST',
                    headers
                });

            } catch (error) {

                console.error('Logout error:', error);

            } finally {

                localStorage.clear();

                window.location.href =
                    '../auth/signin.html';

            }

        });


    /*
    ==========================================
    TASK MODAL
    ==========================================
    */

    setupTaskModal();

});



/*
==================================================
API HELPER
==================================================
*/

async function api(path, options = {}, optional = false) {

    const response = await fetch(
        `${API_BASE_URL}${path}`,
        options
    );

    let data = {};

    try {

        data = await response.json();

    } catch {

        data = {};

    }


    if (!response.ok) {

        if (
            optional &&
            (
                response.status === 404 ||
                response.status === 400
            )
        ) {

            return null;

        }


        const error = new Error(
            data.message || 'Request failed'
        );

        error.status = response.status;

        throw error;

    }


    return data;

}



/*
==================================================
USER
==================================================
*/

function normalizeDashboardMatch(match) {
    // Support both the existing dashboard shape and the current /matching contract.
    if (!match || typeof match !== 'object') return {};

    const statusMap = {
        ELIGIBLE: 'Good Match',
        POTENTIALLY_ELIGIBLE: 'Potential Match',
        REQUIREMENTS_NOT_MET: 'Not Currently Eligible',
        GOOD_MATCH: 'Good Match',
        POTENTIAL_MATCH: 'Potential Match',
        NOT_CURRENTLY_ELIGIBLE: 'Not Currently Eligible'
    };

    // In the current API, checks and gaps are top-level. Older responses may nest checks.
    const rawChecks = Array.isArray(match.checks)
        ? match.checks
        : Array.isArray(match.eligibility?.checks)
            ? match.eligibility.checks
            : [];

    const checks = rawChecks.map(check => {
        const passed = typeof check.passed === 'boolean'
            ? check.passed
            : check.state === 'MET' || check.state === 'PASSED';
        return {
            ...check,
            requirement: check.requirement || check.label || check.name || 'Requirement',
            passed,
            studentValue: check.studentValue ?? check.student_value ?? null,
            required: check.required ?? check.requiredValue ?? null,
            explanation: check.explanation || check.message || ''
        };
    });

    const rawStatus = match.status || match.eligibility?.status || '';
    const status = statusMap[String(rawStatus).toUpperCase()]
        || (['Good Match', 'Potential Match', 'Not Currently Eligible'].includes(rawStatus)
            ? rawStatus
            : 'Potential Match');

    const goalScore = Number(match.goalFit?.score);
    const existingScore = Number(match.score ?? match.matchPercentage);
    const eligibilityScore = checks.length
        ? Math.round(checks.filter(check => check.passed).length / checks.length * 100)
        : 0;
    const score = Number.isFinite(existingScore)
        ? existingScore
        : Number.isFinite(goalScore)
            ? goalScore
            : eligibilityScore;

    const gaps = Array.isArray(match.gaps)
        ? match.gaps
        : checks.filter(check => !check.passed);

    return { ...match, status, score, checks, gaps };
}

function displayUser(user) {

    const name =
        [
            user?.first_name,
            user?.last_name
        ]
            .filter(Boolean)
            .join(' ')
        ||
        user?.email
        ||
        'Student';


    const navUserName =
        document.getElementById('navUserName');

    const greeting =
        document.getElementById('Greeting');


    if (navUserName) {

        navUserName.textContent = name;

    }


    if (greeting) {

        greeting.textContent =
            `Welcome back, ${name}!`;

    }

}



/*
==================================================
PROFILE STATE
==================================================
*/

function renderProfileState(profile) {

    const text =
        document.getElementById(
            'profileCompletionText'
        );

    const title =
        document.getElementById(
            'profileCompletionTitle'
        );


    if (!profile || !profile.profile_id) {

        if (title) {

            title.textContent =
                'Your profile is not complete yet';

        }

        if (text) {

            text.textContent =
                'Complete your profile to start receiving personalized recommendations.';

        }

        return;

    }


    /*
    These are the profile fields currently
    relevant to the matching system.
    */

    const fields = [

        'school_name',
        'education_level',
        'field_of_study',
        'academic_percent_equivalent',
        'citizenship',
        'date_of_birth'

    ];


    const completed =
        fields.filter(field => {

            const value = profile[field];

            return (
                value !== null &&
                value !== undefined &&
                value !== ''
            );

        }).length;


    const percentage =
        Math.round(
            (completed / fields.length) * 100
        );


    if (title) {

        title.textContent =
            `Your profile is ${percentage}% ready`;

    }


    if (text) {

        if (percentage >= 100) {

            text.textContent =
                'Your core profile information is ready for matching.';

        } else {

            text.textContent =
                `Complete ${fields.length - completed} more profile field${fields.length - completed === 1 ? '' : 's'} to improve your recommendations.`;

        }

    }

}



/*
==================================================
GOALS
==================================================
*/

function renderGoals(goals) {

    const goalSummary =
        document.getElementById('goalSummary');

    const horizonGoal =
        document.getElementById('horizonGoal');


    if (!goals.length) {

        if (goalSummary) {

            goalSummary.textContent =
                'Add your study goals to make your recommendations more personalized.';

        }

        if (horizonGoal) {

            horizonGoal.textContent =
                'Goal not set';

        }

        return;

    }


    const goal = goals[0];


    const degree =
        goal.target_degree ||
        'Study opportunity';


    const field =
        goal.target_field
            ? ` in ${goal.target_field}`
            : '';


    const countries =
        Array.isArray(goal.target_countries) &&
        goal.target_countries.length
            ? ` • ${goal.target_countries.join(', ')}`
            : '';


    if (goalSummary) {

        goalSummary.textContent =
            `Looking for ${degree}${field}${countries}`;

    }


    if (horizonGoal) {

        horizonGoal.textContent =
            `${degree}${field}`;

    }

}



/*
==================================================
MATCHES
==================================================
*/

function renderMatches(matches) {

    const matchList =
        document.getElementById('matchList');


    if (!matchList) return;


    matchList.innerHTML = '';


    if (!matches.length) {

        matchList.innerHTML = `

            <div class="empty-matches">

                <div class="empty-matches-icon">
                    <i class="fa-solid fa-compass"></i>
                </div>

                <h3>
                    No opportunities matched yet
                </h3>

                <p>
                    Complete your profile and study goals
                    to discover opportunities that fit you.
                </p>

                <a href="Profile.html">
                    Complete Profile
                    <i class="fa-solid fa-arrow-right"></i>
                </a>

            </div>

        `;

        return;

    }


    /*
    Show the strongest 3 recommendations
    in the main dashboard section.
    */

    const topMatches =
        matches
            .filter(match => match.opportunity)
            .slice(0, 3);


    topMatches.forEach(match => {

        matchList.appendChild(
            createRecommendationCard(match)
        );

    });

}



/*
==================================================
RECOMMENDATION CARD
==================================================
*/

function createRecommendationCard(match) {

    const opportunity =
        match.opportunity || {};


    const card =
        document.createElement('article');


    card.className =
        'recommendation-card';


    const title =
        escapeHtml(
            opportunity.title ||
            'Untitled Opportunity'
        );


    const provider =
        escapeHtml(
            opportunity.provider ||
            opportunity.organization ||
            'Opportunity provider'
        );


    const score =
        Number.isFinite(Number(match.score))
            ? Number(match.score)
            : 0;


    const status =
        match.status ||
        'Potential Match';


    const deadline =
        formatDate(
            opportunity.deadline
        );


    /*
    Get passed checks from the REAL
    matching service response.
    */

    const passedChecks =
        Array.isArray(match.checks)
            ? match.checks.filter(
                check => check.passed
            )
            : [];


    /*
    Only show factors that actually
    came from the matching engine.
    */

    const factors =
        passedChecks
            .slice(0, 3)
            .map(check => {

                return `
                    <span class="factor-tag">
                        <i class="fa-solid fa-check"></i>
                        ${escapeHtml(check.requirement)}
                    </span>
                `;

            })
            .join('');


    const safeLink =
        opportunity.website_url ||
        opportunity.application_url ||
        '#';


    card.innerHTML = `

        <div class="recommendation-card-top">

            <span class="opportunity-type">
                ${escapeHtml(
                    opportunity.category ||
                    'SCHOLARSHIP'
                )}
            </span>

            <span class="recommendation-score">
                ${score}% Match
            </span>

        </div>


        <div class="recommendation-main">

            <h3>
                ${title}
            </h3>

            <p class="recommendation-provider">
                ${provider}
            </p>


            <div class="match-status">

                <span class="${getStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>

            </div>


            ${
                factors
                    ? `
                        <div class="match-factors">
                            ${factors}
                        </div>
                    `
                    : ''
            }

        </div>


        <div class="recommendation-footer">

            <span class="recommendation-deadline">

                <i class="fa-regular fa-clock"></i>

                ${
                    deadline
                        ? `Deadline: ${deadline}`
                        : 'Deadline not specified'
                }

            </span>


            <a
                class="recommendation-action"
                href="${escapeAttribute(safeLink)}"
                ${
                    safeLink !== '#'
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : ''
                }
            >
                View Opportunity
                <i class="fa-solid fa-arrow-right"></i>
            </a>

        </div>

    `;


    return card;

}



/*
==================================================
TOP MATCHES SIDEBAR
==================================================
*/

function renderTopMatches(matches) {

    const container =
        document.getElementById(
            'topMatchesList'
        );


    const count =
        document.getElementById(
            'matchCount'
        );


    if (!container) return;


    if (count) {

        count.textContent =
            matches.length;

    }


    container.innerHTML = '';


    if (!matches.length) {

        container.innerHTML = `

            <div class="mini-empty">
                No matches available yet.
            </div>

        `;

        return;

    }


    matches
        .slice(0, 4)
        .forEach(match => {

            container.appendChild(
                createMiniOpportunityCard(match)
            );

        });

}



/*
==================================================
MINI OPPORTUNITY CARD
==================================================
*/

function createMiniOpportunityCard(match) {

    const opportunity =
        match.opportunity || {};


    const card =
        document.createElement('div');


    card.className =
        'scholarship-mini-card';


    const score =
        Number(match.score) || 0;


    const title =
        escapeHtml(
            opportunity.title ||
            'Untitled Opportunity'
        );


    const provider =
        escapeHtml(
            opportunity.provider ||
            opportunity.organization ||
            'Opportunity provider'
        );


    const deadline =
        formatDate(
            opportunity.deadline
        );


    const safeLink =
        opportunity.website_url ||
        opportunity.application_url ||
        '#';


    card.innerHTML = `

        <div class="match-badge">
            ${score}% Match
        </div>

        <h4>
            ${title}
        </h4>

        <span class="uni-location">
            <i class="fa-regular fa-building"></i>
            ${provider}
        </span>

        <div class="card-footer-info">

            <span class="deadline">

                <i class="fa-regular fa-clock"></i>

                ${
                    deadline
                        ? deadline
                        : 'Deadline not specified'
                }

            </span>


            <a
                class="btn-sm-action"
                href="${escapeAttribute(safeLink)}"
                ${
                    safeLink !== '#'
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : ''
                }
            >
                View
            </a>

        </div>

    `;


    return card;

}



/*
==================================================
JOURNEY
==================================================
*/

function renderJourney(
    profile,
    goals,
    matches
) {

    const steps = [

        document.getElementById('journeyStep1'),
        document.getElementById('journeyStep2'),
        document.getElementById('journeyStep3'),
        document.getElementById('journeyStep4'),
        document.getElementById('journeyStep5')

    ];


    const badge =
        document.getElementById(
            'journeyStepBadge'
        );


    const progressNumber =
        document.getElementById(
            'journeyProgressNumber'
        );


    /*
    Determine the student's current stage
    from actual available information.
    */

    let currentStep = 1;


    const hasProfile =
        !!profile?.profile_id;


    const hasGoal =
        Array.isArray(goals) &&
        goals.length > 0;


    const hasMatches =
        Array.isArray(matches) &&
        matches.length > 0;


    const hasGoodMatch =
        matches.some(
            match =>
                normalize(match.status) ===
                'good match'
        );


    if (hasProfile) {
        currentStep = 2;
    }


    if (hasProfile && hasGoal && hasMatches) {
        currentStep = 3;
    }


    if (hasGoodMatch) {
        currentStep = 3;
    }


    /*
    We don't mark "Apply" or "Achieve"
    automatically because we currently
    don't have application-tracking data.
    */

    steps.forEach((step, index) => {

        if (!step) return;


        const stepNumber =
            index + 1;


        step.classList.remove(
            'completed',
            'active'
        );


        const check =
            step.querySelector('.step-check');


        if (stepNumber < currentStep) {

            step.classList.add('completed');

            if (check) {

                check.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

            }

        } else if (stepNumber === currentStep) {

            step.classList.add('active');

            if (check) {

                check.textContent =
                    stepNumber;

            }

        } else {

            if (check) {

                check.textContent =
                    stepNumber;

            }

        }

    });


    if (badge) {

        badge.textContent =
            `Step ${currentStep} of 5`;

    }


    /*
    Approximate progress from the current
    journey stage — not a fake database value.
    */

    const progressMap = {

        1: 20,
        2: 40,
        3: 60,
        4: 80,
        5: 100

    };


    if (progressNumber) {

        progressNumber.textContent =
            `${progressMap[currentStep]}%`;

    }


    const stage =
        document.getElementById(
            'journeyStage'
        );


    if (stage) {

        const stageNames = {

            1: 'Getting Started',
            2: 'Profile Ready',
            3: 'Active Preparation',
            4: 'Application Stage',
            5: 'Achievement'

        };


        stage.textContent =
            stageNames[currentStep];

    }

}



/*
==================================================
DASHBOARD SUMMARY
==================================================
*/

function renderDashboardSummary(
    profile,
    goals,
    matches
) {

    const summary =
        document.getElementById(
            'dashboardSummary'
        );


    if (!summary) return;


    if (!profile?.profile_id) {

        summary.textContent =
            'Complete your profile to begin your personalized scholarship journey.';

        return;

    }


    if (!goals.length) {

        summary.textContent =
            'Your profile is ready. Add your study goals to receive more personalized opportunities.';

        return;

    }


    if (!matches.length) {

        summary.textContent =
            'Your goals are saved. We are ready to help you discover suitable opportunities.';

        return;

    }


    const goodMatches =
        matches.filter(
            match =>
                normalize(match.status) ===
                'good match'
        ).length;


    summary.textContent =
        `We found ${matches.length} active opportunit${matches.length === 1 ? 'y' : 'ies'} based on your profile and goals${goodMatches ? `, including ${goodMatches} strong ${goodMatches === 1 ? 'match' : 'matches'}` : ''}.`;

}



/*
==================================================
TASK MODAL
==================================================
*/

function setupTaskModal() {

    const modal =
        document.getElementById(
            'taskModal'
        );

    const openButton =
        document.getElementById(
            'addTaskBtn'
        );

    const closeButton =
        document.getElementById(
            'closeTaskModal'
        );

    const saveButton =
        document.getElementById(
            'saveNewTaskBtn'
        );


    if (!modal || !openButton) {
        return;
    }


    openButton.addEventListener(
        'click',
        () => {

            modal.classList.add('open');

        }
    );


    closeButton?.addEventListener(
        'click',
        () => {

            modal.classList.remove('open');

        }
    );


    modal.addEventListener(
        'click',
        event => {

            if (event.target === modal) {

                modal.classList.remove('open');

            }

        }
    );


    saveButton?.addEventListener(
        'click',
        () => {

            const titleInput =
                document.getElementById(
                    'new-task-title'
                );

            const dueInput =
                document.getElementById(
                    'new-task-due'
                );


            const title =
                titleInput?.value.trim();


            const due =
                dueInput?.value.trim();


            if (!title) {

                alert(
                    'Please enter a task description.'
                );

                return;

            }


            const task =
                document.createElement('label');


            task.className =
                'task-item';


            task.innerHTML = `

                <input type="checkbox">

                <div class="task-details">

                    <span class="task-title">
                        ${escapeHtml(title)}
                    </span>

                    ${
                        due
                            ? `
                                <span class="task-due">
                                    <i class="fa-regular fa-calendar"></i>
                                    ${escapeHtml(due)}
                                </span>
                            `
                            : ''
                    }

                </div>

            `;


            document
                .getElementById(
                    'taskListContainer'
                )
                ?.appendChild(task);


            if (titleInput) {
                titleInput.value = '';
            }


            if (dueInput) {
                dueInput.value = '';
            }


            modal.classList.remove('open');

        }
    );

}



/*
==================================================
STATUS CLASS
==================================================
*/

function getStatusClass(status) {

    const normalized =
        normalize(status);


    if (normalized === 'good match') {

        return 'status-good';

    }


    if (normalized === 'potential match') {

        return 'status-potential';

    }


    return 'status-not-eligible';

}



/*
==================================================
DATE FORMATTER
==================================================
*/

function formatDate(value) {

    if (!value) return null;


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {

        return String(value);

    }


    return date.toLocaleDateString(
        undefined,
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
    );

}



/*
==================================================
HTML SAFETY
==================================================
*/

function escapeHtml(value) {

    return String(value ?? '')
        .replace(
            /[&<>'"]/g,
            character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[character])
        );

}


function escapeAttribute(value) {

    return escapeHtml(value)
        .replace(/`/g, '&#96;');

}



/*
==================================================
NORMALIZE
==================================================
*/

function normalize(value) {

    return String(value || '')
        .trim()
        .toLowerCase();

}



/*
==================================================
GENERAL ERROR STATE
==================================================
*/

function showDashboardError() {

    const matchList =
        document.getElementById(
            'matchList'
        );


    if (matchList) {

        matchList.innerHTML = `

            <div class="empty-matches error-state">

                <div class="empty-matches-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>

                <h3>
                    We couldn't load your dashboard
                </h3>

                <p>
                    Please refresh the page. If the problem
                    continues, check that the server is running.
                </p>

            </div>

        `;

    }

}