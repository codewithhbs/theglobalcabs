const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Per-vehicle pricing for a tour.
 * One entry per vehicle that the admin wants to offer for this tour.
 * The price is a flat package price for the whole tour (not per-km).
 */
const tourVehiclePricingSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    price: { type: Number, required: true, min: 0 }, // total package price for this vehicle
  },
  { _id: false }
);

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 }, // 1, 2, 3...
    title: { type: String, required: true },       // "Arrival in Jaipur"
    description: String,                            // long-form details
  },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },          // "Golden Triangle 4N/5D"
    slug: { type: String, unique: true, index: true },
    fromLocation: { type: String, required: true },                // "Delhi"
    toLocation: { type: String, required: true },                  // "Agra & Jaipur"
    durationDays: { type: Number, required: true, min: 1 },        // 5
    durationNights: { type: Number, default: 0, min: 0 },          // 4
    category: {
      type: String,
      enum: ['oneDay', 'weekend', 'holiday', 'honeymoon', 'pilgrimage', 'adventure', 'family', 'custom'],
      default: 'holiday',
    },

    shortDescription: String,                                       // 1-2 line teaser
    description: String,                                            // long-form HTML/text
    highlights: [String],                                           // bullet points
    includes: [String],                                             // "Hotel stays", "Driver"...
    excludes: [String],                                              // "Air fare", "Entry fees"...

    image: { url: String, publicId: String },                       // hero image
    gallery: [{ url: String, publicId: String }],                   // optional extra images

    itinerary: [itineraryDaySchema],

    // PER-VEHICLE PRICING – admin sets a flat package price for each vehicle on offer
    vehiclePricing: { type: [tourVehiclePricingSchema], default: [] },

    // Display helpers
    startingPrice: { type: Number, default: 0 },                    // auto-computed = min of vehiclePricing
    isPopular: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    seo: { metaTitle: String, metaDescription: String, keywords: [String] },
  },
  { timestamps: true }
);

tourSchema.pre('validate', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // auto-compute starting price from per-vehicle pricing
  if (Array.isArray(this.vehiclePricing) && this.vehiclePricing.length) {
    const prices = this.vehiclePricing.map((p) => Number(p.price)).filter((n) => !isNaN(n) && n > 0);
    if (prices.length) this.startingPrice = Math.min(...prices);
  } else {
    this.startingPrice = 0;
  }
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
