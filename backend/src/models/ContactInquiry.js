const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'inProgress', 'resolved'], default: 'new' },
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
