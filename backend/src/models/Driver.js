const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: String,
    photo: { url: String, publicId: String },
    licenseNumber: { type: String, required: true },
    documents: [{ name: String, url: String, publicId: String }], // license, aadhaar, police verification
    address: String,
    experienceYears: { type: Number, default: 0 },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    assignedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
    availability: { type: String, enum: ['available', 'onTrip', 'offDuty'], default: 'available' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    rating: { type: Number, default: 5, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
