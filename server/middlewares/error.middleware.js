export const errorHandler = (err, req, res, next) => {
  // If headers are already sent, delegate to standard Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Catch malformed MongoDB ObjectIDs (e.g. /api/courses/invalid-id)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid ID format: ${err.value}`,
    });
  }

  console.error('Error occurred:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: true,
    message: message
  });
};
