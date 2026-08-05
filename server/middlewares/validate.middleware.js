const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error message to be readable
    const errorMsg = errors.array()
      .map(err => `${err.path || err.param}: ${err.msg}`)
      .join(', ');
      
    return res.status(400).json({
      error: true,
      message: errorMsg
    });
  }
  next();
};

module.exports = validate;
