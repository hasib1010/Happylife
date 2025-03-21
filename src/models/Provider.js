
// src/models/Provider.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ProviderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  specialties: [{
    type: String,
    trim: true,
  }],
  servicesOffered: [{
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
    },
    year: {
      type: Number,
    },
    documentUrl: {
      type: String, // S3 URL
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  }],
  location: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
  },
  contactInfo: {
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
  },
  workingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    open: {
      type: String, // "09:00"
    },
    close: {
      type: String, // "17:00"
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  }],
  gallery: [{
    type: String, // S3 URLs
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true,
});

export default mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
