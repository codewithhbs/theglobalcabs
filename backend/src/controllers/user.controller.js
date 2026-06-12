const User = require('../models/User');
const factory = require('./handlerFactory');

exports.createUser = factory.createOne(User); // admin: create customer/admin accounts
exports.getAllUsers = factory.getAll(User, { searchFields: ['name', 'email', 'phone'] });
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User); // admin: role/active toggle
exports.deleteUser = factory.deleteOne(User);
