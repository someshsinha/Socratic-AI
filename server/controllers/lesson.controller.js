exports.getLessons = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'getLessons stub' });
  } catch (err) {
    next(err);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'getLessonById stub' });
  } catch (err) {
    next(err);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'createLesson stub' });
  } catch (err) {
    next(err);
  }
};
