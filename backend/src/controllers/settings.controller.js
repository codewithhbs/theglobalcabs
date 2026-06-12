const Settings = require('../models/Settings');
const catchAsync = require('../utils/catchAsync');

exports.getSettings = catchAsync(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ status: 'success', data: settings });
});

exports.updateSettings = catchAsync(async (req, res) => {
  if (req.file) req.body.logo = { url: req.file.path, publicId: req.file.filename };
  let settings = await Settings.findOne();
  settings = settings
    ? await Settings.findByIdAndUpdate(settings._id, req.body, { new: true, runValidators: true })
    : await Settings.create(req.body);
  res.json({ status: 'success', data: settings });
});
