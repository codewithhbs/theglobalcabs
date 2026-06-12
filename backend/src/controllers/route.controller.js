const Route = require('../models/Route');
const FareRule = require('../models/FareRule');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllRoutes = factory.getAll(Route, { searchFields: ['name', 'pickupLocation', 'dropLocation'] });
exports.getRoute = factory.getOne(Route, { bySlug: true });
exports.createRoute = factory.createOne(Route);
exports.updateRoute = factory.updateOne(Route);
exports.deleteRoute = factory.deleteOne(Route);

exports.uploadRouteImage = (req, res, next) => {
  if (req.file) req.body.image = { url: req.file.path, publicId: req.file.filename };
  next();
};

// Public: route detail with all vehicle fares
exports.getRouteWithFares = catchAsync(async (req, res, next) => {
  const route = await Route.findOne(
    req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.slug } : { slug: req.params.slug }
  );
  if (!route) return res.status(404).json({ status: 'fail', message: 'Route not found' });
  const fares = await FareRule.find({ route: route._id, status: 'active' }).populate('vehicle');
  res.json({ status: 'success', data: { route, fares } });
});
