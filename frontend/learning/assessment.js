
/* ==========================================
   UBUNTU GOJO
   INITIAL KNOWLEDGE ASSESSMENT
========================================== */

const API = '/api/learning';

// LOCAL DEVELOPMENT ONLY.
// Set to false when connecting the real login system.
const DEMO_MODE = false;

/* DOM ELEMENTS */

const questionContainer = document.getElementById('question-container');
const questionCounter = document.getElementById('question-counter');

const progressPercentage = document.getElementById('progress-percentage');
const progressBar = document.getElementById('quiz-progress');
const progressFill = document.getElementById('quiz-progress-fill');

const message = document.getElementById('assessment-message');
const form = document.getElementById('assessment-form');

const previousButton = document.getElementById('previous-question');
const nextButton = document.getElementById('next-question');
const submitButton = document.getElementById('submit-assessment');

/* STATE */

let questions = [];
let currentIndex = 0;
let isSubmitting = false;

const selectedAnswers = new Map();

/* HELPERS */

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#b91c1c' : '';
}

function showError(text) {
  showMessage(text, true);

  message.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

function getToken() {
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('token')
  );
}

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (!DEMO_MODE) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function setVisible(element, visible) {
  element.hidden = !visible;
  element.style.display = visible ? 'inline-flex' : 'none';
}

/* LOAD ASSESSMENT */

async function loadAssessment() {
  showMessage('Loading your assessment...');

  previousButton.disabled = true;
  nextButton.disabled = true;

  setVisible(submitButton, false);

  try {
    const response = await fetch(
      `${API}/assessment/initial`
    );

    if (!response.ok) {
      throw new Error(
        `Assessment loading failed (HTTP ${response.status}).`
      );
    }

    const result = await response.json();

    if (
      !result.success ||
      !Array.isArray(result.data) ||
      result.data.length === 0
    ) {
      throw new Error(
        result.message ||
        'No assessment questions are available.'
      );
    }

    questions = result.data;
    currentIndex = 0;

    selectedAnswers.clear();

    showMessage('');
    renderQuestion();

  } catch (error) {
    console.error('Assessment loading error:', error);

    questionContainer.textContent =
      'The assessment could not be loaded.';

    showError(error.message);

    previousButton.disabled = true;
    nextButton.disabled = true;

    setVisible(submitButton, false);
  }
}

/* DISPLAY QUESTION */

function renderQuestion() {
  const question = questions[currentIndex];

  if (!question) return;

  questionContainer.replaceChildren();

  const questionId = String(question.question_id);

  const heading = document.createElement('h2');
  heading.className = 'quiz-question';
  heading.textContent = question.question_text;

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'quiz-options';

  const options = Array.isArray(question.options)
    ? question.options
    : [];

  if (options.length === 0) {
    showError('This question has no available answers.');
  }

  options.forEach((option) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';

    const radio = document.createElement('input');

    radio.type = 'radio';
    radio.name = 'current-answer';
    radio.value = String(option.option_id);

    const savedAnswer = selectedAnswers.get(questionId);

    radio.checked =
      savedAnswer === String(option.option_id);

    if (radio.checked) {
      label.classList.add('selected');
    }

    const optionText = document.createElement('span');
    optionText.textContent = option.option_text;

    radio.addEventListener('change', () => {
      selectedAnswers.set(
        questionId,
        String(option.option_id)
      );

      optionsContainer
        .querySelectorAll('.quiz-option')
        .forEach((item) => {
          item.classList.remove('selected');
        });

      label.classList.add('selected');

      showMessage('');

      updateProgress();
      updateNavigation();
    });

    label.append(radio, optionText);
    optionsContainer.appendChild(label);
  });

  questionContainer.append(heading, optionsContainer);

  updateNavigation();
  updateProgress();
}

/* UPDATE NAVIGATION */

function updateNavigation() {
  if (questions.length === 0) return;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  questionCounter.textContent =
    `Question ${currentIndex + 1} of ${questions.length}`;

  previousButton.disabled = isFirst || isSubmitting;

  setVisible(nextButton, !isLast);
  setVisible(submitButton, isLast);

  nextButton.disabled = isSubmitting;
  submitButton.disabled = isSubmitting;

  submitButton.textContent = isSubmitting
    ? 'Submitting...'
    : 'Submit Assessment →';
}

/* UPDATE PROGRESS */

function updateProgress() {
  if (questions.length === 0) return;

  const percentage = Math.round(
    (selectedAnswers.size / questions.length) * 100
  );

  progressPercentage.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;

  progressBar.setAttribute(
    'aria-valuenow',
    String(percentage)
  );
}

/* PREVIOUS QUESTION */

previousButton.addEventListener('click', () => {
  if (isSubmitting || currentIndex === 0) return;

  currentIndex--;

  showMessage('');
  renderQuestion();
});

/* NEXT QUESTION */

nextButton.addEventListener('click', () => {
  if (isSubmitting || questions.length === 0) return;

  const question = questions[currentIndex];

  if (
    !selectedAnswers.has(String(question.question_id))
  ) {
    showError(
      'Please select an answer before continuing.'
    );

    return;
  }

  if (currentIndex < questions.length - 1) {
    currentIndex++;

    showMessage('');
    renderQuestion();
  }
});

/* SUBMIT ASSESSMENT */

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isSubmitting || questions.length === 0) return;

  if (currentIndex !== questions.length - 1) {
    showError(
      'Please complete the assessment before submitting.'
    );

    return;
  }

  /* Check unanswered questions */

  const unansweredIndex = questions.findIndex(
    (question) =>
      !selectedAnswers.has(String(question.question_id))
  );

  if (unansweredIndex !== -1) {
    currentIndex = unansweredIndex;

    renderQuestion();

    showError(
      'Please answer this question before submitting.'
    );

    return;
  }

  /* Authentication check for integrated mode */

  if (!DEMO_MODE && !getToken()) {
    showError(
      'Please sign in before submitting your assessment.'
    );

    return;
  }

  /* Prepare answers */

  const answers = questions.map((question) => ({
    question_id: question.question_id,
    option_id: selectedAnswers.get(
      String(question.question_id)
    )
  }));

  isSubmitting = true;

  updateNavigation();
  showMessage('Submitting your assessment...');

  try {
    const response = await fetch(
      `${API}/assessment/initial/submit`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ answers })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        result.error ||
        `Submission failed (HTTP ${response.status}).`
      );
    }

    /* Save assessment reference */

    const assessmentId =
      result.assessment_id ??
      result.data?.assessment_id;

    if (assessmentId != null) {
      sessionStorage.setItem(
        'learning_assessment_id',
        String(assessmentId)
      );
    }

    // Remember demo mode for the recommendation page.
    sessionStorage.setItem(
      'learning_demo_mode',
      String(DEMO_MODE)
    );

    showMessage(
      'Assessment submitted successfully! Loading your recommendations...'
    );

    window.location.assign('recommendation.html');

  } catch (error) {
    console.error('Assessment submission error:', error);

    showError(
      error.message ||
      'Unable to submit your assessment. Please try again.'
    );

    isSubmitting = false;
    updateNavigation();
  }
});

/* START ASSESSMENT */

loadAssessment();
