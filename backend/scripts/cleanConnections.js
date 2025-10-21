import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanConnectionsCollection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mernDB');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('connections');

    // Count total documents
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total connections: ${totalCount}`);

    // Find and delete documents with null requester or recipient
    const badDocs = await collection.find({
      $or: [
        { requester: null },
        { recipient: null },
        { requester: { $exists: false } },
        { recipient: { $exists: false } }
      ]
    }).toArray();

    if (badDocs.length > 0) {
      console.log(`\n🗑️  Found ${badDocs.length} invalid documents. Deleting...`);
      badDocs.forEach(doc => {
        console.log(`  - Document ID: ${doc._id}, requester: ${doc.requester}, recipient: ${doc.recipient}`);
      });

      const deleteResult = await collection.deleteMany({
        $or: [
          { requester: null },
          { recipient: null },
          { requester: { $exists: false } },
          { recipient: { $exists: false } }
        ]
      });

      console.log(`  ✅ Deleted ${deleteResult.deletedCount} invalid documents`);
    } else {
      console.log('\n✅ No invalid documents found!');
    }

    // Show remaining documents
    const remainingCount = await collection.countDocuments();
    console.log(`\n✨ Remaining connections: ${remainingCount}`);

    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanConnectionsCollection();
