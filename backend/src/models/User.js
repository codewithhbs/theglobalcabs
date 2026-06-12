const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { url: String, publicId: String },
    active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
