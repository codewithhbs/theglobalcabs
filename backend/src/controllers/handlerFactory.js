const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Multipart (multer) bodies arrive as strings — revive JSON objects/arrays and primitives
const normalizeBody = (body = {}) => {
  Object.keys(body).forEach((k) => {
    const v = body[k];
    if (typeof v !== 'string') return;
    if ((v.startsWith('{') && v.endsWith('}')) || (v.startsWith('[') && v.endsWith(']'))) {
      try { body[k] = JSON.parse(v); } catch {}
    } else if (v === 'true') body[k] = true;
    else if (v === 'false') body[k] = false;
  });
  return body;
};
exports.normalizeBody = normalizeBody;

exports.getAll = (Model, { searchFields = [], populate = '' } = {}) =>
  catchAsync(async (req, res) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter().search(searchFields).sort().limitFields().paginate();
    if (populate) features.query = features.query.populate(populate);

    const [docs, total] = await Promise.all([
      features.query,
      Model.countDocuments(new APIFeatures(Model.find(), req.query).filter().search(searchFields).query.getFilter()),
    ]);

    res.json({
      status: 'success',
      results: docs.length,
      total,
      page: features.pagination.page,
      pages: Math.ceil(total / features.pagination.limit),
      data: docs,
    });
  });

exports.getOne = (Model, { populate = '', bySlug = false } = {}) =>
  catchAsync(async (req, res, next) => {
    let query = bySlug && !req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? Model.findOne({ slug: req.params.id })
      : Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.json({ status: 'success', data: doc });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(normalizeBody(req.body));
    res.status(201).json({ status: 'success', data: doc });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, normalizeBody(req.body), { new: true, runValidators: true });
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.json({ status: 'success', data: doc });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    res.status(204).json({ status: 'success', data: null });
  });
