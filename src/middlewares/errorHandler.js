/**
 * Error Handler Middleware
 * Catches all errors thrown in routes and sends a clean JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
