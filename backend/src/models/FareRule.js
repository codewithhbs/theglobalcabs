const mongoose = require('mongoose');

// One fare rule per (route, vehicle) pair. Falls back to vehicle.perKmRate when absent.
const fareRuleSchema = new mongoose.Schema(
  {
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    fareType: { type: String, enum: ['fixed', 'perKm'], default: 'fixed' },
    fixedFare: { type: Number, min: 0 },
    perKmRate: { type: Number, min: 0 },
    minimumFare: { type: Number, default: 0 },
    // Seasonal / festival pricing windows
    pricingWindows: [
      {
        label: String,          // "Diwali Surge", "Summer Season"
        from: Date,
        to: Date,
        type: { type: String, enum: ['flat', 'percent'], default: 'percent' },
        value: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
      },
    ],
    // Peak hour pricing
    peakHours: {
      active: { type: Boolean, default: false },
      start: String, // "22:00"
      end: String,   // "06:00"
      percent: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

fareRuleSchema.index({ route: 1, vehicle: 1 }, { unique: true });

module.exports = mongoose.model('FareRule', fareRuleSchema);
