const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestDetails: { name: String, email: String, phone: String }, // for guest bookings
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    tripType: {
      type: String,
      enum: ['local', 'outstation', 'airport', 'railway', 'oneWay', 'roundTrip'],
      required: true,
    },
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String, required: true },
    returnDate: Date, // for round trips
    passengers: { type: Number, default: 1 },
    distanceKm: Number,
    fare: {
      base: Number,
      subtotal: Number,
      discount: Number,
      tax: Number,
      taxPercent: Number,
      total: { type: Number, required: true },
      breakdown: [{ label: String, amount: Number }],
    },
    couponCode: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: {
      method: { type: String, enum: ['cash', 'online', 'pending'], default: 'pending' },
      status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
      transactionId: String,
      gateway: String, // payment-ready architecture: razorpay/stripe plug in here
    },
    notes: String,
    cancellation: { reason: String, cancelledAt: Date, cancelledBy: String },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: String }],
  },
  { timestamps: true }
);

bookingSchema.pre('validate', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').estimatedDocumentCount();
    this.bookingId = `GC${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
