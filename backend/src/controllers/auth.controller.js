const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  const user = await User.create({ name, email, phone, password }); // role forced to customer by schema default
  sendEmail({
    to: email,
    subject: 'Welcome to The Global Cabs',
    title: `Welcome aboard, ${name}!`,
    html: `<p>Your account is ready. Book local rides, airport transfers and outstation trips in seconds.</p>`,
  });
  sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  sendTokenResponse(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ status: 'success' });
};

exports.getMe = catchAsync(async (req, res) => {
  res.json({ status: 'success', data: { user: req.user } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const allowed = ({ name, phone }) => ({ ...(name && { name }), ...(phone && { phone }) });
  const payload = allowed(req.body);
  if (req.file) payload.avatar = { url: req.file.path, publicId: req.file.filename };
  const user = await User.findByIdAndUpdate(req.user.id, payload, { new: true, runValidators: true });
  res.json({ status: 'success', data: { user } });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(currentPassword))) {
    return next(new AppError('Your current password is incorrect', 401));
  }
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});
