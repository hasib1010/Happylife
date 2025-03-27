// src/models/blog.js
import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide content for the blog'],
    },
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot be more than 500 characters'],
    },
    featuredImage: {
      type: String,
    },
    category: {
      type: String,
    },
    tags: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    promotionEndDate: {
      type: Date,
    },
    metaTitle: {
      type: String,
      maxlength: [100, 'Meta title cannot be more than 100 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [250, 'Meta description cannot be more than 250 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create a text index for search functionality
BlogSchema.index({ 
  title: 'text', 
  content: 'text', 
  summary: 'text', 
  tags: 'text' 
});

// Virtual field for author information
BlogSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

// Generate a slug from the title
BlogSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .substring(0, 200) // Limit slug length
      + '-' + Date.now().toString().substring(9); // Add a timestamp for uniqueness
  }
  
  // If publishing for the first time, set the published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Method to track a view
BlogSchema.methods.trackView = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to like a blog
BlogSchema.methods.addLike = function() {
  this.likeCount += 1;
  return this.save();
};

// Method to add a comment
BlogSchema.methods.addComment = function() {
  this.commentCount += 1;
  return this.save();
};

// Method to check if blog is promoted
BlogSchema.methods.isCurrentlyPromoted = function() {
  return this.isPromoted && 
    this.promotionEndDate && 
    new Date(this.promotionEndDate) > new Date();
};

// Populate author on find
BlogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name profilePicture role businessName',
  });
  next();
});

// Check for valid subscription before publishing
BlogSchema.pre('save', async function(next) {
  // If trying to publish, verify subscription
  if (this.isModified('status') && this.status === 'published') {
    try {
      // Get the User model
      const User = mongoose.model('User');
      const author = await User.findById(this.authorId);
      
      if (!author || !author.hasActiveSubscription()) {
        throw new Error('Active subscription required to publish blogs');
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Middleware to handle related comments if blog is deleted
BlogSchema.pre('remove', async function(next) {
  try {
    // If we have a Comment model, delete related comments
    if (mongoose.models.Comment) {
      await mongoose.models.Comment.deleteMany({ blogId: this._id });
    }
  } catch (error) {
    console.error('Error removing related comments:', error);
  }
  next();
});

// Prevent model compilation error in development due to hot reloading
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default Blog;