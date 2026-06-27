const mongoose = require('mongoose');

const tourBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },        // e.g. TR202600001
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestDetails: { name: String, email: String, phone: String },

    travelDate: { type: Date, required: true },                    // tour start date
    pickupLocation: { type: String, required: true },              // where to pick up from
    travellers: { type: Number, default: 1, min: 1 },

    // Snapshot of price at the time of booking — protects against later admin edits
    price: { type: Number, required: true, min: 0 },               // package price for the chosen vehicle
    fare: {
      base: Number,
      tax: Number,
      taxPercent: Number,
      total: { type: Number, required: true },
      breakdown: [{ label: String, amount: Number }],
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment: {
      method: { type: String, enum: ['cash', 'online', 'pending'], default: 'pending' },
      status: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
      transactionId: String,
      gateway: String,
    },
    notes: String,
    cancellation: { reason: String, cancelledAt: Date, cancelledBy: String },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, by: String }],
  },
  { timestamps: true }
);

tourBookingSchema.pre('validate', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('TourBooking').estimatedDocumentCount();
    this.bookingId = `TR${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('TourBooking', tourBookingSchema);