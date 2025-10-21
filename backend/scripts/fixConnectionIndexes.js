import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixConnectionIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mernDB');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('connections');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Drop all indexes except _id
    console.log('\n🗑️  Dropping old indexes...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`  ✅ Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`  ⚠️  Could not drop ${index.name}:`, error.message);
        }
      }
    }

    // Create new indexes
    console.log('\n🔨 Creating new indexes...');
    
    // Unique index on requester and recipient
    await collection.createIndex(
      { requester: 1, recipient: 1 },
      { unique: true, name: 'requester_1_recipient_1' }
    );
    console.log('  ✅ Created unique index: requester_1_recipient_1');

    // Index for querying by status
    await collection.createIndex(
      { status: 1 },
      { name: 'status_1' }
    );
    console.log('  ✅ Created index: status_1');

    // Index for finding user connections
    await collection.createIndex(
      { requester: 1, status: 1 },
      { name: 'requester_1_status_1' }
    );
    console.log('  ✅ Created index: requester_1_status_1');

    await collection.createIndex(
      { recipient: 1, status: 1 },
      { name: 'recipient_1_status_1' }
    );
    console.log('  ✅ Created index: recipient_1_status_1');

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\n✨ New indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Index migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during index migration:', error);
    process.exit(1);
  }
};

fixConnectionIndexes();
