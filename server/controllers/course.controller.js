import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import { generateCoursePrompt } from '../services/aiService.js';

export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({}).populate({
      path: 'modules',
      populate: { path: 'lessons', select: 'title isEnriched' },
    });
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'modules',
      populate: { path: 'lessons', select: 'title isEnriched' },
    });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required',
      });
    }

    // 1. Generate course outline via AI
    const aiResult = await generateCoursePrompt(topic.trim());

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate course structure from AI',
        details: aiResult.rawError,
      });
    }

    const aiData = aiResult.data || {};
    const courseTitle = aiData.title || aiData.courseTitle || topic.trim();
    const courseDescription = aiData.description || `Course covering ${topic.trim()}`;
    const courseTags = Array.isArray(aiData.tags) ? aiData.tags : [];
    const courseModules = Array.isArray(aiData.modules) ? aiData.modules : [];

    // 2. Create the root Course document
    const newCourse = await Course.create({
      title: courseTitle,
      description: courseDescription,
      tags: courseTags,
      creator: req.auth?.payload?.sub || req.user?.sub || req.user?._id || req.body.creator || 'dev-temp-creator',
    });

    // 3. Create Modules and empty Lesson placeholders
    const createdModules = [];

    for (let i = 0; i < courseModules.length; i++) {
      const modData = courseModules[i];

      const lessonDocs = await Promise.all(
        (modData.lessons || []).map((lessonTitle) =>
          Lesson.create({
            title: typeof lessonTitle === 'string' ? lessonTitle : lessonTitle.title || 'Untitled Lesson',
            content: [],
            isEnriched: false,
          })
        )
      );

      const newModule = await Module.create({
        title: modData.title || `Module ${i + 1}`,
        course: newCourse._id,
        lessons: lessonDocs.map((l) => l._id),
      });

      await Lesson.updateMany(
        { _id: { $in: lessonDocs.map((l) => l._id) } },
        { module: newModule._id }
      );

      createdModules.push(newModule._id);
    }

    // 4. Attach created modules to the course
    newCourse.modules = createdModules;
    await newCourse.save();

    // 5. Return populated response
    const populatedCourse = await Course.findById(newCourse._id).populate({
      path: 'modules',
      populate: { path: 'lessons', select: 'title isEnriched' },
    });

    return res.status(201).json({
      success: true,
      data: populatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCourses = async (req, res, next) => {
  try {
    const creator = req.auth?.payload?.sub;
    if (!creator) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing subject' });
    }
    const courses = await Course.find({ creator })
      .sort({ createdAt: -1 })
      .populate({
        path: 'modules',
        populate: { path: 'lessons', select: 'title isEnriched' },
      });
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // 1. Find all modules for this course
    const modules = await Module.find({ course: id });
    const moduleIds = modules.map((m) => m._id);

    // 2. Cascade delete all lessons associated with these modules
    await Lesson.deleteMany({ module: { $in: moduleIds } });

    // 3. Delete all modules
    await Module.deleteMany({ course: id });

    // 4. Delete the course document itself
    await Course.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Course and all related lessons deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};