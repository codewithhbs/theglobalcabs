const Testimonial = require('../models/Testimonial');
const factory = require('./handlerFactory');

exports.getAllTestimonials = factory.getAll(Testimonial, { searchFields: ['name'] });
exports.getTestimonial = factory.getOne(Testimonial);
exports.createTestimonial = factory.createOne(Testimonial);
exports.updateTestimonial = factory.updateOne(Testimonial);
exports.deleteTestimonial = factory.deleteOne(Testimonial);
exports.uploadAvatar = (req, res, next) => {
  if (req.file) req.body.avatar = { url: req.file.path, publicId: req.file.filename };
  next();
};
