const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.use(auth, admin);
router.get('/overview', controller.overview);
router.get('/opportunity-subtypes', controller.listSubtypes);
router.get('/opportunities', controller.list);
router.post('/opportunities', controller.create);
router.put('/opportunities/:id', controller.update);
router.patch('/opportunities/:id/status', controller.setStatus);
router.delete('/opportunities/:id', controller.remove);
router.get('/learning-options', controller.listLearningOptions);
router.get('/learning-resources', controller.listResources);
router.post('/learning-resources', controller.createResource);
router.put('/learning-resources/:id', controller.updateResource);
router.delete('/learning-resources/:id', controller.removeResource);

module.exports = router;
