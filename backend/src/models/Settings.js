const mongoose = require('mongoose');

// Singleton settings document
const settingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'The Global Cabs' },
    tagline: { type: String, default: 'The Journey Begins with Us' },
    phone: { type: String, default: '+91 7827313298' },
    altPhone: String,
    whatsapp: { type: String, default: '+917827313298' },
    email: { type: String, default: 'ishant.globalcabs@gmail.com' },
    address: { type: String, default: 'Gurugram, Haryana, India' },
    workingHours: { type: String, default: '24x7 Available' },
    social: { facebook: String, instagram: String, twitter: String, linkedin: String, youtube: String },
    taxPercent: { type: Number, default: 5 },
    peakHours: {
      active: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '06:00' },
      percent: { type: Number, default: 10 },
    },
    cancellationWindowHours: { type: Number, default: 4 },
    logo: { url: String, publicId: String },
    announcement: String, // top bar message
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
