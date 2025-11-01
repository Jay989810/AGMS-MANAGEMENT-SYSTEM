// Load environment variables from .env.local FIRST
// This must be done using require() to ensure synchronous execution
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local file
const envResult = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (envResult.error) {
  console.error('Error loading .env.local:', envResult.error);
  process.exit(1);
}

// Verify MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not found in .env.local');
  console.error('Please make sure .env.local exists and contains MONGODB_URI');
  process.exit(1);
}

// Now we can safely import modules that depend on environment variables
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/db';
import User from '../lib/models/User';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if super admin exists
    const existingAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (existingAdmin) {
      console.log('Super admin already exists. Skipping seed.');
      process.exit(0);
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const superAdmin = new User({
      email: 'admin@amazinggrace.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully!');
    console.log('Email: admin@amazinggrace.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
