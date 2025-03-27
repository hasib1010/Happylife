// src/models/comment.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'spam'],
      default: 'pending',
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Set up indexes
CommentSchema.index({ blogId: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ parentId: 1 });
CommentSchema.index({ createdAt: -1 });

// Virtual field for user information
CommentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual field for child comments (replies)
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
});

// Middleware to populate user on find
CommentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name profilePicture',
  });
  next();
});

// Method to approve comment
CommentSchema.methods.approve = function() {
  this.status = 'approved';
  return this.save();
};

// Method to reject comment
CommentSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to mark as spam
CommentSchema.methods.markAsSpam = function() {
  this.status = 'spam';
  return this.save();
};

// Method to add a like
CommentSchema.methods.addLike = function(userId) {
  // Check if already liked by this user
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes = this.likedBy.length;
  }
  return this.save();
};

// Method to remove a like
CommentSchema.methods.removeLike = function(userId) {
  this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
  this.likes = this.likedBy.length;
  return this.save();
};

// Middleware to update blog comment count when a comment is approved
CommentSchema.post('save', async function() {
  try {
    if (this.status === 'approved') {
      const Blog = mongoose.model('Blog');
      const blog = await Blog.findById(this.blogId);
      if (blog) {
        await blog.addComment();
      }
    }
  } catch (error) {
    console.error('Error updating blog comment count:', error);
  }
});

// Prevent model compilation error in development due to hot reloading
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment;