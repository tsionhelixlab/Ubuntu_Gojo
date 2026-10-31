
/* UBUNTU GOJO — INDIVIDUAL LESSON */

const API = '/api/learning';

const params = new URLSearchParams(window.location.search);
const lessonId = params.get('id');

const message = document.getElementById('lesson-message');
const contentSection = document.getElementById('lesson-content');
const completeButton = document.getElementById('complete-lesson-btn');
const completionMessage = document.getElementById('completion-message');

const nextLink = document.getElementById('next-lesson-link');
const journeySection = document.getElementById('journey-next-step');

let currentLesson = null;

/* AUTHENTICATION */

function getToken() {
  return (
    sessionStorage.getItem('token') ||
    localStorage.getItem('token')
  );
}

/* TEXT HELPERS */

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value || '';
  }
}

function createText(tag, value) {
  const element = document.createElement(tag);
  element.textContent = String(value);
  return element;
}

/* DISPLAY DATABASE CONTENT SAFELY */

function displayField(containerId, value) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.replaceChildren();

  if (!value) {
    container.appendChild(
      createText('p', 'No additional material provided.')
    );
    return;
  }

  if (Array.isArray(value)) {
    const list = document.createElement('ul');

    value.forEach(item => {
      list.appendChild(createText('li', item));
    });

    container.appendChild(list);
    return;
  }

  if (typeof value === 'object') {
    container.appendChild(
      createText('pre', JSON.stringify(value, null, 2))
    );
    return;
  }

  String(value).split(/\n\s*\n/).forEach(paragraph => {
    if (paragraph.trim()) {
      const element = createText('p', paragraph.trim());
      element.style.whiteSpace = 'pre-line';
      container.appendChild(element);
    }
  });
}

/* DISPLAY PROGRESS */

function displayProgress(status) {
  const completed = status === 'completed';

  document.getElementById('lesson-progress-fill').style.width =
    completed ? '100%' : '0%';

  document
    .getElementById('lesson-progress-track')
    .setAttribute('aria-valuenow', completed ? '100' : '0');

  setText(
    'lesson-progress-text',
    completed
      ? 'You have completed this lesson.'
      : 'Complete this lesson when you finish reviewing its learning material.'
  );

  completeButton.disabled = completed;

  completeButton.textContent = completed
    ? 'Lesson Completed ✓'
    : 'Mark as Completed ✓';
}

/* CHECK SAVED PROGRESS */

async function loadProgress() {
  const token = getToken();

  if (!token) {
    completionMessage.textContent =
      'Sign in to save and retrieve your learning progress.';
    return;
  }

  try {
    const response = await fetch(`${API}/progress`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      completionMessage.textContent =
        'Unable to retrieve your saved progress.';
      return;
    }

    const result = await response.json();

    const records = Array.isArray(result.data)
      ? result.data
      : [];

    const record = records.find(
      item => String(item.lesson_id) === String(lessonId)
    );

    if (record) {
      displayProgress(record.status);
    }

  } catch (error) {
    completionMessage.textContent =
      'Unable to connect to the progress service.';
  }
}

/* LESSON NAVIGATION */

function configureLessonNavigation(lessons, topics) {

  // Always hide both options before checking the current lesson.
  nextLink.hidden = true;

  if (journeySection) {
    journeySection.hidden = true;
  }

  // Use the topic's display order rather than assuming
  // that a larger topic ID means a later topic.
  const topicOrder = new Map(
    [...topics]
      .sort((a, b) =>
        Number(a.display_order ?? a.topic_id) -
        Number(b.display_order ?? b.topic_id)
      )
      .map((topic, index) => [
        String(topic.topic_id),
        index
      ])
  );

  const orderedLessons = [...lessons].sort((a, b) => {

    const firstTopicOrder =
      topicOrder.get(String(a.topic_id)) ?? 0;

    const secondTopicOrder =
      topicOrder.get(String(b.topic_id)) ?? 0;

    return (
      firstTopicOrder - secondTopicOrder ||
      Number(a.display_order) - Number(b.display_order) ||
      Number(a.lesson_id) - Number(b.lesson_id)
    );
  });

  const currentIndex = orderedLessons.findIndex(
    item => String(item.lesson_id) === String(lessonId)
  );

  if (currentIndex === -1) return;

  const nextLesson = orderedLessons[currentIndex + 1];

  if (nextLesson) {

    // Earlier lessons: display Next Lesson.
    nextLink.href =
      `lesson.html?id=${encodeURIComponent(nextLesson.lesson_id)}`;

    nextLink.hidden = false;

  } else {

    // Only the final lesson of the final topic
    // displays Continue to My Journey.
    if (journeySection) {
      journeySection.hidden = false;
    }

  }
}

