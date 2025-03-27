// src/models/payment.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    type: {
      type: String,
      enum: ['service_feature', 'subscription', 'booking', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      required: true,
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
    paymentId: {
      type: String, // Stripe payment intent ID or similar
      required: true,
    },
    sessionId: {
      type: String, // Stripe checkout session ID or similar
    },
    description: {
      type: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundReason: {
      type: String,
    },
    expiresAt: {
      type: Date, // For subscription and feature payments
    }
  },
  {
    timestamps: true,
  }
);

// Index to find payments by user
PaymentSchema.index({ userId: 1 });

// Index to find payments by service
PaymentSchema.index({ serviceId: 1 });

// Index to find payments by payment ID
PaymentSchema.index({ paymentId: 1 });

// Compound index for service and type
PaymentSchema.index({ serviceId: 1, type: 1 });

// Method to check if a payment is still active
PaymentSchema.methods.isActive = function() {
  if (!this.expiresAt) return true;
  return new Date() < new Date(this.expiresAt);
};

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;