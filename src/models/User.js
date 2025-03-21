// src/models/User.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  accountType: {
    type: String,
    enum: ['regular', 'provider', 'product_seller', 'admin'],
    default: 'regular',
  },
  subscriptionStatus: {
    type: String,
    enum: ['none', 'active', 'canceled', 'past_due', 'unpaid'],
    default: 'none',
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  stripeCustomerId: {
    type: String,
  },
  profileImage: {
    type: String,
    default: '',
  },
  // Added for our custom authentication system
  sessionToken: {
    type: String,
  },
  // Added to track session expiration time
  sessionExpiry: {
    type: Date,
  },
  savedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  savedProviders: [{
    type: Schema.Types.ObjectId,
    ref: 'Provider',
  }],
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  }],
}, { 
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);