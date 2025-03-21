// src/models/Directory.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const DirectorySchema = new Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  
  // Category and listing type info
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'mind-body',
      'nutrition',
      'alternative-medicine',
      'fitness',
      'mental-health',
      'coaching',
      'healing',
      'wellness-products',
      'other'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  listingType: {
    type: String,
    required: [true, 'Please specify listing type'],
    enum: ['service', 'product', 'both'],
    default: 'service'
  },
  
  // Owner info
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Directory entry must be associated with a user']
  },
  
  // Contact information
  contact: {
    email: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  
  // Social media links
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    }
  },
  
  // Location information
  location: {
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'United States'
    },
    coordinates: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    },
    servesRemotely: {
      type: Boolean,
      default: false
    }
  },
  
  // Business hours
  businessHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '17:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '17:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '17:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '17:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '17:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '10:00' },
      closeTime: { type: String, default: '15:00' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '10:00' },
      closeTime: { type: String, default: '15:00' }
    },
    timeZone: {
      type: String,
      default: 'America/New_York'
    },
    additionalHoursInfo: {
      type: String,
      trim: true
    }
  },
  
  // Media
  logo: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  
  // Highlights and features
  highlights: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Additional fields for search and display
  establishedYear: {
    type: Number
  },
  certifications: [{
    type: String,
    trim: true
  }],
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Display and subscription options
  featuredUntil: {
    type: Date
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  membershipStatus: {
    type: String,
    enum: ['active', 'expired', 'pending', 'canceled'],
    default: 'active'
  },
  
  // Statistics
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug before saving
DirectorySchema.pre('save', async function(next) {
  if (!this.slug || this.isModified('name')) {
    // Create slug from name
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // Check if slug exists and make it unique if necessary
    let slugCount = 0;
    let tempSlug = this.slug;
    let existingEntry;
    
    do {
      if (slugCount > 0) {
        tempSlug = `${this.slug}-${slugCount}`;
      }
      
      existingEntry = await mongoose.models.Directory.findOne({ slug: tempSlug, _id: { $ne: this._id } });
      slugCount++;
    } while (existingEntry);
    
    this.slug = tempSlug;
  }
  
  next();
});

// Create indexes for better query performance
DirectorySchema.index({ owner: 1 });
DirectorySchema.index({ category: 1 });
DirectorySchema.index({ 'location.city': 1, 'location.state': 1 });
DirectorySchema.index({ isActive: 1, isFeatured: 1 });
DirectorySchema.index({ listingType: 1 });
DirectorySchema.index({ tags: 1 });
DirectorySchema.index({ 
  name: 'text', 
  description: 'text', 
  shortDescription: 'text',
  tags: 'text',
  highlights: 'text'
});

// Helper method to get formatted categories
DirectorySchema.statics.getCategories = function() {
  return [
    { value: 'mind-body', label: 'Mind & Body' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'alternative-medicine', label: 'Alternative Medicine' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'coaching', label: 'Coaching' },
    { value: 'healing', label: 'Healing' },
    { value: 'wellness-products', label: 'Wellness Products' },
    { value: 'other', label: 'Other' }
  ];
};

// Get formatted business hours
DirectorySchema.methods.getFormattedBusinessHours = function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const formatted = {};
  
  days.forEach(day => {
    const dayInfo = this.businessHours[day];
    
    if (dayInfo.isOpen) {
      formatted[day] = `${dayInfo.openTime} - ${dayInfo.closeTime}`;
    } else {
      formatted[day] = 'Closed';
    }
  });
  
  return formatted;
};

// Virtual for full address
DirectorySchema.virtual('fullAddress').get(function() {
  const loc = this.location;
  if (!loc.address) return '';
  
  let address = loc.address;
  if (loc.city) address += `, ${loc.city}`;
  if (loc.state) address += `, ${loc.state}`;
  if (loc.zipCode) address += ` ${loc.zipCode}`;
  if (loc.country && loc.country !== 'United States') address += `, ${loc.country}`;
  
  return address;
});

export default mongoose.models.Directory || mongoose.model('Directory', DirectorySchema);