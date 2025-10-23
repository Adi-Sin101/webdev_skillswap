import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdminAccount = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminUser = await User.findOne({ email: 'admin@skillswap.com' });

    if (adminUser) {
      console.log('✅ Admin account found:');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('⚡ Role:', adminUser.role);
      console.log('🚫 Banned:', adminUser.isBanned);
      console.log('🆔 ID:', adminUser._id);
    } else {
      console.log('❌ Admin account NOT found');
      console.log('💡 Run: npm run create-admin');
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin account:', error);
    process.exit(1);
  }
};

checkAdminAccount();
