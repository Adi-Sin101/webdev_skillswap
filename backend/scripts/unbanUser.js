import dotenv from 'dotenv';
import connectDB from '../config/connectDB.js';
import User from '../models/User.js';

dotenv.config();

const unbanUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Find banned users
    const bannedUsers = await User.find({ isBanned: true });
    
    if (bannedUsers.length === 0) {
      console.log('❌ No banned users found');
      process.exit(1);
    }

    // Unban all test users
    for (const user of bannedUsers) {
      user.isBanned = false;
      user.bannedReason = undefined;
      user.bannedAt = undefined;
      await user.save();
      console.log(`✅ Unbanned user: ${user.name} (${user.email})`);
    }

    console.log(`\n✅ ${bannedUsers.length} user(s) have been unbanned`);

  } catch (error) {
    console.error('Error unbanning users:', error);
  } finally {
    process.exit(0);
  }
};

unbanUser();