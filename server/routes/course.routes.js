import express from 'express';
import * as courseController from '../controllers/course.controller.js';
import validate from '../middlewares/validate.middleware.js';
import { body } from 'express-validator';
import { checkJwt, checkJwtOptional } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Secure endpoint for user's personal courses
router.get('/user-courses', checkJwt, courseController.getUserCourses);

// Public route to view specific course outline & details
router.get('/:id', courseController.getCourseById);

// Create course with optional auth (associates with user if logged in, otherwise guest)
router.post('/', [
  checkJwtOptional,
  body('topic').notEmpty().withMessage('Topic is required'),
  validate
], courseController.createCourse);

// Delete course (strictly requires authentication and ownership)
router.delete('/:id', checkJwt, courseController.deleteCourse);

export default router;
