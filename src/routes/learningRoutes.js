
const express = require('express');
const router = express.Router();

const LearningController = require('../controllers/learningController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Learn & Understand API is working'
  });
});

router.get('/lessons/:id/materials', LearningController.getLessonMaterials);
router.get('/lessons/:id/quiz', LearningController.getLessonQuiz);

router.post('/lessons/:id/quiz/submit', authMiddleware, LearningController.submitLessonQuiz);
router.post('/activities/:id/submit', authMiddleware, LearningController.submitActivity);

router.get('/levels', LearningController.getLevels);
router.get('/topics', LearningController.getTopics);
router.get('/lessons', LearningController.getLessons);

router.get('/assessment/initial', LearningController.getInitialAssessment);
router.post('/assessment/initial/submit', authMiddleware, LearningController.submitInitialAssessment);

router.get('/recommendations', authMiddleware, LearningController.getRecommendations);

router.post('/progress', authMiddleware, LearningController.updateProgress);
router.get('/progress', authMiddleware, LearningController.getProgress);

module.exports = router;
