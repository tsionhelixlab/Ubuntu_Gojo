
const pool = require('../config/db');

/* ==========================================
   UBUNTU GOJO - LEARNING CONTROLLER
========================================== */

const validId = value =>
  (typeof value === 'number' &&
    Number.isSafeInteger(value) && value > 0) ||
  (typeof value === 'string' &&
    /^[1-9]\d*$/.test(value) &&
    BigInt(value) <= 9223372036854775807n);

/* ==========================================
   LEVELS
========================================== */

exports.getLevels = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT level_id, title, description, display_order
      FROM learning_levels
      ORDER BY display_order
    `);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get levels error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve learning levels'
    });
  }
};

/* ==========================================
   TOPICS
========================================== */

exports.getTopics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT topic_id, level_id, title, description
      FROM learning_topics
      ORDER BY level_id, topic_id
    `);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get topics error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve learning topics'
    });
  }
};

/* ==========================================
   LESSONS
========================================== */

exports.getLessons = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        lesson_id,
        topic_id,
        title,
        content,
        key_points,
        practical_example,
        common_mistakes,
        display_order
      FROM learning_lessons
      ORDER BY topic_id, display_order
    `);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get lessons error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve learning lessons'
    });
  }
};

/* ==========================================
   INITIAL ASSESSMENT
========================================== */

exports.getInitialAssessment = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        q.question_id,
        q.topic_id,
        q.question_text,
        q.question_type,
        q.difficulty,
        o.option_id,
        o.option_text
      FROM learning_questions q
      JOIN learning_answer_options o
        ON o.question_id = q.question_id
      WHERE q.assessment_type = 'initial'
      ORDER BY q.question_id, o.option_id
    `);

    const questions = [];
    const questionMap = new Map();

    for (const row of result.rows) {
      const id = String(row.question_id);

      if (!questionMap.has(id)) {
        const question = {
          question_id: row.question_id,
          topic_id: row.topic_id,
          question_text: row.question_text,
          question_type: row.question_type,
          difficulty: row.difficulty,
          options: []
        };

        questionMap.set(id, question);
        questions.push(question);
      }

      questionMap.get(id).options.push({
        option_id: row.option_id,
        option_text: row.option_text
      });
    }

    return res.status(200).json({
      success: true,
      total_questions: questions.length,
      data: questions
    });

  } catch (error) {
    console.error(
      'Get initial assessment error:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve initial assessment'
    });
  }
};

/* ==========================================
   SUBMIT INITIAL ASSESSMENT
========================================== */

