const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.token) token = req.cookies.token;
  if (!token) return next(new AppError('You are not logged in. Please log in to continue.', 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+active');
  if (!user || user.active === false) return next(new AppError('Account no longer exists or is disabled.', 401));

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

// Attaches user if logged in; never blocks (for guest booking flows)
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
    else if (req.cookies?.token) token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) { /* guest */ }
  next();
};
