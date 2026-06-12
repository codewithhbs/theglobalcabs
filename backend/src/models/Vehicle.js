const mongoose = require('mongoose');
const slugify = require('slugify');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Innova Crysta"
    slug: { type: String, unique: true, index: true },
    category: {
      type: String,
      enum: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'],
      required: true,
    },
    seatingCapacity: { type: Number, required: true, min: 1 },
    luggageCapacity: { type: Number, default: 2 }, // bags
    perKmRate: { type: Number, required: true, min: 0 },
    minimumFare: { type: Number, default: 0 },
    images: [{ url: String, publicId: String }],
    features: [String], // AC, Music System, GPS...
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], default: 'Diesel' },
    registrationNumber: String,
    description: String,
    isAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

vehicleSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(`${this.name}-${this.category}`, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
