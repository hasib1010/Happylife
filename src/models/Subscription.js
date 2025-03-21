// src/models/Subscription.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const SubscriptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['provider', 'product_seller'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active',
  },
  stripeCustomerId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
  },
  currentPeriodStart: {
    type: Date,
    required: true,
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  // Auto-renewal field
  autoRenew: {
    type: Boolean,
    default: true,
  },
  // Subscription history tracking
  renewalCount: {
    type: Number,
    default: 0,
  },
  lastPaymentDate: {
    type: Date,
  },
  lastFailedPaymentDate: {
    type: Date,
  },
  canceledAt: {
    type: Date,
  },
  // Payment method details (optional, for display)
  paymentMethodDetails: {
    type: Object,
  },
}, { 
  timestamps: true,
});

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trialing';
};

// Method to check if subscription needs renewal soon (within 5 days)
SubscriptionSchema.methods.needsRenewalSoon = function() {
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  return this.currentPeriodEnd <= fiveDaysFromNow && this.autoRenew;
};

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);