// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { ROLES } from '@/models/User';

// Environment variables - would be in .env in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Newly created user (without password)
   */
  async register(userData) {
    const { email, password, name, role = ROLES.REGULAR } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry
    });

    await newUser.save();

    // Remove password before returning
    const userObject = newUser.toObject();
    delete userObject.password;

    return {
      user: userObject,
      verificationToken
    };
  }

  /**
   * Authenticate a user and generate tokens
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ipAddress - IP address of the client
   * @param {string} userAgent - User agent string
   * @returns {Promise<Object>} Authentication result with tokens
   */
  async login(email, password, ipAddress, userAgent) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error('Account is temporarily locked. Try again later.');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      throw new Error('Invalid credentials');
    }

    // Check if email is verified (optional, can be enabled)
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.isEmailVerified) {
      throw new Error('Please verify your email address before logging in');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Your account has been deactivated. Please contact support.');
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;

    // Update last login information
    user.lastLogin = {
      date: new Date(),
      ip: ipAddress,
      userAgent
    };

    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Return user (without password) and tokens
    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      accessToken,
      refreshToken
    };
  }

  /**
   * Generate a new access token
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      accountType: user.accountType // For backward compatibility
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  /**
   * Generate a new refresh token
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user._id
    };

    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
  }

  /**
   * Refresh an access token using a refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      // Get user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Verify a user's email
   * @param {string} token - Verification token
   * @returns {Promise<boolean>} Success status
   */
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save();
    return true;
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<string>} Password reset token
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetExpiry;

    await user.save();
    return resetToken;
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();
    return true;
  }

  /**
   * Change password for authenticated user
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    return true;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, profileData) {
    // Prevent updating sensitive fields
    const { password, role, accountType, isActive, ...safeProfileData } = profileData;

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: safeProfileData }, 
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    const userObject = updatedUser.toObject();
    delete userObject.password;

    return userObject;
  }

  /**
   * Set up two-factor authentication
   * @param {string} userId - User ID
   * @returns {Promise<Object>} 2FA setup data
   */
  async setupTwoFactor(userId) {
    // This would normally use a library like speakeasy
    // Simplified implementation for example
    const secret = crypto.randomBytes(20).toString('hex');
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.twoFactorSecret = secret;
    await user.save();
    
    // In a real implementation, return a QR code or secret for the user to save
    return {
      secret,
      // otpauth URL for QR code generation would go here
    };
  }

  /**
   * Verify two-factor token
   * @param {string} userId - User ID
   * @param {string} token - 2FA token
   * @returns {Promise<boolean>} Verification result
   */
  async verifyTwoFactor(userId, token) {
    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new Error('Invalid user or 2FA not set up');
    }
    
    // This would normally verify the token against the secret using a library
    // Simplified implementation for example
    const isValid = this.simulateTokenVerification(user.twoFactorSecret, token);
    
    if (isValid) {
      // Enable 2FA if not already enabled
      if (!user.twoFactorEnabled) {
        user.twoFactorEnabled = true;
        await user.save();
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Simulate 2FA token verification (would use a real library in production)
   * @param {string} secret - User's 2FA secret
   * @param {string} token - Token to verify
   * @returns {boolean} Is token valid
   */
  simulateTokenVerification(secret, token) {
    // In a real app, use a library like speakeasy to verify the token
    // This is just a placeholder
    return token === '123456'; // Obviously not secure, just for demo
  }

  /**
   * Check if a JWT token is valid
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token if valid, null otherwise
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();