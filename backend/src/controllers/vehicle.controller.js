const Vehicle = require('../models/Vehicle');
const factory = require('./handlerFactory');

exports.getAllVehicles = factory.getAll(Vehicle, { searchFields: ['name', 'category'] });
exports.getVehicle = factory.getOne(Vehicle, { bySlug: true });
exports.createVehicle = factory.createOne(Vehicle);
exports.updateVehicle = factory.updateOne(Vehicle);
exports.deleteVehicle = factory.deleteOne(Vehicle);

exports.uploadVehicleImages = (req, res, next) => {
  if (req.files?.length) {
    const imgs = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    req.body.images = req.body.keepImages
      ? [...JSON.parse(req.body.keepImages), ...imgs]
      : imgs;
  }
  if (typeof req.body.features === 'string') req.body.features = req.body.features.split(',').map((s) => s.trim());
  next();
};
