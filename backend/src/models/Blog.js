const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: String,
    content: { type: String, required: true }, // HTML from rich text editor
    coverImage: { url: String, publicId: String },
    author: { type: String, default: 'The Global Cabs' },
    tags: [String],
    category: String,
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    seo: { metaTitle: String, metaDescription: String, keywords: [String] },
  },
  { timestamps: true }
);

blogSchema.pre('validate', function (next) {
  if (this.isModified('title') || !this.slug) this.slug = slugify(this.title, { lower: true, strict: true });
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
