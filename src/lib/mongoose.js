// src/lib/mongoose.js
import mongoose from 'mongoose';

// Cache the mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

/**
 * Connect to MongoDB database
 * @returns {Promise<Mongoose>} Mongoose connection
 */
export async function connectDB() {
  // If connection exists, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // Cache the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  // Await the cached promise
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Disconnect from MongoDB database
 * Used mainly for testing
 */
export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB');
  }
}