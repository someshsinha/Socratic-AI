exports.getCourses = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'getCourses stub' });
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'getCourseById stub' });
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    res.json({ ok: true, message: 'createCourse stub' });
  } catch (err) {
    next(err);
  }
};
