const AppError = require('../utils/appError');

module.exports = (err, req, res, next) => {
  let error = err;
  error.statusCode = error.statusCode || 500;

  if (err.name === 'CastError') error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new AppError(`Duplicate value for "${field}". Please use another value.`, 400);
  }
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map((e) => e.message).join('. ');
    error = new AppError(`Invalid input: ${msgs}`, 400);
  }
  if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
  if (err.name === 'TokenExpiredError') error = new AppError('Session expired. Please log in again.', 401);

  if (process.env.NODE_ENV === 'development') console.error('💥', err);

  res.status(error.statusCode).json({
    status: error.status || 'error',
    message: error.isOperational ? error.message : error.message || 'Something went wrong',
  });
};
