// src/models/product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
    },
    subcategory: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Please specify a price'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    images: [{
      type: String,
    }],
    features: [{
      type: String,
    }],
    specifications: [{
      name: String,
      value: String,
    }],
    faqs: [{
      question: String,
      answer: String,
    }],
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
    tags: [{
      type: String,
    }],
    viewCount: {
      type: Number,
      default: 0,
    },
    contact: {
      email: {
        type: String,
        required: [true, 'Please provide a contact email'],
      },
      phone: String,
      website: String,
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      isRemote: {
        type: Boolean,
        default: false,
      }
    },
    businessHours: [{
      day: {
        type: Number, 
        min: 0,
        max: 6
      },
      open: String,
      close: String,
      isClosed: {
        type: Boolean,
        default: false,
      }
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },  // This ensures virtuals are included in JSON output
    toObject: { virtuals: true } // This ensures virtuals are included when converting to objects
  }
);

// Add text index for search
ProductSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text', 
  category: 'text', 
  subcategory: 'text' 
});

// Virtual field for seller information
ProductSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true,
});

// Calculate if product is on sale
ProductSchema.virtual('onSale').get(function() {
  return this.discountPrice && this.discountPrice < this.price;
});

// Calculate discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Middleware to populate seller on find
ProductSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'seller',
    select: 'name email profilePicture businessName role' // Include any additional fields you need
  });
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;