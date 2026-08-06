import express from 'express';
import * as lessonController from '../controllers/lesson.controller.js';

const router = express.Router();

router.get('/', lessonController.getLessons);
router.get('/:id', lessonController.getLessonById);
router.post('/', lessonController.createLesson);

export default router;