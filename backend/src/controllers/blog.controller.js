const Blog = require('../models/Blog');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllBlogs = factory.getAll(Blog, { searchFields: ['title', 'tags', 'category'] });
exports.getBlog = catchAsync(async (req, res, next) => {
  const filter = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { slug: req.params.id };
  const blog = await Blog.findOneAndUpdate(filter, { $inc: { views: 1 } }, { new: true });
  if (!blog) return res.status(404).json({ status: 'fail', message: 'Blog not found' });
  res.json({ status: 'success', data: blog });
});
exports.createBlog = factory.createOne(Blog);
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
exports.uploadCover = (req, res, next) => {
  if (req.file) req.body.coverImage = { url: req.file.path, publicId: req.file.filename };
  if (typeof req.body.tags === 'string') req.body.tags = req.body.tags.split(',').map((s) => s.trim());
  next();
};
