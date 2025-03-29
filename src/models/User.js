// src/models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password required only if not using Google OAuth
      },
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    profilePicture: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'provider', 'seller', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Provider/Seller specific fields
    businessName: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    categories: [{
      type: String,
    }],
    // Subscription related fields
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', null],
      default: null,
    },
    subscriptionPlan: {
      type: String,
      default: null,
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },  // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to objects
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Check if user has an active subscription
UserSchema.methods.hasActiveSubscription = function () {
  return this.isSubscribed && 
         (this.subscriptionStatus === 'active' || this.subscriptionStatus === 'trialing') &&
         new Date(this.subscriptionEnd) > new Date();
};

// Add virtual fields for products and services
UserSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'sellerId',
});

UserSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'providerId',
});

// Method to get display name (either business name or personal name)
UserSchema.methods.getDisplayName = function() {
  return this.businessName || this.name;
};

// Prevents model compilation error in development due to hot reloading
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;