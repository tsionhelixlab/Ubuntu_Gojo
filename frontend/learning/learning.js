
/* ==========================================
   UBUNTU GOJO — MY LEARNING PATH
========================================== */

const API = '/api/learning';

// LOCAL DEVELOPMENT ONLY.
// Set to false when integrating real authentication.
const DEMO_MODE = false;

/* PAGE ELEMENTS */

const levelCards = document.querySelectorAll(
  '.learning-level-card'
);

const selectedSection = document.getElementById(
  'selected-level-section'
);

const selectedTitle = document.getElementById(
  'selected-level-title'
);

const selectedDescription = document.getElementById(
  'selected-level-description'
);

const learningMessage = document.getElementById(
  'learning-message'
);

const lessonsContainer = document.getElementById(
  'learning-lessons'
);

const recommendationSection = document.getElementById(
  'learning-recommendation'
);

const suggestedLevel = document.getElementById(
  'suggested-level'
);

const suggestedDescription = document.getElementById(
  'suggested-level-description'
);

/* LEVEL INFORMATION */

const levelInformation = {
  foundation: {
    title: 'Foundation',
    description:
      'Understand scholarships, education systems, funding and basic eligibility.'
  },

  developing: {
    title: 'Developing',
    description:
      'Build your academic profile and prepare application materials.'
  },

  advanced: {
    title: 'Advanced',
    description:
      'Develop application strategies, manage deadlines and prepare for admission.'
  }
};

/* DATABASE DATA */

let levels = [];
let topics = [];
let lessons = [];

let selectedLevel = null;

/* HELPERS */

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = String(text);
  }

  return element;
}

function getToken() {
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('token')
  );
}

