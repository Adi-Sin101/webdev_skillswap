import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const testAdminStats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@skillswap.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', adminUser.name);

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log('✅ JWT token generated');

    // Test the admin stats endpoint
    const response = await fetch('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin stats endpoint working!');
      console.log('📊 Stats:', data.stats);
    } else {
      console.log('❌ Admin stats endpoint failed:', data.error);
      console.log('Status:', response.status);
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error testing admin stats:', error);
    process.exit(1);
  }
};

testAdminStats();
