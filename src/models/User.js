// src/models/User.js
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, mapRoleToAccountType } from '@/lib/constants';

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
  // Replace simple accountType with robust role-based system
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.REGULAR,
  },
  // Store custom permissions that override defaults
  permissions: {
    type: Map,
    of: String,
    default: {},
  },
  // Backward compatibility for existing code
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
  // Track last login info
  lastLogin: {
    date: Date,
    ip: String,
    userAgent: String
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  // Password reset
  passwordResetToken: String,
  passwordResetExpiry: Date,
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  // Login attempts security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
}, { 
  timestamps: true,
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Method to get effective permissions (combines role defaults with custom overrides)
UserSchema.methods.getPermissions = function() {
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[this.role] || DEFAULT_ROLE_PERMISSIONS[ROLES.REGULAR];
  const customPermissions = this.permissions ? Object.fromEntries(this.permissions) : {};
  
  return {
    ...rolePermissions,
    ...customPermissions
  };
};

// Method to check if user has permission for a specific action
UserSchema.methods.hasPermission = function(area, level) {
  const permissions = this.getPermissions();
  const areaPermission = permissions[area];
  
  if (!areaPermission) return false;
  
  // Permission hierarchy
  const permissionLevels = {
    [PERMISSIONS.READ_ONLY]: 1,
    [PERMISSIONS.MANAGE_OWN]: 2,
    [PERMISSIONS.MANAGE_ALL]: 3,
    [PERMISSIONS.FULL_ACCESS]: 4
  };
  
  return permissionLevels[areaPermission] >= permissionLevels[level];
};

// Method to check if user is an admin (for backward compatibility)
UserSchema.methods.isAdmin = function() {
  return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
};

// Method to check if user can access admin panel
UserSchema.methods.canAccessAdminPanel = function() {
  return [ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(this.role);
};

// Middleware to sync accountType with role for backward compatibility
UserSchema.pre('save', function(next) {
  // Map role to accountType
  if (this.isModified('role')) {
    this.accountType = mapRoleToAccountType(this.role);
  }
  
  // Map accountType to role if role isn't set explicitly
  if (this.isModified('accountType') && !this.isModified('role')) {
    switch(this.accountType) {
      case 'provider':
        this.role = ROLES.PROVIDER;
        break;
      case 'product_seller':
        this.role = ROLES.PRODUCT_SELLER;
        break;
      case 'admin':
        this.role = ROLES.ADMIN;
        break;
      default:
        this.role = ROLES.REGULAR;
    }
  }
  
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);