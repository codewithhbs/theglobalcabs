const mongoose = require('mongoose');

// Per-path SEO overrides managed from admin panel
const seoMetaSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true }, // "/", "/fleet", "/routes/gurugram-to-delhi-airport"
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: { url: String, publicId: String },
    canonical: String,
    noIndex: { type: Boolean, default: false },
    schemaMarkup: String, // raw JSON-LD
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeoMeta', seoMetaSchema);
