const mongoose = require('mongoose');
const slugify = require('slugify');

// CMS pages: about, privacy-policy, terms, cancellation-policy, faq, custom pages
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true }, // HTML
    sections: [{ heading: String, body: String, image: { url: String, publicId: String } }],
    faqs: [{ question: String, answer: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    seo: {
      metaTitle: String,
      metaDescription: String,
      focusKeyword: String,
      keywords: [String],
      canonical: String,
      noIndex: { type: Boolean, default: false },
      ogTitle: String,
      ogDescription: String,
      ogImage: String, // image URL
      schemaMarkup: String, // optional raw JSON-LD
    },
  },
  { timestamps: true }
);

pageSchema.pre('validate', function (next) {
  this.slug = slugify(this.slug || this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Page', pageSchema);
