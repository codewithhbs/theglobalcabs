const Driver = require('../models/Driver');
const factory = require('./handlerFactory');

exports.getAllDrivers = factory.getAll(Driver, {
  searchFields: ['name', 'phone', 'licenseNumber'],
  populate: 'assignedVehicle assignedRoutes',
});
exports.getDriver = factory.getOne(Driver, { populate: 'assignedVehicle assignedRoutes' });
exports.createDriver = factory.createOne(Driver);
exports.updateDriver = factory.updateOne(Driver);
exports.deleteDriver = factory.deleteOne(Driver);

exports.uploadDriverFiles = (req, res, next) => {
  const photo = req.files?.photo?.[0];
  const docs = req.files?.documents || [];
  if (photo) req.body.photo = { url: photo.path, publicId: photo.filename };
  if (docs.length) {
    req.body.documents = docs.map((f) => ({ name: f.originalname, url: f.path, publicId: f.filename }));
  }
  next();
};
