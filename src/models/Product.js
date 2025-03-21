
// src/models/Product.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
  },
  subCategory: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Please specify a price'],
  },
  images: [{
    type: String, // S3 URLs
  }],
  ingredients: [{
    type: String,
  }],
  benefits: [{
    type: String,
  }],
  usage: {
    type: String,
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
  }],
}, { 
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
