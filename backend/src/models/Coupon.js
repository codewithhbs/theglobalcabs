const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['flat', 'percent'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: Number,
    minBookingAmount: { type: Number, default: 0 },
    validFrom: Date,
    validTo: Date,
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

couponSchema.methods.isValidNow = function (amount = 0) {
  const now = new Date();
  if (this.status !== 'active') return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validTo && now > this.validTo) return false;
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return false;
  if (amount < this.minBookingAmount) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
