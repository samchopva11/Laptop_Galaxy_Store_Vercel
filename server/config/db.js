const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
  // If we already have a connected client, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If there is no connection attempt in progress, start one
  if (!cachedPromise) {
    console.log('Connecting to MongoDB...');
    cachedPromise = mongoose.connect(process.env.MONGODB_URI)
      .then((mongooseInstance) => {
        cachedConnection = mongooseInstance;
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return cachedConnection;
      })
      .catch((error) => {
        cachedPromise = null; // Clear cached promise on failure to allow retry
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
      });
  }

  return cachedPromise;
};

module.exports = connectDB;

