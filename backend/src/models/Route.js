const mongoose = require('mongoose');
const slugify = require('slugify');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Gurugram to Delhi Airport"
    slug: { type: String, unique: true, index: true },
    pickupLocation: { type: String, required: [true, 'Pickup location is required'] },
    dropLocation: { type: String, required: [true, 'Drop location is required'] },
    distanceKm: { type: Number, required: [true, 'Distance is required'], min: 1 },
    estimatedTime: { type: String, required: true }, // e.g. "1 hr 20 min"
    description: String,
    image: { url: String, publicId: String },
    category: {
      type: String,
      enum: ['oneWay', 'roundTrip', 'airport', 'railway', 'local', 'outstation'],
      default: 'oneWay',
    },
    isPopular: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    seo: { metaTitle: String, metaDescription: String, keywords: [String] },
  },
  { timestamps: true }
);

routeSchema.pre('validate', function (next) {
  if (!this.name) this.name = `${this.pickupLocation} to ${this.dropLocation}`;
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Route', routeSchema);
