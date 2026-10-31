
/* ==========================================
   UBUNTU GOJO
   PERSONALIZED LEARNING RECOMMENDATIONS
========================================== */

const API = '/api/learning';

// LOCAL DEVELOPMENT ONLY.
// Disable when integrating the real login system.
const DEMO_MODE = false;

/* PAGE ELEMENTS */

const message = document.getElementById('recommendations-message');
const content = document.getElementById('recommendations-content');

const recommendedLevel = document.getElementById('recommended-level');
const levelExplanation = document.getElementById('level-explanation');

const assessmentScore = document.getElementById('assessment-score');
const scoreDescription = document.getElementById('score-description');

const learningGaps = document.getElementById('learning-gaps');
const recommendedLessons = document.getElementById('recommended-lessons');

const startLearningButton = document.getElementById('start-learning-btn');

/* HELPERS */

function showMessage(text) {
  message.textContent = text;
}

function getToken() {
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('token')
  );
}

function firstAvailable(object, keys) {
  if (!object || typeof object !== 'object') {
    return undefined;
  }

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  return undefined;
}

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

/* DISPLAY ACTUAL RECOMMENDED LEVEL */

function displayLevel(data) {
  const rawLevel = firstAvailable(data, [
    'recommended_level',
    'starting_level',
    'level'
  ]);

  const levelName =
    typeof rawLevel === 'string'
      ? rawLevel
      : firstAvailable(rawLevel, [
          'level_name',
          'name'
        ]);

  recommendedLevel.textContent = levelName
    ? String(levelName)
    : 'No additional starting level identified';

  const explanation = firstAvailable(data, [
    'level_explanation',
    'recommendation_reason',
    'explanation',
    'reason'
  ]);

  levelExplanation.textContent = explanation
    ? String(explanation)
    : 'Your starting level is determined by your assessment results.';

  const levelId =
    firstAvailable(data, [
      'recommended_level_id',
      'level_id'
    ]) ??
    firstAvailable(rawLevel, [
      'level_id',
      'id'
    ]);

  if (levelId !== undefined && levelId !== null) {
    startLearningButton.href =
      `learning.html?level=${encodeURIComponent(levelId)}`;

    startLearningButton.hidden = false;
  } else {
    startLearningButton.hidden = true;
  }
}

/* DISPLAY ASSESSMENT SCORE */

function displayScore(data) {
  const score = firstAvailable(data, [
    'overall_score',
    'score',
    'total_score',
    'assessment_score'
  ]);

  assessmentScore.textContent =
    score !== undefined && score !== null
      ? `${score}%`
      : '—';

  scoreDescription.textContent =
    score === undefined
      ? 'Assessment score not returned'
      : 'Your latest initial knowledge assessment result';
}

/* DISPLAY KNOWLEDGE GAPS */

function displayGaps(data) {
  learningGaps.replaceChildren();

  const gaps = firstAvailable(data, [
    'knowledge_gaps',
    'learning_gaps',
    'weak_topics',
    'gaps'
  ]);

  if (!Array.isArray(gaps) || gaps.length === 0) {
    learningGaps.appendChild(
      createElement(
        'p',
        'empty-recommendation',
        'No knowledge gaps were identified in the assessed topics.'
      )
    );

    return;
  }

  gaps.forEach((gap) => {
    const card = createElement('article', 'gap-card');

    card.appendChild(
      createElement(
        'span',
        'gap-label',
        'LEARNING PRIORITY'
      )
    );

    const title = firstAvailable(gap, [
      'topic_name',
      'topic_title',
      'title',
      'name'
    ]);

    const percentage = firstAvailable(gap, [
      'percentage'
    ]);

    const description = firstAvailable(gap, [
      'description',
      'reason',
      'explanation'
    ]);

    card.appendChild(
      createElement(
        'h3',
        '',
        typeof gap === 'string'
          ? gap
          : title || 'Learning topic'
      )
    );

    if (percentage !== undefined) {
      card.appendChild(
        createElement(
          'p',
          '',
          `Your performance in this topic: ${percentage}%`
        )
      );
    }

    card.appendChild(
      createElement(
        'p',
        '',
        description ||
        'Review the related lessons to strengthen your understanding.'
      )
    );

    learningGaps.appendChild(card);
  });
}

/* DISPLAY RECOMMENDED LESSONS */

function displayLessons(data) {
  recommendedLessons.replaceChildren();

  const lessons = firstAvailable(data, [
    'recommended_lessons',
    'suggested_lessons',
    'lessons'
  ]);

  if (!Array.isArray(lessons) || lessons.length === 0) {
    recommendedLessons.appendChild(
      createElement(
        'p',
        'empty-recommendation',
        'No additional lessons were recommended from the assessed gaps.'
      )
    );

    return;
  }

  lessons.forEach((lesson) => {
    const card = createElement('article', 'lesson-card');

    const title = firstAvailable(lesson, [
      'lesson_title',
      'title',
      'name'
    ]);

    const description = firstAvailable(lesson, [
      'description',
      'summary',
      'content'
    ]);

    const level = firstAvailable(lesson, [
      'level_name',
      'level'
    ]);

    const lessonId = firstAvailable(lesson, [
      'lesson_id',
      'id'
    ]);

    if (level !== undefined && level !== null) {
      card.appendChild(
        createElement(
          'span',
          'lesson-level',
          level
        )
      );
    }

    card.appendChild(
      createElement(
        'h3',
        '',
        title || 'Learning lesson'
      )
    );

    const summary = description
      ? String(description).slice(0, 180)
      : 'Explore this lesson in your learning workspace.';

    card.appendChild(
      createElement('p', '', summary)
    );

    if (lessonId !== undefined && lessonId !== null) {
      const link = createElement(
        'a',
        '',
        'Explore Lesson →'
      );

      link.href =
        `learning.html?lesson=${encodeURIComponent(lessonId)}`;

      card.appendChild(link);
    }

    recommendedLessons.appendChild(card);
  });
}

/* LOAD PERSONALIZED RECOMMENDATIONS */

async function loadRecommendation() {
  content.hidden = true;

  const token = getToken();

  if (!DEMO_MODE && !token) {
    showMessage(
      'Please sign in and complete your initial assessment to view personalized recommendations.'
    );

    return;
  }

  showMessage('Loading your personalized recommendations...');

  try {
    const headers = {};

    if (!DEMO_MODE && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API}/recommendations`,
      {
        method: 'GET',
        headers
      }
    );

    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message ||
        result.error ||
        `Unable to load recommendations (HTTP ${response.status}).`
      );
    }

    const data =
      result.data ??
      result.recommendations ??
      result;

    if (Array.isArray(data) && data.length === 0) {
      showMessage(
        'No completed initial assessment was found for this student. Please complete the assessment first.'
      );

      return;
    }

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      throw new Error(
        'The recommendations response has an unexpected format.'
      );
    }

    // These values come from the actual saved assessment.
    displayLevel(data);
    displayScore(data);
    displayGaps(data);
    displayLessons(data);

    content.hidden = false;
    showMessage('');

  } catch (error) {
    console.error(
      'Recommendation loading error:',
      error
    );

    content.hidden = true;

    showMessage(
      error.message ||
      'Something went wrong while loading recommendations.'
    );
  }
}

/* START */

loadRecommendation();
