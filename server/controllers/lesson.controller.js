import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import { generateLessonPrompt } from '../services/aiService.js';

export const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({});
    res.json({ success: true, data: lessons });
  } catch (err) {
    next(err);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    const { title, content, moduleId } = req.body;
    const lesson = await Lesson.create({
      title,
      content: content || [],
      module: moduleId || null,
      isEnriched: Array.isArray(content) && content.length > 0,
    });
    res.status(201).json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

export const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    // Lazy Generation: If content is already generated/enriched, return cached DB record
    if (lesson.isEnriched && lesson.content.length > 0) {
      await lesson.populate('module');
      return res.status(200).json({ success: true, data: lesson });
    }

    // Resolve context titles for targeted prompt engineering
    const moduleDoc = await Module.findOne({ lessons: lesson._id });
    const courseDoc = moduleDoc
      ? await Course.findById(moduleDoc.course)
      : null;

    const courseTitle = courseDoc?.title || 'General';
    const moduleTitle = moduleDoc?.title || 'General Module';

    // Generate detailed lesson content via Stage 2 AI prompt
    const aiResult = await generateLessonPrompt(
      courseTitle,
      moduleTitle,
      lesson.title
    );

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate lesson content',
        details: aiResult.rawError,
      });
    }

    const { objectives, content } = aiResult.data;

    // Save generated content back to MongoDB using findOneAndUpdate to avoid version key race conditions
    const updatedLesson = await Lesson.findOneAndUpdate(
      { _id: id },
      {
        objectives: objectives || [],
        content: content || [],
        isEnriched: true,
      },
      { new: true }
    ).populate('module');

    return res.status(200).json({
      success: true,
      data: updatedLesson,
    });
  } catch (error) {
    next(error);
  }
};