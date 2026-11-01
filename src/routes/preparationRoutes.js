
const express = require('express');
const router = express.Router();

const preparationController = require('../controllers/preparationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:section/workspaces', preparationController.getWorkspaces);

// Student workspaces
router.get('/my/workspaces', authMiddleware, preparationController.getMyWorkspaces);
router.post('/workspaces', authMiddleware, preparationController.createWorkspace);
router.patch('/workspaces/:id', authMiddleware, preparationController.updateWorkspace);
router.delete('/workspaces/:id', authMiddleware, preparationController.deleteWorkspace);

// Tasks, essay drafts and study plans
for (const kind of ['tasks', 'drafts', 'plans']) {
  router.get(
    `/workspaces/:workspaceId/${kind}`,
    authMiddleware,
    preparationController.listChildren(kind)
  );

  router.post(
    `/workspaces/:workspaceId/${kind}`,
    authMiddleware,
    preparationController.createChild(kind)
  );

  router.patch(
    `/${kind}/:id`,
    authMiddleware,
    preparationController.updateChild(kind)
  );

  router.delete(
    `/${kind}/:id`,
    authMiddleware,
    preparationController.deleteChild(kind)
  );
}

// Preparation resources
router.get('/resources', authMiddleware, preparationController.listResources);

module.exports = router;
