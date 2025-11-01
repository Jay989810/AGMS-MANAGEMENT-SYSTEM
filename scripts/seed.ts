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


