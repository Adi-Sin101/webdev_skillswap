import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminAccount = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Admin account details
    const adminEmail = 'admin@skillswap.com';
    const adminPassword = 'Admin@123'; // You can change this
    const adminName = 'SkillSwap Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.isBanned = false;
      existingAdmin.bio = existingAdmin.bio || 'Official SkillSwap Administrator. Here to help you with any questions, concerns, or issues you may have. Feel free to reach out anytime!';
      existingAdmin.skills = existingAdmin.skills.length > 0 ? existingAdmin.skills : ['Platform Management', 'User Support', 'Community Moderation', 'Technical Support'];
      existingAdmin.badges = existingAdmin.badges.length > 0 ? existingAdmin.badges : ['Admin', 'Community Leader', 'Helper'];
      existingAdmin.university = existingAdmin.university || 'SkillSwap';
      if (!existingAdmin.profilePicture) {
        existingAdmin.profilePicture = 'https://ui-avatars.com/api/?name=SkillSwap+Admin&background=4F46E5&color=fff&size=200&bold=true';
      }
      await existingAdmin.save();
      console.log('✅ Existing user updated to admin role');
      console.log('Email:', adminEmail);
      console.log('Role:', existingAdmin.role);
    } else {
      // Create new admin account
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        university: 'SkillSwap',
        bio: 'Official SkillSwap Administrator. Here to help you with any questions, concerns, or issues you may have. Feel free to reach out anytime!',
        skills: ['Platform Management', 'User Support', 'Community Moderation', 'Technical Support'],
        role: 'admin',
        isBanned: false,
        badges: ['Admin', 'Community Leader', 'Helper'],
        rating: 5,
        completedActivities: 100,
        profilePicture: 'https://ui-avatars.com/api/?name=SkillSwap+Admin&background=4F46E5&color=fff&size=200&bold=true'
      });

      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Name:', adminName);
      console.log('🎓 University:', 'SkillSwap');
      console.log('⚡ Role:', 'admin');
      console.log('═══════════════════════════════════════');
      console.log('⚠️  Please change the password after first login!');
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
};

createAdminAccount();
