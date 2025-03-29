  // src/models/service.js - Modified for directory listings
  import mongoose from 'mongoose';

  const ServiceSchema = new mongoose.Schema(
    {
      providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      // Directory listing fields
      businessName: {
        type: String,
        required: [true, 'Please provide your business name'],
        trim: true,
        maxlength: [100, 'Business name cannot be more than 100 characters'],
      },
      description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
      },
      // Legacy title field - kept for compatibility but now optional
      title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters'],
      },
      // Legacy price field - kept for compatibility but now optional
      price: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
      category: {
        type: String,
        required: [true, 'Please specify a category'],
      },
      subcategory: {
        type: String,
      },
      logo: {
        type: String,
      },
      coverImage: {
        type: String,
      },
      // For backward compatibility, keep the old images array
      images: [{
        type: String,
      }],
      contact: {
        email: {
          type: String,
          required: [true, 'Please provide an email address'],
        },
        phone: {
          type: String,
        },
        alternatePhone: {
          type: String,
        },
      },
      website: {
        type: String,
        trim: true,
      },
      socialMedia: {
        facebook: { type: String, trim: true },
        twitter: { type: String, trim: true },
        instagram: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        youtube: { type: String, trim: true },
        tiktok: { type: String, trim: true },
        pinterest: { type: String, trim: true },
        other: [{ platform: String, url: String }],
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        },
        address: {
          street: String,
          city: String,
          state: String,
          zipCode: String,
          country: String,
        },
        isRemote: {
          type: Boolean,
          default: false,
        },
      },
      // New field for business hours (replaces availability)
      businessHours: [{
        day: { // 0-6 representing Sunday to Saturday
          type: Number,
          min: 0,
          max: 6,
        },
        open: { type: String }, // Format: "HH:MM" (24-hour)
        close: { type: String }, // Format: "HH:MM" (24-hour)
        isClosed: { type: Boolean, default: false },
      }],
      // For backward compatibility, keep the old availability structure
      availability: {
        daysOfWeek: [{ // 0-6 representing Sunday to Saturday
          type: Number,
          min: 0,
          max: 6,
        }],
        timeSlots: [{
          startTime: String, // Format: "HH:MM" (24-hour)
          endTime: String,   // Format: "HH:MM" (24-hour)
        }],
        exceptions: [{ // Days when not available
          date: Date,
          reason: String,
        }],
      },
      features: [{
        type: String,
      }],
      faqs: [{
        question: String,
        answer: String,
      }],
      // Subscription and status fields
      subscriptionStatus: {
        type: String,
        enum: ['active', 'expired', 'canceled', 'trial'],
        default: 'trial',
      },
      subscriptionStartDate: {
        type: Date,
        default: Date.now,
      },
      subscriptionEndDate: {
        type: Date,
      },
      lastPaymentId: {
        type: String,
      },
      // Visibility controls
      status: {
        type: String,
        enum: ['draft', 'published', 'suspended'],
        default: 'draft',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isFeatured: {
        type: Boolean,
        default: false,
      },
      featureExpiration: {
        type: Date,
      },
      // Analytics
      viewCount: {
        type: Number,
        default: 0,
      },
      clickCount: {
        type: Number, 
        default: 0,
      },
      clickThroughRate: {
        type: Number,
        default: 0,
      },
      tags: [{
        type: String,
      }],
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );

  // Create indexes for search and geospatial queries
  ServiceSchema.index({ 'location.coordinates': '2dsphere' });
  ServiceSchema.index({ 
    businessName: 'text', 
    description: 'text', 
    tags: 'text', 
    category: 'text', 
    subcategory: 'text' 
  });

  // Virtual field for provider information
  ServiceSchema.virtual('provider', {
    ref: 'User',
    localField: 'providerId',
    foreignField: '_id',
    justOne: true,
  });

  // Method to check if a listing is visible
  ServiceSchema.methods.isVisible = function() {
    return this.isActive && 
          this.status === 'published' && 
          ['active', 'trial'].includes(this.subscriptionStatus);
  };

  // Method to check if listing is currently featured
  ServiceSchema.methods.isCurrentlyFeatured = function() {
    return this.isFeatured && 
      this.featureExpiration && 
      new Date(this.featureExpiration) > new Date();
  };

  // Method to track click on website or social media
  ServiceSchema.methods.trackClick = function() {
    this.clickCount += 1;
    if (this.viewCount > 0) {
      this.clickThroughRate = (this.clickCount / this.viewCount) * 100;
    }
    return this.save();
  };

  // Middleware to populate provider on find
  ServiceSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'provider',
      select: 'name email profilePicture',
    });
    next();
  });

  // Middleware to check subscription status before saving
  ServiceSchema.pre('save', function(next) {
    // Check if subscription has expired
    if (this.subscriptionEndDate && new Date(this.subscriptionEndDate) < new Date()) {
      this.subscriptionStatus = 'expired';
    }
    next();
  });

  // For backward compatibility with existing data
  ServiceSchema.pre('save', function(next) {
    // If the title is not set but businessName is, use businessName as title
    if (!this.title && this.businessName) {
      this.title = this.businessName;
    }
    next();
  });

  const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);

  export default Service;