/* LOAD THE SELECTED LESSON */

async function loadLesson() {

  if (!lessonId || !/^[1-9]\d*$/.test(lessonId)) {
    message.textContent = 'Invalid lesson ID.';
    return;
  }

  // Prevent the final section appearing while loading.
  if (journeySection) {
    journeySection.hidden = true;
  }

  nextLink.hidden = true;

  try {

    const [lessonsResponse, topicsResponse, levelsResponse] =
      await Promise.all([
        fetch(`${API}/lessons`),
        fetch(`${API}/topics`),
        fetch(`${API}/levels`)
      ]);

    if (
      !lessonsResponse.ok ||
      !topicsResponse.ok ||
      !levelsResponse.ok
    ) {
      throw new Error('Unable to retrieve learning information.');
    }

    const lessonsResult = await lessonsResponse.json();
    const topicsResult = await topicsResponse.json();
    const levelsResult = await levelsResponse.json();

    if (
      lessonsResult.success === false ||
      topicsResult.success === false ||
      levelsResult.success === false
    ) {
      throw new Error('The learning API returned an error.');
    }

    const lessons = lessonsResult.data;
    const topics = topicsResult.data;
    const levels = levelsResult.data;

    if (
      !Array.isArray(lessons) ||
      !Array.isArray(topics) ||
      !Array.isArray(levels)
    ) {
      throw new Error('Unexpected learning API response.');
    }

    currentLesson = lessons.find(
      lesson => String(lesson.lesson_id) === String(lessonId)
    );

    if (!currentLesson) {
      message.textContent = 'Lesson not found.';
      return;
    }

    const topic = topics.find(
      item =>
        String(item.topic_id) ===
        String(currentLesson.topic_id)
    );

    const level = levels.find(
      item =>
        String(item.level_id) ===
        String(topic?.level_id)
    );

    /* LESSON INTRODUCTION */

    setText('lesson-title', currentLesson.title);

    setText(
      'lesson-topic',
      topic?.title || 'Learning Topic'
    );

    setText(
      'lesson-level',
      level?.title || 'Learning Level'
    );

    setText(
      'lesson-description',
      `Explore ${currentLesson.title} and strengthen your understanding.`
    );

    /* MAIN EDUCATIONAL MATERIAL */

    displayField(
      'lesson-body',
      currentLesson.content
    );

    /* KEY POINTS */

    const takeawaysSection =
      document.getElementById('takeaways-section');

    takeawaysSection.hidden = true;

    if (currentLesson.key_points) {

      displayField(
        'lesson-takeaways',
        currentLesson.key_points
      );

      takeawaysSection.hidden = false;
    }

    /* LEARNING OBJECTIVES */

    const objectives =
      document.getElementById('lesson-objectives');

    objectives.replaceChildren();

    const objectiveList = document.createElement('ul');

    objectiveList.appendChild(
      createText(
        'li',
        `Understand the main ideas in ${currentLesson.title}.`
      )
    );

    objectiveList.appendChild(
      createText(
        'li',
        'Review the key points and apply what you learn.'
      )
    );

    objectives.appendChild(objectiveList);

    /* ADDITIONAL DATABASE MATERIAL */

    if (currentLesson.practical_example) {

      const section = document.createElement('section');
      section.className = 'lesson-extra';

      section.appendChild(
        createText('h3', 'Practical Example')
      );

      const body = createText(
        'p',
        currentLesson.practical_example
      );

      body.style.whiteSpace = 'pre-line';

      section.appendChild(body);

      document
        .querySelector('.lesson-article')
        .appendChild(section);
    }

    if (currentLesson.common_mistakes) {

      const section = document.createElement('section');
      section.className = 'lesson-extra';

      section.appendChild(
        createText('h3', 'Common Mistakes to Avoid')
      );

      const body = createText(
        'p',
        currentLesson.common_mistakes
      );

      body.style.whiteSpace = 'pre-line';

      section.appendChild(body);

      document
        .querySelector('.lesson-article')
        .appendChild(section);
    }

    /* ADDITIONAL MATERIALS AND QUIZ */

    await loadExtraMaterials();

    /* NEXT LESSON OR FINAL JOURNEY */

    configureLessonNavigation(lessons, topics);

    /* SHOW PAGE */

    message.textContent = '';
    contentSection.hidden = false;

    displayProgress('not_started');

    await loadProgress();

  } catch (error) {

    console.error('Lesson loading error:', error);

    message.textContent =
      error.message || 'Unable to load this lesson.';
  }
}

