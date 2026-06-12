const ContactInquiry = require('../models/ContactInquiry');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../utils/sendEmail');

exports.createInquiry = catchAsync(async (req, res) => {
  const inquiry = await ContactInquiry.create(req.body);
  // notify admin
  sendEmail({
    to: process.env.COMPANY_EMAIL,
    subject: `New inquiry from ${inquiry.name}`,
    title: 'New Contact Inquiry',
    html: `<p><strong>${inquiry.name}</strong> (${inquiry.email} / ${inquiry.phone || '-'})</p><p>${inquiry.message}</p>`,
  });
  res.status(201).json({ status: 'success', message: 'Thanks! Our team will reach out shortly.', data: inquiry });
});

exports.getAllInquiries = factory.getAll(ContactInquiry, { searchFields: ['name', 'email', 'subject'] });
exports.updateInquiry = factory.updateOne(ContactInquiry);
exports.deleteInquiry = factory.deleteOne(ContactInquiry);
