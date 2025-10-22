import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  { name: 'Programming', description: 'Web development, mobile apps, software engineering', icon: '💻' },
  { name: 'Design', description: 'UI/UX, graphic design, video editing', icon: '🎨' },
  { name: 'Business', description: 'Marketing, entrepreneurship, management', icon: '💼' },
  { name: 'Languages', description: 'English, Spanish, French, etc.', icon: '🗣️' },
  { name: 'Math & Science', description: 'Calculus, physics, chemistry, statistics', icon: '🔬' },
  { name: 'Writing', description: 'Creative writing, technical writing, blogging', icon: '✍️' },
  { name: 'Music', description: 'Instruments, music theory, production', icon: '🎵' },
  { name: 'Photography', description: 'Photo editing, videography, lighting', icon: '📷' },
  { name: 'Fitness', description: 'Personal training, yoga, nutrition', icon: '💪' },
  { name: 'Cooking', description: 'Recipes, baking, meal prep', icon: '👨‍🍳' },
  { name: 'Data Science', description: 'Machine learning, data analysis, AI', icon: '📊' },
  { name: 'Public Speaking', description: 'Presentation skills, communication', icon: '🎤' },
  { name: 'Career Development', description: 'Resume writing, interview prep, networking', icon: '🚀' },
  { name: 'Gaming', description: 'Game development, esports coaching', icon: '🎮' },
  { name: 'Other', description: 'Skills that don\'t fit other categories', icon: '✨' }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing categories`);

    const result = await Category.insertMany(categories);
    console.log(`✨ Successfully seeded ${result.length} categories`);

    console.log('\n📋 Categories:');
    result.forEach(cat => {
      console.log(`  ${cat.icon} ${cat.name} - ${cat.description}`);
    });

    console.log('\n✅ Category seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
