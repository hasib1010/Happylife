
// src/models/Review.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  // Either productId or providerId should be filled
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true,
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
