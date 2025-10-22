import mongoose from 'mongoose';
import dotenv from 'dotenv';
import University from '../models/University.js';

dotenv.config();

const universities = [
  // Top US Universities
  { name: 'Harvard University', location: 'Cambridge, MA', city: 'Cambridge', state: 'Massachusetts', country: 'USA' },
  { name: 'Stanford University', location: 'Stanford, CA', city: 'Stanford', state: 'California', country: 'USA' },
  { name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA', city: 'Cambridge', state: 'Massachusetts', country: 'USA' },
  { name: 'University of California, Berkeley', location: 'Berkeley, CA', city: 'Berkeley', state: 'California', country: 'USA' },
  { name: 'Yale University', location: 'New Haven, CT', city: 'New Haven', state: 'Connecticut', country: 'USA' },
  { name: 'Princeton University', location: 'Princeton, NJ', city: 'Princeton', state: 'New Jersey', country: 'USA' },
  { name: 'Columbia University', location: 'New York, NY', city: 'New York', state: 'New York', country: 'USA' },
  { name: 'University of Chicago', location: 'Chicago, IL', city: 'Chicago', state: 'Illinois', country: 'USA' },
  { name: 'University of Pennsylvania', location: 'Philadelphia, PA', city: 'Philadelphia', state: 'Pennsylvania', country: 'USA' },
  { name: 'Cornell University', location: 'Ithaca, NY', city: 'Ithaca', state: 'New York', country: 'USA' },
  { name: 'Duke University', location: 'Durham, NC', city: 'Durham', state: 'North Carolina', country: 'USA' },
  { name: 'Northwestern University', location: 'Evanston, IL', city: 'Evanston', state: 'Illinois', country: 'USA' },
  { name: 'New York University (NYU)', location: 'New York, NY', city: 'New York', state: 'New York', country: 'USA' },
  { name: 'University of Michigan', location: 'Ann Arbor, MI', city: 'Ann Arbor', state: 'Michigan', country: 'USA' },
  { name: 'University of California, Los Angeles (UCLA)', location: 'Los Angeles, CA', city: 'Los Angeles', state: 'California', country: 'USA' },
  { name: 'University of Southern California (USC)', location: 'Los Angeles, CA', city: 'Los Angeles', state: 'California', country: 'USA' },
  { name: 'Carnegie Mellon University', location: 'Pittsburgh, PA', city: 'Pittsburgh', state: 'Pennsylvania', country: 'USA' },
  { name: 'Johns Hopkins University', location: 'Baltimore, MD', city: 'Baltimore', state: 'Maryland', country: 'USA' },
  { name: 'Georgia Institute of Technology', location: 'Atlanta, GA', city: 'Atlanta', state: 'Georgia', country: 'USA' },
  { name: 'University of Texas at Austin', location: 'Austin, TX', city: 'Austin', state: 'Texas', country: 'USA' },
  
  // More US Universities
  { name: 'Boston University', location: 'Boston, MA', city: 'Boston', state: 'Massachusetts', country: 'USA' },
  { name: 'University of Washington', location: 'Seattle, WA', city: 'Seattle', state: 'Washington', country: 'USA' },
  { name: 'University of Wisconsin-Madison', location: 'Madison, WI', city: 'Madison', state: 'Wisconsin', country: 'USA' },
  { name: 'University of Illinois at Urbana-Champaign', location: 'Champaign, IL', city: 'Champaign', state: 'Illinois', country: 'USA' },
  { name: 'University of North Carolina at Chapel Hill', location: 'Chapel Hill, NC', city: 'Chapel Hill', state: 'North Carolina', country: 'USA' },
  { name: 'Ohio State University', location: 'Columbus, OH', city: 'Columbus', state: 'Ohio', country: 'USA' },
  { name: 'Pennsylvania State University', location: 'University Park, PA', city: 'University Park', state: 'Pennsylvania', country: 'USA' },
  { name: 'Purdue University', location: 'West Lafayette, IN', city: 'West Lafayette', state: 'Indiana', country: 'USA' },
  { name: 'University of Florida', location: 'Gainesville, FL', city: 'Gainesville', state: 'Florida', country: 'USA' },
  { name: 'University of Maryland', location: 'College Park, MD', city: 'College Park', state: 'Maryland', country: 'USA' },
  
  // International Universities
  { name: 'University of Oxford', location: 'Oxford', city: 'Oxford', state: '', country: 'UK' },
  { name: 'University of Cambridge', location: 'Cambridge', city: 'Cambridge', state: '', country: 'UK' },
  { name: 'Imperial College London', location: 'London', city: 'London', state: '', country: 'UK' },
  { name: 'University College London (UCL)', location: 'London', city: 'London', state: '', country: 'UK' },
  { name: 'ETH Zurich', location: 'Zurich', city: 'Zurich', state: '', country: 'Switzerland' },
  { name: 'University of Toronto', location: 'Toronto, ON', city: 'Toronto', state: 'Ontario', country: 'Canada' },
  { name: 'University of British Columbia', location: 'Vancouver, BC', city: 'Vancouver', state: 'British Columbia', country: 'Canada' },
  { name: 'McGill University', location: 'Montreal, QC', city: 'Montreal', state: 'Quebec', country: 'Canada' },
  { name: 'National University of Singapore (NUS)', location: 'Singapore', city: 'Singapore', state: '', country: 'Singapore' },
  { name: 'University of Melbourne', location: 'Melbourne, VIC', city: 'Melbourne', state: 'Victoria', country: 'Australia' },
  { name: 'University of Sydney', location: 'Sydney, NSW', city: 'Sydney', state: 'New South Wales', country: 'Australia' },
  { name: 'Tsinghua University', location: 'Beijing', city: 'Beijing', state: '', country: 'China' },
  { name: 'Peking University', location: 'Beijing', city: 'Beijing', state: '', country: 'China' },
  { name: 'University of Tokyo', location: 'Tokyo', city: 'Tokyo', state: '', country: 'Japan' },
  { name: 'Seoul National University', location: 'Seoul', city: 'Seoul', state: '', country: 'South Korea' },
];

const seedUniversities = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing universities
    const deleteResult = await University.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing universities`);

    // Insert universities
    const result = await University.insertMany(universities);
    console.log(`✨ Successfully seeded ${result.length} universities`);

    // Display some examples
    console.log('\n📋 Sample universities:');
    const samples = await University.find().limit(5);
    samples.forEach(uni => {
      console.log(`  - ${uni.name} (${uni.location})`);
    });

    console.log('\n✅ University seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding universities:', error);
    process.exit(1);
  }
};

seedUniversities();
