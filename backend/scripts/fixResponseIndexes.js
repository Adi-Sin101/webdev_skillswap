import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Response from '../models/Response.js';

dotenv.config();

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all existing indexes on the responses collection
    console.log('Dropping old indexes...');
    await Response.collection.dropIndexes();
    console.log('✅ Old indexes dropped');

    // Recreate indexes with the new configuration
    console.log('Creating new indexes...');
    await Response.createIndexes();
    console.log('✅ New indexes created');

    console.log('\n✅ Index migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();
