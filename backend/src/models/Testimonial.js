const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: String, // "Frequent Traveller", "Corporate Client"
    message: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    avatar: { url: String, publicId: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
