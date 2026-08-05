const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');

router.get('/', courseController.getCourses);

// A route to intentionally throw an error to demonstrate error.middleware.js
router.get('/test/error', (req, res, next) => {
  const error = new Error('Test error for centralized handler');
  error.statusCode = 400;
  next(error);
});

router.get('/:id', courseController.getCourseById);

// Create course with validation to demonstrate validate.middleware.js
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('creator').notEmpty().withMessage('Creator is required'),
  validate
], courseController.createCourse);

module.exports = router;
