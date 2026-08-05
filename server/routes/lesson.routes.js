const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLessonById);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').isArray().withMessage('Content must be an array'),
  validate
], lessonController.createLesson);

module.exports = router;
