const SeoMeta = require('../models/SeoMeta');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllSeo = factory.getAll(SeoMeta, { searchFields: ['path', 'metaTitle'] });
exports.createSeo = factory.createOne(SeoMeta);
exports.updateSeo = factory.updateOne(SeoMeta);
exports.deleteSeo = factory.deleteOne(SeoMeta);

// Public: get meta for a path (frontend generateMetadata consumes this)
exports.getByPath = catchAsync(async (req, res) => {
  const meta = await SeoMeta.findOne({ path: req.query.path || '/' });
  res.json({ status: 'success', data: meta });
});
