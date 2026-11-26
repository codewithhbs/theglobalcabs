const slugify = require('slugify');
const Page = require('../models/Page');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllPages = factory.getAll(Page, { searchFields: ['title', 'slug'] });
exports.getPage = factory.getOne(Page, { bySlug: true });

// Clean slug + friendly duplicate-slug error (admin add/edit)
const prepare = (body = {}) => {
  if (body.slug !== undefined) body.slug = slugify(String(body.slug || body.title || ''), { lower: true, strict: true });
  return body;
};

exports.createPage = catchAsync(async (req, res, next) => {
  const body = prepare(req.body);
  if (body.slug && (await Page.exists({ slug: body.slug }))) return next(new AppError(`Slug "${body.slug}" already exists`, 400));
  const doc = await Page.create(body);
  res.status(201).json({ status: 'success', data: doc });
});

exports.updatePage = catchAsync(async (req, res, next) => {
  const body = prepare(req.body);
  if (body.slug && (await Page.exists({ slug: body.slug, _id: { $ne: req.params.id } }))) {
    return next(new AppError(`Slug "${body.slug}" already exists`, 400));
  }
  const doc = await Page.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!doc) return next(new AppError('No document found with that ID', 404));
  res.json({ status: 'success', data: doc });
});

exports.deletePage = factory.deleteOne(Page);
