import dotenv from 'dotenv';
import connectDB from '../config/connectDB.js';
import User from '../models/User.js';

dotenv.config();

const testBanUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Find a test user (not admin)
    const testUser = await User.findOne({ role: { $ne: 'admin' } }).limit(1);
    
    if (!testUser) {
      console.log('❌ No non-admin user found to test ban functionality');
      process.exit(1);
    }

    console.log(`Found test user: ${testUser.name} (${testUser.email})`);

    // Check if user is already banned
    if (testUser.isBanned) {
      console.log('✅ User is already banned');
      console.log(`Ban reason: ${testUser.bannedReason}`);
      console.log(`Banned at: ${testUser.bannedAt}`);
    } else {
      // Ban the user using updateOne to avoid validation issues
      await User.updateOne(
        { _id: testUser._id },
        {
          $set: {
            isBanned: true,
            bannedReason: 'Testing ban functionality - violating community guidelines',
            bannedAt: new Date()
          }
        }
      );
      
      // Fetch updated user
      const updatedUser = await User.findById(testUser._id);
      
      console.log('✅ User has been banned for testing');
      console.log(`Ban reason: ${updatedUser.bannedReason}`);
      console.log(`Banned at: ${updatedUser.bannedAt}`);
    }

    console.log('\n📝 Test Instructions:');
    console.log(`1. Try to login with email: ${testUser.email}`);
    console.log('2. You should see a detailed ban message with reason and timestamp');
    console.log('3. Login should be prevented');
    console.log('\n🔄 To unban this user, run: node scripts/unbanUser.js');

  } catch (error) {
    console.error('Error testing ban functionality:', error);
  } finally {
    process.exit(0);
  }
};

testBanUser();