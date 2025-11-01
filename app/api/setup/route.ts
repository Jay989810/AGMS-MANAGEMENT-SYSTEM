import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

// Mark route as dynamic since it uses database
export const dynamic = 'force-dynamic';

/**
 * Setup route - Creates the first admin user if no users exist
 * This is a one-time setup route that doesn't require authentication
 * DELETE THIS ROUTE AFTER SETUP FOR SECURITY
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('Database connected successfully');

    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return NextResponse.json(
        { 
          error: 'Users already exist. Setup is not needed.',
          userCount 
        },
        { status: 400 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user with this email already exists (shouldn't happen, but safety check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const superAdmin = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: 'SUPER_ADMIN',
    });

    await superAdmin.save();
    
    console.log('✅ Super admin created successfully:', email);

    return NextResponse.json({
      success: true,
      message: 'Super admin created successfully!',
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Setup error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Check if it's a MongoDB connection error
    if (error.message?.includes('MongoServerError') || error.message?.includes('MongoNetworkError')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your MONGODB_URI environment variable.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET route to check if setup is needed
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      setupNeeded: userCount === 0,
      userCount,
      message: userCount === 0 
        ? 'No users found. Setup is required.' 
        : `Found ${userCount} user(s). Setup is not needed.`,
    });
  } catch (error: any) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check setup status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        setupNeeded: true, // Assume setup needed if we can't check
      },
      { status: 500 }
    );
  }
}

