const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;

  while (retries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      console.error(`   Error: ${error.message}`);

      if (!retries) {
        console.error('💀 All retries exhausted. Shutting down...');
        process.exit(1);
      }

      // Wait 5 seconds before retrying
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
};

// Handle connection events after initial connect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

module.exports = connectDB;