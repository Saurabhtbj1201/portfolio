import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Delete existing demo user if exists
    await User.deleteOne({ email: 'test@test.com' });

    // Create demo admin user
    const demoAdmin = await User.create({
      username: 'testadmin',
      email: 'test@test.com',
      password: '1234'
    });

    console.log('✅ Demo admin user created successfully');
    console.log('Email: test@test.com');
    console.log('Password: 1234');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