/* SAVE LESSON COMPLETION */

async function completeLesson() {

  if (!currentLesson) return;

  const token = getToken();

  if (!token) {
    completionMessage.textContent =
      'Please sign in to save your lesson completion.';
    return;
  }

  completeButton.disabled = true;

  completionMessage.textContent =
    'Saving your progress...';

  try {

    const response = await fetch(`${API}/progress`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        lesson_id: currentLesson.lesson_id,
        status: 'completed'
      })
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        result.message || 'Unable to save lesson progress.'
      );
    }

    displayProgress(result.data.status);

    completionMessage.textContent =
      'Your lesson completion has been saved successfully.';

  } catch (error) {

    completeButton.disabled = false;

    completionMessage.textContent =
      error.message || 'Unable to save your progress.';
  }
}

/* LOAD ADDITIONAL LEARNING MATERIALS */

async function loadExtraMaterials() {

  try {

    const [mr, qr] = await Promise.all([
      fetch(`${API}/lessons/${lessonId}/materials`),
      fetch(`${API}/lessons/${lessonId}/quiz`)
    ]);

    if (!mr.ok || !qr.ok) {
      throw new Error(
        'Additional learning materials are unavailable.'
      );
    }

    const materials = (await mr.json()).data;
    const quiz = (await qr.json()).data;

    /* DATABASE LEARNING OBJECTIVES */

    if (materials.lesson.learning_objectives) {
      displayField(
        'lesson-objectives',
        materials.lesson.learning_objectives
      );
    }

    /* ESTIMATED LESSON TIME */

    if (materials.lesson.estimated_minutes) {
      setText(
        'lesson-description',
        `Estimated time: ${materials.lesson.estimated_minutes} minutes`
      );
    }

    /* RESOURCES */

    const resources =
      document.getElementById('lesson-resources');

    resources.replaceChildren();

    for (const r of materials.resources) {

      const box = createText('div', '');
      box.className = 'resource-item';

      const label = createText('h4', r.title);
      box.append(label);

      if (
        r.resource_type === 'image' ||
        r.resource_type === 'diagram'
      ) {

        const image = document.createElement('img');

        image.src = r.url;
        image.alt = r.description || r.title;
        image.loading = 'lazy';
        image.className = 'learning-diagram';

        box.append(image);

        const spots = materials.hotspots.filter(
          h =>
            String(h.resource_id) ===
            String(r.resource_id)
        );

        if (spots.length) {

          const area = document.createElement('div');
          area.className = 'hotspot-controls';

          const detail = createText(
            'p',
            'Select a diagram label to learn more.'
          );

          for (const h of spots) {

            const btn = createText('button', h.label);
            btn.type = 'button';

            btn.addEventListener('click', () => {
              detail.textContent = h.explanation;
            });

            area.append(btn);
          }

          area.append(detail);
          box.append(area);
        }

      } else {

        const a = createText('a', r.title);

        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        box.append(a);
      }

      if (r.description) {
        box.append(createText('p', r.description));
      }

      resources.append(box);
    }

    document.getElementById('materials-section').hidden =
      !materials.resources.length;

    /* PRACTICE ACTIVITIES */

    const activities =
      document.getElementById('lesson-activities');

    activities.replaceChildren();

    for (const a of materials.activities) {

      const box = document.createElement('div');
      box.className = 'activity-card';

      box.append(
        createText('h4', a.title),
        createText('p', a.instructions)
      );

      const field = document.createElement('textarea');

      field.rows = 4;
      field.placeholder = 'Write your response here';
      field.setAttribute('aria-label', a.title);

      box.append(field);

      const btn = createText(
        'button',
        'Save activity response'
      );

      btn.type = 'button';

      const status = createText('p', '');

      btn.addEventListener('click', async () => {

        const token = getToken();

        if (!token) {
          status.textContent = 'Sign in to save your work.';
          return;
        }

        try {

          const response = await fetch(
            `${API}/activities/${a.activity_id}/submit`,
            {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },

              body: JSON.stringify({
                response_text: field.value
              })
            }
          );

          const data = await response.json();

          status.textContent = data.success
            ? 'Response saved.'
            : data.message || 'Unable to save response.';

        } catch (error) {
          status.textContent = 'Connection failed.';
        }
      });

      box.append(btn, status);
      activities.append(box);
    }

    document.getElementById('activities-section').hidden =
      !materials.activities.length;

    /* LESSON QUIZ */

    if (quiz.length) {

      const form = document.getElementById('lesson-quiz');

      form.replaceChildren();

      for (const q of quiz) {

        const fieldset = document.createElement('fieldset');

        fieldset.append(
          createText('legend', q.question_text)
        );

        for (const o of q.options) {

          const label = document.createElement('label');
          const radio = document.createElement('input');

          radio.type = 'radio';
          radio.name = `q${q.question_id}`;
          radio.value = o.option_id;

          label.append(
            radio,
            document.createTextNode(o.option_text)
          );

          fieldset.append(label);
        }

        form.append(fieldset);
      }

      const button = createText('button', 'Submit quiz');

      button.type = 'submit';

      form.append(button);

      form.addEventListener('submit', async event => {

        event.preventDefault();

        const token = getToken();

        const status =
          document.getElementById('quiz-result');

        if (!token) {
          status.textContent = 'Sign in to submit the quiz.';
          return;
        }

        const answers = quiz.map(q => ({
          question_id: q.question_id,

          option_id: form.querySelector(
            `input[name="q${q.question_id}"]:checked`
          )?.value
        }));

        if (answers.some(a => !a.option_id)) {
          status.textContent = 'Answer every question.';
          return;
        }

        try {

          const response = await fetch(
            `${API}/lessons/${lessonId}/quiz/submit`,
            {
              method: 'POST',

              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },

              body: JSON.stringify({ answers })
            }
          );

          const result = await response.json();

          status.textContent = result.success
            ? `Score: ${result.score}%. ${
                (result.feedback || [])
                  .map(f => f.explanation || '')
                  .join(' ')
              }`
            : result.message;

        } catch (error) {

          status.textContent = 'Connection failed.';
        }
      });

      document.getElementById('quiz-section').hidden = false;

    } else {

      document.getElementById('quiz-section').hidden = true;

    }

  } catch (error) {

    console.warn(error.message);

  }
}

/* EVENT LISTENERS */

completeButton.addEventListener(
  'click',
  completeLesson
);

/* INITIALIZE LESSON */

loadLesson();
