
// src/models/Booking.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const BookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // "14:30"
  },
  endTime: {
    type: String,
    required: true, // "15:30"
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
}, { 
  timestamps: true,
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
