const jwt = require('jsonwebtoken');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  const cookieDays = parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 7;
  res.cookie('token', token, {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

module.exports = { signToken, sendTokenResponse };
