
// src/models/Blog.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const BlogSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorType: {
    type: String,
    enum: ['provider', 'product_seller'],
    required: true,
  },
  // If the blog is related to a specific provider or product
  relatedProvider: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
  },
  relatedProduct: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  featuredImage: {
    type: String, // S3 URL
  },
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  publishedAt: {
    type: Date,
  },
}, { 
  timestamps: true,
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
