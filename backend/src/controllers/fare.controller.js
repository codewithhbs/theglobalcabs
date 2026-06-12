const FareRule = require('../models/FareRule');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Coupon = require('../models/Coupon');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { calculateFare } = require('../utils/fareEngine');

exports.getAllFareRules = factory.getAll(FareRule, { populate: 'route vehicle' });
exports.getFareRule = factory.getOne(FareRule, { populate: 'route vehicle' });
exports.createFareRule = factory.createOne(FareRule);
exports.updateFareRule = factory.updateOne(FareRule);
exports.deleteFareRule = factory.deleteOne(FareRule);

// Public fare calculator
// body: { routeId? , vehicleId, distanceKm?, date, time, tripType, couponCode? }
exports.calculate = catchAsync(async (req, res, next) => {
  const { routeId, vehicleId, distanceKm, date, time, tripType, couponCode } = req.body;
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return next(new AppError('Vehicle not found', 404));

  let fareRule = null;
  let km = Number(distanceKm) || 0;
  if (routeId) {
    const route = await Route.findById(routeId);
    if (!route || route.status !== 'active') return next(new AppError('Route not available', 404));
    km = route.distanceKm;
    fareRule = await FareRule.findOne({ route: routeId, vehicle: vehicleId, status: 'active' });
  }
  if (!routeId && !km) return next(new AppError('Provide a route or distance in km', 400));

  let coupon = null;
  if (couponCode) {
    const c = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (c && c.isValidNow()) coupon = { type: c.type, value: c.value, code: c.code };
  }

  const fare = await calculateFare({ fareRule, vehicle, distanceKm: km, date, time, tripType, coupon });
  res.json({ status: 'success', data: { fare, vehicle: { id: vehicle._id, name: vehicle.name, category: vehicle.category }, distanceKm: km } });
});

// Coupons (admin)
exports.getAllCoupons = factory.getAll(Coupon, { searchFields: ['code'] });
exports.createCoupon = factory.createOne(Coupon);
exports.updateCoupon = factory.updateOne(Coupon);
exports.deleteCoupon = factory.deleteOne(Coupon);
