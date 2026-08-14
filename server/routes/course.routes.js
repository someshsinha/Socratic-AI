import express from 'express';
import * as courseController from '../controllers/course.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { body } from 'express-validator';
import { checkJwt, checkJwtOptional } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', courseController.getCourses);

// A route to intentionally throw an error to demonstrate error.middleware.js
router.get('/test/error', (req, res, next) => {
  const error = new Error('Test error for centralized handler');
  error.statusCode = 400;
  next(error);
});

// Secure endpoint for user's personal courses
router.get('/user-courses', checkJwt, courseController.getUserCourses);

router.get('/:id', courseController.getCourseById);

// Create course with validation to demonstrate validate.middleware.js
router.post('/', [
  checkJwtOptional,
  body('topic').notEmpty().withMessage('Topic is required'),
  validate
], courseController.createCourse);

// Delete course
router.delete('/:id', checkJwtOptional, courseController.deleteCourse);

export default router;
