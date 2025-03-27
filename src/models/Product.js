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
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'lb', 'oz'],
        default: 'g',
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm', 'ft'],
        default: 'cm',
      },
    },
    shippingInfo: {
      isFreeShipping: {
        type: Boolean,
        default: false,
      },
      shippingCost: Number,
      estimatedDelivery: String, // e.g., "3-5 business days"
      shippingRestrictions: [String], // e.g., countries or regions
    },
    ingredients: {
      type: String,
    },
    usageInstructions: {
      type: String,
    },
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
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'pending', 'rejected', 'out_of_stock'],
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
    soldCount: {
      type: Number,
      default: 0,
    },
    returnPolicy: {
      isReturnable: {
        type: Boolean,
        default: true,
      },
      returnPeriod: {
        type: Number, // in days
        default: 30,
      },
      returnConditions: [String],
    },
  },
  {
    timestamps: true,
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

// Method to check if a product is purchasable
ProductSchema.methods.isPurchasable = function() {
  return this.isActive && 
         this.status === 'published' &&
         this.stock > 0;
};

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
    select: 'name profilePicture businessName',
  });
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;