function getHeaders() {
  const headers = {};

  if (!DEMO_MODE) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function showMessage(text) {
  learningMessage.textContent = text;
}

function normalizeLevel(value) {
  return String(value || '').trim().toLowerCase();
}

/* FIND DATABASE LEVEL */

function findLevel(value) {
  if (value === undefined || value === null) {
    return null;
  }

  return levels.find(level =>
    String(level.level_id) === String(value) ||
    normalizeLevel(level.title) === normalizeLevel(value)
  ) || null;
}

/* FIND LESSONS BELONGING TO A LEVEL */

function getLessonsForLevel(levelValue) {
  const level = findLevel(levelValue);

  if (!level) {
    return [];
  }

  const levelTopics = topics.filter(
    topic =>
      String(topic.level_id) === String(level.level_id)
  );

  const topicIds = new Set(
    levelTopics.map(topic => String(topic.topic_id))
  );

  return lessons
    .filter(
      lesson => topicIds.has(String(lesson.topic_id))
    )
    .sort((a, b) => {
      const topicDifference =
        Number(a.topic_id) - Number(b.topic_id);

      return topicDifference ||
        Number(a.display_order) - Number(b.display_order);
    });
}

/* UPDATE LESSON COUNTS */

function updateLessonCounts() {
  levelCards.forEach(card => {
    const levelName = card.dataset.level;

    const count = getLessonsForLevel(levelName).length;

    const countElement = card.querySelector(
      '.level-lesson-count'
    );

    if (countElement) {
      countElement.textContent =
        `${count} ${count === 1 ? 'Lesson' : 'Lessons'}`;
    }
  });
}

/* DISPLAY LESSON CARDS */

function displayLessons(levelValue) {
  lessonsContainer.replaceChildren();

  const filteredLessons = getLessonsForLevel(levelValue);

  if (filteredLessons.length === 0) {
    lessonsContainer.appendChild(
      createElement(
        'p',
        'learning-empty',
        'No lessons are available for this level.'
      )
    );

    return;
  }

  filteredLessons.forEach(lesson => {
    const topic = topics.find(
      item =>
        String(item.topic_id) === String(lesson.topic_id)
    );

    const card = createElement(
      'article',
      'learning-lesson-card'
    );

    const topicLabel = createElement(
      'span',
      'lesson-topic',
      topic?.title || 'Learning Topic'
    );

    const title = createElement(
      'h3',
      'lesson-title',
      lesson.title
    );

    const description = createElement(
      'p',
      'lesson-description',
      lesson.key_points ||
      'Explore this lesson to develop your scholarship knowledge.'
    );

    const link = createElement(
      'a',
      'lesson-open-link',
      'Open Lesson →'
    );

    link.href =
      `lesson.html?id=${encodeURIComponent(lesson.lesson_id)}`;

    card.appendChild(topicLabel);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(link);

    lessonsContainer.appendChild(card);
  });
}

/* SELECT A LEVEL */

function selectLevel(levelValue, scroll = false) {
  const level = findLevel(levelValue);

  if (!level) {
    showMessage('The requested learning level was not found.');
    return;
  }

  const levelName = normalizeLevel(level.title);

  const information = levelInformation[levelName];

  selectedLevel = level.level_id;

  levelCards.forEach(card => {
    const active =
      normalizeLevel(card.dataset.level) === levelName;

    card.classList.toggle('active', active);
    card.setAttribute('aria-pressed', String(active));
  });

  selectedTitle.textContent =
    `${level.title} Lessons`;

  selectedDescription.textContent =
    information?.description ||
    level.description ||
    'Explore the lessons available at this learning level.';

  showMessage('');

  displayLessons(level.level_id);

  if (scroll) {
    selectedSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/* LOAD PERSONALIZED RECOMMENDATION */

async function loadRecommendations() {
  if (!DEMO_MODE && !getToken()) {
    recommendationSection.hidden = true;
    return null;
  }

  try {
    const response = await fetch(
      `${API}/recommendations`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(
        `Unable to load recommendations (${response.status}).`
      );
    }

    const result = await response.json();

    if (result.success !== true) {
      throw new Error(
        result.message || 'Recommendation request failed.'
      );
    }

    // No assessment completed yet.
    if (Array.isArray(result.data)) {
      recommendationSection.hidden = true;
      return null;
    }

    const data = result.data &&
      typeof result.data === 'object'
        ? result.data
        : result;

    const level = findLevel(
      data.recommended_level_id ??
      data.recommended_level
    );

    if (!level) {
      recommendationSection.hidden = true;
      return data;
    }

    suggestedLevel.textContent =
      `${level.title} Level`;

    suggestedDescription.textContent =
      data.level_explanation ||
      'This starting point was recommended using your initial assessment results.';

    recommendationSection.hidden = false;

    levelCards.forEach(card => {
      card.classList.toggle(
        'recommended',
        normalizeLevel(card.dataset.level) ===
          normalizeLevel(level.title)
      );
    });

    return data;

  } catch (error) {
    console.error(
      'Recommendation loading error:',
      error
    );

    recommendationSection.hidden = true;
    return null;
  }
}

/* LOAD DATABASE DATA */

async function loadLearningData() {
  showMessage('Loading learning materials...');

  try {
    const responses = await Promise.all([
      fetch(`${API}/levels`),
      fetch(`${API}/topics`),
      fetch(`${API}/lessons`)
    ]);

    for (const response of responses) {
      if (!response.ok) {
        throw new Error(
          'Unable to retrieve learning materials.'
        );
      }
    }

    const [
      levelsResult,
      topicsResult,
      lessonsResult
    ] = await Promise.all(
      responses.map(response => response.json())
    );

    if (
      levelsResult.success !== true ||
      topicsResult.success !== true ||
      lessonsResult.success !== true
    ) {
      throw new Error(
        'The learning API returned an error.'
      );
    }

    levels = levelsResult.data;
    topics = topicsResult.data;
    lessons = lessonsResult.data;

    if (
      !Array.isArray(levels) ||
      !Array.isArray(topics) ||
      !Array.isArray(lessons)
    ) {
      throw new Error(
        'Unexpected learning API response.'
      );
    }

    updateLessonCounts();
    showMessage('');

    return true;

  } catch (error) {
    console.error('Learning data error:', error);

    showMessage(
      error.message ||
      'Unable to load learning materials.'
    );

    return false;
  }
}

/* LEVEL BUTTON EVENTS */

levelCards.forEach(card => {
  card.addEventListener('click', () => {
    if (levels.length === 0) {
      showMessage(
        'Learning materials are not loaded yet.'
      );
      return;
    }

    selectLevel(card.dataset.level, true);
  });
});

/* INITIALIZE LEARNING PAGE */

async function initializeLearning() {
  const loaded = await loadLearningData();

  if (!loaded) return;

  const parameters = new URLSearchParams(
    window.location.search
  );

  const requestedLevel = parameters.get('level');
  const requestedLesson = parameters.get('lesson');

  // Load the student's actual recommendation.
  const recommendation = await loadRecommendations();

  // If the recommendation page sent a lesson ID,
  // verify it exists before opening that lesson.
  if (requestedLesson) {
    const lesson = lessons.find(
      item =>
        String(item.lesson_id) === String(requestedLesson)
    );

    if (!lesson) {
      showMessage(
        'The requested lesson was not found.'
      );
      return;
    }

    window.location.assign(
      `lesson.html?id=${encodeURIComponent(lesson.lesson_id)}`
    );

    return;
  }

  // If a level ID or name was supplied, select it.
  if (requestedLevel) {
    const level = findLevel(requestedLevel);

    if (level) {
      selectLevel(level.level_id);
      return;
    }

    showMessage(
      'The requested level was not found. Please choose an available level.'
    );

    return;
  }

  // Otherwise, automatically select the recommended level.
  if (recommendation?.recommended_level_id) {
    const level = findLevel(
      recommendation.recommended_level_id
    );

    if (level) {
      selectLevel(level.level_id);
      return;
    }
  }

  // Without a recommendation, allow the student
  // to choose any available level manually.
  showMessage(
    'Choose a learning level above to explore its lessons.'
  );
}

/* START */

initializeLearning();