exports.submitInitialAssessment = async (req, res) => {
  const userId = req.user.user_id;
  const answers = req.body?.answers;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide a non-empty answers array.'
    });
  }

  if (!answers.every(answer =>
    answer &&
    validId(answer.question_id) &&
    validId(answer.option_id)
  )) {
    return res.status(400).json({
      success: false,
      message: 'Every answer requires valid question_id and option_id values.'
    });
  }

  const submitted = new Map();

  for (const answer of answers) {
    const questionId = String(answer.question_id);

    if (submitted.has(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Each question must be answered exactly once.'
      });
    }

    submitted.set(questionId, String(answer.option_id));
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        q.question_id,
        q.topic_id,
        q.question_type,
        o.option_id,
        o.is_correct
      FROM learning_questions q
      JOIN learning_answer_options o
        ON o.question_id = q.question_id
      WHERE q.assessment_type = 'initial'
      ORDER BY q.question_id, o.option_id
    `);

    const questions = new Map();

    for (const row of result.rows) {
      const id = String(row.question_id);

      if (!questions.has(id)) {
        questions.set(id, {
          topic_id: String(row.topic_id),
          question_type: row.question_type,
          options: new Map()
        });
      }

      questions.get(id).options.set(
        String(row.option_id),
        row.is_correct
      );
    }

    if (questions.size === 0) {
      return res.status(409).json({
        success: false,
        message: 'The initial assessment has no configured questions.'
      });
    }

    if ([...questions.values()].some(
      question => question.question_type !== 'single_choice'
    )) {
      return res.status(409).json({
        success: false,
        message: 'Initial assessment contains an unsupported question type.'
      });
    }

    if (
      submitted.size !== questions.size ||
      [...questions.keys()].some(id => !submitted.has(id))
    ) {
      return res.status(400).json({
        success: false,
        message: 'All initial assessment questions must be answered.'
      });
    }

    const topicResults = new Map();
    let correctCount = 0;

    for (const [questionId, optionId] of submitted) {
      const question = questions.get(questionId);

      if (!question || !question.options.has(optionId)) {
        return res.status(400).json({
          success: false,
          message: 'An option does not belong to its submitted question.'
        });
      }

      const correct = question.options.get(optionId) === true;

      if (correct) correctCount++;

      const topicId = question.topic_id;

      if (!topicResults.has(topicId)) {
        topicResults.set(topicId, {
          topic_id: topicId,
          total: 0,
          correct: 0
        });
      }

      const topic = topicResults.get(topicId);
      topic.total++;

      if (correct) topic.correct++;
    }

    const score = Number(
      ((correctCount / questions.size) * 100).toFixed(2)
    );

    await client.query('BEGIN');
    transactionStarted = true;

    const attempt = await client.query(`
      INSERT INTO learning_assessments
        (user_id, assessment_type, score, completed_at)
      VALUES ($1, 'initial', $2, NOW())
      RETURNING assessment_id
    `, [userId, score]);

    const assessmentId = attempt.rows[0].assessment_id;

    for (const [questionId, optionId] of submitted) {
      await client.query(`
        INSERT INTO learning_assessment_answers
          (assessment_id, question_id, option_id)
        VALUES ($1, $2, $3)
      `, [assessmentId, questionId, optionId]);
    }

    await client.query('COMMIT');
    transactionStarted = false;

    const topics = [...topicResults.values()].map(topic => {
      const percentage = Number(
        ((topic.correct / topic.total) * 100).toFixed(2)
      );

      return {
        ...topic,
        percentage,
        status: percentage >= 80
          ? 'known'
          : 'needs_learning'
      };
    });

    return res.status(201).json({
      success: true,
      message: 'Initial assessment submitted successfully.',
      assessment_id: assessmentId,
      score,
      total_questions: questions.size,
      correct_answers: correctCount,
      topic_results: topics
    });

  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }

    console.error('Assessment submission error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to submit initial assessment.'
    });

  } finally {
    if (client) client.release();
  }
};

/* ==========================================
   PERSONALIZED RECOMMENDATIONS
========================================== */

exports.getRecommendations = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const assessment = await pool.query(`
      SELECT assessment_id, score
      FROM learning_assessments
      WHERE user_id = $1
        AND assessment_type = 'initial'
        AND completed_at IS NOT NULL
      ORDER BY completed_at DESC, assessment_id DESC
      LIMIT 1
    `, [userId]);

    if (assessment.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Complete your initial assessment first.',
        data: []
      });
    }

    const assessmentId = assessment.rows[0].assessment_id;

    const results = await pool.query(`
      SELECT
        t.topic_id,
        t.title AS topic_title,
        l.level_id,
        l.title AS level_title,
        l.display_order AS level_order,

        COUNT(DISTINCT q.question_id)::INTEGER AS total_questions,

        COUNT(DISTINCT q.question_id)
          FILTER (WHERE o.is_correct = TRUE)::INTEGER AS correct_answers

      FROM learning_assessment_answers a

      JOIN learning_questions q
        ON q.question_id = a.question_id

      JOIN learning_answer_options o
        ON o.option_id = a.option_id
       AND o.question_id = q.question_id

      JOIN learning_topics t
        ON t.topic_id = q.topic_id

      JOIN learning_levels l
        ON l.level_id = t.level_id

      WHERE a.assessment_id = $1

      GROUP BY
        t.topic_id,
        t.title,
        l.level_id,
        l.title,
        l.display_order

      ORDER BY l.display_order, t.topic_id
    `, [assessmentId]);

    const topicResults = results.rows.map(row => {
      const percentage = Number(
        (
          (row.correct_answers / row.total_questions) * 100
        ).toFixed(2)
      );

      return {
        ...row,
        topic_name: row.topic_title,
        percentage,
        status: percentage >= 80
          ? 'known'
          : 'needs_learning'
      };
    });

    const gaps = topicResults.filter(
      topic => topic.status === 'needs_learning'
    );

    // Use actual assessment results, not a hardcoded level.
    const firstGap = gaps[0];

    const recommendedLevel = firstGap
      ? firstGap.level_title
      : null;

    const recommendedLevelId = firstGap
      ? firstGap.level_id
      : null;

    const levelExplanation = firstGap
      ? `Your assessment identified a learning gap in ${firstGap.topic_title}. Start at ${firstGap.level_title} to strengthen this area.`
      : 'You met the knowledge threshold in all assessed topics. No higher level has been assigned without further assessment.';

    const topicIds = gaps.map(topic => topic.topic_id);

    let recommendedLessons = [];

    if (topicIds.length > 0) {
      const lessonResult = await pool.query(`
        SELECT
          ls.lesson_id,
          ls.topic_id,
          ls.title,
          ls.content,
          ls.display_order,
          l.title AS level_name

        FROM learning_lessons ls

        JOIN learning_topics t
          ON t.topic_id = ls.topic_id

        JOIN learning_levels l
          ON l.level_id = t.level_id

        WHERE ls.topic_id = ANY($1::BIGINT[])

        ORDER BY
          l.display_order,
          ls.topic_id,
          ls.display_order
      `, [topicIds]);

      recommendedLessons = lessonResult.rows.map(lesson => ({
        ...lesson,
        lesson_title: lesson.title
      }));
    }

    return res.status(200).json({
      success: true,

      assessment_id: assessmentId,
      overall_score: assessment.rows[0].score,

      recommended_level: recommendedLevel,
      recommended_level_id: recommendedLevelId,
      level_explanation: levelExplanation,

      assessed_topics: topicResults,
      knowledge_gaps: gaps,
      recommended_lessons: recommendedLessons,

      message: gaps.length > 0
        ? 'Recommendations generated from your actual assessment results.'
        : 'No knowledge gaps were identified in the assessed topics.'
    });

  } catch (error) {
    console.error('Recommendation error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to generate learning recommendations.'
    });
  }
};

/* ==========================================
   UPDATE LEARNING PROGRESS
========================================== */

exports.updateProgress = async (req, res) => {
  const userId = req.user.user_id;
  const { lesson_id, status } = req.body || {};

  const allowedStatuses = [
    'not_started',
    'in_progress',
    'completed'
  ];

  if (
    !validId(lesson_id) ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide a valid lesson_id and progress status.'
    });
  }

  try {
    const lesson = await pool.query(
      'SELECT lesson_id FROM learning_lessons WHERE lesson_id = $1',
      [lesson_id]
    );

    if (lesson.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found.'
      });
    }

    const result = await pool.query(`
      INSERT INTO learning_progress
        (user_id, lesson_id, status, completed_at, updated_at)
      VALUES (
        $1,
        $2,
        $3,
        CASE WHEN $3 = 'completed' THEN NOW() ELSE NULL END,
        NOW()
      )

      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()

      RETURNING
        progress_id,
        lesson_id,
        status,
        completed_at,
        updated_at
    `, [userId, lesson_id, status]);

    return res.status(200).json({
      success: true,
      message: 'Learning progress updated successfully.',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update progress error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to update learning progress.'
    });
  }
};

/* ==========================================
   GET LEARNING PROGRESS
========================================== */

exports.getProgress = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const result = await pool.query(`
      SELECT
        p.progress_id,
        p.lesson_id,
        ls.title AS lesson_title,
        ls.topic_id,
        p.status,
        p.completed_at,
        p.updated_at

      FROM learning_progress p

      JOIN learning_lessons ls
        ON ls.lesson_id = p.lesson_id

      WHERE p.user_id = $1
      ORDER BY p.updated_at DESC
    `, [userId]);

    return res.status(200).json({
      success: true,
      total: result.rowCount,
      data: result.rows
    });

  } catch (error) {
    console.error('Get progress error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve learning progress.'
    });
  }
};

/* ==========================================
   GET LESSON MATERIALS - CORRECTED
========================================== */

exports.getLessonMaterials = async (req, res) => {
  const lessonId = req.params.id;

  if (!validId(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson ID'
    });
  }

  try {
    // Retrieve the lesson using confirmed database columns.
    const lesson = await pool.query(`
      SELECT
        lesson_id,
        topic_id,
        title,
        content,
        key_points,
        practical_example,
        common_mistakes,
        display_order
      FROM learning_lessons
      WHERE lesson_id = $1
    `, [lessonId]);

    if (lesson.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // learning_resources does NOT contain display_order.
    // Therefore, order the results by resource_id.
    const resources = await pool.query(`
      SELECT
        resource_id,
        lesson_id,
        title,
        resource_type,
        url,
        description,
        is_free
      FROM learning_resources
      WHERE lesson_id = $1
      ORDER BY resource_id
    `, [lessonId]);

    return res.status(200).json({
      success: true,
      data: {
        lesson: lesson.rows[0],
        resources: resources.rows,

        // These tables do not exist in the current database.
        // Keep empty arrays for frontend compatibility.
        activities: [],
        hotspots: []
      }
    });

  } catch (error) {
    console.error('Materials error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve lesson materials'
    });
  }
};

/* ==========================================
   GET LESSON QUIZ
========================================== */

exports.getLessonQuiz = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson ID'
    });
  }

  try {
    const result = await pool.query(`
      SELECT
        q.question_id,
        q.question_text,
        q.question_type,
        o.option_id,
        o.option_text

      FROM learning_questions q

      JOIN learning_answer_options o
        ON o.question_id = q.question_id

      WHERE q.lesson_id = $1
        AND q.assessment_type = 'lesson'

      ORDER BY q.question_id, o.option_id
    `, [req.params.id]);

    const data = [];
    const questionMap = new Map();

    for (const row of result.rows) {
      const id = String(row.question_id);

      if (!questionMap.has(id)) {
        const question = {
          question_id: row.question_id,
          question_text: row.question_text,
          question_type: row.question_type,
          options: []
        };

        questionMap.set(id, question);
        data.push(question);
      }

      questionMap.get(id).options.push({
        option_id: row.option_id,
        option_text: row.option_text
      });
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Lesson quiz error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve quiz'
    });
  }
};

/* ==========================================
   SUBMIT LESSON QUIZ
========================================== */

exports.submitLessonQuiz = async (req, res) => {
  const answers = req.body?.answers;

  if (
    !validId(req.params.id) ||
    !Array.isArray(answers) ||
    !answers.length
  ) {
    return res.status(400).json({
      success: false,
      message: 'Provide lesson ID and answers'
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    const key = await client.query(`
      SELECT
        q.question_id,
        q.explanation,
        o.option_id,
        o.is_correct

      FROM learning_questions q

      JOIN learning_answer_options o
        ON o.question_id = q.question_id

      WHERE q.lesson_id = $1
        AND q.assessment_type = 'lesson'
        AND q.question_type = 'single_choice'
    `, [req.params.id]);

    const questions = new Map();

    for (const row of key.rows) {
      const id = String(row.question_id);

      if (!questions.has(id)) {
        questions.set(id, {
          explanation: row.explanation,
          options: new Map()
        });
      }

      questions.get(id).options.set(
        String(row.option_id),
        row.is_correct
      );
    }

    if (
      !questions.size ||
      answers.length !== questions.size
    ) {
      return res.status(400).json({
        success: false,
        message: 'Answer every available single-choice lesson question'
      });
    }

    const submitted = new Map();

    for (const answer of answers) {
      if (
        !answer ||
        !validId(answer.question_id) ||
        !validId(answer.option_id)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid answer ID'
        });
      }

      const id = String(answer.question_id);
      const option = String(answer.option_id);

      if (
        submitted.has(id) ||
        !questions.has(id) ||
        !questions.get(id).options.has(option)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or duplicate answer'
        });
      }

      submitted.set(id, option);
    }

    const correct = [...submitted].filter(
      ([id, option]) =>
        questions.get(id).options.get(option) === true
    ).length;

    const score = Number(
      ((100 * correct) / questions.size).toFixed(2)
    );

    await client.query('BEGIN');
    transactionStarted = true;

    const attempt = await client.query(`
      INSERT INTO learning_assessments
        (user_id, assessment_type, score, completed_at)
      VALUES ($1, 'lesson', $2, NOW())
      RETURNING assessment_id
    `, [req.user.user_id, score]);

    for (const [id, option] of submitted) {
      await client.query(`
        INSERT INTO learning_assessment_answers
          (assessment_id, question_id, option_id)
        VALUES ($1, $2, $3)
      `, [attempt.rows[0].assessment_id, id, option]);
    }

    await client.query('COMMIT');
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      score,
      correct,
      total: questions.size,

      feedback: [...submitted].map(([id, option]) => ({
        question_id: id,
        is_correct: questions.get(id).options.get(option),
        explanation: questions.get(id).explanation
      }))
    });

  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError.message);
      }
    }

    console.error('Submit lesson quiz error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to submit lesson quiz'
    });

  } finally {
    if (client) client.release();
  }
};

/* ==========================================
   SUBMIT LEARNING ACTIVITY
========================================== */

exports.submitActivity = async (req, res) => {
  // The current database does not contain
  // learning_activities or learning_activity_submissions.
  //
  // Return 501 instead of reporting a false success
  // or executing SQL against nonexistent tables.

  return res.status(501).json({
    success: false,
    message:
      'Learning activity submissions are not available in the current database.'
  });
};
